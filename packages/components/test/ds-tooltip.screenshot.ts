import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('ds-tooltip screenshots', () => {
  test('light-visible', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-ds-tooltip--top');
    await withTheme(page, 'light', () => takeScreenshot(page, 'tooltip-light'));
  });
});
