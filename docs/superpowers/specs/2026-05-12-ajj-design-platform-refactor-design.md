# ajj-design Platform Refactor

**Date:** 2026-05-12
**Status:** Approved

## Overview

Refactor `ajj-design` from a single-system repo into a multi-design-system monorepo platform. The existing design system is renamed `hardline`. Future design systems (independent tokens + components, completely different aesthetics) are added as new package pairs without rewriting tooling.

## Goals

- Brand the existing design system as `hardline`, published under `@ajustinjames`
- Keep `ajj-design` as the private platform monorepo name
- Add future design systems with minimal friction (one scaffold script)
- Automate versioning and npm publish via GH Actions + PR labels

## Repo Structure

```
ajj-design/                              ← private platform monorepo
  packages/
    hardline-tokens/                     ← @ajustinjames/hardline-tokens
    hardline-components/                 ← @ajustinjames/hardline-components
    # future: do not add now
    cobalt-tokens/                       ← @ajustinjames/cobalt-tokens
    cobalt-components/                   ← @ajustinjames/cobalt-components
  scripts/
    create-system.sh                     ← scaffold new design system
  .storybook/                            ← shared, glob: packages/*/stories/**
  .github/workflows/
    release.yml                          ← semver label → version bump → publish
  tsconfig.base.json                     ← shared
  pnpm-workspace.yaml                    ← packages: ['packages/*']
  package.json                           ← shared devDeps (Storybook, Playwright)
```

**Shared at root (zero duplication):** Storybook, Playwright, TypeScript base config, CI/CD, lockfile.

**Per system (copy-paste via scaffold):** `tokens.json`, `sd.config.js`, component `src/`, `test/`, `stories/`, `package.json`, three tsconfigs.

## Migration: ajj-design → hardline

### Directory renames
- `packages/tokens` → `packages/hardline-tokens`
- `packages/components` → `packages/hardline-components`

### Package name changes
| Before | After |
|---|---|
| `@ajj/tokens` | `@ajustinjames/hardline-tokens` |
| `@ajj/components` | `@ajustinjames/hardline-components` |

### Internal dependency
`hardline-components/package.json`: `@ajj/tokens: workspace:*` → `@ajustinjames/hardline-tokens: workspace:*`

### Custom element prefix
All 21 `ds-*` components renamed to `hl-*`:
- `@customElement('ds-btn')` → `@customElement('hl-btn')`
- Applies to: class decorators, story `tag` fields, test query selectors, any HTML usage in `docs/example.html`

### CSS custom property prefix
`--ds-*` → `--hl-*` across all component `static styles` and Style Dictionary output.

Explicit changes in `packages/tokens/sd.config.js`:
- `prefix: 'ds'` → `prefix: 'hl'` (line 38)
- `css/dark-theme` format string-replace: `'--ds-alias-dark-'` → `'--hl-alias-dark-'` and `'--ds-alias-'` → `'--hl-alias-'` (both sides of the `.replace()` call, line 15)

After these edits, run `pnpm tokens:build` to regenerate `tokens.css` and `tokens-dark.css`. No manual edits to generated files.

### Root scripts
`--filter @ajj/tokens` → `--filter @ajustinjames/hardline-tokens`
`--filter @ajj/components` → `--filter @ajustinjames/hardline-components`
`packages/components/playwright.config.ts` → `packages/hardline-components/playwright.config.ts` (in `test:screenshots` script)

### Storybook stories glob
`.storybook/main.ts`: `../packages/components/stories/**/*.stories.ts` → `../packages/*/stories/**/*.stories.ts`

### Docs

`docs/manifesto.md` line 41 references the old prefix and a non-existent component name:
- `ds-` → `hl-`
- `<ds-button>` → `<hl-btn>` (component is `hl-btn`, not `hl-button`)
- `<ds-card>` → `<hl-card>`

`docs/example.html` — bulk-replace `ds-` tags and `--ds-` CSS vars to `hl-` (106 matches).

### CLAUDE.md
Update package names and component prefix docs throughout. Then rename to `AGENTS.md` (plural — cross-tool convention for Codex, Amp, etc.). Leave `CLAUDE.md` as a one-line redirect: `See AGENTS.md`.

## Publishing

### publishConfig
Add to every published `package.json` (required for public scoped packages):
```json
"publishConfig": { "access": "public" }
```

### Manual publish command
```bash
cd packages/hardline-tokens && pnpm publish
cd packages/hardline-components && pnpm publish
```

Automated via GH Actions on merge (see Versioning).

## Versioning

One version per design system — both packages always share the same version number. `hardline@0.1.0` means `hardline-tokens@0.1.0` and `hardline-components@0.1.0`.

**First release:** both packages currently at `0.0.1`. Apply the `hardline:minor` label to the migration PR to bump to `0.1.0` on merge.

### PR label format
`<system>:<bump>` — e.g., `hardline:patch`, `hardline:minor`, `hardline:major`

No label = no publish. Docs, infra, and WIP merges are unaffected.

### GH Action (`release.yml`) on merge to `main`
1. Read PR label — parse system name and bump type
2. Bump version in `packages/<system>-tokens/package.json` and `packages/<system>-components/package.json` (same version)
3. Commit the version bump (`chore: release <system>-v<version>`)
4. Create git tag `<system>-v<version>` (e.g., `hardline-v0.1.0`)
5. Create GH release from tag
6. Run `pnpm publish --filter @ajustinjames/<system>-tokens --filter @ajustinjames/<system>-components` → npm

Adding a future system requires no changes to the workflow — the label prefix drives everything.

### Existing workflow changes
- **`publish.yml`** — replace entirely with `release.yml`. It uses old `@ajj/*` package names, `v*` tag pattern, and `pnpm -r publish` (publishes all packages, wrong for multi-system). Delete it.
- **`ci.yml`** — update `--filter` flags from `@ajj/*` to `@ajustinjames/hardline-*`. Also update hardcoded artifact upload path: `packages/components/test/__screenshots__/diff/` → `packages/hardline-components/test/__screenshots__/diff/`.
- **`deploy-storybook.yml`** — no changes required (uses root scripts only, no `@ajj/*` refs or `packages/*` paths).

## Scaffold Script

`scripts/create-system.sh <name> <prefix>` — creates a new design system from the hardline template.

**Usage:**
```bash
bash scripts/create-system.sh cobalt co
```

**Steps:**
1. Copy `packages/hardline-tokens` → `packages/<name>-tokens`
2. Copy `packages/hardline-components` → `packages/<name>-components`
3. Find-replace throughout both dirs — **order is load-bearing, longest patterns first**:
   - `@ajustinjames/hardline` → `@ajustinjames/<name>`
   - `--hl-` → `--<prefix>-`
   - `hl-` → `<prefix>-`
   - `hardline` → `<name>`
4. Wipe `dist/` in both new packages
5. Print next steps: `pnpm install`, `pnpm --filter @ajustinjames/<name>-tokens build`

## Per-System Naming Conventions

| System | Element prefix | CSS var prefix | npm packages |
|---|---|---|---|
| hardline | `hl-` | `--hl-*` | `@ajustinjames/hardline-{tokens,components}` |
| cobalt (example) | `co-` | `--co-*` | `@ajustinjames/cobalt-{tokens,components}` |

Element prefixes must be unique to avoid custom element registry collisions when multiple systems are loaded in the same browser context.
