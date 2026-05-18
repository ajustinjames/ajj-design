import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-toggle screenshots', () => {
  test('off light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-toggle--off');
    await withTheme(page, 'light', () => takeScreenshot(page, 'toggle-off-light'));
  });
  test('on light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-toggle--on');
    await withTheme(page, 'light', () => takeScreenshot(page, 'toggle-on-light'));
  });
});
