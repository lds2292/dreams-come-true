const { test, expect } = require('@playwright/test');

test.describe('오늘의 꿈해몽 섹션', () => {

  test('카테고리 뱃지에 큰따옴표가 없어야 한다', async ({ page }) => {
    await page.goto('/');

    // 오늘의 꿈해몽 카드 로딩 대기 (스켈레톤 → 카드)
    await page.waitForSelector('.daily-card', { timeout: 15_000 });

    const categoryEl = page.locator('.daily-category');
    await expect(categoryEl).toBeVisible();

    const text = await categoryEl.textContent();
    console.log('[category]', text);

    // 큰따옴표 없어야 함
    expect(text).not.toContain('"');

    await categoryEl.screenshot({ path: 'tests/screenshots/daily-category.png' });
  });

  test('오늘의 꿈해몽 카드가 렌더링된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.daily-card', { timeout: 15_000 });

    const card = page.locator('.daily-card');
    await expect(card).toBeVisible();
    await expect(page.locator('.daily-title')).not.toBeEmpty();
    await expect(page.locator('.daily-summary')).not.toBeEmpty();

    await card.screenshot({ path: 'tests/screenshots/daily-card.png' });
  });

});
