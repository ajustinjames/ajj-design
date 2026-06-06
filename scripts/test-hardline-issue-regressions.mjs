import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentIndex = await readFile('packages/hardline-components/src/index.ts', 'utf8');
const buttonSource = await readFile('packages/hardline-components/src/ds-btn/ds-btn.ts', 'utf8');
const tokens = JSON.parse(await readFile('packages/hardline-tokens/tokens.json', 'utf8'));

const componentExports = [...componentIndex.matchAll(/export \* from '(\.\/ds-[^']+\.js)';/g)].map(match => match[1]);
const sideEffectImports = [...componentIndex.matchAll(/^import '(\.\/ds-[^']+\.js)';$/gm)].map(match => match[1]);

assert.deepEqual(
  sideEffectImports,
  componentExports,
  'the package entrypoint must explicitly import every public component module before re-exporting it',
);

assert.equal(
  tokens.aliasDark.action.color.$value,
  '#F0F0EC',
  'dark default buttons need a light action foreground token',
);

assert.equal(
  tokens.aliasDark.action['shadow-primary'].$value,
  '2px 2px 0px #000000',
  'dark primary buttons need a shadow that contrasts with the orange fill',
);

assert.match(
  buttonSource,
  /:host\(\[variant='primary'\]\)\s*\{[\s\S]*--hl-btn-shadow:\s*var\(--hl-alias-action-shadow-primary,/,
  'primary buttons must consume the primary shadow token',
);

assert.match(
  buttonSource,
  /:host\(\[disabled\]\)\s*\{[\s\S]*opacity:\s*var\(--hl-btn-disabled-opacity,\s*var\(--hl-alias-action-disabled-opacity,\s*0\.72\)\);/,
  'disabled buttons must use the disabled opacity token with a readable fallback',
);
