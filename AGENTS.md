# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Overview

`ajj-design` is a multi-system design platform hosting two design systems: `hardline`, an industrial-material system, and `glassline`, a liquid-glass system. Both are framework-agnostic Web Components built with Lit, with design tokens compiled via Style Dictionary, targeting web CSS custom properties from a single source of truth.

- `hardline`: industrial-material aesthetic (hard-cast shadows, 0px corner radii, no gradients — see Design constraints below). Custom elements prefixed `hl-*`. Packages at `packages/hardline-tokens` and `packages/hardline-components`.
- `glassline`: liquid-glass aesthetic (translucent blurred surfaces, rounded geometry, specular highlights — Apple Liquid Glass style). Custom elements prefixed `gl-*`. Packages at `packages/glassline-tokens` and `packages/glassline-components`. Follows the same `ds-*` filename conventions described elsewhere in this doc.

New design systems are scaffolded from `hardline` via `scripts/create-system.sh <name> <prefix>` (see Package structure below).

## Commands

```bash
# Install dependencies
pnpm install

# Build hardline tokens (must run before components see updated tokens)
pnpm tokens:build

# Run hardline component tests (Playwright/Chromium, headless)
pnpm test

# Run tests in watch mode from repo root
pnpm --filter @ajustinjames/hardline-components test:watch

# Run a single test file
pnpm --filter @ajustinjames/hardline-components exec web-test-runner test/ds-btn.test.ts

# Launch Storybook
pnpm storybook

# Build Storybook static site
pnpm build-storybook

# Verify package manifests are safe to publish
pnpm verify:publish-metadata
```

## Release Workflow

Releases are PR-driven. Do not make the GitHub Actions release workflow mutate
package manifests or push commits back to `main`.

Release decisions are derived from working-tree state, not git diffs. The plan
is computed by `scripts/release-plan.mjs`, which both workflows share:
- `.github/workflows/release-check.yml` runs it read-only on every PR to `main`
  (`node scripts/release-plan.mjs --check`). It fails the PR if the resulting
  tree would violate an invariant — versions out of lockstep, bad semver, or a
  non-sequential bump — so a bad version state is blocked *before* it merges.
- `.github/workflows/release.yml` runs it on `push` to `main` and publishes any
  system whose tree version is the valid next semver above what's on npm. It
  packs tarballs, verifies publish metadata, publishes via npm OIDC, pushes the
  `<system>-v<version>` tag, and creates the GitHub release.

Because the plan is tree-state based (not diff based), a version bump can land
across multiple PRs and still publish correctly: only the final manifest state
matters. A push with no version change above npm is a no-op.

For a package release, bump both manifests to the same next valid semver above
the published npm version:
- `packages/hardline-tokens/package.json`
- `packages/hardline-components/package.json`

The versions must stay identical (lockstep); the pre-merge check enforces this.
For example, if npm has `0.0.2`, both move to `0.0.3`, `0.1.0`, or `1.0.0`.

For docs, infrastructure, Storybook-only, or other non-package changes, do not
bump package manifests.

Branch off the latest `origin/main` before bumping so you target the correct
next version; the pre-merge check will reject a stale or non-sequential bump.

## Architecture

### Package structure

| Package | Name | Purpose |
|---|---|---|
| `packages/hardline-tokens` | `@ajustinjames/hardline-tokens` | Single `tokens.json` -> Style Dictionary -> `dist/web/tokens.css` |
| `packages/hardline-components` | `@ajustinjames/hardline-components` | Lit Web Components consuming token CSS vars |
| `packages/glassline-tokens` | `@ajustinjames/glassline-tokens` | Single `tokens.json` -> Style Dictionary -> `dist/web/tokens.css` |
| `packages/glassline-components` | `@ajustinjames/glassline-components` | Lit Web Components consuming token CSS vars |

`@ajustinjames/hardline-components` uses `workspace:^` for its local dependency
on `@ajustinjames/hardline-tokens` (and likewise `glassline-components` on
`glassline-tokens`). Publish from pnpm-packed tarballs so the published package
metadata contains a real semver range, not a raw `workspace:` range. Storybook
runs at the repo root and pulls stories from `packages/*/stories/`.

New systems are scaffolded from the hardline template with
`./scripts/create-system.sh <name> <prefix>`, which copies
`packages/hardline-tokens` and `packages/hardline-components` into
`packages/<name>-tokens` and `packages/<name>-components` and rewrites package
names, custom-element prefixes, and doc references.

### Token pipeline

`tokens.json` uses the DTCG format (`$value`, `$type`). The three tiers are:
- **global** - raw values (`#FF4F00`, `100ms`)
- **alias** - semantic references (`{global.color.accent}`) that components consume
- **component** - per-component overrides (CSS custom property layer on top of alias tokens)

`sd.config.js` registers a custom format for Tailwind `@theme {}` (web). Run `pnpm tokens:build` after any `tokens.json` change to regenerate.

### Component conventions

- All hardline components extend `LitElement` with `@customElement('hl-*')`.
- All Lit properties that affect style use `reflect: true` so `:host([attr])` CSS selectors work.
- Styling lives entirely in `static styles` using CSS custom properties that fall back to alias token vars, which fall back to hard-coded values: `var(--hl-btn-bg, var(--hl-alias-action-bg, #FFFFFF))`.
- Components are visual shells only - no internal state management. Slot-based composition (`<slot>`, `<slot name="prefix">`, etc.).
- File path conventions intentionally still use `ds-*` filenames and `Ds*` TypeScript class names. Each new hardline component needs: `src/ds-*/ds-*.ts`, a test in `test/ds-*.test.ts`, a story in `stories/ds-*.stories.ts`, and a barrel export in `src/index.ts`.
- Do not change import paths from `ds-*` filenames to `hl-*` unless the files are actually renamed in a separate approved migration.

### Foundations

`src/foundations/aria-association-controller.ts` is a `ReactiveController` that wires ARIA attributes (`aria-labelledby`, `aria-describedby`, etc.) across shadow DOM boundaries. It mints a UUID-based id on the host if none is set and warns in dev mode. Components needing cross-shadow ARIA association should instantiate this controller.

### Design constraints (from manifesto)

These constraints are `hardline`-specific and do not apply to `glassline`, which
intentionally uses rounded geometry, blur, and specular highlights.

- Corner radii: **0px** only. No pills, no rounded corners.
- Shadows: hard-cast offset shadows only (`2px 2px 0px #000`). No blur.
- No gradients.
- Fonts: Inter for UI, JetBrains Mono for technical/status/metadata.
- No third-party UI libraries except headless primitives (e.g., Radix UI).
- Accent: `#FF4F00` (International Orange). Background: `#F0F0EC` (Paper).

### Testing

Tests use `@open-wc/testing` with `@web/test-runner` and Playwright (Chromium). Test files live in `packages/hardline-components/test/` and match `test/**/*.test.ts`. The `tsconfig.test.json` configures esbuild for TypeScript transpilation during test runs.
