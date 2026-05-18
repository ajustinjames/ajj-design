import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-spinner screenshots', () => {
  test('all sizes light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-spinner--medium');
    await withTheme(page, 'light', () => takeScreenshot(page, 'spinner-sizes-light'));
  });
});
