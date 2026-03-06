/**
 * 꿈해몽 keywords 재생성 스크립트
 *
 * 실행 방법:
 *   node scripts/rebuild-keywords.js <JSON_FILENAME>
 *
 * 예시:
 *   node scripts/rebuild-keywords.js ACT
 *   node scripts/rebuild-keywords.js ANIMAL
 *
 * npm scripts:
 *   npm run rebuild:keywords -- ACT
 *
 * 동작:
 *   - data/<JSON_FILENAME>.json의 각 항목에서 dream 필드만 기반으로 keywords 재생성
 *   - 해석 결과(길흉·의미)가 아닌, 사용자가 실제 검색할 법한 표현으로 생성
 *   - GPT 호출 비용 절감을 위해 배치(20개)당 1회 호출
 *   - 완료 후 원본 JSON 파일에 덮어쓰기
 *
 * 사전 준비:
 *   .env 파일에 OPENAI_API_KEY 설정 필요
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const GPT_BATCH_SIZE = 20; // 1회 GPT 호출당 처리할 꿈 개수
const GPT_MODEL = 'gpt-4o-mini';

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

/**
 * GPT로 꿈 목록의 keywords 일괄 생성
 * @param {string[]} dreams
 * @returns {Promise<string[][]>} 각 꿈에 대한 keywords 배열의 배열
 */
async function generateKeywordsBatch(openai, dreams) {
  const numbered = dreams.map((d, i) => `${i + 1}. ${d}`).join('\n');

  const prompt = `당신은 꿈해몽 검색 서비스의 키워드 전문가입니다.
아래 꿈 목록 각각에 대해, 사용자가 이 꿈을 검색할 때 입력할 법한 검색 키워드를 3~5개 생성해주세요.

규칙:
- 꿈의 행위, 등장 대상, 상황만 기반으로 작성
- 해석 결과(길몽/흉몽/행운/불길/성공/실패 등 의미)는 절대 포함하지 않음
- 각 키워드는 "~꿈" 형태 또는 핵심 명사/동사구로 작성
- 동의어·유사 표현을 포함해 검색 커버리지 확대
- 반드시 아래 JSON 형식으로만 응답 (설명 없이)

꿈 목록:
${numbered}

응답 형식 (배열 길이는 꿈 목록 수와 동일해야 함):
[
  ["키워드1", "키워드2", "키워드3"],
  ["키워드1", "키워드2", "키워드3"]
]`;

  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content;

  // response_format: json_object는 최상위가 object여야 함 → 배열을 { result: [...] }로 파싱
  let parsed;
  try {
    const obj = JSON.parse(raw);
    // GPT가 { result: [...] } 또는 { keywords: [...] } 등으로 감쌀 수 있음
    parsed = Array.isArray(obj) ? obj : Object.values(obj)[0];
  } catch {
    throw new Error(`GPT 응답 파싱 실패:\n${raw}`);
  }

  if (!Array.isArray(parsed) || parsed.length !== dreams.length) {
    throw new Error(`GPT 응답 길이 불일치: 기대 ${dreams.length}개, 실제 ${parsed?.length}개\n${raw}`);
  }

  return parsed;
}

async function rebuild(filename) {
  const dataPath = path.resolve(__dirname, `../../data/${filename}.json`);

  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${dataPath}`);
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`\n=== keywords 재생성 시작: ${filename} (${records.length}개) ===\n`);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const batches = chunk(records, GPT_BATCH_SIZE);
  let processed = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const dreams = batch.map((r) => r.metadata.dream);

    process.stdout.write(
      `[${batchIdx + 1}/${batches.length}] GPT 호출 중... (${processed + 1}~${processed + batch.length}번)`
    );

    let keywordsList;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        keywordsList = await generateKeywordsBatch(openai, dreams);
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`\n  ⚠️  배치 ${batchIdx + 1} 시도 ${attempt}/3 실패: ${err.message}`);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
    if (!keywordsList) {
      console.warn(`  ⚠️  배치 ${batchIdx + 1} 3회 실패 → 기존 keywords 유지`);
      keywordsList = batch.map((r) => r.metadata.keywords ?? []);
    }

    for (let i = 0; i < batch.length; i++) {
      batch[i].metadata.keywords = keywordsList[i];
    }

    processed += batch.length;
    console.log(` ✅ ${processed}/${records.length}개 완료`);
  }

  fs.writeFileSync(dataPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`\n✅ ${filename}.json keywords 재생성 완료 → ${dataPath}`);

  // 샘플 출력
  console.log('\n--- 샘플 확인 (처음 3개) ---');
  for (const r of records.slice(0, 3)) {
    console.log(`  꿈: ${r.metadata.dream}`);
    console.log(`  keywords: ${JSON.stringify(r.metadata.keywords)}`);
    console.log();
  }
}

const filename = process.argv[2];
if (!filename) {
  console.error('❌ 파일명을 인자로 전달해주세요. 예: node rebuild-keywords.js ACT');
  process.exit(1);
}

rebuild(filename).catch((err) => {
  console.error('\n❌ 실패:', err.message);
  process.exit(1);
});
