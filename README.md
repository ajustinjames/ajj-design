# ajj-design

Industrial-material design system platform. The current system is `hardline`: framework-agnostic Web Components built with Lit, with design tokens compiled via Style Dictionary to CSS custom properties from a single source of truth.

Live Storybook: https://ajustinjames.github.io/ajj-design/

## Design Principles

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

## Requirements

- Node ≥ 20
- pnpm ≥ 10
