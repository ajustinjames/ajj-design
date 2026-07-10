import { test } from '@playwright/test';
import { withTheme, takeScreenshot } from './screenshot-helpers.js';

test.describe('gl-radio screenshots', () => {
  test('unchecked light', async ({ page }) => {
    await page.goto('/iframe.html?id=glassline-gl-radio--default');
    await withTheme(page, 'light', () => takeScreenshot(page, 'radio-unchecked-light'));
  });
});
