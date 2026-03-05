/**
 * 단일 텍스트를 임베딩 벡터로 변환하여 출력하는 유틸 스크립트
 *
 * 사용법:
 *   node scripts/embed-query.js "칼꿈"
 */

require('dotenv').config();

const { embedQuery } = require('../src/services/pinecone');

async function main() {
  const text = process.argv[2];
  if (!text) {
    console.error('사용법: node scripts/embed-query.js "검색어"');
    process.exit(1);
  }

  console.log(`임베딩 중: "${text}"`);
  const vector = await embedQuery(text);
  console.log(`\n차원 수: ${vector.length}`);
  console.log('\n벡터 (JSON):');
  console.log(JSON.stringify(vector));
}

main().catch((err) => {
  console.error('오류:', err.message);
  process.exit(1);
});
