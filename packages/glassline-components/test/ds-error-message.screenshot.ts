import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-error-message screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-error-message--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'error-message-light'));
  });
});
