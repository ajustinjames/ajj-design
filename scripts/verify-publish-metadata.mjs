import { readFile } from 'node:fs/promises';
import path from 'node:path';

const packagePaths = process.argv.slice(2);

if (packagePaths.length === 0) {
  console.error('Usage: node scripts/verify-publish-metadata.mjs <package.json>...');
  process.exit(2);
}

const dependencyFields = ['dependencies', 'peerDependencies', 'optionalDependencies'];
let failed = false;

for (const packagePath of packagePaths) {
  const manifest = JSON.parse(await readFile(packagePath, 'utf8'));
  const label = manifest.name ?? packagePath;

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

console.log(`Verified publish metadata for ${packagePaths.map((file) => path.dirname(file)).join(', ')}`);
