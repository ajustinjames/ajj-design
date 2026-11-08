import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  BUMPS,
  discoverSystems,
  latestPublishedVersion,
  packageNames,
  planRelease,
  readManifest,
  repoRoot,
} from './release-lib.mjs';

/**
 * Computes the release plan for every design system in this repo.
 *
 * Label mode (PRs and pushes to main): the PR's label (`patch|minor|major`)
 * applies to every already-published system whose published
 * files the PR changed. Changed files come from `git diff HEAD^1 HEAD`, which is
 * the PR's changes both on the pull_request merge ref and on main after a
 * squash merge (the only merge method main allows).
 *
 * Dispatch mode (manual Release run): --system and --bump select one system.
 *
 * Versions are always computed from npm, never from package.json (a 0.0.0
 * placeholder) or from git history.
 *
 * Usage:
 *   node scripts/release-plan.mjs --labels '["minor"]'                      # labels + git diff
 *   node scripts/release-plan.mjs --labels '["minor"]' --check              # pre-merge wording
 *   node scripts/release-plan.mjs --labels '["minor"]' --files '["packages/hardline-components/src/x.ts"]'
 *   node scripts/release-plan.mjs --system hardline --bump patch|minor|major|resume
 *   node scripts/release-plan.mjs ... --json                                # raw plan on stdout
 *
 * Labels may also come from the RELEASE_LABELS env var (JSON array).
 * Exits 1 if the plan contains an error.
 * Writes `plan` and `has_publish` to $GITHUB_OUTPUT and a summary
 * table to $GITHUB_STEP_SUMMARY when those are set.
 */

const { values: args } = parseArgs({
  options: {
    labels: { type: 'string' },
    files: { type: 'string' },
    system: { type: 'string' },
    bump: { type: 'string' },
    check: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
});

const systems = discoverSystems();
const inputErrors = [];

function parseJsonArray(raw, what) {
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return value;
    throw new Error('not an array');
  } catch (error) {
    inputErrors.push(`Could not parse ${what} ${JSON.stringify(raw)} as a JSON array: ${error.message}`);
    return [];
  }
}

function gitChangedFiles() {
  try {
    return execFileSync('git', ['diff', '--name-only', 'HEAD^1', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    inputErrors.push(`Could not list changed files with git diff HEAD^1 HEAD (is the checkout deep enough?): ${error.message}`);
    return [];
  }
}

let dispatch;
let labels = [];
let changedFiles = [];

if (args.system || args.bump) {
  const bumps = [...BUMPS, 'resume'];
  if (!args.system || !args.bump) inputErrors.push('--system and --bump must be passed together');
  else if (!systems.includes(args.system)) inputErrors.push(`Unknown system '${args.system}' (known: ${systems.join(', ')})`);
  else if (!bumps.includes(args.bump)) inputErrors.push(`Unknown bump '${args.bump}'; expected one of ${bumps.join(', ')}`);
  else dispatch = { system: args.system, bump: args.bump };
} else {
  labels = parseJsonArray(args.labels || process.env.RELEASE_LABELS || '[]', 'labels');
  changedFiles = args.files ? parseJsonArray(args.files, 'files') : gitChangedFiles();
}

const states = systems.map((system) => {
  const names = packageNames(system);
  return {
    system,
    manifestVersions: {
      tokens: readManifest(system, 'tokens').version,
      components: readManifest(system, 'components').version,
    },
    published: {
      tokens: latestPublishedVersion(names.tokens),
      components: latestPublishedVersion(names.components),
    },
  };
});

const plan = [
  ...planRelease({ states, labels, changedFiles, dispatch }),
  ...inputErrors.map((reason) => ({ system: '*', action: 'error', reason })),
];

const releases = plan.filter((entry) => entry.action === 'publish');
const failed = plan.some((entry) => entry.action === 'error');

function describe(entry) {
  switch (entry.action) {
    case 'publish':
      return entry.bump === 'resume'
        ? `resume ${entry.version} (${entry.published})`
        : `publish ${entry.version} (${entry.bump} over ${entry.published})`;
    default:
      return entry.reason;
  }
}

if (args.json) {
  process.stdout.write(`${JSON.stringify(plan)}\n`);
} else {
  for (const entry of plan) {
    const line = `[${entry.system}] ${entry.action === 'skip' ? 'skip — ' : ''}${describe(entry)}`;
    if (entry.action === 'error') console.error(`::error::${line}`);
    else if (entry.action === 'warn') console.log(`::warning::${line}`);
    else console.log(line);
  }
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `plan=${JSON.stringify(plan)}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `has_publish=${plan.some((entry) => entry.action === 'publish')}\n`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const lead = failed
    ? '❌ The release plan has errors.'
    : releases.length === 0
      ? args.check
        ? 'Merging this PR will **not** publish anything. Add a `patch`, `minor` or `major` label to release the systems it changes.'
        : 'Nothing to publish.'
      : `${args.check ? 'Merging this PR will publish' : 'Publishing'}: ${releases
          .map((entry) => `**${entry.system} ${entry.version}**`)
          .join(', ')}`;
  const rows = plan.map((entry) => `| ${entry.system} | ${entry.action} | ${describe(entry).replaceAll('|', '\\|')} |`);
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `### ${args.check ? 'Release preview (on merge)' : 'Release plan'}`,
      '',
      lead,
      '',
      '| System | Action | Detail |',
      '|---|---|---|',
      ...rows,
      '',
    ].join('\n'),
  );
}

process.exit(failed ? 1 : 0);
