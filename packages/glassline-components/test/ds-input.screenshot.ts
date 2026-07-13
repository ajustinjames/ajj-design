import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-input screenshots', () => {
  test('states light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-input--states');
    await withTheme(page, 'light', () => takeScreenshot(page, 'input-states-light'));
  });
});
