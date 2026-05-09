import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-radio screenshots', () => {
  test('unchecked light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-radio--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'radio-unchecked-light'));
  });
});
