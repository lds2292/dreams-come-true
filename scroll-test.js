/**
 * 페이지 전환 시 스크롤 리셋 검증 테스트
 *
 * 실행 방법:
 *   node scroll-test.js
 *
 * 사전 조건:
 *   - 프론트엔드 dev 서버 실행 중 (localhost:5173)
 *   - playwright 패키지 설치 (npm install -D playwright)
 */

const { chromium } = require('playwright');

const MOCK_RESULTS = {
  results: Array.from({ length: 20 }, (_, i) => ({
    id: `dream-${i}`,
    title: `용꿈 ${i + 1}`,
    dream_no: i + 1,
    basic: `기본 해몽 내용입니다. 용이 하늘을 나는 꿈은 크게 성공할 징조입니다. `.repeat(10),
    fortune_telling: `예지몽 해몽 내용입니다. `.repeat(10),
    reality: `현실몽 해몽 내용입니다. `.repeat(10),
    baby: `태몽 해몽 내용입니다. `.repeat(10),
    random: '',
    score: 0.95 - i * 0.02,
  })),
  total: 20,
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 크기

  // 백엔드 없이 테스트하기 위한 API mock
  await page.route('**/api/dreams/search**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RESULTS),
    });
  });

  console.log('1. 검색 페이지 이동');
  await page.goto('http://localhost:5173/search');
  await page.waitForSelector('.search-input');

  console.log('2. 검색 실행');
  await page.fill('.search-input', '용꿈');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.result-card');

  console.log('3. 컨텐츠 높이 확인');
  const scrollInfo = await page.evaluate(() => {
    const el = document.querySelector('.layout-content');
    return {
      scrollHeight: el?.scrollHeight,
      clientHeight: el?.clientHeight,
      exists: !!el,
    };
  });
  console.log(`   layout-content 존재: ${scrollInfo.exists}`);
  console.log(`   scrollHeight: ${scrollInfo.scrollHeight}px / clientHeight: ${scrollInfo.clientHeight}px`);

  if (scrollInfo.scrollHeight === scrollInfo.clientHeight) {
    console.log('   ⚠️  layout-content가 스크롤 컨테이너로 동작하지 않음 (height 고정 필요)');
  }

  console.log('4. 검색 결과 스크롤 다운 (600px)');
  await page.evaluate(() => {
    document.querySelector('.layout-content').scrollTop = 600;
  });
  await page.waitForTimeout(500);

  const scrollBefore = await page.evaluate(() => document.querySelector('.layout-content')?.scrollTop);
  console.log(`   스크롤 위치 (클릭 전): ${scrollBefore}px`);

  console.log('5. 첫 번째 카드 클릭');
  await page.locator('.result-card').first().click();
  await page.waitForSelector('.detail-page');
  await page.waitForTimeout(800);

  const scrollAfter = await page.evaluate(() => document.querySelector('.layout-content')?.scrollTop);
  console.log(`   스크롤 위치 (상세 진입 후): ${scrollAfter}px`);

  if (scrollAfter === 0) {
    console.log('\n✅ PASS: 상세 페이지 진입 시 스크롤이 최상단으로 리셋됨');
  } else {
    console.log(`\n❌ FAIL: 스크롤이 ${scrollAfter}px에 남아있음`);
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
