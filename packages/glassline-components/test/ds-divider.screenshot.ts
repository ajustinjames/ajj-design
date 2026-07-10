import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-divider screenshots', () => {
  test('horizontal light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-divider--horizontal');
    await withTheme(page, 'light', () => takeScreenshot(page, 'divider-horizontal-light'));
  });
});
