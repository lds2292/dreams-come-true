/**
 * 임베딩 텍스트 미리보기 JSON 생성 스크립트
 *
 * 실행 방법:
 *   node scripts/preview-embed-texts.js
 *
 * 출력:
 *   data/embed_preview.json
 */

const fs   = require('fs');
const path = require('path');

const DATA_PATH    = path.resolve(__dirname, '../../data/person_pinecone_dreams.json');
const PREVIEW_PATH = path.resolve(__dirname, '../../data/embed_preview.json');

const dreams = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

function buildEmbedText(item) {
  const { dream, interpretations, keywords = [] } = item.metadata;
  const keywordText = keywords.join(' ');
  const contents = Object.values(interpretations)
    .map((v) => v.content)
    .filter(Boolean)
    .join(' ');
  return `${dream}. ${dream} ${keywordText}. ${contents}`;
}

const preview = dreams.map((item) => ({
  id: item.id,
  dream: item.metadata.dream,
  keywords: item.metadata.keywords ?? [],
  embed_text: buildEmbedText(item),
}));

fs.writeFileSync(PREVIEW_PATH, JSON.stringify(preview, null, 2), 'utf-8');

console.log(`✅ 완료: ${PREVIEW_PATH}`);
console.log(`총 ${preview.length}개 항목\n`);
console.log('=== 샘플 (이발을 하는 꿈) ===');
const sample = preview.find((d) => d.dream.includes('이발'));
if (sample) console.log(JSON.stringify(sample, null, 2));
