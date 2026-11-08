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
 */

export const SCOPE = '@ajustinjames';
export const PLACEHOLDER_VERSION = '0.0.0';
export const BUMPS = ['patch', 'minor', 'major'];
export const RELEASE_WORKFLOW_FILE = 'release.yml';

export const repoRoot = path.resolve(import.meta.dirname, '..');
export const packagesDir = path.join(repoRoot, 'packages');

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const LABEL = /^([a-z][a-z0-9-]*):(patch|minor|major)$/;

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

/**
 * Parse release labels of the form `<system>:<patch|minor|major>`.
 * Labels that don't match the pattern (e.g. "dependencies") are ignored.
 * Returns { requests: Map<system, bump>, errors: string[] }.
 */
export function parseReleaseLabels(labels, systems) {
  const requests = new Map();
  const errors = [];
  const known = new Set(systems);

  for (const label of labels) {
    const match = LABEL.exec(label);
    if (!match) continue;
    const [, system, bump] = match;
    if (!known.has(system)) {
      errors.push(`Label '${label}' refers to unknown system '${system}' (known: ${systems.join(', ')})`);
      continue;
    }
    if (requests.has(system)) {
      errors.push(
        `Multiple release labels for ${system}: '${system}:${requests.get(system)}' and '${label}'. Keep exactly one.`,
      );
      continue;
    }
    requests.set(system, bump);
  }
  return { requests, errors };
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

/**
 * Decide what to do for one system. Pure: all registry/manifest state is
 * passed in, so this is unit-tested directly.
 *
 * @param {object} input
 * @param {string} input.system
 * @param {{tokens: string, components: string}} input.manifestVersions
 * @param {{tokens: string|null, components: string|null}} input.published
 * @param {string|undefined} input.request  patch|minor|major|resume|undefined
 */
export function planForSystem({ system, manifestVersions, published, request }) {
  const fail = (reason) => ({ system, action: 'error', reason });
  const names = packageNames(system);

  for (const kind of ['tokens', 'components']) {
    if (manifestVersions[kind] !== PLACEHOLDER_VERSION) {
      return fail(
        `${names[kind]} has version '${manifestVersions[kind]}' in package.json. Versions are computed by CI from release labels; keep it at ${PLACEHOLDER_VERSION}.`,
      );
    }
  }

  for (const kind of ['tokens', 'components']) {
    if (published[kind] !== null && !isSemver(published[kind])) {
      return fail(`Unsupported published version ${names[kind]}@${published[kind]}; expected major.minor.patch`);
    }
  }

  const { tokens, components } = published;

  if (tokens === null && components === null) {
    if (request) {
      return fail(
        `${system} has never been published to npm, so it can't be released by label. Run the "Release Bootstrap" workflow for ${system} first (see AGENTS.md → Release Workflow).`,
      );
    }
    return { system, action: 'skip', reason: 'never published (use the Release Bootstrap workflow)' };
  }

  if (tokens !== components) {
    // A previous release published one package but not the other.
    const state = `${names.tokens}=${tokens ?? 'unpublished'}, ${names.components}=${components ?? 'unpublished'}`;
    if (tokens === null || components === null) {
      // OIDC can't create the missing package; only the bootstrap path can.
      const reason = `partial first release (${state}); re-run the Release Bootstrap workflow for ${system} with version ${tokens ?? components}`;
      return request ? fail(reason) : { system, action: 'warn', reason };
    }
    const pending = compareSemver(tokens, components) > 0 ? tokens : components;
    if (request === 'resume') {
      return { system, action: 'publish', version: pending, bump: 'resume', published: state };
    }
    if (request) {
      return fail(`Partial release detected (${state}). Finish it first: run the Release workflow manually with system=${system}, bump=resume.`);
    }
    return { system, action: 'warn', reason: `partial release detected (${state}); run Release with bump=resume` };
  }

  if (!request) {
    return { system, action: 'skip', reason: `no release label (published ${tokens})` };
  }
  if (request === 'resume') {
    return { system, action: 'skip', reason: `nothing to resume (both packages at ${tokens})` };
  }

  return { system, action: 'publish', version: bumpVersion(tokens, request), bump: request, published: tokens };
}
