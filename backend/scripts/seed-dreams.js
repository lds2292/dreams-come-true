/**
 * Pinecone 범용 시딩 스크립트
 *
 * 실행 방법:
 *   node scripts/seed-dreams.js <JSON_FILENAME>
 *
 * 예시:
 *   node scripts/seed-dreams.js PERSON
 *   node scripts/seed-dreams.js ANIMAL
 *   node scripts/seed-dreams.js ACT
 *   node scripts/seed-dreams.js GOODS
 *   node scripts/seed-dreams.js DEATH
 *
 * npm scripts:
 *   npm run seed:person
 *   npm run seed:animal
 *   npm run seed:act
 *   npm run seed:goods
 *   npm run seed:death
 *
 * 동작:
 *   1. Pinecone 인덱스에서 <JSON_FILENAME>- prefix를 가진 벡터만 삭제
 *   2. data/<JSON_FILENAME>.json 데이터를 임베딩 후 upsert
 *
 * 사전 준비:
 *   .env 파일에 PINECONE_API_KEY, PINECONE_INDEX_NAME, OPENAI_API_KEY 설정 필요
 */

require('dotenv').config();

const path = require('path');
const { getIndex, embedTexts } = require('../src/services/pinecone');

const BATCH_SIZE = 100;

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function seed(filename) {
  const dataPath = path.resolve(__dirname, `../../data/${filename}.json`);
  let records;
  try {
    records = require(dataPath);
  } catch {
    console.error(`❌ 파일을 찾을 수 없습니다: ${dataPath}`);
    process.exit(1);
  }

  console.log(`=== Pinecone 시딩 시작: ${filename} ===`);
  console.log(`대상 인덱스: ${process.env.PINECONE_INDEX_NAME}`);
  console.log(`총 레코드: ${records.length}개\n`);

  const index = getIndex();

  // 1. prefix에 해당하는 기존 벡터만 삭제
  const prefix = `${filename}-`;
  console.log(`기존 데이터 삭제 중... (prefix: ${prefix})`);
  let deletedCount = 0;
  let paginationToken;
  do {
    const result = await index.listPaginated({ prefix, ...(paginationToken && { paginationToken }) });
    const ids = (result.vectors ?? []).map((v) => v.id).filter(Boolean);
    if (ids.length > 0) {
      await index.deleteMany({ ids });
      deletedCount += ids.length;
    }
    paginationToken = result.pagination?.next;
  } while (paginationToken);
  console.log(`✅ 기존 데이터 ${deletedCount}개 삭제 완료\n`);

  // 2. 임베딩 + upsert
  const batches = chunk(records, BATCH_SIZE);
  let totalUploaded = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const start = batchIdx * BATCH_SIZE + 1;
    const end = start + batch.length - 1;
    console.log(`[${batchIdx + 1}/${batches.length}] 임베딩 중... (${start}~${end}번)`);

    const texts = batch.map((item) => item.metadata.embed_text);
    const vectors = await embedTexts(texts);

    const upsertRecords = batch.map((item, i) => ({
      id: item.id,
      values: vectors[i],
      metadata: {
        dream: item.metadata.dream,
        category: item.metadata.category ?? [],
        keywords: (item.metadata.keywords ?? []).join(', '),
        embed_text: texts[i],
        basic: item.metadata.interpretations?.basic?.content ?? '',
        baby: item.metadata.interpretations?.baby?.content ?? '',
        random: item.metadata.interpretations?.random?.content ?? '',
        reality: item.metadata.interpretations?.reality?.content ?? '',
        fortune_telling: item.metadata.interpretations?.fortune_telling?.content ?? '',
      },
    }));

    await index.upsert({ records: upsertRecords });

    totalUploaded += upsertRecords.length;
    console.log(`  ✅ ${totalUploaded}/${records.length}개 완료`);
  }

  console.log(`\n=== 시딩 완료 ===`);
  console.log(`총 ${totalUploaded}개 레코드가 Pinecone에 업로드되었습니다.`);
}

const filename = process.argv[2];
if (!filename) {
  console.error('❌ 파일명을 인자로 전달해주세요. 예: node seed-dreams.js ANIMAL');
  process.exit(1);
}

seed(filename).catch((err) => {
  console.error('\n❌ 시딩 실패:', err.message);
  process.exit(1);
});