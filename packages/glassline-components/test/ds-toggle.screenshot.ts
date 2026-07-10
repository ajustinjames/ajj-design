import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-toggle screenshots', () => {
  test('off light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-toggle--off');
    await withTheme(page, 'light', () => takeScreenshot(page, 'toggle-off-light'));
  });
  test('on light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-toggle--on');
    await withTheme(page, 'light', () => takeScreenshot(page, 'toggle-on-light'));
  });
});
