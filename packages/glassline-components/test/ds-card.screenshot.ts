import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-card screenshots', () => {
  test('all elevations light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-card--all-elevations');
    await withTheme(page, 'light', () => takeScreenshot(page, 'card-all-elevations-light'));
  });
});
