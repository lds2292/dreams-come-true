/**
 * 검색 품질 테스트 스크립트
 *
 * 사용법:
 *   node scripts/test-search.js "검색어"
 *   node scripts/test-search.js "빠르게 달리다" --topk=5
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { embedQuery, querySimilar } = require('../src/services/pinecone');
const { applySymonyms } = require('../src/utils/synonymMap');

async function main() {
  const args = process.argv.slice(2);
  const query = args.find(a => !a.startsWith('--'));
  const topK  = parseInt(args.find(a => a.startsWith('--topk='))?.split('=')[1] ?? '10');

  if (!query) {
    console.error('사용법: node scripts/test-search.js "검색어" [--topk=10]');
    process.exit(1);
  }

  const normalized = applySymonyms(query.trim());
  if (normalized !== query) console.log(`[동의어 치환] "${query}" → "${normalized}"`);

  console.log(`\n검색어: "${normalized}"  (topK=${topK})\n`);

  const vector  = await embedQuery(normalized);
  const matches = await querySimilar(vector, topK);

  if (matches.length === 0) {
    console.log('결과 없음');
    return;
  }

  console.log('순위  점수    꿈 제목');
  console.log('─'.repeat(60));
  matches.forEach((m, i) => {
    const score  = (m.score * 100).toFixed(1).padStart(5);
    const rank   = String(i + 1).padStart(2);
    const dream  = m.metadata?.dream ?? m.id;
    const flag   = m.score >= 0.69 ? ' ✅' : m.score >= 0.55 ? ' 🟡' : ' 🔴';
    console.log(`${rank}위  ${score}%${flag}  ${dream}  [${m.id}]`);
  });

  console.log('\n범례: ✅ 최고유사도(≥69%)  🟡 표시됨(≥55%)  🔴 필터링됨(<55%)');
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
