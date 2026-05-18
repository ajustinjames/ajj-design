import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-breadcrumb screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-breadcrumb--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'breadcrumb-light'));
  });
});
