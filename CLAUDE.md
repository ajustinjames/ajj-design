# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`ajj-design` is an industrial-material design system — framework-agnostic Web Components built with Lit, with design tokens compiled via Style Dictionary. It targets web (CSS custom properties) and Flutter (Dart classes) from a single source of truth.

## Commands

```bash
# Install dependencies
pnpm install

# Build tokens (must run before components see updated tokens)
pnpm tokens:build

# Run component tests (Playwright/Chromium, headless)
pnpm test

# Run tests in watch mode (from repo root)
pnpm --filter @ajj/components test:watch

# Run a single test file
pnpm --filter @ajj/components exec web-test-runner test/ds-btn.test.ts

# Launch Storybook
pnpm storybook

# Build Storybook static site
pnpm build-storybook
```

## Architecture

### Package structure

| Package | Name | Purpose |
|---|---|---|
| `packages/tokens` | `@ajj/tokens` | Single `tokens.json` → Style Dictionary → `dist/web/tokens.css` + `dist/flutter/*.dart` |
| `packages/components` | `@ajj/components` | Lit Web Components consuming token CSS vars |

`@ajj/components` depends on `@ajj/tokens` via `workspace:*`. Storybook runs at the repo root and pulls stories from `packages/components/stories/`.

### Token pipeline

`tokens.json` uses the DTCG format (`$value`, `$type`). The three tiers are:
- **global** — raw values (`#FF4F00`, `100ms`)
- **alias** — semantic references (`{global.color.accent}`) — these are what components consume
- **component** — per-component overrides (CSS custom property layer on top of alias tokens)

`sd.config.js` registers custom formats for Tailwind `@theme {}` (web) and Dart classes (Flutter). Run `pnpm tokens:build` after any `tokens.json` change to regenerate both targets.

### Component conventions

- All components extend `LitElement` with `@customElement('ds-*')`.
- All Lit properties that affect style use `reflect: true` so `:host([attr])` CSS selectors work.
- Styling lives entirely in `static styles` using CSS custom properties that fall back to alias token vars, which fall back to hard-coded values: `var(--ds-btn-bg, var(--ds-alias-action-bg, #FFFFFF))`.
- Components are **visual shells only** — no internal state management. Slot-based composition (`<slot>`, `<slot name="prefix">`, etc.).
- Each new component needs: `src/ds-*/ds-*.ts`, a test in `test/ds-*.test.ts`, a story in `stories/ds-*.stories.ts`, and a barrel export in `src/index.ts`.

### Foundations

`src/foundations/aria-association-controller.ts` — a `ReactiveController` that wires ARIA attributes (`aria-labelledby`, `aria-describedby`, etc.) across shadow DOM boundaries. It mints a UUID-based id on the host if none is set and warns in dev mode. Components needing cross-shadow ARIA association should instantiate this controller.

### Design constraints (from manifesto)

- Corner radii: **0px** only. No pills, no rounded corners.
- Shadows: hard-cast offset shadows only (`2px 2px 0px #000`). No blur.
- No gradients.
- Fonts: Inter for UI, JetBrains Mono for technical/status/metadata.
- No third-party UI libraries except headless primitives (e.g., Radix UI).
- Accent: `#FF4F00` (International Orange). Background: `#F0F0EC` (Paper).

### Testing

Tests use `@open-wc/testing` with `@web/test-runner` + Playwright (Chromium). Test files live in `packages/components/test/` and match `test/**/*.test.ts`. The `tsconfig.test.json` configures esbuild for TypeScript transpilation during test runs.
