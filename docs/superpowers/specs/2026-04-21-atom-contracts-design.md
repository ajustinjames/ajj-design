# Atom Component Contracts — IND-MAT Design System

**Date:** 2026-04-21  
**Components:** `<ds-card>`, `<ds-label>`, `<ds-btn>`, `<ds-input>`  
**Scope:** Token slots, Lit API, Flutter parity, anti-slop enforcement

---

## Architectural Decisions

### Tailwind CSS v4 Role
Tailwind v4 is the **token output format only**. Style Dictionary v4 generates the `@theme {}` block. Lit shadow DOM never uses Tailwind utility classes — only `var(--ds-*)` custom properties. Tailwind remains in page-level scaffold and demo HTML only.

### Token Tier Structure
Three tiers per manifesto. All component styles trace this chain:

```
Global → Alias → Component
var(--ds-global-*) → var(--ds-alias-*) → var(--ds-[component]-*)
```

Component tokens override alias defaults. Alias tokens enable group-level theming. Style Dictionary feeds all three tiers; the `@theme {}` block is the web output.

### Interactive Shell Pattern (B+ Standard)
All Tier A components use the **B+ Shell** model:
- The Lit component owns the visual skin (border, shadow, background, typography)
- The slotted element owns behavior (click, keyboard, routing, form state)
- `:host(:hover)` and `:host(:has(*:focus-visible))` forward pseudo-states from slotted children to the shell without JS
- `:host { display: block; }` is the first rule in every component's shadow stylesheet — enforced in shared Lit base class

### Flutter Parity Strategy
- **Default:** Token parity (Option A). Consumer builds Flutter-native widgets consuming Style Dictionary outputs (`AppColors`, `AppSpacing`, `AppShadows`, `AppFonts`).
- **Exception:** Widget template (Option B) where Flutter's native widgets cannot achieve visual parity. `DataInput` is the first confirmed exception (see below).
- `AppShadows.elevation` is a `Map<int, BoxShadow>` with `blurRadius: 0` — mirrors the `elevation` prop exactly. Flutter's built-in elevation system is never used.

### Global Tier Inventory

Full `--ds-global-*` layer lives in `packages/tokens/tokens.json`. Alias and component tiers shown inline per-component contract.

| Category | Token | Value |
|---|---|---|
| Neutral | `--ds-global-color-ink` | `#1A1A1A` |
| Neutral | `--ds-global-color-muted` | `#666666` |
| Neutral | `--ds-global-color-bg` | `#F0F0EC` |
| Neutral | `--ds-global-color-surface` | `#FFFFFF` |
| Neutral | `--ds-global-color-surface-dark` | `#1A1A1A` |
| Accent | `--ds-global-color-accent` | `#FF4F00` |
| Accent | `--ds-global-color-accent-contrast` | `#FFFFFF` |
| Status | `--ds-global-color-error` | `#CC0000` (WCAG AA on `#F0F0EC`) |
| Status | `--ds-global-color-success` | `#1A6B1A` (WCAG AA on `#F0F0EC`) |
| Shadow | `--ds-global-shadow-color` | `#000000` (pure black — industrial harshness) |
| Shadow | `--ds-global-shadow-inset-color` | `rgba(0,0,0,0.1)` |
| Motion | `--ds-global-duration-snappy` | `100ms` |
| Motion | `--ds-global-duration-smooth` | `200ms` |
| Motion | `--ds-global-easing-linear` | `linear` |
| Motion | `--ds-global-easing-smooth` | `ease` |

Shadow color is pure `#000000` by decision — ink (`#1A1A1A`) softens the cast. Shadows and ink diverge on purpose.

Key alias derivations:

| Alias | Value |
|---|---|
| `--ds-alias-shadow-0` | `1px 1px 0px var(--ds-global-shadow-color)` (compressed — active press) |
| `--ds-alias-shadow-1` | `2px 2px 0px var(--ds-global-shadow-color)` |
| `--ds-alias-shadow-2` | `4px 4px 0px var(--ds-global-shadow-color)` |
| `--ds-alias-shadow-3` | `8px 8px 0px var(--ds-global-shadow-color)` |
| `--ds-alias-shadow-inset` | `inset 1px 1px 0px var(--ds-global-shadow-inset-color)` |
| `--ds-alias-shadow-accent` | `2px 2px 0px var(--ds-global-color-accent)` |
| `--ds-alias-shadow-error` | `2px 2px 0px var(--ds-global-color-error)` |
| `--ds-alias-transition-snappy` | `var(--ds-global-duration-snappy) var(--ds-global-easing-linear)` |
| `--ds-alias-transition-smooth` | `var(--ds-global-duration-smooth) var(--ds-global-easing-smooth)` |

### Motion Policy

Two tiers. No spring. No duration > 200ms.

| Alias | Use |
|---|---|
| `--ds-alias-transition-snappy` (100ms linear) | Transform + shadow (hover/active) |
| `--ds-alias-transition-smooth` (200ms ease) | Color + background swaps (state changes) |

Instant state = broken feel. Tokenized motion = deterministic. Reject easing curves that bounce or overshoot.

### Accessibility & Documentation Contract

Every Tier A component ships:

- **A11y backing** appropriate to the interaction. ID-association A11y (label, helper text, error message, tooltip) uses the `AriaAssociationController` defined below. Behavioral A11y (focus trap, roving tabindex, dismiss semantics) references Radix patterns ported to Lit per-component as needed. No React runtime dependency.
- **Storybook 10.x story file** covering every variant × state × slot combination. Required for merge.

Per-component deliverable rows in each contract below.

### Cross-Seam ARIA Association (`AriaAssociationController`)

Tier A foundations primitive. Single Lit `ReactiveController` that bridges ARIA id references across shadow DOM seams — the boundary where `<label for>` and other tree-scoped HTML associations break by spec.

**Why it exists.** `<label for>` resolves only within its own tree-scope (HTML spec, DOM tree-scope rules). A `<label>` inside a shadow root cannot reach an `<input>` in light DOM, and vice versa. ARIA id references (`aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-errormessage`) are the only mechanism that survives the seam — provided both ends share a common ancestor tree-scope and the id is resolvable from the target's perspective. The controller centralizes that resolution.

**API.**

```typescript
type AriaAssoc =
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-controls'
  | 'aria-errormessage';

interface AriaAssociationOptions {
  attribute: AriaAssoc;
  target: () => string | undefined;   // reactive target id (host re-runs on update)
  also?: Partial<Record<string, string>>; // companion attrs, e.g. { 'aria-invalid': 'true' }
}

class AriaAssociationController implements ReactiveController {
  constructor(host: ReactiveControllerHost & HTMLElement, opts: AriaAssociationOptions) { /* ... */ }
  hostConnected(): void   // mints host id if missing, resolves target, writes/appends id ref
  hostUpdated(): void     // re-resolves on target change, prunes prior writes
  hostDisconnected(): void // removes the id ref token; leaves other tokens intact
}
```

**Resolution algorithm.** The controller must reach a target id that may live above the host's shadow root or in the document. Walk:

```typescript
function resolveTarget(host: HTMLElement, id: string): HTMLElement | null {
  let scope: Node = host.getRootNode();           // start at host's tree-scope
  while (scope) {
    const found = (scope as Document | ShadowRoot).getElementById?.(id);
    if (found) return found;
    if (scope instanceof ShadowRoot) {
      scope = scope.host.getRootNode();           // climb past the shadow boundary
    } else {
      break;                                      // reached document root
    }
  }
  return document.getElementById(id);             // last-resort document fallback
}
```

`getRootNode()` is the load-bearing call: it returns the nearest containing tree-scope (a `ShadowRoot` or the `Document`). From a `ShadowRoot`, `.host.getRootNode()` climbs into the parent scope. The loop guarantees the target is found regardless of how many shadow boundaries sit between host and target — a property neither plain `document.getElementById` nor `querySelector` can offer alone.

**Multi-token writes.** All four supported attributes are space-separated id-ref lists. Controller reads existing tokens, dedupes, appends host id, joins. Disconnect prunes only the host's own token so other consumers' associations survive.

**Stable id strategy / SSR.** Two-mode contract:

| Mode | Behavior | When |
|---|---|---|
| **Inherit** (default) | If consumer set `host.id`, use it verbatim. No mint, no SSR mismatch. | Always preferred. The `label-for` / `for` props already require consumer-supplied ids on the *target*; symmetry pushes consumers toward setting host ids too. |
| **Late-mint** | If `host.id` missing, mint `${tagName}-${crypto.randomUUID().slice(0,8)}` inside `hostConnected` only. SSR output never includes the minted id. | Escape valve for non-critical associations (tooltip, transient helper) where late wiring after hydration is acceptable. Mission-critical A11y (label, error) MUST use Inherit — enforced by dev-only warning when `attribute` is `aria-labelledby` or `aria-errormessage` and id was minted. |

The mint runs in `hostConnected`, which on SSR-rendered components fires only after client hydration — so the server-rendered DOM never contains the minted id. Hydration mismatch is structurally impossible because the server output omits the id entirely; the client adds it as a post-hydration mutation, not a reconciliation diff. Consumers needing server-rendered ARIA wiring set `id` explicitly upfront.

When Lit SSR (`@lit-labs/ssr`) is adopted, the controller adds an `idStrategy: 'ssr-deterministic'` option backed by Lit SSR's per-render id sequencer — same contract, server-stable ids. Tracked but out of scope for v1.

**Consumers (mapping).**

| Atom | Attribute | Companion |
|---|---|---|
| `<ds-label for>` | `aria-labelledby` | — |
| `<ds-helper-text for>` | `aria-describedby` | — |
| `<ds-error-message for>` | `aria-errormessage` | `aria-invalid="true"` on target |
| `<ds-tooltip for>` | `aria-describedby` | — |

`<ds-label>` reference implementation:

```typescript
@customElement('ds-label')
class DsLabel extends LitElement {
  @property({ type: String, reflect: true }) for?: string;
  // ...
  #aria = new AriaAssociationController(this, {
    attribute: 'aria-labelledby',
    target: () => this.for,
  });
}
```

Per-component `connectedCallback` ARIA bridging is removed once the controller is wired in — single source of truth.

---

## Component Contract: `<ds-card>`

### Token Slots

| Component Token | Alias Default | Global Value |
|---|---|---|
| `--ds-card-bg` | `--ds-alias-surface-bg` | `#FFFFFF` |
| `--ds-card-border-color` | `--ds-alias-surface-border` | `#1A1A1A` |
| `--ds-card-border-width` | `--ds-alias-surface-border-width` | `1px` |
| `--ds-card-shadow` | `--ds-alias-shadow-1` | `2px 2px 0px #000000` |
| `--ds-card-padding` | `--ds-alias-surface-padding` | `24px` |
| `--ds-card-radius` | `--ds-alias-radius-default` | `0px` |

### Lit API

```typescript
@customElement('ds-card')
class DsCard extends LitElement {
  @property({ type: Number, reflect: true }) elevation: 1 | 2 | 3 = 1;

  // Slots
  //   <slot>                → default body
  //   <slot name="header">  → optional header region
  //
  // Parts (escape hatch — layout overrides only)
  //   ::part(root)          → applied to inner wrapper <div part="root">
  //
  // Events: none — Tier A visual-only.
}
```

### Pseudo-State Logic

```css
:host {
  display: block;
  box-shadow: var(--ds-card-shadow);
  transition:
    transform var(--ds-alias-transition-snappy),
    box-shadow var(--ds-alias-transition-snappy);
}

/* Elevation prop → shadow token binding */
:host([elevation="1"]) { --ds-card-shadow: var(--ds-alias-shadow-1); }
:host([elevation="2"]) { --ds-card-shadow: var(--ds-alias-shadow-2); }
:host([elevation="3"]) { --ds-card-shadow: var(--ds-alias-shadow-3); }

:host(:hover),
:host(:has(*:focus-visible)) {
  transform: translate(-1px, -1px);
  --ds-card-shadow: var(--ds-alias-shadow-2);
}
```

### Deliverables

| Item | Status |
|---|---|
| A11y backing | None — no interactive A11y logic |
| Storybook 10.x story | Required: elevation 1/2/3 × hover state × with/without header slot |

Consumer usage:
```html
<ds-card elevation="2">
  <article>...</article>
</ds-card>
```

### Flutter Parity (Token Parity — Option A)

```dart
// Style Dictionary output
static const Map<int, BoxShadow> elevation = {
  1: BoxShadow(offset: Offset(2, 2), blurRadius: 0, color: Color(0xFF000000)),
  2: BoxShadow(offset: Offset(4, 4), blurRadius: 0, color: Color(0xFF000000)),
  3: BoxShadow(offset: Offset(8, 8), blurRadius: 0, color: Color(0xFF000000)),
};

// Consumer
Container(
  padding: EdgeInsets.all(AppSpacing.space6),
  decoration: BoxDecoration(
    color: AppColors.surface,
    border: Border.all(color: AppColors.ink, width: 1),
    boxShadow: [AppShadows.elevation[widget.elevation]!],
  ),
)
```

### Anti-Slop Enforcement

| Rule | Enforcement |
|---|---|
| No radius > 2px | `--ds-alias-radius-default: 0px` — override requires explicit opt-in |
| No blur shadow | `AppShadows.elevation` has `blurRadius: 0` in Style Dictionary output |
| No gradient background | `--ds-card-bg` accepts color values only |
| Hover = translate + shadow step-up, not opacity/glow | `:host(:hover)` CSS only, no JS animation |

---

## Component Contract: `<ds-label>`

Standalone typography atom. Independent of `<ds-input>` so clinical UIs can pair labels with read-only data points, status indicators, legends, or non-form metadata.

### Token Slots

| Component Token | Alias Default | Global Value |
|---|---|---|
| `--ds-label-font` | `--ds-alias-font-technical` | JetBrains Mono |
| `--ds-label-size` | `--ds-alias-font-size-label` | `11px` |
| `--ds-label-color` | `--ds-alias-text-main` | `#1A1A1A` |
| `--ds-label-letter-spacing` | `--ds-alias-tracking-wide` | `0.05em` |
| `--ds-label-margin-bottom` | `--ds-alias-space-1` | `4px` |

### Lit API

```typescript
@customElement('ds-label')
class DsLabel extends LitElement {
  /**
   * Target input id. Mirrors `<label for>` ergonomics, but wired via ARIA
   * because `<label for>` inside shadow DOM cannot reach light-DOM ids
   * (HTML spec: `for` resolves only within the same tree-scope).
   */
  @property({ type: String, reflect: true }) for?: string;
  @property({ type: String, reflect: true }) tone: 'default' | 'muted' | 'accent' = 'default';

  // Slots
  //   <slot>  → label text
  //
  // Parts
  //   ::part(root)
  //
  // Events: none.

  // ARIA bridging delegated to the foundations controller.
  #aria = new AriaAssociationController(this, {
    attribute: 'aria-labelledby',
    target: () => this.for,
  });
}
```

`for` semantics preserved at the API surface; the bridge is `aria-labelledby` written onto the target by `AriaAssociationController` — the only mechanism that survives shadow DOM boundaries. No internal `<label for>` is rendered; it would be a no-op per HTML spec. SSR-safe consumers set `id` on `<ds-label>` explicitly (Inherit mode); otherwise the controller late-mints client-side.

### Shell CSS

```css
:host {
  display: block;
  font-family: var(--ds-label-font);
  font-size: var(--ds-label-size);
  color: var(--ds-label-color);
  text-transform: uppercase;
  letter-spacing: var(--ds-label-letter-spacing);
  margin-bottom: var(--ds-label-margin-bottom);
  transition: color var(--ds-alias-transition-smooth);
}
:host([tone="muted"])  { color: var(--ds-alias-text-muted); }
:host([tone="accent"]) { color: var(--ds-global-color-accent); }
```

### Flutter Parity (Token Parity — Option A)

Style Dictionary exports `AppTextStyles.label`. The 11px/mono treatment is identical across web and Flutter.

```dart
// Style Dictionary output
class AppTextStyles {
  static const TextStyle label = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    letterSpacing: 0.55,   // 0.05em × 11px
    color: AppColors.ink,
  );
  static const TextStyle labelMuted  = TextStyle(/* ...color: AppColors.muted */);
  static const TextStyle labelAccent = TextStyle(/* ...color: AppColors.accent */);
}

// Consumer
Text('SYSTEM_KEY', style: AppTextStyles.label.copyWith(/* overrides if needed */))
```

### Deliverables

| Item | Status |
|---|---|
| A11y backing | `AriaAssociationController` (see foundations) — handles `aria-labelledby` write to target |
| Storybook 10.x story | Required: default × muted × accent × paired-with-`<ds-input>` |

### Anti-Slop Enforcement

| Rule | Enforcement |
|---|---|
| Always uppercase | Static `text-transform: uppercase` in shell CSS |
| Always monospaced | `--ds-label-font` defaults to JetBrains Mono — overrideable only via explicit token override |
| Fixed 11px | No `size` prop — density is the rule |
| No floating/animated label behavior | Standalone atom, never repositioned by consumers |

---

## Component Contract: `<ds-btn>`

### Token Slots

| Component Token | Alias Default | Global Value |
|---|---|---|
| `--ds-btn-bg` | `--ds-alias-action-bg` | `#FFFFFF` |
| `--ds-btn-bg-primary` | `--ds-alias-action-bg-primary` | `#FF4F00` |
| `--ds-btn-color` | `--ds-alias-action-color` | `#1A1A1A` |
| `--ds-btn-color-primary` | `--ds-alias-action-color-primary` | `#FFFFFF` |
| `--ds-btn-border-color` | `--ds-alias-action-border` | `#1A1A1A` |
| `--ds-btn-shadow` | `--ds-alias-shadow-1` | `2px 2px 0px #000000` |
| `--ds-btn-font` | `--ds-alias-font-technical` | JetBrains Mono |
| `--ds-btn-font-size` | `--ds-alias-font-size-btn` | `12px` |
| `--ds-btn-font-size-sm` | `--ds-alias-font-size-btn-sm` | `10px` |
| `--ds-btn-font-weight` | `--ds-alias-font-weight-bold` | `600` |
| `--ds-btn-padding-x` | `--ds-alias-action-padding-x` | `16px` |
| `--ds-btn-padding-y` | `--ds-alias-action-padding-y` | `12px` |
| `--ds-btn-padding-x-sm` | `--ds-alias-action-padding-x-sm` | `12px` |
| `--ds-btn-padding-y-sm` | `--ds-alias-action-padding-y-sm` | `4px` |

Sizing math (4px grid enforced both sizes):

- `md`: `12px` padding-y + `16px` line-height + `12px` padding-y = **40px** tap target (10-unit block).
- `sm`: `4px` padding-y + `16px` line-height + `4px` padding-y = **24px** tap target (6-unit block).
- `padding-x`: `16px` / `12px` — both divisible by 4.

Example HTML's `10px`/`6px` values were eyeballed; spec overrides — grid is law.

### Lit API

```typescript
@customElement('ds-btn')
class DsBtn extends LitElement {
  @property({ type: String, reflect: true }) variant: 'default' | 'primary' | 'ghost' = 'default';
  @property({ type: String, reflect: true }) size: 'sm' | 'md' = 'md';

  // Slots
  //   <slot name="prefix">  → icon before label
  //   <slot>                → native interactive element (<button>, <a>, routerLink host)
  //   <slot name="suffix">  → icon after label
  //
  // Parts (escape hatch — layout overrides only)
  //   ::part(root)
  //
  // Events: none — Tier A. Slotted element owns click/keyboard/routing.
}
```

### Pseudo-State Logic

```css
:host {
  display: inline-block;
  transform: translate(0, 0);
  --ds-btn-shadow: var(--ds-alias-shadow-1);
  transition:
    transform    var(--ds-alias-transition-snappy),
    box-shadow   var(--ds-alias-transition-snappy),
    background   var(--ds-alias-transition-smooth),
    color        var(--ds-alias-transition-smooth),
    border-color var(--ds-alias-transition-smooth);
}

/* Variant → token bindings. B+ Shell: shell owns visual skin. */
:host([variant="default"]) {
  --ds-btn-bg:           var(--ds-alias-action-bg);
  --ds-btn-color:        var(--ds-alias-action-color);
  --ds-btn-border-color: var(--ds-alias-action-border);
  --ds-btn-border-style: solid;
}
:host([variant="primary"]) {
  --ds-btn-bg:           var(--ds-alias-action-bg-primary);
  --ds-btn-color:        var(--ds-alias-action-color-primary);
  --ds-btn-border-color: var(--ds-alias-action-bg-primary);
  --ds-btn-border-style: solid;
}
:host([variant="ghost"]) {
  --ds-btn-bg:           transparent;
  --ds-btn-shadow:       none;
  --ds-btn-border-style: dashed;
}

/* Size → padding/font bindings */
:host([size="md"]) {
  --ds-btn-padding-x: var(--ds-alias-action-padding-x);
  --ds-btn-padding-y: var(--ds-alias-action-padding-y);
  --ds-btn-font-size: var(--ds-alias-font-size-btn);
}
:host([size="sm"]) {
  --ds-btn-padding-x: var(--ds-alias-action-padding-x-sm);
  --ds-btn-padding-y: var(--ds-alias-action-padding-y-sm);
  --ds-btn-font-size: var(--ds-alias-font-size-btn-sm);
}

:host(:hover),
:host(:has(*:focus-visible)) {
  transform: translate(-1px, -1px);
  --ds-btn-shadow: var(--ds-alias-shadow-2);
}

/* Press: translate +1/+1 paired with shadow compressed to 1/1 keeps total
   visual footprint constant. Setting shadow `none` here would shrink the
   bottom-right edge by 2px and read as a jitter, not a press. */
:host(:has(*:active)) {
  transform: translate(1px, 1px);
  --ds-btn-shadow: var(--ds-alias-shadow-0);
}

/* Ghost has no shadow to compress — suppress translate so press doesn't jitter */
:host([variant="ghost"]:has(*:active)) { transform: translate(0, 0); }

/* Slotted element: typography + zero-radius enforced, not optional. */
::slotted(*) {
  font-family: var(--ds-btn-font);
  font-size:   var(--ds-btn-font-size);
  font-weight: var(--ds-btn-font-weight);
  text-transform: uppercase;
  border-radius: 0;
  border: 1px solid var(--ds-btn-border-color);
  border-style: var(--ds-btn-border-style, solid);
  background: var(--ds-btn-bg);
  color: var(--ds-btn-color);
  padding: var(--ds-btn-padding-y) var(--ds-btn-padding-x);
  box-shadow: var(--ds-btn-shadow);
  cursor: pointer;
}
```

### B+ Shell Usage

```html
<!-- Plain HTML -->
<ds-btn variant="primary">
  <button type="submit">Execute Protocol</button>
</ds-btn>

<!-- React Router -->
<ds-btn variant="primary">
  <Link to="/dashboard">Dashboard</Link>
</ds-btn>

<!-- Angular -->
<ds-btn>
  <a routerLink="/path">Navigate</a>
</ds-btn>
```

### Flutter Parity (Token Parity — Option A)

Use `BoxShadow` with `AppShadows.elevation`, not Flutter's built-in elevation system. Flutter elevation uses ambient/direct shadow mix — cannot produce a hard-cast shadow.

```dart
TextButton(
  style: TextButton.styleFrom(
    backgroundColor: AppColors.accent,
    foregroundColor: AppColors.accentContrast,
    padding: EdgeInsets.symmetric(
      horizontal: AppSpacing.space4,  // 16px
      vertical: AppSpacing.space3,    // 12px
    ),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
    textStyle: TextStyle(fontFamily: AppFonts.mono, fontSize: 12),
  ),
)
```

### Anti-Slop Enforcement

| Rule | Enforcement |
|---|---|
| No `border-radius` | `border-radius: 0` on `::slotted(*)`, `BorderRadius.zero` in Flutter |
| Ghost = dashed border, not opacity fade | `border-style: dashed` via shell token override |
| `text-transform: uppercase` | Enforced on `::slotted(*)` — not a prop, not optional |
| Active = physical press (translate positive) | CSS only, no spring/easing |
| 4px grid compliant | `md`: 40px tap / `sm`: 24px tap — both multiples of 4 |

### Deliverables

| Item | Status |
|---|---|
| A11y backing | None at the shell level — slotted native element is consumer-owned (React Router `<Link>`, Angular `routerLink`, plain `<button>`) and carries its own semantics |
| Storybook 10.x story | Required: variant (default / primary / ghost) × size (sm / md) × state (idle / hover / focus-visible / active) |

---

## Component Contract: `<ds-input>`

### Flutter Status (Widget Template — Option B)

`DataInput` is a confirmed Widget Template exception. Flutter's `InputDecoration` cannot produce a hard-cast `box-shadow` on focus. Implementation: `StatefulWidget` wraps `TextField` in a `Container` and swaps `BoxDecoration` on `FocusNode` state change.

### Token Slots

| Component Token | Alias Default | Global Value |
|---|---|---|
| `--ds-input-bg` | `--ds-alias-surface-bg-alt` | `#F0F0EC` (idle) |
| `--ds-input-bg-focus` | `--ds-alias-surface-bg` | `#FFFFFF` (focus — bg swap is the "carved → active" signal) |
| `--ds-input-border` | `--ds-alias-surface-border` | `#1A1A1A` |
| `--ds-input-border-error` | `--ds-alias-status-error` | `#CC0000` |
| `--ds-input-border-success` | `--ds-alias-status-success` | `#1A6B1A` |
| `--ds-input-shadow-idle` | `--ds-alias-shadow-inset` | `inset 1px 1px 0px rgba(0,0,0,0.1)` |
| `--ds-input-shadow-focus` | `--ds-alias-shadow-accent` | `2px 2px 0px #FF4F00` |
| `--ds-input-shadow-error` | `--ds-alias-shadow-error` | `2px 2px 0px #CC0000` |
| `--ds-input-text` | `--ds-alias-text-main` | `#1A1A1A` |
| `--ds-input-padding` | `--ds-alias-input-padding` | `8px` (compact: `4px`) |
| `--ds-input-font-value` | `--ds-alias-font-ui` | Inter (`[data-type="clinical"]`: Mono) |

Idle state is deliberately "carved": recessed inset shadow + `#F0F0EC` bg reads as an empty receptacle. On focus, bg swaps to `#FFFFFF` and inset shadow lifts into the accent hard-cast — mechanical affordance, not an animation.

### Lit API

```typescript
@customElement('ds-input')
class DsInput extends LitElement {
  @property({ type: String, reflect: true }) state: 'default' | 'error' | 'success' = 'default';
  @property({ type: String, reflect: true }) density: 'compact' | 'default' = 'default';

  /**
   * Points to the slotted input's `id`. Mirrors native `<label for>` semantics.
   * When set, `connectedCallback` auto-wires `label[for]` and input `id`
   * so screen readers can associate them across the Shadow DOM seam.
   */
  @property({ type: String, reflect: true, attribute: 'label-for' }) labelFor?: string;

  /**
   * Clinical data surface — forces JetBrains Mono on slotted input for numeric values.
   * Kept as `data-type` attribute (not boolean) to preserve CSS selector `[data-type="clinical"]`.
   */
  @property({ type: String, reflect: true, attribute: 'data-type' }) dataType?: 'clinical';

  // Slots
  //   <slot name="label">  → static persistent label — never animated
  //   <slot>               → native <input>/<textarea> (consumer-owned)
  //   <slot name="unit">   → clinical unit (mg, bpm, etc.)
  //
  // Parts
  //   ::part(root)         → escape hatch
  //
  // Events: none — Tier A. Native input events pass through directly.
}
```

### B+ Shell Logic — "Carved" State

```css
:host {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--ds-input-border);
  background: var(--ds-input-bg);
  box-shadow: var(--ds-input-shadow-idle);
  transition:
    background-color var(--ds-alias-transition-smooth),
    border-color     var(--ds-alias-transition-smooth),
    box-shadow       var(--ds-alias-transition-smooth);
}

/* `:focus-within` — any focusable slotted element (input, textarea, select,
   contenteditable, masked-input web components) triggers carved → active.
   Bg swaps #F0F0EC → #FFFFFF. Inset shadow replaced by accent hard-cast. */
:host(:focus-within) {
  background: var(--ds-input-bg-focus);
  border-color: var(--ds-global-color-accent);
  box-shadow: var(--ds-input-shadow-focus);
}

/* State variants */
:host([state="error"]) {
  border-color: var(--ds-input-border-error);
}
:host([state="error"]:focus-within) {
  border-color: var(--ds-input-border-error);
  box-shadow: var(--ds-input-shadow-error);
}
:host([state="success"]) {
  border-color: var(--ds-input-border-success);
}

/* Density */
:host([density="compact"]) { --ds-input-padding: 4px; }

/* Slotted input is transparent inside the shell */
::slotted(input),
::slotted(textarea) {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--ds-font-ui);
  padding: var(--ds-input-padding);
}

:host([data-type="clinical"]) ::slotted(input) {
  font-family: var(--ds-font-mono);
}

/* Unit slot */
::slotted([slot="unit"]) {
  font-family: var(--ds-font-mono);
  font-size: 12px;
  padding: 0 var(--ds-space-2);
  border-left: 1px solid var(--ds-input-border);
  color: var(--ds-color-text-muted);
  align-self: stretch;
  display: flex;
  align-items: center;
}
```

Unit slot `border-left` uses `--ds-input-border` — responds to state changes (accent on focus, red on error) without separate token.

### A11y Wiring + Guardrail

`label-for` is the explicit contract. When set, shell auto-propagates both the input `id` and the label's `for` attribute so the association holds across the Shadow DOM seam. Dev-only warning fires if no association path exists.

```typescript
connectedCallback() {
  super.connectedCallback();
  // Any focusable form control, not just <input>/<textarea>. Matches the
  // `:focus-within` shell selector so behavior and styling stay in lockstep.
  const input = this.querySelector<HTMLElement>(
    'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
  );
  const label = this.querySelector<HTMLElement>('[slot="label"]');

  if (this.labelFor && input && !input.id) {
    input.id = this.labelFor;
  }
  // Accept both native <label> and our <ds-label> custom element.
  // <ds-label> exposes a reflected `for` attribute and writes
  // `aria-labelledby` onto the target itself, so attribute writes here are
  // sufficient — no `htmlFor` property assumption.
  if (this.labelFor && label) {
    const isNativeLabel = label instanceof HTMLLabelElement;
    const isDsLabel = label.tagName.toLowerCase() === 'ds-label';
    if ((isNativeLabel || isDsLabel) && !label.getAttribute('for')) {
      label.setAttribute('for', this.labelFor);
    }
  }

  if (globalThis.__DEV__ ?? true) {  // tree-shaken in production via bundler define
    const associated =
      (label?.getAttribute('for') && input?.id) ||
      input?.getAttribute('aria-labelledby') ||
      input?.getAttribute('aria-label');
    if (label && input && !associated) {
      console.warn(
        '<ds-input>: label/input not associated. Set `label-for="<input-id>"`, or provide `aria-labelledby`/`aria-label` on the input.'
      );
    }
  }
}
```

### Flutter Parity (Widget Template — Option B)

```dart
class DsInput extends StatefulWidget {
  final String? label;
  final DsInputState state;
  final String? unit;
  final bool clinical;   // forces mono font
  const DsInput({this.label, this.state = DsInputState.idle, this.unit, this.clinical = false});

  @override
  State<DsInput> createState() => _DsInputState();
}

class _DsInputState extends State<DsInput> {
  final _focus = FocusNode();
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(() => setState(() => _focused = _focus.hasFocus));
  }

  @override
  Widget build(BuildContext context) {
    final borderColor = widget.state == DsInputState.error
        ? AppColors.error
        : _focused ? AppColors.accent : AppColors.ink;

    // Match web carved → active: bg swap + shadow swap on focus.
    // Flutter's BoxShadow has no true inset — idle skips the inset (doc-only divergence).
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: _focused ? AppColors.surface : AppColors.bgAlt,
        border: Border.all(color: borderColor, width: 1),
        boxShadow: _focused ? [
          BoxShadow(
            offset: const Offset(2, 2),
            blurRadius: 0,
            color: widget.state == DsInputState.error ? AppColors.error : AppColors.accent,
          )
        ] : const [],
      ),
      child: Row(children: [
        Expanded(
          child: TextField(
            focusNode: _focus,
            style: TextStyle(
              fontFamily: widget.clinical ? AppFonts.mono : AppFonts.ui,
            ),
            decoration: InputDecoration(border: InputBorder.none),
          ),
        ),
        if (widget.unit != null)
          Container(
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.space2),
            decoration: BoxDecoration(
              border: Border(left: BorderSide(color: borderColor, width: 1)),
            ),
            child: Text(widget.unit!, style: TextStyle(fontFamily: AppFonts.mono, fontSize: 12)),
          ),
      ]),
    );
  }
}
```

### Deliverables

| Item | Status |
|---|---|
| A11y backing | `AriaAssociationController` (foundations primitive) handles label ↔ input wiring across shadow DOM boundaries via `aria-labelledby`. No Radix port needed — `<label for>` cannot cross the seam, so the React-context approach Radix uses doesn't apply to a Lit/Web Components target. |
| Storybook 10.x story | Required: state (default / error / success) × density (default / compact) × `data-type="clinical"` × with/without `unit` slot × with/without `label-for` |

### Anti-Slop Enforcement

| Rule | Enforcement |
|---|---|
| No floating label | `<slot name="label">` is static above shell — position never animated |
| No `border-radius` | Shell has no `border-radius`. Flutter uses `BoxDecoration` with no `borderRadius` |
| State transition = carved → active (bg + border + shadow swap) | Tokenized, 200ms smooth, no icon injection, no spring |
| Label is persistent and visible at all times | Slot structure enforces this — no CSS hides the label on focus |
| Blur on all focus shadows = 0 | `--ds-alias-shadow-accent` uses `0px` blur |

---

## Resolutions

All initial-review questions resolved 2026-04-21:

1. **Padding** — spec grid-aligned wins (`12/16` btn, `8` input). Example `10/10` values were eyeballed errors. 4px grid is law.
2. **Input idle state** — carved affordance restored: inset shadow + `#F0F0EC` bg → swaps to `#FFFFFF` + accent hard-cast on focus.
3. **Shadow color** — pure `#000000`. Ink (`#1A1A1A`) intentionally softer for text/borders; shadows stay harsh.
4. **`<ds-label>`** — promoted to standalone atom. Clinical UIs need labels detached from inputs (read-only data points, legends, status).
5. **`size="sm"`** — included day-one. High-density is identity; `sm` = 24px tap target.
6. **Transitions tokenized** — `--ds-alias-transition-snappy` (100ms linear) + `--ds-alias-transition-smooth` (200ms ease). No spring. No > 200ms.
7. **A11y backing + Storybook** — per-component deliverable rows added. ID-association A11y centralized in `AriaAssociationController` foundations primitive (no Radix runtime port — `<label for>` cannot cross shadow seams; ARIA id refs are the only mechanism that does). Behavioral A11y references Radix patterns per-component as needed. Required for merge.
8. **`label-for` prop** — kept as explicit A11y contract; shell auto-wires ARIA when set, DOM-query dev warning as fallback.

## Widget Template Exceptions (Option B)

| Component | Reason |
|---|---|
| `<ds-input>` / `DsInput` | Flutter `InputDecoration` cannot produce hard-cast `box-shadow` on focus |
