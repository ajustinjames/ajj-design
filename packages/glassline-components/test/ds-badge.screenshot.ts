import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-badge screenshots', () => {
  test('all tones light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-badge--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'badge-all-light'));
  });
});
