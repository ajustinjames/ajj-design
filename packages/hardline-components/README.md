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

## Changelog and versioning

Release notes for every version are on [GitHub Releases](https://github.com/ajustinjames/ajj-design/releases): look for the `hardline-v<version>` releases (titled "hardline v<version>"). `@ajustinjames/hardline-tokens` and `@ajustinjames/hardline-components` are always released together at the same version; install matching versions.

This package follows strict semver. Element tags, attributes, slots, parts, events, CSS custom properties and export paths are public API: renaming or removing any of them is a major release. See the [versioning policy](https://github.com/ajustinjames/ajj-design/blob/main/AGENTS.md#versioning-policy).

## Development

```bash
pnpm --filter @ajustinjames/hardline-components build
pnpm --filter @ajustinjames/hardline-components test
```

Source files intentionally keep `ds-*` filenames and `Ds*` class names for now. The public custom element tags are `hl-*`.
