import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-tag screenshots', () => {
  test('default light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-tag--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'tag-default-light'));
  });
});
