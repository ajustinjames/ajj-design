import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bumpVersion,
  changedSystems,
  compareSemver,
  parseReleaseLabels,
  planRelease,
  shippedSystemOf,
} from './release-lib.mjs';

const placeholder = { tokens: '0.0.0', components: '0.0.0' };
const at = (version) => ({ tokens: version, components: version });
const state = (system, published, manifestVersions = placeholder) => ({ system, published, manifestVersions });

// Default world: hardline + glassline released at 0.1.0, newsys never published.
const STATES = [state('glassline', at('0.1.0')), state('hardline', at('0.1.0')), state('newsys', at(null))];
const SYSTEMS = STATES.map((s) => s.system);

const HL = 'packages/hardline-components/src/ds-btn/ds-btn.ts';
const GL = 'packages/glassline-tokens/tokens.json';
const NEW = 'packages/newsys-components/src/index.ts';

const plan = (labels, changedFiles, states = STATES) => planRelease({ states, labels, changedFiles });
const bySystem = (entries) => Object.fromEntries(entries.map((e) => [e.system, e]));
const errorsOf = (entries) => entries.filter((e) => e.action === 'error').map((e) => e.reason);

describe('version math', () => {
  it('bumps each part and resets lower parts', () => {
    assert.equal(bumpVersion('0.1.3', 'patch'), '0.1.4');
    assert.equal(bumpVersion('0.1.3', 'minor'), '0.2.0');
    assert.equal(bumpVersion('0.1.3', 'major'), '1.0.0');
  });

  it('compares numerically, not lexically', () => {
    assert.ok(compareSemver('0.10.0', '0.9.0') > 0);
    assert.equal(compareSemver('1.2.3', '1.2.3'), 0);
  });
});

describe('changed-file detection', () => {
  it('counts files that ship in the npm package', () => {
    for (const file of [
      'packages/hardline-components/src/ds-btn/ds-btn.ts',
      'packages/hardline-components/package.json',
      'packages/hardline-components/README.md',
      'packages/hardline-components/tsconfig.build.json',
      'packages/hardline-tokens/tokens.json',
      'packages/hardline-tokens/sd.config.js',
    ]) {
      assert.equal(shippedSystemOf(file), 'hardline', file);
    }
  });

  it('ignores tests, stories, test configs and files outside packages', () => {
    for (const file of [
      'packages/hardline-components/test/ds-btn.test.ts',
      'packages/hardline-components/test/__screenshots__/btn.png',
      'packages/hardline-components/stories/ds-btn.stories.ts',
      'packages/hardline-components/tsconfig.json',
      'packages/hardline-components/tsconfig.test.json',
      'packages/hardline-components/playwright.config.ts',
      'packages/hardline-components/web-test-runner.config.js',
      'pnpm-lock.yaml',
      'AGENTS.md',
    ]) {
      assert.equal(shippedSystemOf(file), null, file);
    }
  });

  it('maps files to known systems only', () => {
    assert.deepEqual([...changedSystems([HL, GL, 'packages/ghost-tokens/tokens.json'], SYSTEMS)].sort(), [
      'glassline',
      'hardline',
    ]);
  });
});

describe('parseReleaseLabels', () => {
  it('ignores unrelated labels', () => {
    assert.deepEqual(parseReleaseLabels(['dependencies', 'javascript']), { bump: null, launch: false, errors: [] });
  });

  it('allows one bump plus launch', () => {
    assert.deepEqual(parseReleaseLabels(['minor', 'launch']), { bump: 'minor', launch: true, errors: [] });
  });

  it('rejects more than one bump label', () => {
    assert.match(parseReleaseLabels(['patch', 'major']).errors[0], /Multiple version labels/);
  });
});

describe('planRelease (labels)', () => {
  it('publishes nothing without a release label', () => {
    const entries = plan(['dependencies'], [HL, GL]);
    assert.ok(entries.every((e) => e.action === 'skip'));
  });

  it('applies one bump to every changed released system', () => {
    const entries = bySystem(plan(['minor'], [HL, GL]));
    assert.equal(entries.hardline.version, '0.2.0');
    assert.equal(entries.glassline.version, '0.2.0');
    assert.equal(entries.newsys.action, 'skip');
  });

  it('leaves unchanged systems alone', () => {
    const entries = bySystem(plan(['patch'], [HL]));
    assert.equal(entries.hardline.version, '0.1.1');
    assert.equal(entries.glassline.action, 'skip');
  });

  it('bumps each system from its own npm version', () => {
    const states = [state('glassline', at('0.1.0')), state('hardline', at('1.4.2'))];
    const entries = bySystem(plan(['patch'], [HL, GL], states));
    assert.equal(entries.hardline.version, '1.4.3');
    assert.equal(entries.glassline.version, '0.1.1');
  });

  it('fails a bump label when only tests/stories changed', () => {
    const errors = errorsOf(plan(['patch'], ['packages/hardline-components/test/ds-btn.test.ts']));
    assert.equal(errors.length, 1);
    assert.match(errors[0], /changes no published files/);
  });

  it('launches a new system at 0.1.0', () => {
    const entries = bySystem(plan(['launch'], [NEW]));
    assert.equal(entries.newsys.action, 'launch');
    assert.equal(entries.newsys.version, '0.1.0');
  });

  it('launches a new system and bumps a changed released system in one PR', () => {
    const entries = bySystem(plan(['launch', 'minor'], [NEW, HL]));
    assert.equal(entries.newsys.action, 'launch');
    assert.equal(entries.hardline.action, 'publish');
    assert.equal(entries.hardline.version, '0.2.0');
  });

  it('requires launch for a changed new system when releasing', () => {
    const errors = errorsOf(plan(['minor'], [NEW]));
    assert.ok(errors.some((e) => /needs the launch label/.test(e)));
  });

  it('skips a changed new system quietly when there are no release labels', () => {
    assert.equal(bySystem(plan([], [NEW])).newsys.action, 'skip');
  });

  it('fails launch when no new system changed', () => {
    assert.match(errorsOf(plan(['launch'], [HL]))[0], /changes no system that has never been published/);
  });

  it('does not release a changed released system with launch alone', () => {
    const entries = bySystem(plan(['launch'], [NEW, HL]));
    assert.equal(entries.hardline.action, 'skip');
    assert.match(entries.hardline.reason, /launch only applies to new systems/);
  });

  it('finishes a half-done launch at the version already published', () => {
    const states = [state('newsys', { tokens: '0.1.0', components: null })];
    const entry = plan(['launch'], [NEW], states)[0];
    assert.equal(entry.action, 'launch');
    assert.equal(entry.version, '0.1.0');
  });

  it('rejects hand-edited manifest versions', () => {
    const states = [state('hardline', at('0.1.0'), { tokens: '0.2.0', components: '0.0.0' })];
    assert.match(errorsOf(plan([], [], states))[0], /keep it at 0\.0\.0/);
  });

  it('warns about a partial release and blocks a bump on top of it', () => {
    const states = [state('hardline', { tokens: '0.2.0', components: '0.1.0' })];
    assert.equal(plan([], [], states)[0].action, 'warn');
    assert.match(errorsOf(plan(['patch'], [HL], states))[0], /Partial release/);
  });
});

describe('planRelease (manual dispatch)', () => {
  const dispatch = (system, bump, states = STATES) => bySystem(planRelease({ states, dispatch: { system, bump } }));

  it('releases only the selected system, regardless of changed files', () => {
    const entries = dispatch('hardline', 'major');
    assert.equal(entries.hardline.version, '1.0.0');
    assert.equal(entries.glassline.action, 'skip');
  });

  it('launches a new system', () => {
    assert.equal(dispatch('newsys', 'launch').newsys.action, 'launch');
  });

  it('refuses launch for a released system', () => {
    assert.equal(dispatch('hardline', 'launch').hardline.action, 'error');
  });

  it('resumes a partial release at the higher version', () => {
    const states = [state('hardline', { tokens: '0.2.0', components: '0.1.0' })];
    const entry = dispatch('hardline', 'resume', states).hardline;
    assert.equal(entry.action, 'publish');
    assert.equal(entry.version, '0.2.0');
  });

  it('treats resume with nothing pending as a no-op', () => {
    assert.equal(dispatch('hardline', 'resume').hardline.action, 'skip');
  });
});
