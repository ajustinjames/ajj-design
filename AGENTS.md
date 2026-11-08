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
pnpm release:notes --system hardline --version 0.2.0  # preview GitHub release notes
pnpm release:launch <system>                     # first release of a new system (local, needs npm login)
pnpm release:trust <system>                      # re-register the npm trusted publisher
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
  - A PR may carry at most one of `patch`, `minor` and `major`. PRs without
    a release label publish nothing. Docs, CI, Storybook-only and
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

### Release notes (the changelog)

GitHub Releases are the changelog. There is no `CHANGELOG.md`, and none should be
added. Each `<system>-v<version>` release lists only the PRs that changed that
system's published files since its previous release, grouped by the PR's
release label:

| PR label | Section |
|---|---|
| `major` | Breaking changes |
| `minor` | Features |
| `patch` | Fixes |
| none (e.g. dependency bumps) | Other changes |

PR titles become changelog lines, so write them for package consumers
("Add `hl-tabs`", "Rename `--hl-btn-bg` to `--hl-btn-surface`"). Package READMEs
link to the releases page. Preview the notes with `pnpm release:notes`.

### PR previews

`.github/workflows/preview.yml` publishes every package on every PR to
[pkg.pr.new](https://pkg.pr.new) and comments install commands on the PR, for
example `npm i https://pkg.pr.new/@ajustinjames/hardline-components@46`. Previews
never touch npm, use version `0.0.0-preview-<sha>`, and need no labels or
secrets. This requires the pkg.pr.new GitHub App to be installed on the repo.
Use previews to try a change in a real app before merging it with a release
label.

### Versioning policy

The packages follow strict semver, including while on `0.x`: a breaking change
always gets the `major` label, so the first one releases `1.0.0`.

Public API, where any incompatible change is **breaking** (`major`):
- custom element tag names (`hl-*`, `gl-*`)
- attributes and properties, their allowed values, and their defaults
- slot names, `::part` names, and dispatched events
- CSS custom properties (`--hl-*`, `--gl-*`) at every tier: global, alias and
  component. Removing or renaming one, or changing what it means (for example
  repurposing a color role), is breaking.
- package `exports` paths (`/css`, `/css-dark`, `/theme`) and exported JS (for
  example `AriaAssociationController`)
- supported runtime: raising the `lit` major version or dropping browser support

**Features** (`minor`): new components, attributes, slots, parts, events,
tokens or exports; intentional visual changes to existing tokens that keep
their meaning; deprecations. A deprecated API keeps working, warns in dev mode,
and is removed only in a later `major`.

**Fixes** (`patch`): bug, accessibility and visual fixes that keep the design
intent; corrections to wrong token values; package README changes.

Not public API, so no version impact: source file paths (`ds-*`), internal
`Ds*` class names, tests, stories and Storybook.

### Launching a new system

CI never publishes a system's first release. npm OIDC trusted publishing can't
create a package that doesn't exist yet, and the repo deliberately keeps **no
npm token in CI**. Instead, the first release is published once from your
machine:

1. Scaffold the system with `scripts/create-system.sh` and merge it **without a
   release label**. Until it is launched, `release.yml` skips it, and
   `release-check` shows it as "not on npm yet" with the command to run.
2. On a clean checkout of `origin/main`:
   ```bash
   npm login                     # npm publish and npm trust need interactive 2FA
   pnpm release:launch <name>    # publishes 0.1.0 (or --version x.y.z)
   ```
   This publishes both packages from your npm session, creates the
   `<name>-v0.1.0` tag and GitHub release with `gh`, and registers `release.yml`
   as both packages' npm trusted publisher (`pnpm release:trust`).
3. From then on, release the system with `patch`, `minor` or `major`.

`release:launch` is idempotent: if it stops partway (for example a failed 2FA
prompt), re-run it, and steps already done are skipped. A first release
published this way has no npm provenance attestation, because only CI publishes
are attested; every later release has one.

The npm trusted publisher is bound to the workflow file name `release.yml`. If
you rename that file, re-register every package with `pnpm release:trust`.

### Manual release and recovery

Run the **Release** workflow manually (Actions tab, on `main`) with `system`
and `bump`:
- `patch`, `minor` or `major`: release without a PR label, for example if the
  label was forgotten before merge.
- `resume`: finish a release that published one of a system's packages but
  not the other. To finish a half-done launch, re-run `pnpm release:launch`.

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
