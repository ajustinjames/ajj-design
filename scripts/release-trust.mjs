import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { RELEASE_WORKFLOW_FILE, discoverSystems, packageNames, readManifest } from './release-lib.mjs';

/**
 * One-time, run-locally step after a system's first (bootstrap) release:
 * registers .github/workflows/release.yml as the npm trusted publisher (OIDC)
 * for both of the system's packages, so label-driven releases can publish
 * them without any token.
 *
 * This can't run in CI: `npm trust` requires an interactive 2FA session and
 * rejects 2FA-bypass tokens. Requires npm >= 11.15 and `npm login`.
 *
 *   pnpm release:trust <system>
 */

const { positionals } = parseArgs({ allowPositionals: true });
const [system] = positionals;
const systems = discoverSystems();

if (!system || !systems.includes(system)) {
  console.error(`Usage: pnpm release:trust <system>   (systems: ${systems.join(', ')})`);
  process.exit(1);
}

const repoUrl = readManifest(system, 'components').repository?.url ?? '';
const repo = /github\.com[/:]([^/]+\/[^/.]+)/.exec(repoUrl)?.[1];
if (!repo) {
  console.error(`Could not derive the GitHub repo from repository.url '${repoUrl}'`);
  process.exit(1);
}

const names = Object.values(packageNames(system));
let failed = false;

for (const [index, name] of names.entries()) {
  if (index > 0) await new Promise((resolve) => setTimeout(resolve, 2000)); // npm rate limiting
  console.log(`\nTrusting ${repo} → ${RELEASE_WORKFLOW_FILE} for ${name}`);
  try {
    execFileSync(
      'npm',
      ['trust', 'github', name, '--repo', repo, '--file', RELEASE_WORKFLOW_FILE, '--allow-publish', '--yes'],
      { stdio: 'inherit' },
    );
  } catch {
    failed = true;
    console.error(
      `Failed for ${name}. If a trusted publisher already exists, check it with \`npm trust list ${name}\`; otherwise configure it at https://www.npmjs.com/package/${name}/access`,
    );
  }
}

process.exit(failed ? 1 : 0);
