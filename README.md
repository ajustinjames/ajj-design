# ajj-design

A multi-system design platform. Each design system ships as a pair of npm packages: framework-agnostic Web Components built with Lit, and design tokens compiled via Style Dictionary to CSS custom properties from a single source of truth.

| System | Aesthetic | Elements |
|---|---|---|
| `hardline` | Industrial material: hard-cast shadows, 0px corners, no gradients | `hl-*` |
| `glassline` | Liquid glass: translucent blurred surfaces, rounded geometry, specular highlights | `gl-*` |

Live Storybook: https://ajustinjames.github.io/ajj-design/

## Hardline Design Principles

- **0px corner radii** — no pills, no rounded corners
- **Hard-cast shadows only** — `2px 2px 0px #000`. No blur, no glow
- **No gradients**
- **Accent:** `#FF4F00` (International Orange) — `#F0F0EC` (Paper) background
- **Fonts:** Inter for UI, JetBrains Mono for technical/status/metadata
- No third-party UI libraries (headless primitives only)

## Packages

| Package | Name | Purpose |
|---|---|---|
| `packages/hardline-tokens` | `@ajustinjames/hardline-tokens` | `tokens.json` -> Style Dictionary -> `dist/web/tokens.css` |
| `packages/hardline-components` | `@ajustinjames/hardline-components` | Lit Web Components consuming token CSS vars |
| `packages/glassline-tokens` | `@ajustinjames/glassline-tokens` | `tokens.json` -> Style Dictionary -> `dist/web/tokens.css` |
| `packages/glassline-components` | `@ajustinjames/glassline-components` | Lit Web Components consuming token CSS vars |

Install a system's tokens and components together; they are always released at the same version:

```bash
npm install @ajustinjames/hardline-components @ajustinjames/hardline-tokens
```

## Commands

```bash
pnpm install             # install deps
pnpm tokens:build        # compile all system token packages
pnpm test                # run all component tests (Playwright/Chromium, headless)
pnpm test:screenshots    # run all component screenshot tests
pnpm storybook           # launch Storybook at localhost:6006
pnpm build-storybook     # build static Storybook
```

## Components

### `<hl-btn>`

Button wrapper — slot-based, style-only. Wrap any `<button>` or `<a>`.

```html
<hl-btn variant="primary" size="md">
  <button>Submit</button>
</hl-btn>
```

| Attribute | Values | Default |
|---|---|---|
| `variant` | `default` \| `primary` \| `ghost` | `default` |
| `size` | `sm` \| `md` | `md` |

Slots: `prefix`, default, `suffix`.

---

### `<hl-card>`

Surface container with hard-cast shadow and hover lift.

```html
<hl-card elevation="2">
  <span slot="header">Title</span>
  <p>Content</p>
</hl-card>
```

| Attribute | Values | Default |
|---|---|---|
| `elevation` | `1` \| `2` \| `3` | `1` |

Slots: `header`, default.

---

### `<hl-input>`

Input wrapper with inline label and unit support. Manages label/input association across shadow DOM.

```html
<hl-input label-for="email" state="default">
  <label slot="label">Email</label>
  <input id="email" type="email" />
</hl-input>

<!-- with unit suffix -->
<hl-input>
  <input type="number" />
  <span slot="unit">kg</span>
</hl-input>
```

| Attribute | Values | Default |
|---|---|---|
| `state` | `default` \| `error` \| `success` | `default` |
| `density` | `default` \| `compact` | `default` |
| `label-for` | string (input id) | — |
| `data-type` | `clinical` | — |

Slots: `label`, default (input/textarea), `unit`.

`label-for` auto-wires `for`/`id` between slotted label and input. Dev-mode warning fires if label and input are unassociated.

---

### `<hl-label>`

Standalone label — JetBrains Mono, uppercase, wide tracking.

```html
<hl-label for="email">Email</hl-label>
<input id="email" />
```

| Attribute | Values | Default |
|---|---|---|
| `tone` | `default` \| `muted` \| `accent` | `default` |
| `for` | string (target element id) | — |

---

## Token Architecture

Three tiers in `tokens.json` (DTCG format):

```
global   → raw values      (#FF4F00, 100ms)
alias    → semantic refs   ({global.color.accent})   ← components consume these
component → per-component overrides
```

Components use a three-level fallback:

```css
var(--hl-btn-bg, var(--hl-alias-action-bg, #FFFFFF))
/*  component      alias token        hard fallback  */
```

Override at any tier by setting the CSS custom property.

Run `pnpm tokens:build` after any `tokens.json` change to regenerate `dist/web/tokens.css`.

## Adding a Component

Each new component needs:

1. `packages/<system>-components/src/ds-<name>/ds-<name>.ts`
2. `packages/<system>-components/test/ds-<name>.test.ts`
3. `packages/<system>-components/stories/ds-<name>.stories.ts`
4. Barrel export in `packages/<system>-components/src/index.ts`

All components extend `LitElement`. Properties that affect style use `reflect: true`. No internal state — visual shells only.

## Releases

- **Changelog:** [GitHub Releases](https://github.com/ajustinjames/ajj-design/releases). Each system is tagged `<system>-v<version>` (for example `hardline-v0.2.0`), and its release notes list only the changes to that system. There is no `CHANGELOG.md`.
- **Versioning:** strict [semver](https://semver.org). Element tags, attributes, slots, parts, events, CSS custom properties (`--hl-*`, `--gl-*`) and package export paths are public API, so removing or renaming any of them is a major release. See [Versioning policy](AGENTS.md#versioning-policy) for the full rules.
- **Provenance:** packages are published from GitHub Actions with npm trusted publishing and carry provenance attestations.
- **Previews:** every pull request gets installable preview builds from [pkg.pr.new](https://pkg.pr.new), posted as a comment on the PR.

Maintainers release by labeling a PR `patch`, `minor`, `major`, or `launch` for a new system's first release. See [Release Workflow](AGENTS.md#release-workflow).

## Requirements

- Node ≥ 20
- pnpm ≥ 10
