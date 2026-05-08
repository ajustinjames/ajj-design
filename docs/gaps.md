# ajj-design — Gaps & Resolutions

Audit date: 2026-05-04. Compares current state against `docs/manifesto.md` and `docs/superpowers/specs/2026-04-21-atom-contracts-design.md`.

Severity: **P0** spec/contract drift, **P1** infra missing, **P2** quality polish, **P3** nice-to-have.

---

## P0 — Spec & contract drift (visible bugs)

### 1. `ds-input` "carved" idle state not implemented
Spec calls for inset shadow + `#F0F0EC` bg idle → swap to `#FFFFFF` + accent hard-cast on focus. Current `ds-input.ts:16-18` uses `--ds-alias-surface-bg` (`#FFFFFF`) idle, no inset shadow, and has no bg swap on `:focus-within`. The "mechanical affordance" signal is dead.

**Fix**
- Wire `--ds-input-bg` default to `--ds-alias-surface-bg-alt` (`#F0F0EC`).
- Add `--ds-input-bg-focus` token, swap on `:focus-within`.
- Wire `--ds-input-shadow-idle` → `--ds-alias-shadow-inset`.
- Add `--ds-input-shadow-idle` and `--ds-input-bg-focus` to `tokens.json` alias tier.

### 2. Token tier 3 (component) absent from `tokens.json`
Manifesto + spec both declare 3 tiers (Global → Alias → Component). `tokens.json` only contains `global` + `alias`. Component tokens live inline in each `.ts` file as `var(--ds-btn-*, …)` fallbacks — not generated, not exported to Flutter, not consumable by external apps wanting to override the alias-default mapping.

**Fix:** Add `component` block to `tokens.json` mirroring the slot tables in the spec. Update `sd.config.js` to emit per-component CSS layer + Dart classes.

### 3. `AriaAssociationController.hostUpdated` doesn't prune stale writes
Spec: "re-resolves on target change, **prunes prior writes**." Implementation (`aria-association-controller.ts:64-66`) calls `#write()` only — never removes the host id from the previous target when `target()` changes. Causes orphaned `aria-labelledby` references after dynamic re-targeting.

**Fix:** Track last-resolved target; on update, remove host id from prior target if it differs from current. Add test.

### 4. `also` companion attributes never tested
`aria-association-controller.test.ts` exercises mint, single/multi-token, disconnect — but not `also`. Spec wires `aria-errormessage` with `aria-invalid="true"` companion. Untested code path.

**Fix:** Add test for `also: { 'aria-invalid': 'true' }` write on connect.

### 5. Flutter output is hardcoded, not token-derived
`sd.config.js:46-127` hardcodes shadow values (`Offset(2,2)`, `Offset(4,4)`, `Offset(8,8)`), font names (`'JetBrains Mono'`), and text-style colors/sizes. None derived from `tokens.json`. Single-source-of-truth claim is violated — change shadow `2px` to `3px` in tokens, web updates, Flutter doesn't.

**Fix:** Drive `flutter/app-shadows`, `flutter/app-fonts`, `flutter/app-text-styles` from dictionary tokens. Parse offsets out of `--ds-alias-shadow-*` strings.

### 6. Roadmap atoms missing
Spec lists `<ds-helper-text>`, `<ds-error-message>`, `<ds-tooltip>` as `AriaAssociationController` consumers. Only `<ds-label>` ships. `<ds-input>` has no programmatic helper/error slot, so error state is visual-only (border + shadow) without screen-reader text.

**Fix (sequenced):**
1. `<ds-helper-text for>` (`aria-describedby`)
2. `<ds-error-message for>` (`aria-errormessage` + `aria-invalid="true"`)
3. `<ds-tooltip for>` (`aria-describedby`, headless primitive may pull from Radix port)

---

## P1 — Infra missing

### 7. No CI
No `.github/workflows/`. No automated test, typecheck, build, or Storybook deploy. Drift goes unnoticed until manual run.

**Fix:** Add `ci.yml` running `pnpm install`, `pnpm tokens:build`, `pnpm test`, `tsc --noEmit`, `pnpm build-storybook`. Cache pnpm store. Pin Node ≥ 20.

### 8. No linter / formatter
No eslint, biome, or prettier config. `ds-input.ts:5` carries `// eslint-disable-next-line` for a non-existent linter. Style drift inevitable.

**Fix:** Adopt Biome (single binary, fast) or ESLint flat config + Prettier. Add `lint` and `format` scripts. Wire into CI.

### 9. No type-check script
No `tsc --noEmit` invocation anywhere. `tsconfig.json` declarations exist but are never validated outside test runs (which use esbuild and skip type errors).

**Fix:** Add `"typecheck": "tsc --noEmit"` script per package + root aggregate. Run in CI.

### 10. No component build / publish path
`@ajj/components` exports `./src/index.ts` raw — consumers without TS+esbuild can't use it. No `dist/`, no `prepack`, no `files` field, no `publishConfig`. Same for `@ajj/tokens` (exports CSS file that depends on `pnpm build` having been run; not enforced).

**Fix:** Add tsc/tsup/vite-lib build emitting `dist/index.js` + `.d.ts`. Add `files`, `main`, `module`, `types`, `exports` map. `prepack` runs build. Tokens: add `prepack: pnpm build`.

### 11. No visual regression tests
`tests/visual/` is empty. Hard-cast shadow offsets and 4px-grid math are exactly the kind of details that regress silently. Unit tests assert reflection only — never computed visual.

**Fix:** Add Playwright visual snapshot suite per component × variant × pseudo-state (hover, focus-visible, active). Run headed Chromium in CI. Snapshot diff threshold tight (≤ 0.1%).

### 12. No a11y automation
`.storybook/main.ts:5` has `addons: []`. No `@storybook/addon-a11y` (axe). No automated contrast/role audit. Manifesto+spec call for a11y backing per component but compliance is unverified.

**Fix:** Add `@storybook/addon-a11y`. Optionally add `@web/test-runner-axe` integration to assert zero violations per component fixture.

### 13. No CHANGELOG / version policy
Both packages at `0.0.1`. No release process, no Changesets/semantic-release. Cross-package coupling (`workspace:*`) means changes are silent.

**Fix:** Adopt Changesets. Add `release` workflow. Document SemVer policy (alias-token rename = major, component slot add = minor).

---

## P2 — Quality

### 14. Disabled state has no contract
No `:host([disabled])` selector or `disabled` reflection on `ds-btn`/`ds-input`. Native disabled on slotted child works visually only by accident — shell shadow/border don't dim.

**Fix:** Add `disabled` reflected attribute to `ds-btn` + `ds-input`. Tokens: `--ds-alias-action-bg-disabled`, `--ds-alias-text-disabled`. Suppress hover/active transforms when disabled. Forward `aria-disabled` via `also`.

### 15. No `prefers-reduced-motion` honor
Every component declares unconditional `transition`. WCAG 2.3.3 violation risk for vestibular-sensitive users.

**Fix:** Wrap transitions in `@media (prefers-reduced-motion: no-preference)`. Or reset durations to `0s` under `(prefers-reduced-motion: reduce)`.

### 16. Dark mode unwired
`--ds-global-color-surface-dark: #1A1A1A` defined; never referenced. No `[data-theme="dark"]` or `prefers-color-scheme` hook.

**Fix:** Either delete the token (deferred) or add a `@media (prefers-color-scheme: dark)` block in `tokens.css` swapping alias-tier values. Spec doesn't promise dark mode — call it out.

### 17. Token output formats limited
`@theme {}` block (Tailwind v4) only. No `:root {}` fallback for non-Tailwind consumers. No JSON export for design tools (Figma Tokens). No SCSS map.

**Fix:** Add `css/variables` (`:root {}`) format alongside Tailwind theme. Optional: `json/flat` for Figma sync.

### 18. Flutter typography incomplete
`app_text_styles.dart` ships only 3 label variants. No btn, input value, body, monospace data text. Web has more typography tokens than Flutter exports — parity is a marketing claim, not a fact.

**Fix:** Generate `TextStyle` per `font-size` × `font-family` × tone combination present in alias tokens. Or document the gap explicitly in `flutter/README.md`.

### 19. Tests don't cover style/state
All four `*.test.ts` files assert property/attribute reflection and slotted DOM presence. No `getComputedStyle` checks against expected token outputs. The carved-state bug (#1) wouldn't fail any existing test.

**Fix:** Add per-state `getComputedStyle` assertions: `box-shadow`, `background-color`, `border-color` for default/hover/focus-within/active/error/success.

### 20. SSR-safe path unverified
Spec: late-mint runs in `hostConnected`; SSR output omits id. No SSR test exists. `@lit-labs/ssr` not installed.

**Fix:** Defer until SSR is actually a target. Add tracking issue. Document "SSR not supported in v0.x" in README.

### 21. `density="default"` reflects redundantly
`ds-input.ts:89` sets `reflect: true` on density with default value `'default'`. Renders `density="default"` attribute on every instance. DOM noise.

**Fix:** Make `density` reflect only when non-default. Pattern: omit reflect, set attribute manually in `willUpdate` when `value !== defaultValue`.

---

## P3 — Polish

### 22. Per-package READMEs missing
Both `@ajj/tokens` and `@ajj/components` have no README. NPM listing will be empty.

### 23. No CONTRIBUTING.md / component-author guide
Spec is comprehensive but buried. New-component checklist (test + story + barrel + Flutter parity) lives only in CLAUDE.md.

### 24. No `.editorconfig`
Mixed indent risk across editors.

### 25. Storybook lacks docs addon
No autodocs. Component contracts in spec are not surfaced in Storybook UI.

**Fix:** Enable `@storybook/addon-docs` autodocs tags, mirror spec's token-slot tables in MDX overview pages.

### 26. License referenced but no badge / SPDX
`LICENSE` file present. Root `package.json` missing `"license"` field. Sub-packages missing `"license"`.

### 27. `engines.pnpm` not pinned
README says `pnpm ≥ 10`. `package.json:6-8` only pins Node. `packageManager: pnpm@10.33.0` is the only pin and is silent.

**Fix:** Add `"pnpm": ">=10.0.0"` to `engines`.

---

## Suggested execution order

1. **Fix P0 #1, #3** (single-day) — visible bugs.
2. **#7 CI + #9 typecheck + #8 lint** — guard against regressions before doing anything else.
3. **#19 style-state tests + #11 visual snapshots** — lock current visual contract.
4. **#2 component tier + #5 token-driven Flutter** — restore single-source-of-truth.
5. **#10 publish path** — unblock external consumption.
6. **#6 missing atoms** (`ds-helper-text`, `ds-error-message`, `ds-tooltip`).
7. **P2 polish in parallel as it touches the relevant components.**
