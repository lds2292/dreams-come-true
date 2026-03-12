/**
 * embed_text 개선 단일 테스트 스크립트
 *
 * 실행: node scripts/test-one-rebuild.js
 *
 * 동작:
 *  1. GPT로 키워드 재생성 (동사/행위 중심, "~꿈" 패턴 제거)
 *  2. 새 embed_text 생성 (dream 중복 제거)
 *  3. Pinecone 벡터 업데이트
 *  4. Supabase dreams.summary 업데이트
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const OpenAI = require('openai');
const { getIndex, embedTexts } = require('../src/services/pinecone');
const supabase = require('../src/lib/supabase');

const TEST_ID   = 'ACT-1';
const TEST_DREAM = '어디론가 빠르게 가는 꿈';
const TEST_CATEGORY = '행동';

// ── 1. 개선된 GPT 프롬프트 ───────────────────────────────────────
async function generateKeywords(dream) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `당신은 꿈해몽 검색 서비스의 키워드 전문가입니다.
아래 꿈에 대해, 사용자가 이 꿈을 검색할 때 입력할 법한 표현을 4~6개 생성해주세요.

규칙:
- 꿈의 행위, 등장 대상, 상황만 기반으로 작성
- 해석 결과(길몽/흉몽/행운/불길/성공/실패 등 의미)는 절대 포함하지 않음
- 동사 원형 단독 사용 금지 (예: "서두르다" ❌) — 반드시 목적어·방향·대상을 포함한 구(phrase)로 작성
- "~꿈" 형태도 사용 금지
- 올바른 예시: "빠르게 어딘가로 이동하다", "급히 목적지로 달려가다", "서둘러 길을 나서다"
- 동의어·유사 표현을 포함해 검색 커버리지 확대
- 반드시 아래 JSON 형식으로만 응답

꿈: ${dream}

응답 형식:
{ "keywords": ["표현1", "표현2", "표현3", "표현4"] }`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const parsed = JSON.parse(res.choices[0].message.content);
  return parsed.keywords;
}

// ── 2. embed_text 생성 (dream 중복 제거) ─────────────────────────
function buildEmbedText(category, dream, keywords) {
  const kwText = keywords.join(' ');
  return `${category} ${dream}. ${kwText}`.trim();
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== 단일 테스트: ${TEST_ID} ===`);
  console.log(`꿈: ${TEST_DREAM}\n`);

  // 기존 값 출력
  console.log('[이전]');
  console.log('  keywords:', JSON.stringify(["빠르게 가는 꿈","급하게 이동하는 꿈","속도감 있는 꿈"]));
  console.log('  embed_text:', '행동 어디론가 빠르게 가는 꿈. 어디론가 빠르게 가는 꿈 빠르게 가는 꿈 급하게 이동하는 꿈 속도감 있는 꿈');

  // 1. 키워드 재생성
  console.log('\n[1] GPT 키워드 재생성 중...');
  const newKeywords = await generateKeywords(TEST_DREAM);
  console.log('  새 keywords:', JSON.stringify(newKeywords));

  // 2. embed_text 재구성
  const newEmbedText = buildEmbedText(TEST_CATEGORY, TEST_DREAM, newKeywords);
  console.log('\n[2] 새 embed_text:');
  console.log(' ', newEmbedText);

  // 3. Pinecone 업데이트
  console.log('\n[3] Pinecone 업데이트 중...');
  const index = getIndex();
  const [vector] = await embedTexts([newEmbedText]);
  await index.upsert({ records: [{
    id: TEST_ID,
    values: vector,
    metadata: {
      dream: TEST_DREAM,
      category: [TEST_CATEGORY],
      keywords: newKeywords.join(', '),
      embed_text: newEmbedText,
    },
  }] });
  console.log('  ✅ Pinecone 업데이트 완료');

  // 4. Supabase summary 업데이트
  console.log('\n[4] Supabase summary 업데이트 중...');
  const { error } = await supabase
    .from('dreams')
    .update({ summary: newEmbedText })
    .eq('dream_no', TEST_ID);

  if (error) {
    console.error('  ❌ Supabase 오류:', error.message);
  } else {
    console.log('  ✅ Supabase 업데이트 완료');
  }

  // 5. 결과 요약
  console.log('\n=== 결과 요약 ===');
  console.log('이전 embed_text:');
  console.log('  행동 어디론가 빠르게 가는 꿈. 어디론가 빠르게 가는 꿈 빠르게 가는 꿈 급하게 이동하는 꿈 속도감 있는 꿈');
  console.log('\n새 embed_text:');
  console.log(' ', newEmbedText);
}

main().catch((err) => {
  console.error('\n❌ 실패:', err.message);
  process.exit(1);
});
