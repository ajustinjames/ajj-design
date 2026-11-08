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

# Release tooling (see Release Workflow)
pnpm test:release                                # unit tests for the release logic
pnpm release:plan --labels '["minor"]'           # preview a label against HEAD^1..HEAD
pnpm release:dry-run                             # build + pack + verify every system
pnpm release:trust <system>                      # one-time npm trusted-publisher setup
```

## Release Workflow

Releases are driven by PR labels. Versions live on npm and in git tags; the
repo never stores a real version.

- Every `packages/<system>-{tokens,components}/package.json` keeps
  `"version": "0.0.0"`. Never edit it: `release-check` fails the PR if you do.
- Release labels:
  - `patch`, `minor`, `major`: on merge, bump **every already-published
    system the PR changed** by that amount, computed from each system's own
    npm version (for example hardline `0.1.0` + `minor` = `0.2.0`).
  - `launch`: on merge, publish the first release (`0.1.0`) of every
    never-published system the PR changed.
  - A PR may carry at most one of `patch`, `minor` and `major`, plus `launch`.
    PRs without a release label publish nothing. Docs, CI, Storybook-only and
    dependency PRs normally get no label.
- "Changed" means the PR touches files that ship in the npm package:
  `src/`, `tokens.json`, `sd.config.js`, `tsconfig.build.json`, `package.json`,
  `README.md`. Changes under `test/` or `stories/`, or to test configs, don't
  count, so a `patch` label on a tests-only PR fails `release-check`.
- A system's tokens and components packages always release together at the
  same version.
- `release-check.yml` runs on every PR, including label changes. It writes a
  "Merging this PR will publish …" preview to the job summary and fails on
  conflicting or pointless labels.
- On merge, `release.yml` stamps the computed version into the manifests
  inside the CI run only, then builds, packs, verifies publish metadata,
  publishes, and creates the `<system>-v<version>` tag and GitHub release.
  Nothing is committed back to `main`, so the `main` ruleset needs no bypass.
  Changed files are read from `HEAD^1..HEAD`, which relies on `main` allowing
  only squash merges (enforced by the ruleset).

The scripts:
- `scripts/release-lib.mjs`: shared logic (system discovery, changed-file
  detection, label parsing, version math, the plan). Unit-tested by
  `pnpm test:release`.
- `scripts/release-plan.mjs`: decides what to publish. Used by both
  `release-check.yml` and `release.yml`.
- `scripts/release-publish.mjs`: builds, packs, verifies and publishes one
  system at an exact version. Idempotent: packages and releases that already
  exist are skipped, so a failed run can be re-run. CI runs
  `pnpm release:dry-run` (pack and verify every system) on every PR.

### Launching a new system

npm OIDC trusted publishing cannot create a package that doesn't exist yet,
so `release.yml` publishes `launch` releases in a separate `launch` job with a
token:

1. Scaffold the system with `scripts/create-system.sh` and open a PR.
2. Label the PR `launch`. `release-check` previews `<name> 0.1.0 (launch)`.
3. On merge, the `launch` job publishes with the `NPM_TOKEN` secret of the
   `npm-launch` environment, which is an npm granular token with write access
   to the `@ajustinjames` scope.
4. Run `pnpm release:trust <name>` locally, once. It registers `release.yml`
   as the npm trusted publisher for both packages. `npm trust` requires
   interactive 2FA, so it cannot run in CI.
5. From then on, release the system with `patch`, `minor` or `major`.

npm is removing direct publishing with 2FA-bypass tokens (announced for
January 2027). After that, do step 3 locally from a checkout of `origin/main`
with `npm login`:
`node scripts/release-publish.mjs --system <name> --version 0.1.0 --launch`.

The npm trusted publisher is bound to the workflow file name `release.yml`. If
you rename that file, re-register every package with `pnpm release:trust`.

### Manual release and recovery

Run the **Release** workflow manually (Actions tab, on `main`) with `system`
and `bump`:
- `patch`, `minor`, `major` or `launch`: release without a PR label, for
  example if the label was forgotten before merge.
- `resume`: finish a release that published one of a system's packages but
  not the other. To finish a half-done launch, re-run with `launch` instead.

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
