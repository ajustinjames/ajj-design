# Design System Completion — ajj-design

**Date:** 2026-05-08
**Scope:** Bug fixes, dark mode tokens, 17 new atoms, Vitest + Playwright screenshot testing, CI/CD

---

## Goal

Make ajj-design production-ready for consumption by external projects (starting with ajustinjames-v2). Four tracks: fix existing design bugs, add a complete atom library, migrate to a modern test stack, and ship CI/CD.

---

## Section 1 — Bug Fixes + Token Additions

### 1.1 `ds-input` Carved Background

**Problem:** Idle background resolves to `#FFFFFF` (`--ds-alias-surface-bg`). Spec requires `#F0F0EC` — the carved affordance that reads as an empty receptacle before focus.

**Fix:** Change `--ds-input-bg` alias default to `--ds-alias-surface-bg-alt` (`#F0F0EC`). Focus state swaps to `--ds-alias-surface-bg` (`#FFFFFF`) as designed. One-line CSS change; token already exists.

### 1.2 `ds-card` Interactive Hover

**Problem:** All cards translate on hover regardless of interactivity. Static data cards (token tables, stat blocks) should not lift.

**Fix:** Add boolean `interactive` prop (reflects to attribute). Scope hover lift behind `:host([interactive]:hover)` and `:host([interactive]:has(*:focus-visible))`. Default: no lift.

```typescript
@property({ type: Boolean, reflect: true }) interactive = false;
```

### 1.3 Disabled States

**Problem:** Neither `ds-btn` nor `ds-input` has a disabled prop. Accessibility gap.

**Fix:** Add boolean `disabled` prop to both components (reflects to attribute).

When disabled:
- Set `aria-disabled="true"` on host
- `pointer-events: none` on host
- Visual: opacity `0.4`, shadow `none`, `cursor: not-allowed` on slotted element
- Slotted native element (`<button>`, `<input>`) keeps its own `disabled` attribute; shell mirrors visually and semantically

### 1.4 Clinical Story Fix

**Problem:** `clinical` arg in `ds-input.stories.ts` is toggled but never passed to `data-type` on the component. Clinical story does nothing.

**Fix:** Render `data-type="clinical"` conditionally in the story render function when `clinical` arg is true.

### 1.5 Dark Mode Token Tier

**Approach:** Single dark alias block in `tokens.json`. Style Dictionary emits two CSS selectors from it:

```css
/* System preference, no manual override */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* dark alias tokens */
  }
}

/* Manual override */
[data-theme="dark"] {
  /* dark alias tokens */
}
```

Light is the `:root` default. Manual switching via `data-theme="light"` | `"dark"` on `<html>`. Respects system preference when no attribute is set.

**Dark alias values:**

| Alias Token | Light | Dark |
|---|---|---|
| `--ds-alias-surface-bg` | `#FFFFFF` | `#1A1A1A` |
| `--ds-alias-surface-bg-alt` | `#F0F0EC` | `#222222` |
| `--ds-alias-surface-border` | `#1A1A1A` | `#404040` |
| `--ds-alias-text-main` | `#1A1A1A` | `#F0F0EC` |
| `--ds-alias-text-muted` | `#666666` | `#999999` |
| `--ds-alias-action-bg` | `#FFFFFF` | `#2A2A2A` |
| `--ds-alias-action-border` | `#1A1A1A` | `#555555` |
| Accent `#FF4F00` | unchanged | unchanged |
| Shadow `#000000` | unchanged | unchanged |

**Storybook:** Theme toggle in the toolbar (`data-theme` set on the story container). Screenshots run in both light and dark.

---

## Section 2 — New Atoms (17 components)

All components follow the Tier A B+ shell pattern: visual skin only, no internal state management, slot-based composition, token fallback chain (`--ds-[component]-* → --ds-alias-* → hard fallback`). Each ships with behavioral tests, screenshot tests, and a Storybook story.

### Form Feedback Atoms (AriaAssociationController already built)

#### `ds-helper-text`
- **Props:** `for?: string`
- **ARIA:** `AriaAssociationController` → `aria-describedby` on target
- **Visual:** JetBrains Mono, 11px, `--ds-alias-text-muted`, not uppercase (readable sentence-length descriptions)
- **Slots:** default (text content)

#### `ds-error-message`
- **Props:** `for?: string`
- **ARIA:** `AriaAssociationController` → `aria-errormessage` + companion `aria-invalid="true"` on target
- **Visual:** JetBrains Mono, 11px, `#CC0000`, CSS `::before` with `■` prefix indicator
- **Slots:** default (error text)

#### `ds-tooltip`
- **Props:** `for?: string`, `placement: 'top' | 'bottom' | 'left' | 'right'` (default `'top'`)
- **ARIA:** `AriaAssociationController` → `aria-describedby`; inner surface has `role="tooltip"`
- **Behavior:** `mouseenter`/`mouseleave` + `focusin`/`focusout` listeners on anchor element; position via `getBoundingClientRect` + `position: fixed`. No Floating UI dependency. No animation (instant show/hide).
- **Visual:** `#1A1A1A` bg, `#F0F0EC` text, JetBrains Mono 11px, hard-cast accent shadow
- **Slots:** default (tooltip content)

### Status / Labelling

#### `ds-badge`
- **Props:** `tone: 'default' | 'accent' | 'success' | 'error' | 'warning'` (default `'default'`)
- **Visual:** JetBrains Mono, 10px, uppercase, 0px radius, 1px solid border, tight padding (2px 6px), no shadow
- **Slots:** default (label text)
- **No behavior.** Static indicator.

#### `ds-tag`
- **Props:** `dismissible: boolean` (default `false`)
- **Visual:** Same base as `ds-badge`, slightly wider padding. When `dismissible`, `<slot name="dismiss">` for a close trigger (consumer-owned `<button>`).
- **Use case:** Post categories, taxonomy labels, filter chips

#### `ds-link`
- **Props:** `tone: 'default' | 'muted' | 'accent'` (default `'default'`)
- **Visual:** Underline decoration, JetBrains Mono or Inter (consumer's choice via token override), no hover color shift — underline weight changes instead (1px → 2px). 0px radius on focus ring.
- **Shell wraps slotted `<a>`.** B+ pattern same as `ds-btn`.

### Layout

#### `ds-divider`
- **Props:** `orientation: 'horizontal' | 'vertical'` (default `'horizontal'`), `tone: 'default' | 'muted'`
- **ARIA:** `role="separator"`
- **Visual:** 1px solid `--ds-alias-surface-border` (default) or muted variant. No shadow.
- **No slots.** Presentational only.

### Form Controls

#### `ds-checkbox`
- **Props:** `disabled: boolean`, `checked: boolean` (reflects), `indeterminate: boolean`
- **Shell wraps slotted `<input type="checkbox">`.** Shell provides the custom visual indicator (0px radius box, hard-cast shadow when checked, accent fill on checked).
- **ARIA:** Delegated to native `<input>` in light DOM.
- **Slots:** default (label text via `<label>` slotted alongside)

#### `ds-radio`
- **Props:** `disabled: boolean`, `checked: boolean` (reflects)
- **Shell wraps slotted `<input type="radio">`.** Custom indicator: square (not circle — manifesto; 0px radius), accent fill on checked.
- **Slots:** default (label text)

#### `ds-toggle`
- **Props:** `checked: boolean` (reflects), `disabled: boolean`
- **ARIA:** `role="switch"`, `aria-checked`
- **Visual:** Rectangular track (0px radius), square thumb slides between positions. Accent fill when on. Hard-cast shadow on thumb. No spring animation — 100ms linear.
- **Emits:** `change` event (mirrors native checkbox pattern)

#### `ds-select`
- **Approach:** Radix UI Select (headless) wrapped in a Lit shell. Radix is permitted by manifesto.
- **Props:** `disabled: boolean`, `placeholder?: string`, `state: 'default' | 'error' | 'success'`
- **Visual:** Same carved shell as `ds-input`. Dropdown panel: `ds-card` elevation-2 treatment, 0px radius, hard-cast shadow, monospace option labels.
- **Slots:** `<option>` elements in light DOM; shell intercepts via Radix.

### Content

#### `ds-code`
- **Props:** `language?: string`, `inline: boolean` (default `false`)
- **Visual:**
  - Block: dark surface (`#1A1A1A`), `#F0F0EC` text, JetBrains Mono, 13px, 16px padding, hard-cast shadow. Optional language label top-right in accent.
  - Inline: accent background tint, Mono, 12px, tight padding, no shadow.
- **No syntax highlighting** — shell only. Consumer can slot pre-highlighted HTML.
- **Slots:** default (code content)

### Feedback / Status

#### `ds-alert`
- **Props:** `tone: 'info' | 'success' | 'warning' | 'error'`
- **ARIA:** `role="alert"` (live region, announced immediately)
- **Visual:** Left border accent (4px solid, tone color), `ds-card` surface treatment, `■` prefix indicator in tone color, JetBrains Mono label, Inter body.
- **Slots:** `header` (title), default (body), `actions` (button row)

#### `ds-spinner`
- **Props:** `size: 'sm' | 'md' | 'lg'` (default `'md'`)
- **ARIA:** `role="status"`, `aria-label="Loading"` (overrideable via slot)
- **Visual:** Rotating square (not circle — 0px radius). Rotation animation: 200ms linear steps (stepped, mechanical feel — not smooth). Accent color.
- **Slots:** `<slot name="label">` (hidden visually, read by screen readers)

#### `ds-progress`
- **Props:** `value: number` (0–100), `max: number` (default 100)
- **Shell wraps `<progress>` element.** Custom styling: rectangular track, accent fill, no radius.
- **ARIA:** `aria-valuenow`, `aria-valuemin`, `aria-valuemax` from props.
- **Visual:** 4px tall track, hard left-border, accent fill bar. No animation on value change — instant.

### Navigation

#### `ds-breadcrumb`
- **ARIA:** `<nav aria-label="breadcrumb">` shell, `<ol>` inner list, `aria-current="page"` on last item.
- **Visual:** JetBrains Mono, 11px, separator token (`--ds-breadcrumb-separator`, default `"/"`), muted color except current item (ink).
- **Slots:** default (slotted `<li>` or `<ds-breadcrumb-item>` elements — consumer-owned)
- **No props.** Structure driven by slotted content.

#### `ds-avatar`
- **Props:** `size: 'sm' | 'md' | 'lg'` (default `'md'`), `initials?: string`
- **Visual:** Square (0px radius), hard-cast shadow. Image via `<img slot="image">` or initials fallback rendered in component. Sizes: sm=24px, md=40px, lg=64px (4px grid).
- **Slots:** `image` (optional `<img>`)

---

## Section 3 — Testing Migration

### Stack Change

| Before | After |
|---|---|
| `@web/test-runner` + Playwright | `@vitest/browser` + Playwright provider |
| `web-test-runner.config.js` | `vitest.config.ts` |
| esbuild TypeScript transformer | Vitest native TypeScript |
| `@open-wc/testing` fixtures | `@open-wc/testing` (unchanged, works in browser mode) |

### Two Test Layers Per Component

**Behavioral (`test/ds-*.test.ts`):**
- Existing tests migrated mechanically (same logic, Vitest API)
- Expanded coverage: state transitions, ARIA attribute writes, focus behavior, slot rendering, disabled states
- Replaces the current prop-only assertions

**Screenshot (`test/ds-*.screenshot.ts`):**
- One screenshot per significant variant (e.g., `btn-primary-md`, `btn-ghost-sm-disabled`)
- Baselines committed to `test/__screenshots__/`
- CI compares against committed baselines, fails on diff
- Baseline updates: local only, committed manually

### Dark Mode Coverage

Screenshot tests run twice per variant — light and dark — via a shared helper:

```typescript
async function withTheme(theme: 'light' | 'dark', fn: () => Promise<void>) {
  document.documentElement.setAttribute('data-theme', theme);
  await fn();
  document.documentElement.removeAttribute('data-theme');
}
```

### Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },
    include: ['test/**/*.test.ts', 'test/**/*.screenshot.ts'],
  },
});
```

---

## Section 4 — CI/CD

### Workflows

**`.github/workflows/ci.yml`** — on push (all branches) + PR:

```yaml
steps:
  - pnpm install (Node 20, pnpm 10, cached store)
  - tsc --noEmit          # type-check
  - pnpm tokens:build     # must precede tests
  - pnpm test             # Vitest browser + Playwright
  - pnpm build-storybook  # verify Storybook builds
```

On screenshot test failure: upload diff artifacts (`test/__screenshots__/diff/`) for review.

**`.github/workflows/deploy-storybook.yml`** — on push to `main` (after CI passes):

```yaml
steps:
  - pnpm install
  - pnpm tokens:build
  - pnpm build-storybook
  - Deploy storybook-static/ to GitHub Pages
```

**`.github/workflows/publish.yml`** — manual trigger (`workflow_dispatch`) or tag push (`v*`):

```yaml
steps:
  - pnpm install
  - pnpm tokens:build
  - pnpm --filter @ajj/tokens build
  - pnpm --filter @ajj/components build
  - npm publish (--access public)
```

### Package Configuration (Prerequisite for Publish)

Both `@ajj/tokens` and `@ajj/components` need proper `exports`, `files`, and `sideEffects` fields before the publish workflow is useful:

```json
// @ajj/components package.json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

Token CSS importable as `@ajj/tokens/dist/web/tokens.css`.

---

## Delivery Order

1. Section 1 bugs + dark mode tokens (foundational — all subsequent work builds on correct tokens)
2. Section 3 testing infra (Vitest migration before new atoms — new atoms get tests from day one)
3. Section 4 CI/CD (lock the pipeline before expanding the component count)
4. Section 2 atoms (built, tested, and deployed through the pipeline)

---

## Anti-Slop Enforcement (All New Atoms)

| Rule | Enforcement |
|---|---|
| No radius > 2px | `border-radius: 0` in all shells |
| No blur shadows | `box-shadow` offset-only, `blurRadius: 0` |
| No gradients | Solid colors only |
| No animation > 200ms | All transitions use `--ds-alias-transition-snappy` (100ms) or `--ds-alias-transition-smooth` (200ms) |
| JetBrains Mono for technical/status/metadata | Enforced per-component in token defaults |
| Inter for UI body | `ds-alert` body, `ds-helper-text` where readability > aesthetics |
| 4px grid spacing | All padding/sizing values divisible by 4 |
