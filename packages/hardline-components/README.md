# @ajustinjames/hardline-components

Framework-agnostic Web Components for the Hardline industrial-material design system.

Hardline components are built with Lit and registered as `hl-*` custom elements. They are visual shells only: application state, routing, form submission, and data loading stay in the consuming app.

Live Storybook: https://ajustinjames.github.io/ajj-design/

## Install

```bash
npm install @ajustinjames/hardline-components @ajustinjames/hardline-tokens
```

## Usage

Import tokens first, then register the components:

```js
import '@ajustinjames/hardline-tokens/css';
import '@ajustinjames/hardline-components';
```

Use the registered custom elements in HTML:

```html
<hl-btn variant="primary">Save changes</hl-btn>

<hl-input label-for="project-name">
  <label slot="label">Project</label>
  <input id="project-name" value="Hardline" />
</hl-input>

<hl-alert tone="info">
  <span slot="header">Status</span>
  Build completed.
</hl-alert>
```

## Styling

Components consume Hardline CSS custom properties with `--hl-*` names. Component-specific variables fall back to alias tokens, then hard-coded defaults.

```css
my-panel {
  --hl-btn-bg: #ff4f00;
  --hl-btn-color: #000000;
}
```

## Development

```bash
pnpm --filter @ajustinjames/hardline-components build
pnpm --filter @ajustinjames/hardline-components test
```

Source files intentionally keep `ds-*` filenames and `Ds*` class names for now. The public custom element tags are `hl-*`.
