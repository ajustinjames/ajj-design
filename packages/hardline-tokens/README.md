# @ajustinjames/hardline-tokens

Design tokens for the Hardline industrial-material design system.

This package ships compiled CSS custom properties generated from the Hardline token source. Use it before loading `@ajustinjames/hardline-components` so components can read the `--hl-*` variables.

Live Storybook: https://ajustinjames.github.io/ajj-design/

## Install

```bash
npm install @ajustinjames/hardline-tokens
```

## Usage

Import the default light token layer:

```js
import '@ajustinjames/hardline-tokens/css';
```

Import the dark token overrides when your app supports the dark theme:

```js
import '@ajustinjames/hardline-tokens/css-dark';
```

The package also exports the light CSS file from the package root:

```js
import '@ajustinjames/hardline-tokens';
```

## Exports

- `@ajustinjames/hardline-tokens` - light theme CSS
- `@ajustinjames/hardline-tokens/css` - light theme CSS
- `@ajustinjames/hardline-tokens/css-dark` - dark theme CSS overrides
- `@ajustinjames/hardline-tokens/theme` - Tailwind `@theme` token output

## Changelog and versioning

Release notes for every version are on [GitHub Releases](https://github.com/ajustinjames/ajj-design/releases): look for the `hardline-v<version>` releases (titled "hardline v<version>"). `@ajustinjames/hardline-tokens` and `@ajustinjames/hardline-components` are always released together at the same version; install matching versions.

This package follows strict semver. Element tags, attributes, slots, parts, events, CSS custom properties and export paths are public API: renaming or removing any of them is a major release. See the [versioning policy](https://github.com/ajustinjames/ajj-design/blob/main/AGENTS.md#versioning-policy).

## Development

```bash
pnpm --filter @ajustinjames/hardline-tokens build
```

Token source lives in `tokens.json`; generated files are written to `dist/web/`.
