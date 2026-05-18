import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-error-message screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-error-message--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'error-message-light'));
  });
});
