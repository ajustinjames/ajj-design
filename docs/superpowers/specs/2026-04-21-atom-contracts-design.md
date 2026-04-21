# Atom Component Contracts — IND-MAT Design System

**Date:** 2026-04-21  
**Components:** `<ds-card>`, `<ds-btn>`, `<ds-input>`  
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

### Status Color Additions
The manifesto global token layer requires two additions to support component state:

| Token | Value | Notes |
|---|---|---|
| `--ds-global-color-error` | `#CC0000` | WCAG AA contrast on `#F0F0EC` |
| `--ds-global-color-success` | `#1A6B1A` | WCAG AA contrast on `#F0F0EC` |

These feed `--ds-alias-status-error` and `--ds-alias-status-success`.

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
// Properties
elevation?: 1 | 2 | 3   // maps to --ds-alias-shadow-1/2/3. Default: 1

// Slots
<slot>                   // default: card body content
<slot name="header">     // optional structured header region

// Parts (escape hatch — layout overrides only)
// Applied to inner wrapper div: <div part="root">
::part(root)

// Events: none — Tier A visual-only
```

### Pseudo-State Logic

```css
:host { display: block; }

:host(:hover),
:host(:has(*:focus-visible)) {
  transform: translate(-1px, -1px);
  --ds-card-shadow: var(--ds-alias-shadow-2);
}
```

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
| `--ds-btn-padding-x` | `--ds-alias-action-padding-x` | `16px` |
| `--ds-btn-padding-y` | `--ds-alias-action-padding-y` | `12px` |

Note: `12px` padding-y = `--ds-global-space-3`. Achieves 40px tap target (12 + 12 + 16 line-height) on the 4px grid.

### Lit API

```typescript
// Properties
variant?: 'default' | 'primary' | 'ghost'  // Default: 'default'
size?:    'sm' | 'md'                       // Default: 'md'

// Slots
<slot name="prefix">   // icon before label
<slot>                 // label text
<slot name="suffix">   // icon after label

// Parts (escape hatch — layout overrides only)
::part(root)

// Events: none — Tier A. Slotted element owns click/keyboard/routing.
```

### Pseudo-State Logic

```css
:host { display: inline-block; transform: translate(0, 0); }

:host(:hover),
:host(:has(*:focus-visible)) {
  transform: translate(-1px, -1px);
  --ds-btn-shadow: var(--ds-alias-shadow-2);
}

:host(:has(*:active)) {
  transform: translate(1px, 1px);
  --ds-btn-shadow: none;
}

/* ghost variant */
:host([variant="ghost"]) ::slotted(*) {
  border-style: dashed;
  box-shadow: none;
  background: transparent;
}

/* text-transform enforced — not optional */
::slotted(*) {
  text-transform: uppercase;
  border-radius: 0;
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
| Ghost = dashed border, not opacity fade | `border-style: dashed` in variant CSS |
| `text-transform: uppercase` | Enforced on `::slotted(*)` — not a prop, not optional |
| Active = physical press (translate positive) | CSS only, no spring/easing |
| 4px grid compliant | `padding-y: 12px` = `--ds-global-space-3` |

---

## Component Contract: `<ds-input>`

### Flutter Status (Widget Template — Option B)

`DataInput` is a confirmed Widget Template exception. Flutter's `InputDecoration` cannot produce a hard-cast `box-shadow` on focus. Implementation: `StatefulWidget` wraps `TextField` in a `Container` and swaps `BoxDecoration` on `FocusNode` state change.

### Token Slots

| Component Token | Alias Default | Global Value |
|---|---|---|
| `--ds-input-bg` | `--ds-alias-surface-bg-alt` | `#F0F0EC` |
| `--ds-input-border` | `--ds-alias-surface-border` | `#1A1A1A` |
| `--ds-input-border-error` | `--ds-alias-status-error` | `#CC0000` |
| `--ds-input-border-success` | `--ds-alias-status-success` | `#1A6B1A` |
| `--ds-input-shadow-focus` | `--ds-alias-shadow-accent` | `2px 2px 0px #FF4F00` |
| `--ds-input-shadow-error` | `--ds-alias-shadow-error` | `2px 2px 0px #CC0000` |
| `--ds-input-text` | `--ds-alias-text-main` | `#1A1A1A` |
| `--ds-input-padding` | `--ds-alias-input-padding` | `8px` (compact: `4px`) |
| `--ds-input-font-value` | `--ds-alias-font-ui` | Inter (`[data-type="clinical"]`: Mono) |

### Lit API

```typescript
// Properties
state?:    'default' | 'error' | 'success'   // Default: 'default'
density?:  'compact' | 'default'              // Default: 'default'
label-for?: string  // reflected attr — dev warning if label/input association missing

// data attributes
data-type?: 'clinical'  // forces JetBrains Mono on ::slotted(input) for numeric values

// Slots
<slot name="label">   // static persistent label — never animated
<slot>                // native <input> or <textarea> (consumer-owned)
<slot name="unit">    // clinical unit (mg, bpm, etc.)

// Parts
::part(root)          // escape hatch

// Events: none — Tier A. Native input events pass through directly.
```

### B+ Shell Logic — "Carved" State

```css
:host { display: block; }

/* Shell IS the visual container */
:host {
  border: 1px solid var(--ds-input-border);
  background: var(--ds-input-bg);
  display: flex;
  align-items: stretch;
}

/* Focus: `:focus` (not `:focus-visible`) — any focus method should show carved state */
:host(:has(input:focus)) {
  border-color: var(--ds-color-accent);
  box-shadow: var(--ds-input-shadow-focus);
}

/* State variants */
:host([state="error"]) {
  border-color: var(--ds-input-border-error);
}
:host([state="error"]:has(input:focus)) {
  box-shadow: var(--ds-input-shadow-error);
}

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

### A11y Guardrail

```typescript
connectedCallback() {
  super.connectedCallback();
  if (globalThis.__DEV__ ?? true) {  // tree-shaken in production builds via bundler define
    const label = this.querySelector('[slot="label"]');
    const input = this.querySelector('input, textarea');
    if (label && input && !label.getAttribute('for') && !input.id) {
      console.warn('<ds-input>: label has no `for` attribute and input has no `id`. Screen readers cannot associate them.');
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

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgAlt,
        border: Border.all(color: borderColor, width: 1),
        boxShadow: _focused ? [
          BoxShadow(
            offset: Offset(2, 2),
            blurRadius: 0,
            color: widget.state == DsInputState.error ? AppColors.error : AppColors.accent,
          )
        ] : [],
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

### Anti-Slop Enforcement

| Rule | Enforcement |
|---|---|
| No floating label | `<slot name="label">` is static above shell — position never animated |
| No `border-radius` | Shell has no `border-radius`. Flutter uses `BoxDecoration` with no `borderRadius` |
| State = border + shadow color swap only | No icon injection, no background color change |
| Label is persistent and visible at all times | Slot structure enforces this — no CSS hides the label on focus |
| Blur on all focus shadows = 0 | `--ds-alias-shadow-accent` uses `0px` blur |

---

## Open Questions

None. All decisions resolved in session.

## Widget Template Exceptions (Option B)

| Component | Reason |
|---|---|
| `<ds-input>` / `DsInput` | Flutter `InputDecoration` cannot produce hard-cast `box-shadow` on focus |
