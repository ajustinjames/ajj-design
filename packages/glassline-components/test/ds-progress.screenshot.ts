import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-progress screenshots', () => {
  test('40% light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-progress--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'progress-40-light'));
  });
});
