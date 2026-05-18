import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-code screenshots', () => {
  test('block light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-code--block');
    await withTheme(page, 'light', () => takeScreenshot(page, 'code-block-light'));
  });
});
