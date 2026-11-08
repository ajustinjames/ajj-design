import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Shared release primitives.
 *
 * Release model: npm + git tags are the source of truth for versions. The
 * `version` field in every packages/<system>-{tokens,components}/package.json
 * is a fixed placeholder (PLACEHOLDER_VERSION). CI computes the real version
 * at release time from the PR's release label and what is already on npm,
 * stamps it into the manifests inside the CI run only, then packs, publishes
 * and tags. Nothing is ever committed back to the repo.
 *
 * Release labels (at most one per PR):
 *   patch | minor | major  bump every already-published system the PR changed
 *
 * A system's first release is never done by CI: OIDC trusted publishing can't
 * create packages, and we keep no npm token in CI. It is published locally with
 * `pnpm release:launch <system>` (LAUNCH_VERSION), which also registers the
 * trusted publisher.
 * Which systems a PR "changed" is derived from its files: only files that end
 * up in the published package count (tests, stories, test configs don't).
 */

export const SCOPE = '@ajustinjames';
export const PLACEHOLDER_VERSION = '0.0.0';
export const BUMPS = ['patch', 'minor', 'major'];
export const LAUNCH_VERSION = '0.1.0';
export const RELEASE_WORKFLOW_FILE = 'release.yml';

export const repoRoot = path.resolve(import.meta.dirname, '..');
export const packagesDir = path.join(repoRoot, 'packages');

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function isSemver(version) {
  return typeof version === 'string' && SEMVER.test(version);
}

export function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function bumpVersion(version, bump) {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump '${bump}'`);
  }
}

export function packageNames(system) {
  return {
    tokens: `${SCOPE}/${system}-tokens`,
    components: `${SCOPE}/${system}-components`,
  };
}

export function manifestPath(system, kind) {
  return path.join(packagesDir, `${system}-${kind}`, 'package.json');
}

export function readManifest(system, kind) {
  return JSON.parse(readFileSync(manifestPath(system, kind), 'utf8'));
}

/**
 * A "system" is a packages/<name>-tokens + packages/<name>-components pair.
 * Orphan halves are reported and skipped.
 */
export function discoverSystems({ warn = (msg) => console.error(msg) } = {}) {
  const candidates = new Set();
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const match = /^([a-z][a-z0-9-]*)-(tokens|components)$/.exec(entry.name);
    if (match) candidates.add(match[1]);
  }

  const systems = [];
  for (const name of [...candidates].sort()) {
    const hasTokens = existsSync(manifestPath(name, 'tokens'));
    const hasComponents = existsSync(manifestPath(name, 'components'));
    if (hasTokens && hasComponents) {
      systems.push(name);
    } else {
      const missing = hasTokens ? 'components' : 'tokens';
      warn(`Warning: packages/${name}-* has no matching ${name}-${missing} package — skipping`);
    }
  }
  return systems;
}

function npmView(args) {
  try {
    return execFileSync('npm', ['view', ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    if (output.includes('E404')) return null;
    // Anything other than "not found" (network, registry outage, auth) must
    // not be mistaken for "unpublished" — fail loudly instead.
    throw new Error(`npm view ${args.join(' ')} failed:\n${output}`);
  }
}

/** Latest published version of a package, or null if it has never been published. */
export function latestPublishedVersion(pkgName) {
  const version = npmView([pkgName, 'version']);
  return version ? version : null;
}

/** Whether exactly `pkgName@version` exists on the registry. */
export function isVersionPublished(pkgName, version) {
  // For an existing package, viewing a missing version prints nothing (exit 0).
  return npmView([`${pkgName}@${version}`, 'version']) === version;
}


// Paths inside a package directory that never reach the published tarball.
const NOT_SHIPPED = [
  /^test\//,
  /^stories\//,
  /^tsconfig\.json$/,
  /^tsconfig\.test\.json$/,
  /^playwright\.config\./,
  /^web-test-runner\.config\./,
];

/** The system a changed file belongs to if it affects a published package, else null. */
export function shippedSystemOf(file) {
  const match = /^packages\/([a-z][a-z0-9-]*)-(?:tokens|components)\/(.+)$/.exec(file);
  if (!match) return null;
  const [, system, rest] = match;
  return NOT_SHIPPED.some((pattern) => pattern.test(rest)) ? null : system;
}

/** Systems whose published packages are affected by a list of changed files. */
export function changedSystems(files, systems) {
  const known = new Set(systems);
  return new Set(files.map(shippedSystemOf).filter((system) => system && known.has(system)));
}

/**
 * Parse PR labels. Unrelated labels (e.g. "dependencies") are ignored.
 * Returns { bump: 'patch'|'minor'|'major'|null, errors: string[] }.
 */
export function parseReleaseLabels(labels) {
  const bumps = labels.filter((label) => BUMPS.includes(label));
  const errors = [];
  if (bumps.length > 1) {
    errors.push(`Multiple version labels (${bumps.join(', ')}). Keep at most one of patch, minor, major.`);
  }
  return { bump: bumps[0] ?? null, errors };
}

function publishStatus({ tokens, components }) {
  if (tokens === null && components === null) return 'unpublished';
  if (tokens === null || components === null) return 'partial-first';
  return tokens === components ? 'published' : 'partial';
}

function describeState(system, { tokens, components }) {
  const names = packageNames(system);
  return `${names.tokens}=${tokens ?? 'unpublished'}, ${names.components}=${components ?? 'unpublished'}`;
}

const launchHint = (system) => `launch it locally after merge with \`pnpm release:launch ${system}\``;

/**
 * Turn a request for one system into a plan entry. Requests:
 * patch|minor|major|resume, or undefined with a skip reason.
 */
function resolve(system, published, request, skipReason) {
  const status = publishStatus(published);
  const state = describeState(system, published);
  const fail = (reason) => ({ system, action: 'error', reason });

  if (status === 'unpublished' || status === 'partial-first') {
    const what = status === 'unpublished' ? 'not on npm yet' : `partially published (${state})`;
    if (request) return fail(`${system} is ${what}; CI can only release published systems. Run \`pnpm release:launch ${system}\` locally.`);
    return { system, action: status === 'unpublished' ? 'skip' : 'warn', reason: `${what}; ${launchHint(system)}` };
  }

  if (!request) {
    if (status === 'partial') {
      return { system, action: 'warn', reason: `partial release (${state}); finish it with a manual Release run with bump=resume` };
    }
    return { system, action: 'skip', reason: skipReason };
  }

  if (status === 'partial') {
    if (request === 'resume') {
      const version = compareSemver(published.tokens, published.components) > 0 ? published.tokens : published.components;
      return { system, action: 'publish', version, bump: 'resume', published: state };
    }
    return fail(`Partial release detected (${state}). Finish it first with a manual Release run with bump=resume.`);
  }

  if (request === 'resume') {
    return { system, action: 'skip', reason: `nothing to resume (both packages at ${published.tokens})` };
  }
  return { system, action: 'publish', version: bumpVersion(published.tokens, request), bump: request, published: published.tokens };
}

/**
 * Compute the release plan. Pure: all registry, manifest and git state is
 * passed in, so this is unit-tested directly.
 *
 * @param {object} input
 * @param {Array<{system: string, manifestVersions: {tokens: string, components: string}, published: {tokens: string|null, components: string|null}}>} input.states
 * @param {string[]} [input.labels]        PR labels (label mode)
 * @param {string[]} [input.changedFiles]  files changed by the PR (label mode)
 * @param {{system: string, bump: string}} [input.dispatch]  manual run instead of labels
 * @returns {Array<object>} one entry per system, plus `system: '*'` entries for global errors
 */
export function planRelease({ states, labels = [], changedFiles = [], dispatch }) {
  const plan = [];
  const systems = states.map((state) => state.system);
  const { bump, errors } = dispatch ? { bump: null, errors: [] } : parseReleaseLabels(labels);
  const changed = changedSystems(changedFiles, systems);

  for (const { system, manifestVersions, published } of states) {
    const names = packageNames(system);
    const edited = ['tokens', 'components'].find((kind) => manifestVersions[kind] !== PLACEHOLDER_VERSION);
    if (edited) {
      plan.push({
        system,
        action: 'error',
        reason: `${names[edited]} has version '${manifestVersions[edited]}' in package.json. Versions are computed by CI from release labels; keep it at ${PLACEHOLDER_VERSION}.`,
      });
      continue;
    }
    for (const kind of ['tokens', 'components']) {
      if (published[kind] !== null && !isSemver(published[kind])) {
        plan.push({ system, action: 'error', reason: `Unsupported published version ${names[kind]}@${published[kind]}` });
      }
    }
    if (plan.at(-1)?.system === system) continue;

    if (dispatch) {
      plan.push(resolve(system, published, dispatch.system === system ? dispatch.bump : undefined, 'not selected'));
      continue;
    }

    const status = publishStatus(published);
    if (status === 'unpublished' || status === 'partial-first') {
      // Never released by CI: a bump label applies to the published systems in
      // the PR; this one is reported (skip/warn) with the local launch command.
      plan.push(resolve(system, published, undefined));
    } else if (!changed.has(system)) {
      plan.push(resolve(system, published, undefined, 'no changes to published files'));
    } else {
      plan.push(resolve(system, published, bump ?? undefined, 'no release label'));
    }
  }

  for (const reason of errors) plan.push({ system: '*', action: 'error', reason });

  if (!dispatch && bump && !plan.some((entry) => entry.action === 'error' || entry.action === 'publish')) {
    const unreleased = states
      .filter(({ system, published }) => changed.has(system) && publishStatus(published) !== 'published' && publishStatus(published) !== 'partial')
      .map(({ system }) => system);
    plan.push({
      system: '*',
      action: 'error',
      reason: unreleased.length
        ? `The ${bump} label is set, but the only systems this PR changes (${unreleased.join(', ')}) are not on npm yet. Remove the label; after merge, run \`pnpm release:launch <system>\` locally.`
        : `The ${bump} label is set, but this PR changes no published files of a released system (${systems.join(', ')}). Remove the label, or change shipped files.`,
    });
  }

  return plan;
}

/** `owner/repo` from $GITHUB_REPOSITORY, or from a package's repository.url. */
export function githubRepo(system) {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const url = readManifest(system, 'components').repository?.url ?? '';
  const repo = /github\.com[/:]([^/]+\/[^/.]+)/.exec(url)?.[1];
  if (!repo) throw new Error(`Could not derive the GitHub repo from repository.url '${url}'`);
  return repo;
}

// Release-note sections, keyed by the release label the PR carried.
const NOTE_SECTIONS = [
  ['major', 'Breaking changes'],
  ['minor', 'Features'],
  ['patch', 'Fixes'],
];

/**
 * Markdown body for a system's GitHub release. GitHub Releases are the
 * changelog for this repo (there is no CHANGELOG.md).
 *
 * @param {object} input
 * @param {string} input.system
 * @param {string} input.version
 * @param {string} input.repo            owner/repo
 * @param {string|null} input.previousTag  null for a system's first release
 * @param {Array<{number: number|null, title: string, labels: string[]}>} input.changes
 *   PRs (or commits without a PR, number = null) that changed this system's
 *   published files since previousTag
 */
export function formatReleaseNotes({ system, version, repo, previousTag, changes }) {
  const lines = [];
  const item = (change) => `- ${change.title}${change.number ? ` (#${change.number})` : ''}`;

  if (!previousTag) {
    lines.push(`First release of **${system}**.`, '');
  } else if (changes.length === 0) {
    lines.push('No changes to published files since the previous release.', '');
  } else {
    const sections = new Map();
    for (const change of changes) {
      const heading = NOTE_SECTIONS.find(([label]) => change.labels.includes(label))?.[1] ?? 'Other changes';
      if (!sections.has(heading)) sections.set(heading, []);
      sections.get(heading).push(change);
    }
    for (const heading of ['Breaking changes', 'Features', 'Fixes', 'Other changes']) {
      if (!sections.has(heading)) continue;
      lines.push(`## ${heading}`, '', ...sections.get(heading).map(item), '');
    }
  }

  const names = packageNames(system);
  lines.push(
    '## Packages',
    '',
    ...['tokens', 'components'].map(
      (kind) => `- [\`${names[kind]}@${version}\`](https://www.npmjs.com/package/${names[kind]}/v/${version})`,
    ),
    '',
  );
  if (previousTag) {
    lines.push(`**Full diff:** https://github.com/${repo}/compare/${previousTag}...${system}-v${version}`, '');
  }
  return lines.join('\n');
}
