import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { LAUNCH_VERSION, discoverSystems, isSemver, repoRoot } from './release-lib.mjs';

/**
 * First release of a brand-new design system. Run locally, once per system:
 *
 *   npm login                      # npm publish + npm trust need interactive 2FA
 *   pnpm release:launch <system>   # optionally --version x.y.z (default 0.1.0)
 *
 * 1. Publishes both packages at the launch version from your npm session and
 *    creates the `<system>-v<version>` tag + GitHub release (via `gh`).
 *    Must run from a clean checkout of origin/main.
 * 2. Registers .github/workflows/release.yml as both packages' npm trusted
 *    publisher, so every later release goes through CI with patch/minor/major
 *    labels and no npm token.
 *
 * Why local: OIDC trusted publishing can't create packages that don't exist
 * yet, and we deliberately keep no npm token in CI. Both steps are idempotent,
 * so re-running finishes a launch that stopped halfway.
 */

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: { version: { type: 'string', default: LAUNCH_VERSION } },
});
const [system] = positionals;
const systems = discoverSystems();

if (!system || !systems.includes(system)) {
  console.error(`Usage: pnpm release:launch <system> [--version ${LAUNCH_VERSION}]   (systems: ${systems.join(', ')})`);
  process.exit(1);
}
if (!isSemver(args.version)) {
  console.error(`Invalid version '${args.version}'; expected major.minor.patch`);
  process.exit(1);
}

const step = (title, script, scriptArgs) => {
  console.log(`\n### ${title}`);
  execFileSync('node', [script, ...scriptArgs], { cwd: repoRoot, stdio: 'inherit' });
};

try {
  execFileSync('npm', ['whoami'], { stdio: ['ignore', 'ignore', 'ignore'] });
} catch {
  console.error('Not logged in to npm. Run `npm login` first.');
  process.exit(1);
}

try {
  step(`Publish ${system} ${args.version}`, 'scripts/release-publish.mjs', ['--system', system, '--version', args.version, '--launch']);
} catch {
  console.error(`\nPublish stopped. Fix the error above and re-run \`pnpm release:launch ${system}\`; anything already published is skipped.`);
  process.exit(1);
}

try {
  step('Register release.yml as the npm trusted publisher', 'scripts/release-trust.mjs', [system]);
} catch {
  // Also the path on a re-run, when the trusted publisher already exists.
  console.error(
    `\n${system} ${args.version} is published, but registering the trusted publisher failed (see above). ` +
      `If \`npm trust list @ajustinjames/${system}-tokens\` already shows release.yml, you're done; ` +
      `otherwise fix the error and run \`pnpm release:trust ${system}\`. Label releases fail with E404 until it's registered.`,
  );
  process.exit(1);
}

console.log(`\n${system} ${args.version} is live. Release it from now on with patch/minor/major PR labels.`);
