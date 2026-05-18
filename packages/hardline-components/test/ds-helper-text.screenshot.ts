import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-helper-text screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-helper-text--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'helper-text-light'));
  });
  test('dark', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-helper-text--default');
    await withTheme(page, 'dark', () => takeScreenshot(page, 'helper-text-dark'));
  });
});
