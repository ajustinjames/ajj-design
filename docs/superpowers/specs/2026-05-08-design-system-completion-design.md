# Design System Completion — ajj-design

**Date:** 2026-05-08
**Scope:** Drop Flutter target, bug fixes, dark mode tokens, 17 new atoms, Vitest + Playwright screenshot testing, CI/CD

---

## Goal

Make ajj-design production-ready for consumption by external projects (starting with ajustinjames-v2). Four tracks: fix existing design bugs, add a complete atom library, migrate to a modern test stack, and ship CI/CD.

---

## Section 0 — Precondition: Drop Flutter Target

Before any token, component, or CI work below, remove the Flutter emit path so subsequent token tiers (dark mode, future component tokens) don't get duplicated and then deleted.

**Rationale:** No current or planned Flutter consumer. Web is the only target (Lit shells + Tailwind-compatible CSS for `ajustinjames-v2`). Flutter side ships only color/shadow/spacing constants — no widget shells, no interaction semantics, no parity tests. Carrying the Flutter formats forces double-work on every new token tier (`aliasDark`, future component-tier overrides) for zero downstream value.

**Reversibility:** `tokens.json` stays in DTCG format (portable). Re-adding Flutter formats later is <100 LOC if a real consumer ever materializes.

**Steps:**

1. `packages/tokens/sd.config.js`:
   - Remove the `flutter/app-colors`, `flutter/app-shadows`, `flutter/app-spacing`, `flutter/app-fonts`, `flutter/app-text-styles` format registrations.
   - Remove the `flutter` entry from the `platforms` block. `web` platform stays untouched.
2. Delete `packages/tokens/dist/flutter/` (build artifact; will not regenerate).
3. Update `CLAUDE.md` Overview: drop "and Flutter (Dart classes)" — web-only system going forward.
4. Update `packages/tokens/README.md` (if present) to remove Flutter consumption instructions.

After this section, all subsequent dark-mode and component-tier token additions write only to the web emit path.

---

## Section 1 — Bug Fixes + Token Additions

### 1.1 `ds-input` Carved Background

**Problem:** Idle background resolves to `#FFFFFF` (`--ds-alias-surface-bg`). Spec requires `#F0F0EC` — the carved affordance that reads as an empty receptacle before focus. Focus-state background swap to white is not currently in the code either.

**Fix:** `--ds-input-bg` is a component-tier variable defined in `ds-input.ts` (not an alias in `tokens.json`). Edit the fallback chain in `ds-input.ts`:

```css
:host {
  background: var(--ds-input-bg, var(--ds-alias-surface-bg-alt, #F0F0EC));
}
:host(:focus-within) {
  background: var(--ds-alias-surface-bg, #FFFFFF);
}
```

Tokens already exist; no `tokens.json` change needed.

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
- `pointer-events: none` on host
- Visual: opacity `0.4`, shadow `none`, `cursor: not-allowed` on slotted element
- Slotted native element (`<button>`, `<input>`) keeps its own `disabled` attribute; the native already exposes the disabled state to AT, so the shell does not duplicate `aria-disabled` on the host (host has no role).
- Dev warning if `disabled` is set on the shell but the slotted native is missing `disabled` — they must stay in sync.

### 1.4 Clinical Story Fix

**Problem:** `clinical` arg in `ds-input.stories.ts` is toggled but never passed to `data-type` on the component. Clinical story does nothing.

**Fix:** Render `data-type="clinical"` conditionally in the story render function when `clinical` arg is true.

### 1.5 Dark Mode Token Tier

**Token shape (`tokens.json`):** add a parallel `aliasDark` block mirroring the keys of `alias` for the values that change between modes (only the rows in the table below). Keys not listed inherit from light.

```json
"aliasDark": {
  "surface": { "bg": { "$value": "#1A1A1A" }, "bg-alt": { "$value": "#222222" }, "border": { "$value": "#404040" } },
  "text":    { "main": { "$value": "#F0F0EC" }, "muted": { "$value": "#999999" } },
  "action":  { "bg": { "$value": "#2A2A2A" }, "border": { "$value": "#555555" } }
}
```

**Style Dictionary work (new format + new file):** The current `css/tailwind-theme` format emits a single `@theme {}` block for light tokens — keep it untouched for the light defaults. Add a second format and second output file `tokens-dark.css` that emits dark values under two selectors:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* dark alias tokens — same --ds-alias-* names, dark values */
  }
}
[data-theme="dark"] {
  /* same dark alias tokens, manual override */
}
```

The dark format reads only `aliasDark.*` tokens, rewrites their names to the corresponding `--ds-alias-*` (stripping the `Dark` segment), and concatenates the two selector blocks.

`tokens-dark.css` is imported alongside `tokens.css` in Storybook preview and component bundles.

Light is the `:root` default (from `@theme {}`). Manual switching via `data-theme="light"` | `"dark"` on `<html>`. Respects system preference when no attribute is set.

**Border contrast caveat:** `#404040` border on `#1A1A1A` bg is ~2.2:1 — under WCAG 3:1 minimum for non-text. Acceptable for decorative dividers; for surface borders that carry meaning (input outline, card edge), bump to `#5A5A5A` (≈3.05:1). Update the table accordingly during implementation.

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
- **Behavior:** `mouseenter`/`mouseleave` + `focusin`/`focusout` listeners on anchor element; position via `getBoundingClientRect` + `position: fixed`. No Floating UI dependency. No animation (instant show/hide). While shown, attach `scroll` (capture, passive) + `resize` listeners on `window` that reposition; also dismiss on `Escape` keydown.
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
- **Visual:** Underline decoration. Default font: Inter (UI body context — consumer overrides to mono via `--ds-link-font`). No hover color shift — `text-decoration-thickness` changes instead (1px → 2px). 0px radius on focus ring.
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
- **Native input visibility:** Slotted native is visually hidden (`opacity: 0; position: absolute; inset: 0; margin: 0;`) but remains in the layout/focus order. The shell's drawn indicator overlays it. Click on shell forwards to native via label-wrap or the native already covering the host area.
- **State sync:** Shell reflects `checked` from native via `change` listener on slotted input. `checked` and `indeterminate` props on the shell are *outputs* of the native state, not separate state — read on connect and on every `change`.
- **ARIA:** Delegated to native `<input>` in light DOM.
- **Slots:** default (label text via `<label>` slotted alongside)

#### `ds-radio`
- **Props:** `disabled: boolean`, `checked: boolean` (reflects)
- **Shell wraps slotted `<input type="radio">`.** Custom indicator: square (not circle — manifesto; 0px radius), accent fill on checked.
- **Native input visibility:** Same hide-but-keep-focusable pattern as `ds-checkbox`.
- **State sync:** Same pattern as `ds-checkbox` — shell mirrors native `checked`, does not own it.
- **Slots:** default (label text)

#### `ds-toggle`
- **Approach:** Same B+ pattern — shell wraps slotted `<input type="checkbox">`, no internal state. The thumb position is driven entirely by `:host([checked])` reflecting the native input's `change`-synced state, identical to `ds-checkbox`. There is **no Tier A exception**.
- **Props:** `checked: boolean` (reflects, mirrors native), `disabled: boolean`
- **ARIA:** Native `<input type="checkbox">` already exposes a checkbox role; for affordance, the shell may add `role="switch"` *on the slotted input* via a connection-time attribute write only if no `role` is present (consumer override wins). Do not put `role="switch"` on the host.
- **Visual:** Rectangular track (0px radius), square thumb slides between positions. Accent fill when on. Hard-cast shadow on thumb. 100ms linear thumb translate.
- **Emits:** `change` re-fired from host (consumers listen on `<ds-toggle>`).

#### `ds-select`
- **Approach:** B+ shell over native `<select>` — same pattern as `ds-checkbox`/`ds-radio`. Shell provides custom trigger appearance; native `<select>` handles all keyboard navigation, accessibility, and mobile platform picker. No Radix dependency (Radix is React-only; not usable in Lit).
- **Props:** `disabled: boolean`, `placeholder?: string`, `state: 'default' | 'error' | 'success'`
- **Visual:** Same carved shell as `ds-input`. Trigger shows selected value in monospace. Dropdown appearance is browser/OS native (not overridden — acceptable trade-off for full a11y without a custom listbox).
- **Slots:** default (slotted native `<select>` with `<option>` children, consumer-owned)

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
- **Props:** `size: 'sm' | 'md' | 'lg'` (default `'md'`), `label: string` (default `'Loading'`)
- **ARIA:** `role="status"`, `aria-label` bound to `label` prop — consumer overrides via prop, not slot
- **Visual:** Rotating square (not circle — 0px radius). Accent color.
- **Animation:** stepped rotation, 8 frames per turn, 800ms per full revolution (`animation: ds-spin 800ms steps(8, end) infinite`). This is a keyframe animation, **not** a CSS transition — it does not use `--ds-alias-transition-*` (those are `ease`/`linear` transitions, not `steps()`). Step timing is intentional (mechanical feel, anti-slop manifesto).
- **No slots.** Purely visual; all accessible text via `label` prop.

#### `ds-progress`
- **Props:** `value: number` (0–100), `max: number` (default 100)
- **Shell wraps slotted `<progress>` element.** Single source of truth for ARIA is the native `<progress>` — it provides `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` automatically. Shell does **not** duplicate ARIA attributes. Shell `value`/`max` props, when set, write through to the slotted `<progress>` (mirror pattern), and consumers may also set them directly on the native; either works.
- **Custom styling:** rectangular track, accent fill, no radius. Slotted progress styled via `::slotted(progress)` with `appearance: none` + browser-specific pseudo-elements (`::-webkit-progress-bar`, `::-webkit-progress-value`, `::-moz-progress-bar`).
- **Visual:** 4px tall track, hard left-border, accent fill bar. No animation on value change — instant.

### Navigation

#### `ds-breadcrumb`
- **ARIA:** `<nav aria-label="breadcrumb">` shell, `<ol>` inner list, `aria-current="page"` on last item.
- **Visual:** JetBrains Mono, 11px, separator token (`--ds-breadcrumb-separator`, default `"/"`), muted color except current item (ink).
- **Slots:** default (slotted `<li>` or `<ds-breadcrumb-item>` elements — consumer-owned)
- **No props.** Structure driven by slotted content.

#### `ds-avatar`
- **Props:** `size: 'sm' | 'md' | 'lg'` (default `'md'`), `initials?: string`
- **Render rules (priority order):**
  1. If a non-empty `image` slot is assigned → render slotted `<img>`, hide initials.
  2. Else if `initials` prop is set → render initials (`<span>` in JetBrains Mono, uppercase).
  3. Else → render an empty square placeholder (filled with `--ds-alias-surface-bg-alt`).
- Use `slotchange` on the `image` slot + a property-changed observer on `initials` to switch between modes; expose the active mode via `data-mode="image" | "initials" | "empty"` for styling and tests.
- **Visual:** Square (0px radius), hard-cast shadow. Sizes: sm=24px, md=40px, lg=64px (4px grid).
- **Slots:** `image` (optional `<img>`)

---

## Section 3 — Testing Migration

### Stack Change

| Before | After |
|---|---|
| `@web/test-runner` + Playwright | `@vitest/browser` + Playwright provider |
| `web-test-runner.config.js` | `vitest.config.ts` |
| `tsconfig.test.json` (esbuild) | **deleted** — Vitest uses native TS |
| esbuild TypeScript transformer | Vitest native TypeScript |
| `@open-wc/testing` fixtures | `@open-wc/testing` (unchanged, works in browser mode) |

**Cleanup:** remove `@web/test-runner`, `@web/test-runner-playwright`, `@web/dev-server-esbuild`, and `tsconfig.test.json` from `packages/components/`. Update the `test` and `test:watch` scripts to invoke `vitest`.

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
  - pnpm exec playwright install --with-deps chromium   # required by vitest browser mode
  - tsc --noEmit                                         # type-check
  - pnpm tokens:build                                    # must precede tests
  - pnpm test                                            # Vitest browser + Playwright
  - pnpm build-storybook                                 # verify Storybook builds
```

Cache the Playwright browser download (key includes the Playwright version) so installs are skipped on cache hit.

On screenshot test failure: upload diff artifacts (`test/__screenshots__/diff/`) for review.

**`.github/workflows/deploy-storybook.yml`** — on push to `main` (after CI passes):

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
steps:
  - pnpm install
  - pnpm tokens:build
  - pnpm build-storybook
  - actions/configure-pages
  - actions/upload-pages-artifact (path: storybook-static)
  - actions/deploy-pages
```

GitHub Pages must be enabled for the repo (`Settings → Pages → Source: GitHub Actions`) — one-time manual setup before the workflow can deploy.

**`.github/workflows/publish.yml`** — manual trigger (`workflow_dispatch`) or tag push (`v*`):

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
steps:
  - pnpm install
  - pnpm tokens:build
  - pnpm --filter @ajj/components build      # tsc → dist/
  - pnpm -r publish --access public --no-git-checks
```

`NPM_TOKEN` must be added as a repo secret. The job uses `actions/setup-node` with `registry-url: 'https://registry.npmjs.org'` so npm auth picks up `NODE_AUTH_TOKEN`.

### Package Configuration (Prerequisite for Publish)

**`@ajj/components` needs a build pipeline.** It currently has no `build` script and `exports` points at `./src/index.ts`. Add:

```json
// packages/components/package.json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css", "./dist/index.js"]
}
```

`sideEffects` lists `dist/index.js` because the barrel registers custom elements via `customElements.define` side effects — bundlers must not tree-shake the barrel.

A new `tsconfig.build.json` extends the existing config with `outDir: "dist"`, `declaration: true`, `emitDeclarationOnly: false`, and excludes `test/` and `stories/`.

`@ajj/tokens` already has `exports`. Add `"files": ["dist"]` and confirm `dist/web/tokens.css` is importable as `@ajj/tokens/dist/web/tokens.css` (it is, given the existing root export). Add a subpath export if a cleaner consumer import is desired:

```json
"exports": {
  ".": "./dist/web/tokens.css",
  "./css": "./dist/web/tokens.css",
  "./css-dark": "./dist/web/tokens-dark.css"
}
```

---

## Delivery Order

1. Section 0 Flutter drop (precondition — avoids duplicated token work)
2. Section 1 bugs + dark mode tokens (foundational — all subsequent work builds on correct tokens)
3. Section 3 testing infra (Vitest migration before new atoms — new atoms get tests from day one)
4. Section 4 CI/CD (lock the pipeline before expanding the component count)
5. Section 2 atoms (built, tested, and deployed through the pipeline)

---

## Anti-Slop Enforcement (All New Atoms)

| Rule | Enforcement |
|---|---|
| No radius > 2px | `border-radius: 0` in all shells |
| No blur shadows | `box-shadow` offset-only, `blurRadius: 0` |
| No gradients | Solid colors only |
| No animation > 200ms | All *transitions* use `--ds-alias-transition-snappy` (100ms linear) or `--ds-alias-transition-smooth` (200ms ease). Keyframe animations (e.g. `ds-spinner`) are not transitions and may use `steps()` timing — they still respect the 200ms-per-revolution-segment cap, but are exempt from the alias tokens. |
| JetBrains Mono for technical/status/metadata | Enforced per-component in token defaults |
| Inter for UI body | `ds-alert` body, `ds-helper-text` where readability > aesthetics |
| 4px grid spacing | All padding/sizing values divisible by 4 |
