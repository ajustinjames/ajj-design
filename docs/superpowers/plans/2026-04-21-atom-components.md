# IND-MAT Atom Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the IND-MAT monorepo and implement the four Tier A atom web components (`ds-card`, `ds-label`, `ds-btn`, `ds-input`) with token pipeline, ARIA foundations, and Storybook stories.

**Architecture:** pnpm workspace with two packages — `packages/tokens` (Style Dictionary v4 pipeline outputting a Tailwind v4 `@theme {}` block + Flutter Dart files) and `packages/components` (Lit 3 web components consuming token CSS vars, tested with Web Test Runner in Chromium). Components use the B+ Shell pattern: the Lit element owns skin, slotted native elements own behavior. ARIA id-association across shadow boundaries is centralized in `AriaAssociationController`.

**Tech Stack:** Node 20+, pnpm 9+, TypeScript 5.x (strict), Lit 3.x, Style Dictionary 4.x, `@web/test-runner` + `@open-wc/testing`, Storybook 10.x (`@storybook/web-components-vite`)

---

## File Map

```
pnpm-workspace.yaml
package.json                                  ← root (private, scripts)
tsconfig.base.json
.storybook/
  main.ts
  preview.ts
packages/
  tokens/
    package.json
    tokens.json                               ← all global + alias tiers
    sd.config.js                              ← SD v4 config + custom formatters
    dist/                                     ← gitignored, generated
      web/tokens.css                          ← @theme {} block
      flutter/
        app_colors.dart
        app_shadows.dart
        app_spacing.dart
        app_fonts.dart
        app_text_styles.dart
  components/
    package.json
    tsconfig.json
    web-test-runner.config.js
    src/
      foundations/
        aria-association-controller.ts
      ds-card/
        ds-card.ts
      ds-label/
        ds-label.ts
      ds-btn/
        ds-btn.ts
      ds-input/
        ds-input.ts
      index.ts
    test/
      foundations/
        aria-association-controller.test.ts
      ds-card.test.ts
      ds-label.test.ts
      ds-btn.test.ts
      ds-input.test.ts
    stories/
      ds-card.stories.ts
      ds-label.stories.ts
      ds-btn.stories.ts
      ds-input.stories.ts
```

---

## Task 1: Scaffold Monorepo

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `packages/tokens/package.json`
- Create: `packages/components/package.json`
- Create: `packages/components/tsconfig.json`
- Create: `packages/components/web-test-runner.config.js`

- [ ] **Step 1: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 2: Write root `package.json`**

```json
{
  "name": "ajj-design",
  "private": true,
  "type": "module",
  "scripts": {
    "tokens:build": "pnpm --filter @ajj/tokens build",
    "test": "pnpm --filter @ajj/components test",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "devDependencies": {
    "@storybook/web-components-vite": "^10.0.0",
    "storybook": "^10.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true
  }
}
```

- [ ] **Step 4: Write `packages/tokens/package.json`**

```json
{
  "name": "@ajj/tokens",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "node sd.config.js"
  },
  "dependencies": {
    "style-dictionary": "^4.0.0"
  }
}
```

- [ ] **Step 5: Write `packages/components/package.json`**

```json
{
  "name": "@ajj/components",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "test": "web-test-runner",
    "test:watch": "web-test-runner --watch"
  },
  "dependencies": {
    "@ajj/tokens": "workspace:*",
    "lit": "^3.0.0"
  },
  "devDependencies": {
    "@open-wc/testing": "^4.0.0",
    "@web/test-runner": "^0.19.0",
    "@web/test-runner-playwright": "^0.11.0",
    "typescript": "^5.4.0",
    "@web/dev-server-esbuild": "^1.0.0"
  }
}
```

- [ ] **Step 6: Write `packages/components/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/**/*", "test/**/*", "stories/**/*"]
}
```

- [ ] **Step 7: Write `packages/components/web-test-runner.config.js`**

```js
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'test/**/*.test.ts',
  plugins: [esbuildPlugin({ ts: true })],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  nodeResolve: true,
};
```

- [ ] **Step 8: Install dependencies**

```bash
cd /path/to/ajj-design
pnpm install
```

Expected: pnpm installs all workspace packages without errors.

- [ ] **Step 9: Update `.gitignore`**

Add to existing `.gitignore`:
```
packages/tokens/dist/
packages/components/dist/
node_modules/
.storybook-cache/
storybook-static/
```

- [ ] **Step 10: Commit scaffold**

```bash
git add pnpm-workspace.yaml package.json tsconfig.base.json packages/ .gitignore
git commit -m "chore: scaffold pnpm monorepo with tokens and components packages"
```

---

## Task 2: Token Pipeline

**Files:**
- Create: `packages/tokens/tokens.json`
- Create: `packages/tokens/sd.config.js`

- [ ] **Step 1: Write `packages/tokens/tokens.json`**

Three-tier structure. Global tier uses concrete values; alias tier references globals by path `{global.x.y}` — Style Dictionary resolves these at build time.

```json
{
  "global": {
    "color": {
      "ink":              { "$value": "#1A1A1A", "$type": "color" },
      "muted":            { "$value": "#666666", "$type": "color" },
      "bg":               { "$value": "#F0F0EC", "$type": "color" },
      "surface":          { "$value": "#FFFFFF", "$type": "color" },
      "surface-dark":     { "$value": "#1A1A1A", "$type": "color" },
      "accent":           { "$value": "#FF4F00", "$type": "color" },
      "accent-contrast":  { "$value": "#FFFFFF", "$type": "color" },
      "error":            { "$value": "#CC0000", "$type": "color" },
      "success":          { "$value": "#1A6B1A", "$type": "color" }
    },
    "shadow": {
      "color":        { "$value": "#000000",        "$type": "color" },
      "inset-color":  { "$value": "rgba(0,0,0,0.1)", "$type": "color" }
    },
    "duration": {
      "snappy": { "$value": "100ms" },
      "smooth":  { "$value": "200ms" }
    },
    "easing": {
      "linear": { "$value": "linear" },
      "smooth": { "$value": "ease" }
    }
  },
  "alias": {
    "shadow": {
      "0":      { "$value": "1px 1px 0px {global.shadow.color}" },
      "1":      { "$value": "2px 2px 0px {global.shadow.color}" },
      "2":      { "$value": "4px 4px 0px {global.shadow.color}" },
      "3":      { "$value": "8px 8px 0px {global.shadow.color}" },
      "inset":  { "$value": "inset 1px 1px 0px {global.shadow.inset-color}" },
      "accent": { "$value": "2px 2px 0px {global.color.accent}" },
      "error":  { "$value": "2px 2px 0px {global.color.error}" }
    },
    "transition": {
      "snappy": { "$value": "{global.duration.snappy} {global.easing.linear}" },
      "smooth": { "$value": "{global.duration.smooth} {global.easing.smooth}" }
    },
    "surface": {
      "bg":           { "$value": "{global.color.surface}" },
      "bg-alt":       { "$value": "{global.color.bg}" },
      "border":       { "$value": "{global.color.ink}" },
      "border-width": { "$value": "1px" },
      "padding":      { "$value": "24px" }
    },
    "radius": {
      "default": { "$value": "0px" }
    },
    "text": {
      "main":  { "$value": "{global.color.ink}" },
      "muted": { "$value": "{global.color.muted}" }
    },
    "font": {
      "technical": { "$value": "'JetBrains Mono', monospace" },
      "ui":        { "$value": "'Inter', system-ui, sans-serif" }
    },
    "font-size": {
      "label":    { "$value": "11px" },
      "btn":      { "$value": "12px" },
      "btn-sm":   { "$value": "10px" }
    },
    "font-weight": {
      "bold": { "$value": "600" }
    },
    "tracking": {
      "wide": { "$value": "0.05em" }
    },
    "space": {
      "1": { "$value": "4px" },
      "2": { "$value": "8px" },
      "3": { "$value": "12px" },
      "4": { "$value": "16px" },
      "6": { "$value": "24px" },
      "8": { "$value": "32px" }
    },
    "action": {
      "bg":          { "$value": "{global.color.surface}" },
      "bg-primary":  { "$value": "{global.color.accent}" },
      "color":       { "$value": "{global.color.ink}" },
      "color-primary": { "$value": "{global.color.accent-contrast}" },
      "border":      { "$value": "{global.color.ink}" },
      "padding-x":   { "$value": "16px" },
      "padding-y":   { "$value": "12px" },
      "padding-x-sm": { "$value": "12px" },
      "padding-y-sm": { "$value": "4px" }
    },
    "input": {
      "padding": { "$value": "8px" }
    },
    "status": {
      "error":   { "$value": "{global.color.error}" },
      "success": { "$value": "{global.color.success}" }
    }
  }
}
```

- [ ] **Step 2: Write `packages/tokens/sd.config.js`**

SD v4 with a custom `css/tailwind-theme` formatter that outputs `@theme {}` instead of `:root {}`. Shadow values use string interpolation — SD resolves `{path}` references to concrete values before the formatter runs.

```js
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(t => `  --${t.name}: ${t.value};`);
    return `@theme {\n${lines.join('\n')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-colors',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.filter(t => t.$type === 'color');
    const entries = tokens.map(t => {
      const hex = t.value.replace('#', '');
      const name = t.name
        .replace(/^ds-/, '')
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return `  static const Color ${name} = Color(0xFF${hex.toUpperCase()});`;
    });
    return [
      "import 'package:flutter/material.dart';",
      '',
      'class AppColors {',
      entries.join('\n'),
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-shadows',
  format: () => {
    return [
      "import 'package:flutter/material.dart';",
      '',
      'class AppShadows {',
      '  static const Map<int, BoxShadow> elevation = {',
      '    1: BoxShadow(offset: Offset(2, 2), blurRadius: 0, color: Color(0xFF000000)),',
      '    2: BoxShadow(offset: Offset(4, 4), blurRadius: 0, color: Color(0xFF000000)),',
      '    3: BoxShadow(offset: Offset(8, 8), blurRadius: 0, color: Color(0xFF000000)),',
      '  };',
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-spacing',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.filter(t =>
      t.name.startsWith('ds-alias-space-')
    );
    const entries = tokens.map(t => {
      const num = t.name.replace('ds-alias-space-', '');
      const px = parseFloat(t.value);
      return `  static const double space${num} = ${px}.0;`;
    });
    return [
      'class AppSpacing {',
      entries.join('\n'),
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-fonts',
  format: () => {
    return [
      'class AppFonts {',
      "  static const String mono = 'JetBrains Mono';",
      "  static const String ui   = 'Inter';",
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-text-styles',
  format: () => {
    return [
      "import 'package:flutter/material.dart';",
      "import 'app_fonts.dart';",
      "import 'app_colors.dart';",
      '',
      'class AppTextStyles {',
      '  static const TextStyle label = TextStyle(',
      "    fontFamily: AppFonts.mono,",
      '    fontSize: 11,',
      '    letterSpacing: 0.55,',
      '    color: AppColors.globalColorInk,',
      '  );',
      '  static const TextStyle labelMuted = TextStyle(',
      "    fontFamily: AppFonts.mono,",
      '    fontSize: 11,',
      '    letterSpacing: 0.55,',
      '    color: AppColors.globalColorMuted,',
      '  );',
      '  static const TextStyle labelAccent = TextStyle(',
      "    fontFamily: AppFonts.mono,",
      '    fontSize: 11,',
      '    letterSpacing: 0.55,',
      '    color: AppColors.globalColorAccent,',
      '  );',
      '}',
      '',
    ].join('\n');
  },
});

const sd = new StyleDictionary({
  source: ['tokens.json'],
  usesDtcg: true,
  platforms: {
    web: {
      prefix: 'ds',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/tailwind-theme',
        },
      ],
    },
    flutter: {
      prefix: 'ds',
      buildPath: 'dist/flutter/',
      files: [
        { destination: 'app_colors.dart',      format: 'flutter/app-colors' },
        { destination: 'app_shadows.dart',     format: 'flutter/app-shadows' },
        { destination: 'app_spacing.dart',     format: 'flutter/app-spacing' },
        { destination: 'app_fonts.dart',       format: 'flutter/app-fonts' },
        { destination: 'app_text_styles.dart', format: 'flutter/app-text-styles' },
      ],
    },
  },
});

await sd.buildAllPlatforms();
```

- [ ] **Step 3: Run the token build**

```bash
cd packages/tokens && pnpm build
```

Expected: `dist/web/tokens.css` exists and starts with `@theme {`. `dist/flutter/app_colors.dart` exists with `class AppColors`.

Verify:
```bash
head -5 dist/web/tokens.css
# Expected:
# @theme {
#   --ds-global-color-ink: #1A1A1A;
```

- [ ] **Step 4: Commit token pipeline**

```bash
git add packages/tokens/
git commit -m "feat(tokens): Style Dictionary v4 pipeline — @theme CSS + Flutter Dart output"
```

---

## Task 3: Storybook Setup

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`

- [ ] **Step 1: Write `.storybook/main.ts`**

```typescript
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['packages/components/stories/**/*.stories.ts'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
};

export default config;
```

- [ ] **Step 2: Write `.storybook/preview.ts`**

Import the generated token CSS so all stories inherit the token layer.

```typescript
import '../packages/tokens/dist/web/tokens.css';
import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#F0F0EC' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
};

export default preview;
```

- [ ] **Step 3: Verify Storybook starts (no stories yet)**

```bash
pnpm storybook
```

Expected: Browser opens at `http://localhost:6006`, no import errors. Stop the server with `Ctrl+C`.

- [ ] **Step 4: Commit Storybook config**

```bash
git add .storybook/
git commit -m "chore(storybook): add Storybook 10 web-components-vite config"
```

---

## Task 4: `AriaAssociationController`

**Files:**
- Create: `packages/components/src/foundations/aria-association-controller.ts`
- Create: `packages/components/test/foundations/aria-association-controller.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/components/test/foundations/aria-association-controller.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../../src/foundations/aria-association-controller.js';

// Minimal host element for testing the controller
@customElement('test-host')
class TestHost extends LitElement {
  @property({ type: String }) for?: string;

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-labelledby',
    target: () => this.for,
  });
}

describe('AriaAssociationController', () => {
  it('mints an id on host if none is set', async () => {
    const el = await fixture<TestHost>(html`<test-host></test-host>`);
    expect(el.id).to.match(/^test-host-/);
  });

  it('does NOT overwrite an existing host id', async () => {
    const el = await fixture<TestHost>(html`<test-host id="my-id"></test-host>`);
    expect(el.id).to.equal('my-id');
  });

  it('writes aria-labelledby on the target with the host id', async () => {
    await fixture(html`
      <div>
        <test-host id="lbl" for="inp"></test-host>
        <input id="inp" />
      </div>
    `);
    const input = document.querySelector<HTMLInputElement>('input')!;
    expect(input.getAttribute('aria-labelledby')).to.include('lbl');
  });

  it('appends host id to existing aria-labelledby without duplication', async () => {
    await fixture(html`
      <div>
        <test-host id="lbl2" for="inp2"></test-host>
        <input id="inp2" aria-labelledby="existing" />
      </div>
    `);
    const input = document.querySelector<HTMLInputElement>('#inp2')!;
    const tokens = input.getAttribute('aria-labelledby')!.split(' ');
    expect(tokens).to.include('lbl2');
    expect(tokens).to.include('existing');
    expect(tokens.filter(t => t === 'lbl2').length).to.equal(1);
  });

  it('removes host id token on disconnect', async () => {
    const container = await fixture<HTMLDivElement>(html`
      <div>
        <test-host id="lbl3" for="inp3"></test-host>
        <input id="inp3" />
      </div>
    `);
    const input = container.querySelector<HTMLInputElement>('#inp3')!;
    const host = container.querySelector<TestHost>('test-host')!;
    expect(input.getAttribute('aria-labelledby')).to.include('lbl3');
    host.remove();
    expect(input.getAttribute('aria-labelledby') ?? '').to.not.include('lbl3');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/components && pnpm test -- --grep AriaAssociationController
```

Expected: FAIL — `AriaAssociationController` does not exist yet.

- [ ] **Step 3: Implement `AriaAssociationController`**

```typescript
// packages/components/src/foundations/aria-association-controller.ts
import type { ReactiveController, ReactiveControllerHost } from 'lit';

declare global {
  // Bundler-replaced boolean flag; undefined in test environments (treated as dev).
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

export type AriaAssoc =
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-controls'
  | 'aria-errormessage';

export interface AriaAssociationOptions {
  attribute: AriaAssoc;
  target: () => string | undefined;
  also?: Partial<Record<string, string>>;
}

function resolveTarget(host: HTMLElement, id: string): HTMLElement | null {
  let scope: Node = host.getRootNode();
  while (scope) {
    const found = (scope as Document | ShadowRoot).getElementById?.(id);
    if (found) return found;
    if (scope instanceof ShadowRoot) {
      scope = scope.host.getRootNode();
    } else {
      break;
    }
  }
  return document.getElementById(id);
}

export class AriaAssociationController implements ReactiveController {
  #host: ReactiveControllerHost & HTMLElement;
  #opts: AriaAssociationOptions;
  #minted = false;

  constructor(host: ReactiveControllerHost & HTMLElement, opts: AriaAssociationOptions) {
    this.#host = host;
    this.#opts = opts;
    host.addController(this);
  }

  hostConnected(): void {
    if (!this.#host.id) {
      const tag = this.#host.tagName.toLowerCase();
      this.#host.id = `${tag}-${crypto.randomUUID().slice(0, 8)}`;
      this.#minted = true;
      if (
        globalThis.__DEV__ !== false &&
        (this.#opts.attribute === 'aria-labelledby' ||
          this.#opts.attribute === 'aria-errormessage')
      ) {
        console.warn(
          `<${this.#host.tagName.toLowerCase()}>: No id set on host — minted "${this.#host.id}". ` +
          `Set id explicitly for SSR-safe ${this.#opts.attribute} association.`
        );
      }
    }
    this.#write();
  }

  hostUpdated(): void {
    this.#write();
  }

  hostDisconnected(): void {
    const targetId = this.#opts.target();
    if (!targetId) return;
    const target = resolveTarget(this.#host, targetId);
    if (!target) return;
    const attr = this.#opts.attribute;
    const tokens = (target.getAttribute(attr) ?? '')
      .split(' ')
      .filter(t => t && t !== this.#host.id);
    if (tokens.length) {
      target.setAttribute(attr, tokens.join(' '));
    } else {
      target.removeAttribute(attr);
    }
  }

  #write(): void {
    const targetId = this.#opts.target();
    if (!targetId) return;
    const target = resolveTarget(this.#host, targetId);
    if (!target) return;
    const attr = this.#opts.attribute;
    const existing = (target.getAttribute(attr) ?? '').split(' ').filter(Boolean);
    if (!existing.includes(this.#host.id)) {
      existing.push(this.#host.id);
      target.setAttribute(attr, existing.join(' '));
    }
    if (this.#opts.also) {
      for (const [k, v] of Object.entries(this.#opts.also)) {
        target.setAttribute(k, v);
      }
    }
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd packages/components && pnpm test -- --grep AriaAssociationController
```

Expected: 5 tests, all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/foundations/ packages/components/test/foundations/
git commit -m "feat(foundations): AriaAssociationController — ARIA id-association across shadow boundaries"
```

---

## Task 5: `<ds-card>`

**Files:**
- Create: `packages/components/src/ds-card/ds-card.ts`
- Create: `packages/components/test/ds-card.test.ts`
- Create: `packages/components/stories/ds-card.stories.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/components/test/ds-card.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import type { DsCard } from '../src/ds-card/ds-card.js';
import '../src/ds-card/ds-card.js';

describe('ds-card', () => {
  it('has default elevation of 1', async () => {
    const el = await fixture<DsCard>(html`<ds-card></ds-card>`);
    expect(el.elevation).to.equal(1);
  });

  it('reflects elevation as attribute', async () => {
    const el = await fixture<DsCard>(html`<ds-card elevation="2"></ds-card>`);
    expect(el.getAttribute('elevation')).to.equal('2');
    expect(el.elevation).to.equal(2);
  });

  it('elevation 3 reflects attribute "3"', async () => {
    const el = await fixture<DsCard>(html`<ds-card elevation="3"></ds-card>`);
    expect(el.getAttribute('elevation')).to.equal('3');
  });

  it('renders slotted content in default slot', async () => {
    const el = await fixture<DsCard>(html`
      <ds-card><p id="body">content</p></ds-card>
    `);
    const slotted = el.querySelector('#body');
    expect(slotted).to.exist;
    expect(slotted!.textContent).to.equal('content');
  });

  it('renders content in named header slot', async () => {
    const el = await fixture<DsCard>(html`
      <ds-card><span slot="header" id="hdr">Header</span></ds-card>
    `);
    const hdr = el.querySelector('#hdr');
    expect(hdr).to.exist;
  });

  it('has display: block on :host', async () => {
    const el = await fixture<DsCard>(html`<ds-card></ds-card>`);
    const display = getComputedStyle(el).display;
    expect(display).to.equal('block');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/components && pnpm test -- --grep ds-card
```

Expected: FAIL — `ds-card` is not defined.

- [ ] **Step 3: Implement `ds-card`**

```typescript
// packages/components/src/ds-card/ds-card.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-card')
export class DsCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--ds-card-bg, var(--ds-alias-surface-bg, #FFFFFF));
      border: var(--ds-card-border-width, 1px) solid var(--ds-card-border-color, var(--ds-alias-surface-border, #1A1A1A));
      padding: var(--ds-card-padding, 24px);
      border-radius: var(--ds-card-radius, 0px);
      box-shadow: var(--ds-card-shadow, var(--ds-alias-shadow-1, 2px 2px 0px #000000));
      transition:
        transform var(--ds-alias-transition-snappy, 100ms linear),
        box-shadow var(--ds-alias-transition-snappy, 100ms linear);
    }

    :host([elevation='1']) { --ds-card-shadow: var(--ds-alias-shadow-1, 2px 2px 0px #000000); }
    :host([elevation='2']) { --ds-card-shadow: var(--ds-alias-shadow-2, 4px 4px 0px #000000); }
    :host([elevation='3']) { --ds-card-shadow: var(--ds-alias-shadow-3, 8px 8px 0px #000000); }

    :host(:hover),
    :host(:has(*:focus-visible)) {
      transform: translate(-1px, -1px);
      --ds-card-shadow: var(--ds-alias-shadow-2, 4px 4px 0px #000000);
    }
  `;

  @property({ type: Number, reflect: true }) elevation: 1 | 2 | 3 = 1;

  render() {
    return html`
      <div part="root">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-card': DsCard;
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd packages/components && pnpm test -- --grep ds-card
```

Expected: 6 tests, all PASS.

- [ ] **Step 5: Write Storybook story**

```typescript
// packages/components/stories/ds-card.stories.ts
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-card/ds-card.js';

type DsCardArgs = { elevation: 1 | 2 | 3; withHeader: boolean };

const meta: Meta<DsCardArgs> = {
  title: 'Atoms/ds-card',
  tags: ['autodocs'],
  render: ({ elevation, withHeader }) => html`
    <ds-card elevation="${elevation}">
      ${withHeader ? html`<strong slot="header">Card Header</strong>` : ''}
      <p>Body content — industrial surface at elevation ${elevation}.</p>
    </ds-card>
  `,
  argTypes: {
    elevation: { control: { type: 'radio' }, options: [1, 2, 3] },
    withHeader: { control: 'boolean' },
  },
  args: { elevation: 1, withHeader: false },
};

export default meta;
type Story = StoryObj<DsCardArgs>;

export const Elevation1: Story = { args: { elevation: 1 } };
export const Elevation2: Story = { args: { elevation: 2 } };
export const Elevation3: Story = { args: { elevation: 3 } };
export const WithHeader: Story = { args: { elevation: 1, withHeader: true } };
export const HoverState: Story = {
  args: { elevation: 1 },
  parameters: { pseudo: { hover: true } },
};
```

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/ds-card/ packages/components/test/ds-card.test.ts packages/components/stories/ds-card.stories.ts
git commit -m "feat(ds-card): Tier A surface component — elevation prop, B+ shell, Storybook story"
```

---

## Task 6: `<ds-label>`

**Files:**
- Create: `packages/components/src/ds-label/ds-label.ts`
- Create: `packages/components/test/ds-label.test.ts`
- Create: `packages/components/stories/ds-label.stories.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/components/test/ds-label.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import type { DsLabel } from '../src/ds-label/ds-label.js';
import '../src/ds-label/ds-label.js';

describe('ds-label', () => {
  it('has display: block', async () => {
    const el = await fixture<DsLabel>(html`<ds-label>Field</ds-label>`);
    expect(getComputedStyle(el).display).to.equal('block');
  });

  it('defaults tone to "default"', async () => {
    const el = await fixture<DsLabel>(html`<ds-label>X</ds-label>`);
    expect(el.tone).to.equal('default');
  });

  it('reflects tone attribute', async () => {
    const el = await fixture<DsLabel>(html`<ds-label tone="muted">X</ds-label>`);
    expect(el.getAttribute('tone')).to.equal('muted');
  });

  it('reflects accent tone attribute', async () => {
    const el = await fixture<DsLabel>(html`<ds-label tone="accent">X</ds-label>`);
    expect(el.getAttribute('tone')).to.equal('accent');
  });

  it('renders slotted text', async () => {
    const el = await fixture<DsLabel>(html`<ds-label>System Key</ds-label>`);
    expect(el.textContent?.trim()).to.equal('System Key');
  });

  it('reflects the "for" property as attribute', async () => {
    const el = await fixture<DsLabel>(html`<ds-label for="my-input">Label</ds-label>`);
    expect(el.getAttribute('for')).to.equal('my-input');
    expect(el.for).to.equal('my-input');
  });

  it('writes aria-labelledby on the target when "for" is set', async () => {
    const container = await fixture(html`
      <div>
        <ds-label id="lbl" for="inp">Label</ds-label>
        <input id="inp" />
      </div>
    `);
    const input = container.querySelector<HTMLInputElement>('#inp')!;
    expect(input.getAttribute('aria-labelledby')).to.include('lbl');
  });

  it('applies text-transform: uppercase', async () => {
    const el = await fixture<DsLabel>(html`<ds-label>label text</ds-label>`);
    expect(getComputedStyle(el).textTransform).to.equal('uppercase');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/components && pnpm test -- --grep ds-label
```

Expected: FAIL — `ds-label` not defined.

- [ ] **Step 3: Implement `ds-label`**

```typescript
// packages/components/src/ds-label/ds-label.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('ds-label')
export class DsLabel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ds-label-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--ds-label-size, var(--ds-alias-font-size-label, 11px));
      color: var(--ds-label-color, var(--ds-alias-text-main, #1A1A1A));
      letter-spacing: var(--ds-label-letter-spacing, var(--ds-alias-tracking-wide, 0.05em));
      margin-bottom: var(--ds-label-margin-bottom, var(--ds-alias-space-1, 4px));
      text-transform: uppercase;
      transition: color var(--ds-alias-transition-smooth, 200ms ease);
    }

    :host([tone='muted'])  { color: var(--ds-alias-text-muted, #666666); }
    :host([tone='accent']) { color: var(--ds-global-color-accent, #FF4F00); }
  `;

  @property({ type: String, reflect: true }) for?: string;
  @property({ type: String, reflect: true }) tone: 'default' | 'muted' | 'accent' = 'default';

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-labelledby',
    target: () => this.for,
  });

  render() {
    return html`<span part="root"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-label': DsLabel;
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd packages/components && pnpm test -- --grep ds-label
```

Expected: 8 tests, all PASS.

- [ ] **Step 5: Write Storybook story**

```typescript
// packages/components/stories/ds-label.stories.ts
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-label/ds-label.js';
import '../src/ds-input/ds-input.js';

type DsLabelArgs = { tone: 'default' | 'muted' | 'accent'; text: string };

const meta: Meta<DsLabelArgs> = {
  title: 'Atoms/ds-label',
  tags: ['autodocs'],
  render: ({ tone, text }) => html`<ds-label tone="${tone}">${text}</ds-label>`,
  argTypes: {
    tone: { control: { type: 'radio' }, options: ['default', 'muted', 'accent'] },
    text: { control: 'text' },
  },
  args: { tone: 'default', text: 'System Key' },
};

export default meta;
type Story = StoryObj<DsLabelArgs>;

export const Default: Story = { args: { tone: 'default' } };
export const Muted: Story = { args: { tone: 'muted' } };
export const Accent: Story = { args: { tone: 'accent' } };
export const PairedWithInput: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:240px;">
      <ds-label id="lbl-demo" for="inp-demo">System Key</ds-label>
      <ds-input label-for="inp-demo">
        <input id="inp-demo" type="text" placeholder="CORE-ALPHA-01" />
      </ds-input>
    </div>
  `,
};
```

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/ds-label/ packages/components/test/ds-label.test.ts packages/components/stories/ds-label.stories.ts
git commit -m "feat(ds-label): standalone label atom — tone prop, AriaAssociationController, Storybook story"
```

---

## Task 7: `<ds-btn>`

**Files:**
- Create: `packages/components/src/ds-btn/ds-btn.ts`
- Create: `packages/components/test/ds-btn.test.ts`
- Create: `packages/components/stories/ds-btn.stories.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/components/test/ds-btn.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import type { DsBtn } from '../src/ds-btn/ds-btn.js';
import '../src/ds-btn/ds-btn.js';

describe('ds-btn', () => {
  it('has display: inline-block', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn><button>OK</button></ds-btn>`);
    expect(getComputedStyle(el).display).to.equal('inline-block');
  });

  it('defaults variant to "default"', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn><button>OK</button></ds-btn>`);
    expect(el.variant).to.equal('default');
  });

  it('defaults size to "md"', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn><button>OK</button></ds-btn>`);
    expect(el.size).to.equal('md');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn variant="primary"><button>OK</button></ds-btn>`);
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('reflects size attribute', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn size="sm"><button>OK</button></ds-btn>`);
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('renders slotted button in default slot', async () => {
    const el = await fixture<DsBtn>(html`
      <ds-btn><button id="inner">Action</button></ds-btn>
    `);
    const btn = el.querySelector('#inner');
    expect(btn).to.exist;
    expect(btn!.textContent).to.equal('Action');
  });

  it('renders prefix and suffix icon slots', async () => {
    const el = await fixture<DsBtn>(html`
      <ds-btn>
        <span slot="prefix" id="pfx">→</span>
        <button>Go</button>
        <span slot="suffix" id="sfx">↗</span>
      </ds-btn>
    `);
    expect(el.querySelector('#pfx')).to.exist;
    expect(el.querySelector('#sfx')).to.exist;
  });

  it('ghost variant reflects attribute', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn variant="ghost"><button>Ghost</button></ds-btn>`);
    expect(el.getAttribute('variant')).to.equal('ghost');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/components && pnpm test -- --grep ds-btn
```

Expected: FAIL — `ds-btn` not defined.

- [ ] **Step 3: Implement `ds-btn`**

```typescript
// packages/components/src/ds-btn/ds-btn.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-btn')
export class DsBtn extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      transform: translate(0, 0);
      --ds-btn-shadow: var(--ds-alias-shadow-1, 2px 2px 0px #000000);
      transition:
        transform    var(--ds-alias-transition-snappy, 100ms linear),
        box-shadow   var(--ds-alias-transition-snappy, 100ms linear),
        background   var(--ds-alias-transition-smooth, 200ms ease),
        color        var(--ds-alias-transition-smooth, 200ms ease),
        border-color var(--ds-alias-transition-smooth, 200ms ease);
    }

    :host([variant='default']) {
      --ds-btn-bg:           var(--ds-alias-action-bg, #FFFFFF);
      --ds-btn-color:        var(--ds-alias-action-color, #1A1A1A);
      --ds-btn-border-color: var(--ds-alias-action-border, #1A1A1A);
      --ds-btn-border-style: solid;
    }
    :host([variant='primary']) {
      --ds-btn-bg:           var(--ds-alias-action-bg-primary, #FF4F00);
      --ds-btn-color:        var(--ds-alias-action-color-primary, #FFFFFF);
      --ds-btn-border-color: var(--ds-alias-action-bg-primary, #FF4F00);
      --ds-btn-border-style: solid;
    }
    :host([variant='ghost']) {
      --ds-btn-bg:           transparent;
      --ds-btn-shadow:       none;
      --ds-btn-border-style: dashed;
    }

    :host([size='md']) {
      --ds-btn-padding-x: var(--ds-alias-action-padding-x, 16px);
      --ds-btn-padding-y: var(--ds-alias-action-padding-y, 12px);
      --ds-btn-font-size: var(--ds-alias-font-size-btn, 12px);
    }
    :host([size='sm']) {
      --ds-btn-padding-x: var(--ds-alias-action-padding-x-sm, 12px);
      --ds-btn-padding-y: var(--ds-alias-action-padding-y-sm, 4px);
      --ds-btn-font-size: var(--ds-alias-font-size-btn-sm, 10px);
    }

    :host(:hover),
    :host(:has(*:focus-visible)) {
      transform: translate(-1px, -1px);
      --ds-btn-shadow: var(--ds-alias-shadow-2, 4px 4px 0px #000000);
    }

    :host(:has(*:active)) {
      transform: translate(1px, 1px);
      --ds-btn-shadow: var(--ds-alias-shadow-0, 1px 1px 0px #000000);
    }

    :host([variant='ghost']:has(*:active)) {
      transform: translate(0, 0);
    }

    ::slotted(*) {
      font-family: var(--ds-btn-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size:   var(--ds-btn-font-size, 12px);
      font-weight: var(--ds-btn-font-weight, var(--ds-alias-font-weight-bold, 600));
      text-transform: uppercase;
      border-radius: 0;
      border: 1px solid var(--ds-btn-border-color, #1A1A1A);
      border-style: var(--ds-btn-border-style, solid);
      background: var(--ds-btn-bg, #FFFFFF);
      color: var(--ds-btn-color, #1A1A1A);
      padding: var(--ds-btn-padding-y, 12px) var(--ds-btn-padding-x, 16px);
      box-shadow: var(--ds-btn-shadow);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
  `;

  @property({ type: String, reflect: true }) variant: 'default' | 'primary' | 'ghost' = 'default';
  @property({ type: String, reflect: true }) size: 'sm' | 'md' = 'md';

  render() {
    // display:contents makes the wrapper transparent to layout so the ::part(root)
    // escape hatch is available without affecting inline-block host sizing.
    return html`
      <div part="root" style="display:contents">
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-btn': DsBtn;
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd packages/components && pnpm test -- --grep ds-btn
```

Expected: 8 tests, all PASS.

- [ ] **Step 5: Write Storybook story**

```typescript
// packages/components/stories/ds-btn.stories.ts
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-btn/ds-btn.js';

type DsBtnArgs = {
  variant: 'default' | 'primary' | 'ghost';
  size: 'sm' | 'md';
  label: string;
};

const meta: Meta<DsBtnArgs> = {
  title: 'Atoms/ds-btn',
  tags: ['autodocs'],
  render: ({ variant, size, label }) => html`
    <ds-btn variant="${variant}" size="${size}">
      <button type="button">${label}</button>
    </ds-btn>
  `,
  argTypes: {
    variant: { control: { type: 'radio' }, options: ['default', 'primary', 'ghost'] },
    size: { control: { type: 'radio' }, options: ['sm', 'md'] },
    label: { control: 'text' },
  },
  args: { variant: 'default', size: 'md', label: 'Execute Protocol' },
};

export default meta;
type Story = StoryObj<DsBtnArgs>;

export const Default: Story = { args: { variant: 'default' } };
export const Primary: Story = { args: { variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const SmDefault: Story = { args: { size: 'sm', variant: 'default' } };
export const SmPrimary: Story = { args: { size: 'sm', variant: 'primary' } };
export const FocusVisible: Story = {
  args: { variant: 'default' },
  parameters: { pseudo: { focusVisible: true } },
};
export const Active: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { active: true } },
};
```

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/ds-btn/ packages/components/test/ds-btn.test.ts packages/components/stories/ds-btn.stories.ts
git commit -m "feat(ds-btn): button shell — variant/size props, B+ shell press physics, Storybook story"
```

---

## Task 8: `<ds-input>`

**Files:**
- Create: `packages/components/src/ds-input/ds-input.ts`
- Create: `packages/components/test/ds-input.test.ts`
- Create: `packages/components/stories/ds-input.stories.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/components/test/ds-input.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import type { DsInput } from '../src/ds-input/ds-input.js';
import '../src/ds-input/ds-input.js';

describe('ds-input', () => {
  it('has display: flex', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input type="text" /></ds-input>
    `);
    expect(getComputedStyle(el).display).to.equal('flex');
  });

  it('defaults state to "default"', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input type="text" /></ds-input>
    `);
    expect(el.state).to.equal('default');
  });

  it('defaults density to "default"', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input type="text" /></ds-input>
    `);
    expect(el.density).to.equal('default');
  });

  it('reflects state attribute', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input state="error"><input type="text" /></ds-input>
    `);
    expect(el.getAttribute('state')).to.equal('error');
  });

  it('reflects density="compact" attribute', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input density="compact"><input type="text" /></ds-input>
    `);
    expect(el.getAttribute('density')).to.equal('compact');
  });

  it('reflects data-type="clinical" attribute', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input data-type="clinical"><input type="text" /></ds-input>
    `);
    expect(el.getAttribute('data-type')).to.equal('clinical');
  });

  it('renders slotted input in default slot', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input id="native" type="text" /></ds-input>
    `);
    expect(el.querySelector('#native')).to.exist;
  });

  it('renders label slot content', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input>
        <ds-label slot="label" id="lbl">Field</ds-label>
        <input type="text" />
      </ds-input>
    `);
    const lbl = el.querySelector('#lbl');
    expect(lbl).to.exist;
  });

  it('renders unit slot content', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input>
        <input type="text" />
        <span slot="unit" id="unit">mg</span>
      </ds-input>
    `);
    expect(el.querySelector('#unit')).to.exist;
  });

  it('label-for wires input id via connectedCallback', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input label-for="dose">
        <input type="text" />
      </ds-input>
    `);
    const input = el.querySelector('input')!;
    expect(input.id).to.equal('dose');
  });

  it('label-for wires label[for] via connectedCallback', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input label-for="sys-key">
        <label slot="label">Key</label>
        <input type="text" />
      </ds-input>
    `);
    const label = el.querySelector('label')!;
    expect(label.getAttribute('for')).to.equal('sys-key');
  });

  it('emits dev warning when label present but no association', async () => {
    const warnings: string[] = [];
    const orig = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(String(args[0]));
    (globalThis as Record<string, unknown>).__DEV__ = true;

    await fixture<DsInput>(html`
      <ds-input>
        <label slot="label">No id</label>
        <input type="text" />
      </ds-input>
    `);

    console.warn = orig;
    expect(warnings.some(w => w.includes('ds-input'))).to.be.true;
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/components && pnpm test -- --grep ds-input
```

Expected: FAIL — `ds-input` not defined.

- [ ] **Step 3: Implement `ds-input`**

```typescript
// packages/components/src/ds-input/ds-input.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

@customElement('ds-input')
export class DsInput extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--ds-input-border, var(--ds-alias-surface-border, #1A1A1A));
      background: var(--ds-input-bg, var(--ds-alias-surface-bg-alt, #F0F0EC));
      box-shadow: var(--ds-input-shadow-idle, var(--ds-alias-shadow-inset, inset 1px 1px 0px rgba(0,0,0,0.1)));
      transition:
        background-color var(--ds-alias-transition-smooth, 200ms ease),
        border-color     var(--ds-alias-transition-smooth, 200ms ease),
        box-shadow       var(--ds-alias-transition-smooth, 200ms ease);
    }

    :host(:focus-within) {
      background: var(--ds-input-bg-focus, var(--ds-alias-surface-bg, #FFFFFF));
      border-color: var(--ds-global-color-accent, #FF4F00);
      box-shadow: var(--ds-input-shadow-focus, var(--ds-alias-shadow-accent, 2px 2px 0px #FF4F00));
    }

    :host([state='error']) {
      border-color: var(--ds-input-border-error, var(--ds-alias-status-error, #CC0000));
    }
    :host([state='error']:focus-within) {
      border-color: var(--ds-input-border-error, #CC0000);
      box-shadow: var(--ds-input-shadow-error, var(--ds-alias-shadow-error, 2px 2px 0px #CC0000));
    }
    :host([state='success']) {
      border-color: var(--ds-input-border-success, var(--ds-alias-status-success, #1A6B1A));
    }

    :host([density='compact']) {
      --ds-input-padding: 4px;
    }

    ::slotted(input),
    ::slotted(textarea) {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--ds-font-ui, 'Inter', system-ui, sans-serif);
      font-size: 14px;
      color: var(--ds-input-text, var(--ds-alias-text-main, #1A1A1A));
      padding: var(--ds-input-padding, var(--ds-alias-input-padding, 8px));
    }

    :host([data-type='clinical']) ::slotted(input) {
      font-family: var(--ds-font-mono, 'JetBrains Mono', monospace);
    }

    ::slotted([slot='unit']) {
      font-family: var(--ds-font-mono, 'JetBrains Mono', monospace);
      font-size: 12px;
      padding: 0 var(--ds-alias-space-2, 8px);
      border-left: 1px solid var(--ds-input-border, #1A1A1A);
      color: var(--ds-alias-text-muted, #666666);
      align-self: stretch;
      display: flex;
      align-items: center;
    }
  `;

  @property({ type: String, reflect: true }) state: 'default' | 'error' | 'success' = 'default';
  @property({ type: String, reflect: true }) density: 'compact' | 'default' = 'default';
  @property({ type: String, reflect: true, attribute: 'label-for' }) labelFor?: string;
  @property({ type: String, reflect: true, attribute: 'data-type' }) dataType?: 'clinical';

  connectedCallback(): void {
    super.connectedCallback();
    const input = this.querySelector<HTMLElement>(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
    );
    const label = this.querySelector<HTMLElement>('[slot="label"]');

    if (this.labelFor && input && !input.id) {
      input.id = this.labelFor;
    }
    if (this.labelFor && label) {
      const isNativeLabel = label instanceof HTMLLabelElement;
      const isDsLabel = label.tagName.toLowerCase() === 'ds-label';
      if ((isNativeLabel || isDsLabel) && !label.getAttribute('for')) {
        label.setAttribute('for', this.labelFor);
      }
    }

    if (globalThis.__DEV__ !== false) {
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

  render() {
    // display:contents preserves the :host flex layout (label/input/unit are flex children)
    // while still exposing ::part(root) as an escape hatch for consumers.
    return html`
      <div part="root" style="display:contents">
        <slot name="label"></slot>
        <slot></slot>
        <slot name="unit"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-input': DsInput;
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd packages/components && pnpm test -- --grep ds-input
```

Expected: 12 tests, all PASS.

- [ ] **Step 5: Write Storybook story**

```typescript
// packages/components/stories/ds-input.stories.ts
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-input/ds-input.js';
import '../src/ds-label/ds-label.js';

type DsInputArgs = {
  state: 'default' | 'error' | 'success';
  density: 'default' | 'compact';
  clinical: boolean;
  withUnit: boolean;
  withLabel: boolean;
};

const meta: Meta<DsInputArgs> = {
  title: 'Atoms/ds-input',
  tags: ['autodocs'],
  render: ({ state, density, clinical, withUnit, withLabel }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      ${withLabel
        ? html`<ds-label id="lbl-story" for="inp-story">System Key</ds-label>`
        : ''}
      <ds-input
        state="${state}"
        density="${density}"
        ?data-type="${clinical ? 'clinical' : null}"
        label-for="${withLabel ? 'inp-story' : ''}"
      >
        ${withLabel
          ? ''
          : html`<ds-label slot="label" for="inp-story">System Key</ds-label>`}
        <input id="inp-story" type="text" placeholder="${clinical ? '0.00' : 'CORE-ALPHA-01'}" />
        ${withUnit ? html`<span slot="unit">mg</span>` : ''}
      </ds-input>
    </div>
  `,
  argTypes: {
    state: { control: { type: 'radio' }, options: ['default', 'error', 'success'] },
    density: { control: { type: 'radio' }, options: ['default', 'compact'] },
    clinical: { control: 'boolean' },
    withUnit: { control: 'boolean' },
    withLabel: { control: 'boolean', description: 'Label via external ds-label vs label slot' },
  },
  args: { state: 'default', density: 'default', clinical: false, withUnit: false, withLabel: false },
};

export default meta;
type Story = StoryObj<DsInputArgs>;

export const Default: Story = { args: { state: 'default' } };
export const Error: Story = { args: { state: 'error' } };
export const Success: Story = { args: { state: 'success' } };
export const Compact: Story = { args: { density: 'compact' } };
export const Clinical: Story = { args: { clinical: true, withUnit: true } };
export const WithUnit: Story = { args: { withUnit: true } };
export const WithLabelSlot: Story = { args: { withLabel: false } };
export const WithExternalLabel: Story = { args: { withLabel: true } };
```

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/ds-input/ packages/components/test/ds-input.test.ts packages/components/stories/ds-input.stories.ts
git commit -m "feat(ds-input): carved input shell — state/density/clinical props, A11y wiring, Storybook story"
```

---

## Task 9: Barrel Export + Full Test Run

**Files:**
- Create: `packages/components/src/index.ts`

- [ ] **Step 1: Write barrel export**

```typescript
// packages/components/src/index.ts
export * from './foundations/aria-association-controller.js';
export * from './ds-card/ds-card.js';
export * from './ds-label/ds-label.js';
export * from './ds-btn/ds-btn.js';
export * from './ds-input/ds-input.js';
```

- [ ] **Step 2: Run all tests**

```bash
cd packages/components && pnpm test
```

Expected: All tests in all 5 test files PASS. Zero failures.

- [ ] **Step 3: Verify Storybook builds with all stories**

```bash
cd /path/to/ajj-design && pnpm build-storybook
```

Expected: `storybook-static/` directory created, no TypeScript or import errors.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/index.ts
git commit -m "feat(components): barrel export — all Tier A atoms"
```

---

## Completion Checklist

All items are required for merge:

- [ ] Token pipeline builds `dist/web/tokens.css` with `@theme {}` block
- [ ] Token pipeline builds all 5 Flutter Dart files
- [ ] `AriaAssociationController` tests pass (5 tests)
- [ ] `ds-card` tests pass (6 tests), Storybook story covers elevation 1/2/3 × hover × header slot
- [ ] `ds-label` tests pass (8 tests), Storybook story covers default × muted × accent × paired-with-input
- [ ] `ds-btn` tests pass (8 tests), Storybook story covers variant × size × state (idle/hover/focus/active)
- [ ] `ds-input` tests pass (12 tests), Storybook story covers state × density × clinical × unit × label variants
- [ ] `pnpm build-storybook` exits 0
