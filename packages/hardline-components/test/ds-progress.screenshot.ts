import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-progress screenshots', () => {
  test('40% light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-progress--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'progress-40-light'));
  });
});
