import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-spinner screenshots', () => {
  test('all sizes light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-spinner--medium');
    await withTheme(page, 'light', () => takeScreenshot(page, 'spinner-sizes-light'));
  });
});
