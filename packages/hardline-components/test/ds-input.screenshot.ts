import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('hl-input screenshots', () => {
  test('states light', async ({ page }) => {
    await page.goto('/iframe.html?id=atoms-hl-input--states');
    await withTheme(page, 'light', () => takeScreenshot(page, 'input-states-light'));
  });
});
