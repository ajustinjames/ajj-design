import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  testDir: 'test',
  testMatch: '**/*.screenshot.ts',
  use: {
    headless: true,
    baseURL: 'http://localhost:6006',
  },
  webServer: {
    command: 'pnpm storybook',
    cwd: repoRoot,
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
