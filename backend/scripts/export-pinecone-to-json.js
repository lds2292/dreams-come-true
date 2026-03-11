/**
 * Pinecone → JSON 내보내기 스크립트
 *
 * Pinecone에서 카테고리별로 벡터를 모두 가져와
 * data/{CATEGORY}.json 파일로 저장합니다.
 *
 * 실행:
 *   node scripts/export-pinecone-to-json.js
 */

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const { getIndex } = require('../src/services/pinecone');

const CATEGORIES = ['PERSON', 'ANIMAL', 'ACT', 'GOODS', 'DEATH', 'NATURE'];
const OUTPUT_DIR = path.resolve(__dirname, '../../../data');

async function fetchAllByPrefix(index, prefix) {
  const records = [];
  let paginationToken;

  do {
    const result = await index.listPaginated({
      prefix,
      ...(paginationToken && { paginationToken }),
    });

    const ids = (result.vectors ?? []).map((v) => v.id).filter((id) => typeof id === 'string' && id.length > 0);
    console.log(`  - 페이지 ID 수: ${ids.length}, 다음 페이지: ${result.pagination?.next ? '있음' : '없음'}`);

    if (ids.length > 0) {
      // fetch로 메타데이터 포함 상세 조회 (100개씩)
      for (let i = 0; i < ids.length; i += 100) {
        const chunk = ids.slice(i, i + 100);
        if (chunk.length === 0) continue;

        const fetched = await index.fetch({ ids: chunk });
        const fetchedRecords = fetched.records ?? fetched.vectors ?? {};
        for (const [id, vec] of Object.entries(fetchedRecords)) {
          records.push({
            id,
            values: [],  // 벡터값은 용량이 크므로 제외
            metadata: vec.metadata ?? {},
          });
        }
        console.log(`  - fetch 완료: ${records.length}개 누적`);
      }
    }

    paginationToken = result.pagination?.next;
  } while (paginationToken);

  return records;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const index = getIndex();

  for (const category of CATEGORIES) {
    const prefix = `${category}-`;
    console.log(`\n[${category}] 조회 중... (prefix: ${prefix})`);

    const records = await fetchAllByPrefix(index, prefix);
    console.log(`[${category}] ${records.length}개 조회 완료`);

    const outputPath = path.join(OUTPUT_DIR, `${category}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), 'utf-8');
    console.log(`[${category}] 저장 완료 → ${outputPath}`);
  }

  console.log('\n✅ 전체 완료');
}

main().catch((err) => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
