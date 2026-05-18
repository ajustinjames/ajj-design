import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-divider screenshots', () => {
  test('horizontal light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-divider--horizontal');
    await withTheme(page, 'light', () => takeScreenshot(page, 'divider-horizontal-light'));
  });
});
