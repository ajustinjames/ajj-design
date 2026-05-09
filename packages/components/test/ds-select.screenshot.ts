import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-select screenshots', () => {
  test('default light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-select--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'select-default-light'));
  });
});
