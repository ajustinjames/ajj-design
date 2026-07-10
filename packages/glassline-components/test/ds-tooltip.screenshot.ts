import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-tooltip screenshots', () => {
  test('light-visible', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-tooltip--top');
    await page.locator('#tooltip-anchor').hover();
    await withTheme(page, 'light', () => takeScreenshot(page, 'tooltip-light'));
  });
});
