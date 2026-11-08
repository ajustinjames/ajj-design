import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bumpVersion,
  changedSystems,
  compareSemver,
  formatReleaseNotes,
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
    assert.deepEqual(parseReleaseLabels(['dependencies', 'javascript', 'launch']), { bump: null, errors: [] });
  });

  it('reads one bump label', () => {
    assert.deepEqual(parseReleaseLabels(['minor', 'enhancement']), { bump: 'minor', errors: [] });
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

  it('never releases a new system from CI; points to the local launch', () => {
    const entry = bySystem(plan([], [NEW])).newsys;
    assert.equal(entry.action, 'skip');
    assert.match(entry.reason, /pnpm release:launch newsys/);
  });

  it('applies a bump to the released systems in a PR that also adds a new system', () => {
    const entries = bySystem(plan(['minor'], [NEW, HL]));
    assert.equal(entries.hardline.version, '0.2.0');
    assert.equal(entries.newsys.action, 'skip');
    assert.deepEqual(errorsOf(Object.values(entries)), []);
  });

  it('fails a bump label when the only changed system is new, with the launch command', () => {
    const errors = errorsOf(plan(['patch'], [NEW]));
    assert.equal(errors.length, 1);
    assert.match(errors[0], /not on npm yet/);
    assert.match(errors[0], /pnpm release:launch/);
  });

  it('warns about a half-done launch', () => {
    const states = [state('newsys', { tokens: '0.1.0', components: null })];
    const entry = plan([], [], states)[0];
    assert.equal(entry.action, 'warn');
    assert.match(entry.reason, /pnpm release:launch newsys/);
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

  it('refuses to release a never-published system', () => {
    const entry = dispatch('newsys', 'minor').newsys;
    assert.equal(entry.action, 'error');
    assert.match(entry.reason, /pnpm release:launch newsys/);
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

describe('formatReleaseNotes', () => {
  const base = { system: 'hardline', version: '0.2.0', repo: 'o/r', previousTag: 'hardline-v0.1.0' };

  it('groups PRs by their release label, breaking first', () => {
    const notes = formatReleaseNotes({
      ...base,
      changes: [
        { number: 3, title: 'Fix focus ring', labels: ['patch'] },
        { number: 1, title: 'Rename --hl-btn-bg', labels: ['major'] },
        { number: 2, title: 'Add hl-tabs', labels: ['minor', 'enhancement'] },
        { number: 4, title: 'Bump lit', labels: ['dependencies'] },
        { number: null, title: 'direct commit', labels: [] },
      ],
    });
    const order = ['## Breaking changes', '- Rename --hl-btn-bg (#1)', '## Features', '- Add hl-tabs (#2)', '## Fixes', '- Fix focus ring (#3)', '## Other changes', '- Bump lit (#4)', '- direct commit'];
    let last = -1;
    for (const line of order) {
      const index = notes.indexOf(line);
      assert.ok(index > last, `expected "${line}" after the previous line`);
      last = index;
    }
  });

  it('links both npm packages and the diff', () => {
    const notes = formatReleaseNotes({ ...base, changes: [] });
    assert.match(notes, /npmjs\.com\/package\/@ajustinjames\/hardline-tokens\/v\/0\.2\.0/);
    assert.match(notes, /npmjs\.com\/package\/@ajustinjames\/hardline-components\/v\/0\.2\.0/);
    assert.match(notes, /compare\/hardline-v0\.1\.0\.\.\.hardline-v0\.2\.0/);
  });

  it('describes a first release without a diff link', () => {
    const notes = formatReleaseNotes({ ...base, version: '0.1.0', previousTag: null, changes: [] });
    assert.match(notes, /First release of \*\*hardline\*\*/);
    assert.doesNotMatch(notes, /compare/);
  });
});
