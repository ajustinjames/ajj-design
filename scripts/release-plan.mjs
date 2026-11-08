import { appendFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  BUMPS,
  discoverSystems,
  latestPublishedVersion,
  packageNames,
  parseReleaseLabels,
  planForSystem,
  readManifest,
} from './release-lib.mjs';

/**
 * Computes the release plan for every design system in this repo.
 *
 * What gets released comes from release labels (`<system>:<patch|minor|major>`)
 * on the merged PR, or from an explicit --system/--bump (manual dispatch).
 * The version is always computed from what is published on npm, never from
 * package.json (which holds a placeholder) or from a git diff.
 *
 * Usage:
 *   node scripts/release-plan.mjs --labels '["hardline:minor"]'      # merged PR labels
 *   node scripts/release-plan.mjs --labels '[...]' --check           # pre-merge validation
 *   node scripts/release-plan.mjs --system hardline --bump patch     # manual release
 *   node scripts/release-plan.mjs --system hardline --bump resume    # finish a partial release
 *   node scripts/release-plan.mjs ... --json                         # raw plan on stdout
 *
 * Labels may also be passed via the RELEASE_LABELS env var (JSON array).
 * Exits 1 if any system's plan is an error.
 *
 * When $GITHUB_OUTPUT is set, writes `plan=<json>` and `has_publish=<bool>`.
 * When $GITHUB_STEP_SUMMARY is set, writes a human-readable summary.
 */

const { values: args } = parseArgs({
  options: {
    labels: { type: 'string' },
    system: { type: 'string' },
    bump: { type: 'string' },
    check: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
});

const systems = discoverSystems();
const errors = [];
let requests = new Map();

if (args.system || args.bump) {
  if (!args.system || !args.bump) {
    errors.push('--system and --bump must be passed together');
  } else if (!systems.includes(args.system)) {
    errors.push(`Unknown system '${args.system}' (known: ${systems.join(', ')})`);
  } else if (![...BUMPS, 'resume'].includes(args.bump)) {
    errors.push(`Unknown bump '${args.bump}'; expected one of ${[...BUMPS, 'resume'].join(', ')}`);
  } else {
    requests.set(args.system, args.bump);
  }
} else {
  const raw = args.labels || process.env.RELEASE_LABELS || '[]';
  let labels;
  try {
    labels = JSON.parse(raw);
    if (!Array.isArray(labels)) throw new Error('not an array');
  } catch (error) {
    errors.push(`Could not parse labels ${JSON.stringify(raw)} as a JSON array: ${error.message}`);
    labels = [];
  }
  const parsed = parseReleaseLabels(labels, systems);
  requests = parsed.requests;
  errors.push(...parsed.errors);
}

const plan = systems.map((system) => {
  const names = packageNames(system);
  return planForSystem({
    system,
    request: requests.get(system),
    manifestVersions: {
      tokens: readManifest(system, 'tokens').version,
      components: readManifest(system, 'components').version,
    },
    published: {
      tokens: latestPublishedVersion(names.tokens),
      components: latestPublishedVersion(names.components),
    },
  });
});

for (const reason of errors) plan.push({ system: '*', action: 'error', reason });

const publishes = plan.filter((entry) => entry.action === 'publish');
const failed = plan.some((entry) => entry.action === 'error');

function describe(entry) {
  switch (entry.action) {
    case 'publish':
      return entry.bump === 'resume'
        ? `resume ${entry.version} (${entry.published})`
        : `publish ${entry.version} (${entry.bump} over ${entry.published})`;
    case 'error':
      return entry.reason;
    default:
      return `${entry.action} — ${entry.reason}`;
  }
}

if (args.json) {
  process.stdout.write(`${JSON.stringify(plan)}\n`);
} else {
  for (const entry of plan) {
    const line = `[${entry.system}] ${describe(entry)}`;
    if (entry.action === 'error') console.error(`::error::${line}`);
    else if (entry.action === 'warn') console.log(`::warning::${line}`);
    else console.log(line);
  }
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `plan=${JSON.stringify(plan)}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `has_publish=${publishes.length > 0}\n`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const heading = args.check ? 'Release preview (on merge)' : 'Release plan';
  const lead = failed
    ? '❌ The release plan has errors.'
    : publishes.length === 0
      ? args.check
        ? 'Merging this PR will **not** publish anything. Add a `<system>:<patch|minor|major>` label to release.'
        : 'Nothing to publish.'
      : `${args.check ? 'Merging this PR will publish' : 'Publishing'}: ${publishes
          .map((entry) => `**${entry.system} ${entry.version}**`)
          .join(', ')}`;
  const detail = (entry) => (entry.action === 'publish' ? describe(entry) : entry.reason).replaceAll('|', '\\|');
  const rows = plan.map((entry) => `| ${entry.system} | ${entry.action} | ${detail(entry)} |`);
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [`### ${heading}`, '', lead, '', '| System | Action | Detail |', '|---|---|---|', ...rows, ''].join('\n'),
  );
}

process.exit(failed ? 1 : 0);
