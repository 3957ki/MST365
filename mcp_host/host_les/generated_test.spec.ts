import { test, expect } from '@playwright/test';

test('Laftel Website Test', async ({ page }) => {
  const now = new Date();
  const formattedDate = now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/[/\s:]/g, '-');

  await page.goto('https://laftel.net/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `./${formattedDate}/homepage.png` });

  await page.locator('text=태그검색').click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `./${formattedDate}/tagsearch.png` });

  await page.locator('text=가족').first().check();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `./${formattedDate}/familyfilter.png` });
});