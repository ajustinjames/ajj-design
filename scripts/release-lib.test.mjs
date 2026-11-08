import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bumpVersion, compareSemver, parseReleaseLabels, planForSystem } from './release-lib.mjs';

const SYSTEMS = ['glassline', 'hardline'];
const placeholder = { tokens: '0.0.0', components: '0.0.0' };
const at = (version) => ({ tokens: version, components: version });
const plan = (overrides) =>
  planForSystem({ system: 'hardline', manifestVersions: placeholder, published: at('0.1.0'), request: undefined, ...overrides });

describe('bumpVersion', () => {
  it('bumps each part and resets lower parts', () => {
    assert.equal(bumpVersion('0.1.3', 'patch'), '0.1.4');
    assert.equal(bumpVersion('0.1.3', 'minor'), '0.2.0');
    assert.equal(bumpVersion('0.1.3', 'major'), '1.0.0');
  });
});

describe('compareSemver', () => {
  it('compares numerically, not lexically', () => {
    assert.ok(compareSemver('0.10.0', '0.9.0') > 0);
    assert.equal(compareSemver('1.2.3', '1.2.3'), 0);
  });
});

describe('parseReleaseLabels', () => {
  it('ignores unrelated labels', () => {
    const { requests, errors } = parseReleaseLabels(['dependencies', 'javascript', 'github_actions'], SYSTEMS);
    assert.equal(requests.size, 0);
    assert.deepEqual(errors, []);
  });

  it('collects one bump per system', () => {
    const { requests, errors } = parseReleaseLabels(['hardline:minor', 'glassline:patch'], SYSTEMS);
    assert.deepEqual(Object.fromEntries(requests), { hardline: 'minor', glassline: 'patch' });
    assert.deepEqual(errors, []);
  });

  it('rejects unknown systems and duplicate labels', () => {
    const { errors } = parseReleaseLabels(['nope:patch', 'hardline:minor', 'hardline:major'], SYSTEMS);
    assert.equal(errors.length, 2);
    assert.match(errors[0], /unknown system 'nope'/);
    assert.match(errors[1], /Multiple release labels for hardline/);
  });
});

describe('planForSystem', () => {
  it('skips systems without a label', () => {
    assert.equal(plan({}).action, 'skip');
  });

  it('computes the next version from npm', () => {
    assert.deepEqual(plan({ request: 'minor' }), {
      system: 'hardline',
      action: 'publish',
      version: '0.2.0',
      bump: 'minor',
      published: '0.1.0',
    });
  });

  it('rejects hand-edited manifest versions', () => {
    const result = plan({ manifestVersions: { tokens: '0.2.0', components: '0.0.0' } });
    assert.equal(result.action, 'error');
    assert.match(result.reason, /keep it at 0\.0\.0/);
  });

  it('quietly skips never-published systems without a label', () => {
    const result = plan({ published: { tokens: null, components: null } });
    assert.equal(result.action, 'skip');
  });

  it('refuses a label release for a never-published system and points to bootstrap', () => {
    const result = plan({ published: { tokens: null, components: null }, request: 'minor' });
    assert.equal(result.action, 'error');
    assert.match(result.reason, /Release Bootstrap/);
  });

  it('sends a half-finished first release back to bootstrap', () => {
    const result = plan({ published: { tokens: '0.1.0', components: null }, request: 'resume' });
    assert.equal(result.action, 'error');
    assert.match(result.reason, /Release Bootstrap/);
  });

  it('resumes a partial release at the higher published version', () => {
    const result = plan({ published: { tokens: '0.2.0', components: '0.1.0' }, request: 'resume' });
    assert.equal(result.action, 'publish');
    assert.equal(result.version, '0.2.0');
  });

  it('warns about a partial release without a request, and blocks a new bump on top of it', () => {
    const partial = { tokens: '0.2.0', components: '0.1.0' };
    assert.equal(plan({ published: partial }).action, 'warn');
    assert.equal(plan({ published: partial, request: 'patch' }).action, 'error');
  });

  it('treats resume with nothing pending as a no-op', () => {
    assert.equal(plan({ request: 'resume' }).action, 'skip');
  });
});
