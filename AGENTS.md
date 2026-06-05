# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Overview

`ajj-design` is an industrial-material design system platform. The current system is `hardline`: framework-agnostic Web Components built with Lit, with design tokens compiled via Style Dictionary. It targets web CSS custom properties from a single source of truth.

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

For a package release:
- Bump both package manifests in the PR:
  - `packages/hardline-tokens/package.json`
  - `packages/hardline-components/package.json`
- Keep both package versions identical.
- The manifest bump must be the next valid semver relative to the currently
  published npm version. For example, if npm has `0.0.2`, both manifests can
  move to `0.0.3`, `0.1.0`, or `1.0.0`.

The release workflow infers whether to publish from the package manifest version
changes. It validates that both packages have the same target version, verifies
that neither package has already published that exact version, builds both
packages, pushes the release tag, publishes to npm, and creates the GitHub
release. No package manifest version change means no publish.

For docs, infrastructure, Storybook-only, or other non-package changes, do not
bump package manifests.

## Architecture

### Package structure

| Package | Name | Purpose |
|---|---|---|
| `packages/hardline-tokens` | `@ajustinjames/hardline-tokens` | Single `tokens.json` -> Style Dictionary -> `dist/web/tokens.css` |
| `packages/hardline-components` | `@ajustinjames/hardline-components` | Lit Web Components consuming token CSS vars |

`@ajustinjames/hardline-components` uses `workspace:^` for its local dependency
on `@ajustinjames/hardline-tokens`. Publish from pnpm-packed tarballs so the
published package metadata contains a real semver range, not a raw `workspace:`
range. Storybook runs at the repo root and pulls stories from
`packages/*/stories/`.

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

- Corner radii: **0px** only. No pills, no rounded corners.
- Shadows: hard-cast offset shadows only (`2px 2px 0px #000`). No blur.
- No gradients.
- Fonts: Inter for UI, JetBrains Mono for technical/status/metadata.
- No third-party UI libraries except headless primitives (e.g., Radix UI).
- Accent: `#FF4F00` (International Orange). Background: `#F0F0EC` (Paper).

### Testing

Tests use `@open-wc/testing` with `@web/test-runner` and Playwright (Chromium). Test files live in `packages/hardline-components/test/` and match `test/**/*.test.ts`. The `tsconfig.test.json` configures esbuild for TypeScript transpilation during test runs.
