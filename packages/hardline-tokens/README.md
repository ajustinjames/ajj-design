# @ajustinjames/hardline-tokens

Design tokens for the Hardline industrial-material design system.

This package ships compiled CSS custom properties generated from the Hardline token source. Use it before loading `@ajustinjames/hardline-components` so components can read the `--hl-*` variables.

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

## Development

```bash
pnpm --filter @ajustinjames/hardline-tokens build
```

Token source lives in `tokens.json`; generated files are written to `dist/web/`.
