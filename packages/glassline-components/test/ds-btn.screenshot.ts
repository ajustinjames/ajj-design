import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-btn screenshots', () => {
  test('all variants light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-btn--all-variants');
    await withTheme(page, 'light', () => takeScreenshot(page, 'btn-all-variants-light'));
  });
});
