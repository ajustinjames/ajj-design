import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-alert screenshots', () => {
  test('info light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-alert--info');
    await withTheme(page, 'light', () => takeScreenshot(page, 'alert-info-light'));
  });
  test('error light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-alert--error');
    await withTheme(page, 'light', () => takeScreenshot(page, 'alert-error-light'));
  });
});
