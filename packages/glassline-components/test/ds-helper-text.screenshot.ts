import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-helper-text screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-helper-text--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'helper-text-light'));
  });
  test('dark', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-helper-text--default');
    await withTheme(page, 'dark', () => takeScreenshot(page, 'helper-text-dark'));
  });
});
