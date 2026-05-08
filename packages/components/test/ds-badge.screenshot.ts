import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-badge screenshots', () => {
  test('all tones light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-badge--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'badge-all-light'));
  });
});
