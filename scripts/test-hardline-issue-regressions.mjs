import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// This script encodes hardline-specific regression assertions (button token
// wiring, dark-mode contrast values). The system to check defaults to
// `hardline` but can be overridden so other systems created via
// `scripts/create-system.sh` can reuse the same harness once they define
// equivalent fixtures, e.g. `node scripts/test-hardline-issue-regressions.mjs glassline`.
const system = process.argv[2] ?? 'hardline';
const componentsDir = `packages/${system}-components`;
const tokensDir = `packages/${system}-tokens`;

const componentIndex = await readFile(`${componentsDir}/src/index.ts`, 'utf8');
const buttonSource = await readFile(`${componentsDir}/src/ds-btn/ds-btn.ts`, 'utf8');
const tokens = JSON.parse(await readFile(`${tokensDir}/tokens.json`, 'utf8'));

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
  /:host\(\[disabled\]\)\s*\{[\s\S]*opacity:\s*var\(--hl-btn-disabled-opacity,\s*var\(--hl-alias-action-disabled-opacity,\s*0\.4\)\);/,
  'disabled buttons must use the disabled opacity token with a fallback matching the light alias.action.disabled-opacity value',
);

console.log(`Verified issue regressions for ${system}.`);
