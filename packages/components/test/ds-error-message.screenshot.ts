import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-error-message screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-error-message--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'error-message-light'));
  });
});
