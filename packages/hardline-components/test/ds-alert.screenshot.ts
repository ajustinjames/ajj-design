import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-alert screenshots', () => {
  test('info light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-alert--info');
    await withTheme(page, 'light', () => takeScreenshot(page, 'alert-info-light'));
  });
  test('error light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-alert--error');
    await withTheme(page, 'light', () => takeScreenshot(page, 'alert-error-light'));
  });
});
