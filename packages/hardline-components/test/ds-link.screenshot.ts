import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-link screenshots', () => {
  test('all tones light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-link--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'link-all-light'));
  });
});
