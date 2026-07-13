import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-breadcrumb screenshots', () => {
  test('light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-breadcrumb--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'breadcrumb-light'));
  });
});
