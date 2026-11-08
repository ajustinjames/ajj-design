import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  compareSemver,
  discoverSystems,
  formatReleaseNotes,
  githubRepo,
  isSemver,
  isVersionPublished,
  latestPublishedVersion,
  manifestPath,
  packageNames,
  repoRoot,
  shippedSystemOf,
} from './release-lib.mjs';

/**
 * Builds, packs, verifies and publishes one design system at an exact version,
 * then creates the `<system>-v<version>` tag + GitHub release.
 *
 * Every step is idempotent: packages already on npm at that version are
 * skipped, and an existing release is left alone. A failed run can simply be
 * re-run (or resumed via the Release workflow with bump=resume).
 *
 * Usage:
 *   node scripts/release-publish.mjs --system hardline --version 0.2.0
 *   node scripts/release-publish.mjs --system newsys --version 0.1.0 --launch   # via pnpm release:launch
 *   node scripts/release-publish.mjs --all --dry-run          # pack + verify every system
 *
 * Flags:
 *   --launch     First release of a system. Requires the packages to be absent
 *                from npm (or present at exactly --version, from a partial run).
 *                Without it, both packages must already exist on npm, because
 *                OIDC trusted publishing cannot create new packages.
 *   --dry-run    Build, pack and verify only. No npm publish, tag or release.
 *   --no-github  Publish to npm but skip the tag + GitHub release.
 *   --notes      Only print the GitHub release notes this release would get
 *                (PRs since the system's previous tag), then exit.
 *
 * Auth comes from the environment: OIDC in the Release workflow, or your
 * `npm login` session locally (first releases, via `pnpm release:launch`).
 */

const { values: args } = parseArgs({
  options: {
    system: { type: 'string' },
    version: { type: 'string' },
    all: { type: 'boolean', default: false },
    launch: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    'no-github': { type: 'boolean', default: false },
    notes: { type: 'boolean', default: false },
  },
});

const dryRun = args['dry-run'];
const KINDS = ['tokens', 'components']; // publish order: components depends on tokens

function run(cmd, cmdArgs, options = {}) {
  console.log(`$ ${cmd} ${cmdArgs.join(' ')}`);
  return execFileSync(cmd, cmdArgs, { cwd: repoRoot, encoding: 'utf8', stdio: 'inherit', ...options });
}

function capture(cmd, cmdArgs) {
  return execFileSync(cmd, cmdArgs, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function die(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

// npm OIDC trusted publishing needs npm >= 11.5.1 (Node >= 24.5 bundles it).
// Older npm fails with a misleading E404, so check up front.
const MIN_NPM = '11.5.1';

function assertNpmVersion() {
  const npmVersion = capture('npm', ['--version']);
  if (!isSemver(npmVersion) || compareSemver(npmVersion, MIN_NPM) < 0) {
    die(`npm ${npmVersion} is too old to publish; need >= ${MIN_NPM} (use Node >= 24.5).`);
  }
}

function assertPublishable(system, version) {
  const names = packageNames(system);
  for (const kind of KINDS) {
    const latest = latestPublishedVersion(names[kind]);
    if (args.launch) {
      if (latest !== null && latest !== version) {
        die(
          `${names[kind]} is already published (latest ${latest}). Launching is only for a system's first release; release it with patch, minor or major labels.`,
        );
      }
    } else if (latest === null) {
      die(
        `${names[kind]} has never been published. OIDC trusted publishing can't create packages; launch it first with \`pnpm release:launch ${system}\`.`,
      );
    } else if (compareSemver(version, latest) < 0) {
      die(`Refusing to publish ${names[kind]}@${version}: it is lower than the latest published ${latest}.`);
    }
  }
}

/** Stamp `version` into both manifests, run `fn`, and always restore them. */
function withStampedVersion(system, version, fn) {
  const originals = KINDS.map((kind) => [manifestPath(system, kind), readFileSync(manifestPath(system, kind), 'utf8')]);
  try {
    for (const [file, text] of originals) {
      const stamped = text.replace(/"version":\s*"[^"]*"/, `"version": "${version}"`);
      if (stamped === text && !text.includes(`"version": "${version}"`)) {
        throw new Error(`Could not find a version field in ${file}`);
      }
      writeFileSync(file, stamped);
    }
    return fn();
  } finally {
    for (const [file, text] of originals) writeFileSync(file, text);
  }
}

function buildAndPack(system, version) {
  const names = packageNames(system);
  const outDir = mkdtempSync(path.join(os.tmpdir(), `release-${system}-`));
  const tarballs = withStampedVersion(system, version, () => {
    for (const kind of KINDS) run('pnpm', ['--filter', names[kind], 'build']);
    return Object.fromEntries(
      KINDS.map((kind) => {
        run('pnpm', ['--dir', `packages/${system}-${kind}`, 'pack', '--pack-destination', outDir]);
        return [kind, path.join(outDir, `ajustinjames-${system}-${kind}-${version}.tgz`)];
      }),
    );
  });
  run('node', ['scripts/verify-publish-metadata.mjs', tarballs.tokens, tarballs.components]);
  return { tarballs, outDir };
}

function previousTag(system, version) {
  const prefix = `${system}-v`;
  const versions = capture('git', ['tag', '--list', `${prefix}*`])
    .split('\n')
    .map((tag) => tag.slice(prefix.length))
    .filter((v) => isSemver(v) && compareSemver(v, version) < 0)
    .sort(compareSemver);
  return versions.length ? `${prefix}${versions.at(-1)}` : null;
}

function releaseExists(tag) {
  try {
    capture('gh', ['release', 'view', tag, '--json', 'tagName']);
    return true;
  } catch {
    return false;
  }
}

/**
 * PRs (or bare commits) since `prevTag` that changed this system's published
 * files, oldest first, with their labels so notes can be grouped.
 */
function collectChanges(system, prevTag, repo) {
  const shas = capture('git', [
    'log', '--reverse', '--format=%H', `${prevTag}..HEAD`, '--',
    `packages/${system}-tokens`, `packages/${system}-components`,
  ]).split('\n').filter(Boolean);

  const changes = [];
  const seen = new Set();
  for (const sha of shas) {
    const files = capture('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', sha]).split('\n');
    if (!files.some((file) => shippedSystemOf(file) === system)) continue;

    let pr = null;
    try {
      const prs = JSON.parse(capture('gh', ['api', `repos/${repo}/commits/${sha}/pulls`]));
      pr = prs.find((candidate) => candidate.merged_at) ?? null;
    } catch {
      // No API access (e.g. offline local run): fall back to the commit subject.
    }
    const key = pr ? `pr-${pr.number}` : sha;
    if (seen.has(key)) continue;
    seen.add(key);
    changes.push(
      pr
        ? { number: pr.number, title: pr.title, labels: pr.labels.map((label) => label.name) }
        : { number: null, title: capture('git', ['log', '-1', '--format=%s', sha]), labels: [] },
    );
  }
  return changes;
}

function createGithubRelease(system, version, workDir) {
  const tag = `${system}-v${version}`;
  if (releaseExists(tag)) {
    console.log(`GitHub release ${tag} already exists; skipping.`);
    return;
  }
  const repo = githubRepo(system);
  const prev = previousTag(system, version);
  const notes = formatReleaseNotes({
    system,
    version,
    repo,
    previousTag: prev,
    changes: prev ? collectChanges(system, prev, repo) : [],
  });
  const notesFile = path.join(workDir, `${tag}-notes.md`);
  writeFileSync(notesFile, notes);
  console.log(`Release notes for ${tag}:\n${notes}`);

  const target = capture('git', ['rev-parse', 'HEAD']);
  run('gh', ['release', 'create', tag, '--target', target, '--title', `${system} v${version}`, '--notes-file', notesFile]);
}

function assertLocalHeadIsMain() {
  if (process.env.CI) return;
  run('git', ['fetch', '--quiet', '--tags', 'origin', 'main']);
  const head = capture('git', ['rev-parse', 'HEAD']);
  const main = capture('git', ['rev-parse', 'origin/main']);
  if (head !== main) {
    die('Local releases must run from a checkout of origin/main (HEAD differs). Check out origin/main or pass --no-github.');
  }
}

function release(system, version) {
  const names = packageNames(system);
  console.log(`\n=== ${system} ${version}${dryRun ? ' (dry run)' : ''} ===`);

  if (!dryRun) {
    assertNpmVersion();
    assertPublishable(system, version);
    if (!args['no-github']) assertLocalHeadIsMain();
  }

  const { tarballs, outDir } = buildAndPack(system, version);
  try {
    if (dryRun) {
      console.log(`Dry run OK: ${Object.values(tarballs).map((t) => path.basename(t)).join(', ')}`);
      return;
    }

    for (const kind of KINDS) {
      if (isVersionPublished(names[kind], version)) {
        console.log(`${names[kind]}@${version} is already on npm; skipping.`);
        continue;
      }
      run('npm', ['publish', tarballs[kind], '--access', 'public']);
    }

    if (!args['no-github']) createGithubRelease(system, version, outDir);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

if (args.notes) {
  if (!args.system || !args.version) die('Pass --system and --version with --notes.');
  const repo = githubRepo(args.system);
  const prev = previousTag(args.system, args.version);
  console.log(
    formatReleaseNotes({
      system: args.system,
      version: args.version,
      repo,
      previousTag: prev,
      changes: prev ? collectChanges(args.system, prev, repo) : [],
    }),
  );
  process.exit(0);
}

if (args.all) {
  if (!dryRun) die('--all is only supported with --dry-run');
  for (const system of discoverSystems()) release(system, args.version ?? '0.0.1');
} else {
  if (!args.system || !args.version) die('Pass --system and --version (or --all --dry-run).');
  if (!discoverSystems().includes(args.system)) die(`Unknown system '${args.system}'`);
  if (!isSemver(args.version)) die(`Invalid version '${args.version}'; expected major.minor.patch`);
  release(args.system, args.version);
}
