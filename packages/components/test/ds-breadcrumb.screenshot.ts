import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-breadcrumb screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-breadcrumb--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'breadcrumb-light'));
  });
});
