import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-checkbox screenshots', () => {
  test('unchecked light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-checkbox--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'checkbox-unchecked-light'));
  });
  test('checked light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-checkbox--checked');
    await withTheme(page, 'light', () => takeScreenshot(page, 'checkbox-checked-light'));
  });
});
