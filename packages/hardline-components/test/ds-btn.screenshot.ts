import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-btn screenshots', () => {
  test('all variants light', async ({ page }) => {
    await page.goto('/iframe.html?id=hardline-hl-btn--all-variants');
    await withTheme(page, 'light', () => takeScreenshot(page, 'btn-all-variants-light'));
  });
});
