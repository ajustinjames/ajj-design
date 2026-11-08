# @ajustinjames/glassline-components

Framework-agnostic Web Components for the Glassline liquid-glass design system.

Glassline components are built with Lit and registered as `gl-*` custom elements. They are visual shells only: application state, routing, form submission, and data loading stay in the consuming app.

Live Storybook: https://ajustinjames.github.io/ajj-design/

## Install

```bash
npm install @ajustinjames/glassline-components @ajustinjames/glassline-tokens
```

## Usage

Import tokens first, then register the components:

```js
import '@ajustinjames/glassline-tokens/css';
import '@ajustinjames/glassline-components';
```

Use the registered custom elements in HTML:

```html
<gl-btn variant="primary">Save changes</gl-btn>

<gl-input label-for="project-name">
  <label slot="label">Project</label>
  <input id="project-name" value="Glassline" />
</gl-input>

<gl-alert tone="info">
  <span slot="header">Status</span>
  Build completed.
</gl-alert>
```

## Styling

Components consume Glassline CSS custom properties with `--gl-*` names. Component-specific variables fall back to alias tokens, then hard-coded defaults.

```css
my-panel {
  --gl-btn-bg: rgba(255, 255, 255, 0.72);
  --gl-btn-color: #1D1D1F;
}
```

## Changelog and versioning

Release notes for every version are on [GitHub Releases](https://github.com/ajustinjames/ajj-design/releases): look for the `glassline-v<version>` releases (titled "glassline v<version>"). `@ajustinjames/glassline-tokens` and `@ajustinjames/glassline-components` are always released together at the same version; install matching versions.

This package follows strict semver. Element tags, attributes, slots, parts, events, CSS custom properties and export paths are public API: renaming or removing any of them is a major release. See the [versioning policy](https://github.com/ajustinjames/ajj-design/blob/main/AGENTS.md#versioning-policy).

## Development

```bash
pnpm --filter @ajustinjames/glassline-components build
pnpm --filter @ajustinjames/glassline-components test
```

Source files intentionally keep `ds-*` filenames and `Ds*` class names for now. The public custom element tags are `gl-*`.
