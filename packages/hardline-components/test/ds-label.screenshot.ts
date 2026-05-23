import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-label screenshots', () => {
  test('all tones light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-label--all-tones');
    await withTheme(page, 'light', () => takeScreenshot(page, 'label-all-tones-light'));
  });
});
