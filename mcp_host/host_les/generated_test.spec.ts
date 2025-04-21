import { test, expect } from '@playwright/test';

test('Naver search 감자', async ({ page }) => {
  await page.goto('https://www.naver.com/');
  await page.fill('input[name="query"]', '감자');
  await page.screenshot({ path: 'naver_search_input.png', fullPage: true });

  await page.keyboard.press('Enter');
  await page.waitForSelector('div.basicList_info_area__2qX9K a');
  const firstResult = await page.$('div.basicList_info_area__2qX9K a');
  await firstResult?.click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'first_result.png', fullPage: true });
});