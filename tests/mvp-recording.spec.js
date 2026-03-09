/**
 * MVP 동작 화면 영상 녹화
 *
 * 녹화 플로우:
 *   1. 홈 화면 — 스크롤, 오늘의 꿈해몽, 카테고리 버튼
 *   2. 검색 — '뱀' 입력, 결과 카드(카테고리 아이콘/뱃지), AI 로딩 메시지
 *   3. 상세 페이지 — 꿈해몽 내용, 피드백 섹션
 *   4. 카테고리 페이지 — 목록 스크롤, 더보기
 *   5. 상징 탭 — 소개 텍스트, 카테고리 팝업
 *
 * 실행 전 서버 기동 필요:
 *   npm run dev:frontend   (port 5173)
 *   npm run dev:backend    (port 8080)
 *
 * 실행:
 *   npx playwright test tests/mvp-recording.spec.js --project=chromium
 *
 * 영상 저장 위치: tests/videos/
 */

const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

const VIEWPORT = { width: 390, height: 844 };

test.setTimeout(120_000);
test('MVP 전체 플로우 녹화', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'ko-KR',
    colorScheme: 'dark',
    recordVideo: {
      dir: path.join(__dirname, 'videos'),
      size: VIEWPORT,
    },
  });
  const page = await context.newPage();

  // ────────────────────────────────────────────
  // 1. 홈 화면
  // ────────────────────────────────────────────
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 오늘의 꿈해몽 카드 로딩 대기
  await page.waitForSelector('.daily-card', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1200);

  // 홈 페이지 천천히 스크롤
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(800);

  // ────────────────────────────────────────────
  // 2. 검색 — 검색창 클릭 후 '뱀' 입력
  // ────────────────────────────────────────────
  await page.click('a[href="/search"], [href="/search"]');
  await page.waitForTimeout(600);

  const searchInput = page.locator('input[type="text"], .search-input').first();
  await searchInput.click();
  await page.waitForTimeout(400);

  for (const char of ['뱀', '꿈']) {
    await searchInput.type(char, { delay: 150 });
  }
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');

  // 로딩 메시지 표시 중 잠시 대기
  await page.waitForTimeout(1500);

  // 결과 대기
  await page.waitForSelector('.result-card', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // 결과 스크롤
  const layoutContent = page.locator('.layout-content');
  await layoutContent.evaluate(el => el.scrollTo({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(1200);
  await layoutContent.evaluate(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(800);

  // ────────────────────────────────────────────
  // 3. 검색 상세 페이지
  // ────────────────────────────────────────────
  const firstCard = page.locator('.result-card').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 상세 페이지 스크롤 (피드백 섹션까지)
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(1200);

    // 피드백 버튼 클릭 (있으면)
    const feedbackBtn = page.locator('.feedback-btn').first();
    if (await feedbackBtn.isVisible().catch(() => false)) {
      await feedbackBtn.click();
      await page.waitForTimeout(800);
    }

    // 뒤로가기
    await page.goBack();
    await page.waitForTimeout(800);
  }

  // ────────────────────────────────────────────
  // 4. 카테고리 페이지 — 홈 → 카테고리 버튼 클릭
  // ────────────────────────────────────────────
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  // 카테고리 섹션까지 스크롤
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(800);

  // 첫 번째 카테고리 버튼 클릭
  const categoryBtn = page.locator('.category-btn, .dream-category-btn').first();
  if (await categoryBtn.isVisible().catch(() => false)) {
    await categoryBtn.click();
    await page.waitForSelector('.category-page, .category-list', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 카테고리 목록 스크롤
    const content = page.locator('.layout-content');
    await content.evaluate(el => el.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    await content.evaluate(el => el.scrollTo({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(1200);
  }

  // ────────────────────────────────────────────
  // 5. 상징 탭
  // ────────────────────────────────────────────
  await page.click('a[href="/symbol"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 상징 페이지 스크롤
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // 카테고리 카드 클릭 → 팝업
  const symbolCard = page.locator('.symbol-cat-card').first();
  if (await symbolCard.isVisible().catch(() => false)) {
    await symbolCard.click();
    await page.waitForTimeout(1200);

    // 팝업 닫기
    const closeBtn = page.locator('.popup-close');
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(800);
    }
  }

  await page.waitForTimeout(1000);

  // 영상 저장
  await context.close();
  await browser.close();
});
