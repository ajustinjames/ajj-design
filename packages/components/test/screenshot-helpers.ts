import type { Page } from '@playwright/test';

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
  await page.screenshot({
    path: `test/__screenshots__/${name}.png`,
    animations: 'disabled',
  });
}
