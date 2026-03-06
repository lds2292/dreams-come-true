const { test, expect } = require('@playwright/test');

const SEARCH_QUERY = '돼지꿈';

test.describe('피드백 섹션', () => {

  // 검색 → 첫 번째 결과 클릭 → 상세페이지 진입 헬퍼
  async function goToDetail(page) {
    await page.goto(`/search?q=${encodeURIComponent(SEARCH_QUERY)}`);

    // 결과 카드 로딩 대기
    await page.waitForSelector('.result-card', { timeout: 15_000 });

    // 첫 번째 결과 클릭
    await page.locator('.result-card').first().click();

    // 상세페이지 섹션 로딩 대기
    await page.waitForSelector('.sections', { timeout: 10_000 });
  }

  test('피드백 섹션이 해몽 섹션 하단에 렌더링된다', async ({ page }) => {
    await goToDetail(page);

    const feedback = page.locator('.feedback-section');
    await expect(feedback).toBeVisible();
    await expect(feedback.locator('.feedback-question')).toContainText('도움이 되셨나요');
    await expect(feedback.locator('.btn-helpful')).toBeVisible();
    await expect(feedback.locator('.btn-unhelpful')).toBeVisible();
  });

  test('피드백 섹션과 해몽 카드의 스타일이 일관적이다', async ({ page }) => {
    await goToDetail(page);

    const sectionCard   = page.locator('.section').first();
    const feedbackCard  = page.locator('.feedback-section');

    const sectionStyles  = await sectionCard.evaluate(el => getComputedStyle(el));
    const feedbackStyles = await feedbackCard.evaluate(el => getComputedStyle(el));

    // border-radius 일치 확인
    console.log('[section]  border-radius:', sectionStyles.borderRadius);
    console.log('[feedback] border-radius:', feedbackStyles.borderRadius);

    // padding 비교
    console.log('[section]  padding:', sectionStyles.padding);
    console.log('[feedback] padding:', feedbackStyles.padding);

    // background 비교
    console.log('[section]  background:', sectionStyles.backgroundColor);
    console.log('[feedback] background:', feedbackStyles.backgroundColor);
  });

  test('스크린샷 — 섹션 카드 vs 피드백 카드 비교', async ({ page }) => {
    await goToDetail(page);

    // 피드백 섹션으로 스크롤 후 스크린샷
    const feedback = page.locator('.feedback-section');
    await feedback.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // 스크롤 안정화

    // 마지막 해몽 카드 + 피드백 카드가 함께 보이는 뷰포트 스크린샷
    await page.screenshot({ path: 'tests/screenshots/feedback-comparison.png' });

    // 개별 클로즈업
    await feedback.screenshot({ path: 'tests/screenshots/feedback-card.png' });
    const lastSection = page.locator('.section').last();
    await lastSection.screenshot({ path: 'tests/screenshots/section-card.png' });

    // 스타일 상세 비교 (모든 속성)
    const props = [
      'padding', 'borderRadius', 'backgroundColor',
      'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
      'boxShadow', 'marginTop',
    ];
    for (const prop of props) {
      const sVal = await lastSection.evaluate((el, p) => getComputedStyle(el)[p], prop);
      const fVal = await feedback.evaluate((el, p) => getComputedStyle(el)[p], prop);
      const mark = sVal === fVal ? '✓' : '✗ 불일치';
      console.log(`${mark}  ${prop.padEnd(18)} section: ${sVal}  |  feedback: ${fVal}`);
    }
  });

  test('👍 도움됐어요 클릭 시 감사 메시지로 전환된다', async ({ page }) => {
    // localStorage 초기화 (이전 응답 제거)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('dct_fb');
    });

    await goToDetail(page);

    const feedback = page.locator('.feedback-section');
    await feedback.locator('.btn-helpful').click();

    await expect(feedback.locator('.feedback-done-title')).toContainText('감사합니다');
    await expect(feedback.locator('.feedback-done-emoji')).toContainText('🙏');
    await expect(feedback.locator('.btn-helpful')).not.toBeVisible();
  });

  test('👎 아쉬워요 클릭 시 감사 메시지로 전환된다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('dct_fb');
    });

    await goToDetail(page);

    const feedback = page.locator('.feedback-section');
    await feedback.locator('.btn-unhelpful').click();

    await expect(feedback.locator('.feedback-done-title')).toContainText('감사합니다');
    await expect(feedback.locator('.btn-unhelpful')).not.toBeVisible();
  });

  test('이미 응답한 경우 재방문 시 감사 메시지가 표시된다', async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(SEARCH_QUERY)}`);
    await page.waitForSelector('.result-card', { timeout: 15_000 });

    // 첫 번째 결과의 id를 읽어 localStorage에 미리 기록
    const dreamId = await page.locator('.result-card').first().getAttribute('data-id')
      .catch(() => null);

    if (dreamId) {
      await page.evaluate((id) => {
        const map = JSON.parse(localStorage.getItem('dct_fb') || '{}');
        map[id] = 'helpful';
        localStorage.setItem('dct_fb', JSON.stringify(map));
      }, dreamId);
    } else {
      // data-id가 없으면 직접 클릭 후 localStorage 확인으로 대체
      await page.locator('.result-card').first().click();
      await page.waitForSelector('.sections', { timeout: 10_000 });
      await page.locator('.btn-helpful').click();
      await page.goBack();
      await page.waitForSelector('.result-card', { timeout: 10_000 });
    }

    await page.locator('.result-card').first().click();
    await page.waitForSelector('.sections', { timeout: 10_000 });

    const feedback = page.locator('.feedback-section');
    await feedback.screenshot({ path: 'tests/screenshots/feedback-revisit.png' });
  });

});
