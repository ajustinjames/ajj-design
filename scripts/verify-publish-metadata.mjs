import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const packageInputs = process.argv.slice(2);

if (packageInputs.length === 0) {
  console.error('Usage: node scripts/verify-publish-metadata.mjs <package-dir|package.json|package.tgz>...');
  process.exit(2);
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

  if (manifest.name?.startsWith('@ajustinjames/') && manifest.version) {
    const expectedTokenRange = `^${manifest.version}`;
    const tokenRange = manifest.dependencies?.['@ajustinjames/hardline-tokens'];

    if (manifest.name === '@ajustinjames/hardline-components' && tokenRange !== expectedTokenRange) {
      console.error(
        `${label} must depend on @ajustinjames/hardline-tokens ${expectedTokenRange}; found ${tokenRange ?? 'missing'}`,
      );
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Verified publish metadata for ${verifiedPackages.join(', ')}`);
