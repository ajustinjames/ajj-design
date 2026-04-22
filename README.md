# ajj-design

Industrial-material design system. Framework-agnostic Web Components built with Lit. Design tokens compiled via Style Dictionary to CSS custom properties (web) and Dart classes (Flutter) from a single source of truth.

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
| `packages/tokens` | `@ajj/tokens` | `tokens.json` → Style Dictionary → `dist/web/tokens.css` + `dist/flutter/*.dart` |
| `packages/components` | `@ajj/components` | Lit Web Components consuming token CSS vars |

## Commands

```bash
pnpm install             # install deps
pnpm tokens:build        # compile tokens (run after any tokens.json change)
pnpm test                # run component tests (Playwright/Chromium, headless)
pnpm storybook           # launch Storybook at localhost:6006
pnpm build-storybook     # build static Storybook
```

## Components

### `<ds-btn>`

Button wrapper — slot-based, style-only. Wrap any `<button>` or `<a>`.

```html
<ds-btn variant="primary" size="md">
  <button>Submit</button>
</ds-btn>
```

| Attribute | Values | Default |
|---|---|---|
| `variant` | `default` \| `primary` \| `ghost` | `default` |
| `size` | `sm` \| `md` | `md` |

Slots: `prefix`, default, `suffix`.

---

### `<ds-card>`

Surface container with hard-cast shadow and hover lift.

```html
<ds-card elevation="2">
  <span slot="header">Title</span>
  <p>Content</p>
</ds-card>
```

| Attribute | Values | Default |
|---|---|---|
| `elevation` | `1` \| `2` \| `3` | `1` |

Slots: `header`, default.

---

### `<ds-input>`

Input wrapper with inline label and unit support. Manages label/input association across shadow DOM.

```html
<ds-input label-for="email" state="default">
  <label slot="label">Email</label>
  <input id="email" type="email" />
</ds-input>

<!-- with unit suffix -->
<ds-input>
  <input type="number" />
  <span slot="unit">kg</span>
</ds-input>
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

### `<ds-label>`

Standalone label — JetBrains Mono, uppercase, wide tracking.

```html
<ds-label for="email">Email</ds-label>
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
var(--ds-btn-bg, var(--ds-alias-action-bg, #FFFFFF))
/*  component      alias token        hard fallback  */
```

Override at any tier by setting the CSS custom property.

Run `pnpm tokens:build` after any `tokens.json` change to regenerate `dist/web/tokens.css` and Flutter Dart classes.

## Adding a Component

Each new component needs:

1. `packages/components/src/ds-<name>/ds-<name>.ts`
2. `packages/components/test/ds-<name>.test.ts`
3. `packages/components/stories/ds-<name>.stories.ts`
4. Barrel export in `packages/components/src/index.ts`

All components extend `LitElement`. Properties that affect style use `reflect: true`. No internal state — visual shells only.

## Requirements

- Node ≥ 20
- pnpm ≥ 10
