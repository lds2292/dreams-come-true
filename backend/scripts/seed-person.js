/**
 * Pinecone 시딩 스크립트 (PERSON.json)
 *
 * 실행 방법:
 *   cd backend
 *   npm run seed:person
 *
 * 동작:
 *   1. 기존 Pinecone 인덱스의 모든 벡터 삭제
 *   2. data/PERSON.json 데이터를 임베딩 후 upsert
 *
 * 사전 준비:
 *   .env 파일에 PINECONE_API_KEY, PINECONE_INDEX_NAME, OPENAI_API_KEY 설정 필요
 */

require('dotenv').config();

const path = require('path');
const { getIndex, embedTexts } = require('../src/services/pinecone');
const persons = require(path.resolve(__dirname, '../../data/PERSON.json'));

const BATCH_SIZE = 100;

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function seed() {
  console.log('=== Pinecone PERSON 시딩 시작 ===');
  console.log(`대상 인덱스: ${process.env.PINECONE_INDEX_NAME}`);
  console.log(`총 레코드: ${persons.length}개\n`);

  const index = getIndex();

  // 1. 기존 데이터 전체 삭제
  console.log('기존 데이터 삭제 중...');
  await index.deleteAll();
  console.log('✅ 기존 데이터 삭제 완료\n');

  // 2. 임베딩 + upsert
  const batches = chunk(persons, BATCH_SIZE);
  let totalUploaded = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const start = batchIdx * BATCH_SIZE + 1;
    const end = start + batch.length - 1;
    console.log(`[${batchIdx + 1}/${batches.length}] 임베딩 중... (${start}~${end}번)`);

    // PERSON.json에 embed_text가 이미 포함되어 있음
    const texts = batch.map((item) => item.metadata.embed_text);
    const vectors = await embedTexts(texts);

    const records = batch.map((item, i) => ({
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

    await index.upsert({ records });

    totalUploaded += records.length;
    console.log(`  ✅ ${totalUploaded}/${persons.length}개 완료`);
  }

  console.log('\n=== 시딩 완료 ===');
  console.log(`총 ${totalUploaded}개 레코드가 Pinecone에 업로드되었습니다.`);
}

seed().catch((err) => {
  console.error('\n❌ 시딩 실패:', err.message);
  process.exit(1);
});
