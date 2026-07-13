import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Computes the release plan for every package "system" in this repo.
 *
 * A system is a pair of packages that release in lockstep:
 *   packages/<system>-tokens  +  packages/<system>-components
 *
 * The plan is derived purely from the working-tree manifest versions and what
 * is currently published on npm -- never from a git diff. This is what makes it
 * resilient to version bumps split across multiple PRs: the only invariant that
 * matters is the resulting tree state.
 *
 * Per system the action is one of:
 *   - "publish": tree version is the valid next semver above the published one
 *   - "skip":    tree version already matches the published one (no-op)
 *   - "error":   an invariant is violated (caller should fail the run)
 *
 * Modes:
 *   node scripts/release-plan.mjs            -> print plan, exit 1 on any error
 *   node scripts/release-plan.mjs --check    -> same, but a pre-merge dry-run
 *                                               (no side effects either way)
 *   node scripts/release-plan.mjs --json     -> emit the raw plan as JSON
 *
 * When $GITHUB_OUTPUT is set, the plan is also written there as `plan=<json>`
 * so workflows can consume it without re-parsing stdout.
 */

const SCOPE = '@ajustinjames';
const repoRoot = path.resolve(import.meta.dirname, '..');
const packagesDir = path.join(repoRoot, 'packages');

const args = new Set(process.argv.slice(2));
const checkMode = args.has('--check');
const jsonMode = args.has('--json');

function readManifest(pkgDir) {
  return JSON.parse(readFileSync(path.join(packagesDir, pkgDir, 'package.json'), 'utf8'));
}

function publishedVersion(pkgName) {
  try {
    return execFileSync('npm', ['view', pkgName, 'version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null; // not published yet
  }
}

function isSemver(version) {
  return /^[0-9]+\.[0-9]+\.[0-9]+$/.test(version);
}

function nextVersions(published) {
  const [major, minor, patch] = published.split('.').map(Number);
  return {
    patch: `${major}.${minor}.${patch + 1}`,
    minor: `${major}.${minor + 1}.0`,
    major: `${major + 1}.0.0`,
  };
}

function hasManifest(pkgDir) {
  return existsSync(path.join(packagesDir, pkgDir, 'package.json'));
}

function discoverSystems() {
  const entries = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const candidates = new Set();
  for (const name of entries) {
    const match = /^([a-z][a-z0-9-]*)-(tokens|components)$/.exec(name);
    if (match) candidates.add(match[1]);
  }
  const systems = [];
  for (const name of [...candidates].sort()) {
    const hasTokens = hasManifest(`${name}-tokens`);
    const hasComponents = hasManifest(`${name}-components`);
    if (hasTokens && hasComponents) {
      systems.push(name);
    } else if (hasTokens) {
      console.error(
        `Warning: packages/${name}-tokens has no matching packages/${name}-components — skipping orphan`,
      );
    } else if (hasComponents) {
      console.error(
        `Warning: packages/${name}-components has no matching packages/${name}-tokens — skipping orphan`,
      );
    }
  }
  return systems;
}

function planForSystem(system) {
  const tokensName = `${SCOPE}/${system}-tokens`;
  const componentsName = `${SCOPE}/${system}-components`;
  const fail = (reason) => ({ system, action: 'error', reason });

  let tokens;
  let components;
  try {
    tokens = readManifest(`${system}-tokens`);
    components = readManifest(`${system}-components`);
  } catch {
    return fail(`Missing manifest for the ${system} package pair`);
  }

  const treeVersion = tokens.version;
  if (treeVersion !== components.version) {
    return fail(
      `Package versions differ on the working tree: ${tokensName}=${tokens.version}, ${componentsName}=${components.version}. Both must move together.`,
    );
  }
  if (!isSemver(treeVersion)) {
    return fail(`Unsupported version '${treeVersion}' for ${system}; expected major.minor.patch`);
  }

  const tokensPublished = publishedVersion(tokensName);
  const componentsPublished = publishedVersion(componentsName);

  if ((tokensPublished === null) !== (componentsPublished === null)) {
    return fail(
      `Published state differs: ${tokensName}=${tokensPublished ?? 'unpublished'}, ${componentsName}=${componentsPublished ?? 'unpublished'}`,
    );
  }
  if (tokensPublished !== null && tokensPublished !== componentsPublished) {
    return fail(
      `Published versions differ: ${tokensName}=${tokensPublished}, ${componentsName}=${componentsPublished}`,
    );
  }

  const published = tokensPublished ?? '0.0.0';
  if (!isSemver(published)) {
    return fail(`Unsupported published version '${published}' for ${system}; expected major.minor.patch`);
  }

  if (treeVersion === published) {
    return { system, action: 'skip', version: treeVersion, reason: 'Version already published' };
  }

  const next = nextVersions(published);
  const bump = Object.keys(next).find((kind) => next[kind] === treeVersion);
  if (!bump) {
    return fail(
      `Version ${treeVersion} is not a valid next semver after published ${published}. Use ${next.patch}, ${next.minor}, or ${next.major}.`,
    );
  }

  return { system, action: 'publish', version: treeVersion, bump, published };
}

const plan = discoverSystems().map(planForSystem);

const errors = plan.filter((entry) => entry.action === 'error');
const publishes = plan.filter((entry) => entry.action === 'publish');

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(plan)}\n`);
} else {
  for (const entry of plan) {
    if (entry.action === 'error') {
      console.error(`::error::[${entry.system}] ${entry.reason}`);
    } else if (entry.action === 'publish') {
      console.log(`[${entry.system}] publish ${entry.version} (${entry.bump}) over ${entry.published}`);
    } else {
      console.log(`[${entry.system}] skip — ${entry.reason}`);
    }
  }
  if (publishes.length === 0 && errors.length === 0) {
    console.log(checkMode ? 'No pending release; nothing to publish.' : 'Nothing to publish.');
  }
}

if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_OUTPUT, `plan=${JSON.stringify(plan)}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `has_publish=${publishes.length > 0}\n`);
}

process.exit(errors.length > 0 ? 1 : 0);
