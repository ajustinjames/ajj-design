import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-avatar screenshots', () => {
  test('all modes light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-avatar--initials');
    await withTheme(page, 'light', () => takeScreenshot(page, 'avatar-all-modes-light'));
  });
});
