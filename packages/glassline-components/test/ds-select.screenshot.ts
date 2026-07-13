import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-select screenshots', () => {
  test('default light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-select--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'select-default-light'));
  });
});
