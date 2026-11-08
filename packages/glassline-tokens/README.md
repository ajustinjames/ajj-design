# @ajustinjames/glassline-tokens

Design tokens for the Glassline liquid-glass design system.

This package ships compiled CSS custom properties generated from the Glassline token source. Use it before loading `@ajustinjames/glassline-components` so components can read the `--gl-*` variables.

Live Storybook: https://ajustinjames.github.io/ajj-design/

## Install

```bash
npm install @ajustinjames/glassline-tokens
```

## Usage

Import the default light token layer:

```js
import '@ajustinjames/glassline-tokens/css';
```

Import the dark token overrides when your app supports the dark theme:

```js
import '@ajustinjames/glassline-tokens/css-dark';
```

The package also exports the light CSS file from the package root:

```js
import '@ajustinjames/glassline-tokens';
```

## Exports

- `@ajustinjames/glassline-tokens` - light theme CSS
- `@ajustinjames/glassline-tokens/css` - light theme CSS
- `@ajustinjames/glassline-tokens/css-dark` - dark theme CSS overrides
- `@ajustinjames/glassline-tokens/theme` - Tailwind `@theme` token output

## Changelog and versioning

Release notes for every version are on [GitHub Releases](https://github.com/ajustinjames/ajj-design/releases): look for the `glassline-v<version>` releases (titled "glassline v<version>"). `@ajustinjames/glassline-tokens` and `@ajustinjames/glassline-components` are always released together at the same version; install matching versions.

This package follows strict semver. Element tags, attributes, slots, parts, events, CSS custom properties and export paths are public API: renaming or removing any of them is a major release. See the [versioning policy](https://github.com/ajustinjames/ajj-design/blob/main/AGENTS.md#versioning-policy).

## Development

```bash
pnpm --filter @ajustinjames/glassline-tokens build
```

Token source lives in `tokens.json`; generated files are written to `dist/web/`.
