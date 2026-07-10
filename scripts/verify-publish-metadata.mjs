import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const packagesDir = path.join(repoRoot, 'packages');

// Mirrors release-plan.mjs's discovery convention: scan packages/*/package.json
// so any package directory (not just registered "systems") is covered. Unlike
// release-plan.mjs, this does not require a <name>-tokens/<name>-components pair
// — every package with a manifest gets its publish metadata verified.
function discoverPackageDirs() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesDir, entry.name))
    .filter((dir) => existsSync(path.join(dir, 'package.json')))
    .sort();
}

let packageInputs = process.argv.slice(2);

if (packageInputs.length === 0) {
  packageInputs = discoverPackageDirs();

  if (packageInputs.length === 0) {
    console.error('No package manifests found under packages/*/package.json');
    process.exit(2);
  }
}

const dependencyFields = ['dependencies', 'peerDependencies', 'optionalDependencies'];
const verifiedPackages = [];
let failed = false;

async function readPackedManifest(tarballPath) {
  const manifest = execFileSync('tar', ['-xOf', tarballPath, 'package/package.json'], {
    encoding: 'utf8',
  });

  return JSON.parse(manifest);
}

async function packDirectory(packageDir) {
  const packDir = await mkdtemp(path.join(os.tmpdir(), 'hardline-publish-metadata-'));

  try {
    execFileSync('pnpm', ['--dir', packageDir, 'pack', '--pack-destination', packDir], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    const tarballs = (await readdir(packDir)).filter((file) => file.endsWith('.tgz'));

    if (tarballs.length !== 1) {
      throw new Error(`Expected one packed tarball for ${packageDir}, found ${tarballs.length}`);
    }

    return await readPackedManifest(path.join(packDir, tarballs[0]));
  } finally {
    await rm(packDir, { force: true, recursive: true });
  }
}

async function readPublishManifest(input) {
  if (input.endsWith('.tgz')) {
    return readPackedManifest(input);
  }

  const inputStat = await stat(input);

  if (inputStat.isDirectory()) {
    return packDirectory(input);
  }

  return JSON.parse(await readFile(input, 'utf8'));
}

for (const packageInput of packageInputs) {
  const manifest = await readPublishManifest(packageInput);
  const label = manifest.name ?? packageInput;
  verifiedPackages.push(`${label}@${manifest.version ?? 'unknown'}`);

  for (const field of dependencyFields) {
    const dependencies = manifest[field] ?? {};

    for (const [name, range] of Object.entries(dependencies)) {
      if (typeof range !== 'string') {
        continue;
      }

      if (range.startsWith('workspace:')) {
        console.error(`${label} ${field}.${name} uses non-publishable range ${range}`);
        failed = true;
      }
    }
  }

  // A "<system>-components" package must depend on its paired "<system>-tokens"
  // package with a real, publishable semver range (never workspace:). Derive the
  // system from the package name so any design system (hardline, glassline, ...)
  // is checked uniformly.
  const componentsMatch = /^@ajustinjames\/([a-z][a-z0-9-]*)-components$/.exec(manifest.name ?? '');

  if (componentsMatch && manifest.version) {
    const system = componentsMatch[1];
    const tokenName = `@ajustinjames/${system}-tokens`;
    const expectedTokenRange = `^${manifest.version}`;
    const tokenRange = manifest.dependencies?.[tokenName];

    if (tokenRange !== expectedTokenRange) {
      console.error(
        `${label} must depend on ${tokenName} ${expectedTokenRange}; found ${tokenRange ?? 'missing'}`,
      );
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Verified publish metadata for ${verifiedPackages.join(', ')}`);
