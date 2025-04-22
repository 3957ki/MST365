import { test, expect } from '@playwright/test';

test('Laftel Website Navigation and Screenshot', async ({ page }) => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');

  await page.goto('https://laftel.net/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `./${formattedDate}/laftel_main.png`, fullPage: true });

  const weekdayButton = await page.locator('text=요일별 신작'); //  버튼의 텍스트를 사용하여 선택.  다른 선택자가 필요하면 수정해야 합니다.
  await weekdayButton.click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `./${formattedDate}/laftel_weekday.png`, fullPage: true });


  const wednesdayItems = await page.locator('text=수요일'); // '수요일' 텍스트를 사용하여 요소 선택,  더 정확한 선택자 필요시 수정
  const firstWednesdayItem = await wednesdayItems.locator('li >> nth=0'); // 첫 번째 요소 선택  li태그를 가정. 실제 DOM구조에 따라 수정 필요
  const firstItemImage = await firstWednesdayItem.locator('img'); // 이미지 요소 선택 img 태그를 가정, 실제 DOM구조에 따라 수정 필요
  await firstItemImage.click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `./${formattedDate}/laftel_detail.png`, fullPage: true });
});