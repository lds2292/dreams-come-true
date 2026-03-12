/**
 * 꿈해몽 embed_text 재구성 스크립트 (GPT 호출 없음, 로컬 처리)
 *
 * 실행 방법:
 *   node scripts/rebuild-embed-text.js <JSON_FILENAME>
 *
 * 예시:
 *   node scripts/rebuild-embed-text.js ACT
 *   node scripts/rebuild-embed-text.js ANIMAL
 *
 * npm scripts:
 *   npm run rebuild:embed-text -- ACT
 *
 * 동작:
 *   - 기존 embed_text의 해석 내용(basic) 제거
 *   - 새 구조: "{category}. {dream}. {dream} {keywords joined}"
 *   - rebuild-keywords.js 실행 후 사용 권장 (최신 keywords 반영)
 *   - 완료 후 원본 JSON 파일에 덮어쓰기
 */

const fs = require('fs');
const path = require('path');

/**
 * embed_text 생성
 * 구조: "{category}. {dream}. {dream} {keywords}"
 *  - dream을 두 번 배치해 제목 가중치 유지 (임베딩 모델에서 앞부분 가중치 높음)
 *  - 해석 내용(basic/fortune_telling 등) 완전 제거
 */
function buildEmbedText(item) {
  const { dream, keywords = [], category = [] } = item.metadata;

  const categoryText = Array.isArray(category) ? category.join('/') : category;
  const keywordText  = Array.isArray(keywords) ? keywords.join(' ') : keywords;

  // dream 중복 제거: "{category} {dream}. {keywords}"
  const parts = [];
  if (categoryText) parts.push(categoryText);
  parts.push(`${dream}.`);
  if (keywordText) parts.push(keywordText);

  return parts.join(' ').trim();
}

function rebuild(filename) {
  const dataPath = path.resolve(__dirname, `../../data/${filename}.json`);

  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${dataPath}`);
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`\n=== embed_text 재구성 시작: ${filename} (${records.length}개) ===\n`);

  for (const record of records) {
    record.metadata.embed_text = buildEmbedText(record);
  }

  fs.writeFileSync(dataPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`✅ ${filename}.json embed_text 재구성 완료 → ${dataPath}`);

  // 샘플 출력
  console.log('\n--- 샘플 확인 (처음 3개) ---');
  for (const r of records.slice(0, 3)) {
    console.log(`  꿈: ${r.metadata.dream}`);
    console.log(`  embed_text: ${r.metadata.embed_text}`);
    console.log();
  }
}

const filename = process.argv[2];
if (!filename) {
  console.error('❌ 파일명을 인자로 전달해주세요. 예: node rebuild-embed-text.js ACT');
  process.exit(1);
}

rebuild(filename);
