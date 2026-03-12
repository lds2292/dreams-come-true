/**
 * Supabase dreams.summary 동기화 스크립트
 *
 * 실행 방법:
 *   node scripts/sync-supabase-summary.js <JSON_FILENAME>
 *
 * 예시:
 *   node scripts/sync-supabase-summary.js ACT
 *
 * 동작:
 *   - data/<JSON_FILENAME>.json의 embed_text를 Supabase dreams.summary에 반영
 *   - dream_no 기준으로 매칭 (예: "ACT-1")
 *   - 배치(50개)씩 upsert
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const supabase = require('../src/lib/supabase');

const BATCH_SIZE = 50;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function sync(filename) {
  const dataPath = path.resolve(__dirname, `../../data/${filename}.json`);
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 파일 없음: ${dataPath}`);
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`\n=== Supabase summary 동기화: ${filename} (${records.length}개) ===\n`);

  const batches = chunk(records, BATCH_SIZE);
  let updated = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // 배치 내 각 레코드를 개별 업데이트
    const results = await Promise.all(
      batch.map(r =>
        supabase
          .from('dreams')
          .update({ summary: r.metadata.embed_text })
          .eq('dream_no', r.id)
      )
    );

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.warn(`  ⚠️  배치 ${i + 1} 중 ${errors.length}건 오류:`, errors[0].error.message);
    }

    updated += batch.length - errors.length;
    console.log(`[${i + 1}/${batches.length}] ✅ ${updated}/${records.length}개 완료`);
  }

  console.log(`\n✅ ${filename} Supabase summary 동기화 완료 (${updated}개)`);
}

const filename = process.argv[2];
if (!filename) {
  console.error('❌ 파일명을 인자로 전달해주세요. 예: node sync-supabase-summary.js ACT');
  process.exit(1);
}

sync(filename).catch(err => {
  console.error('\n❌ 실패:', err.message);
  process.exit(1);
});
