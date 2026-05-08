import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-code screenshots', () => {
  test('block light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-code--block');
    await withTheme(page, 'light', () => takeScreenshot(page, 'code-block-light'));
  });
});
