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

## Development

```bash
pnpm --filter @ajustinjames/glassline-tokens build
```

Token source lives in `tokens.json`; generated files are written to `dist/web/`.
