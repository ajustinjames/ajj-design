import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-select screenshots', () => {
  test('default light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-select--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'select-default-light'));
  });
});
