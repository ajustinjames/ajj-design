import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Page } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, '__screenshots__');

export async function withTheme(page: Page, theme: 'light' | 'dark', fn: () => Promise<void>): Promise<void> {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  await fn();
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-theme');
  });
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.waitForSelector('#storybook-root > *');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: join(screenshotDir, `${name}.png`),
    animations: 'disabled',
  });
}
