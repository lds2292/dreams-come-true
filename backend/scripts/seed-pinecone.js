/**
 * Pinecone 데이터 시딩 스크립트 (person_pinecone_dreams.json)
 *
 * 실행 방법:
 *   cd backend
 *   npm run seed:pinecone
 *
 * 사전 준비:
 *   .env 파일에 PINECONE_API_KEY, PINECONE_INDEX_NAME, OPENAI_API_KEY 설정 필요
 *   Pinecone 인덱스가 이미 생성되어 있어야 함 (dimension: 1536)
 */

require('dotenv').config();

const path = require('path');
const { getIndex, embedTexts } = require('../src/services/pinecone');
const dreams = require(path.resolve(__dirname, '../../data/person_pinecone_dreams.json'));

const EMBED_BATCH_SIZE = 100;  // OpenAI 임베딩 배치 크기
const UPSERT_BATCH_SIZE = 100; // Pinecone upsert 배치 크기

/** 임베딩 텍스트 생성
 *  구조: "제목. 제목 키워드1 키워드2.... 해몽내용"
 *  - 제목을 앞부분에 두 번 배치해 가중치 극대화
 *  - 키워드를 제목 바로 뒤에 배치해 의미 유사도 향상
 */
function buildEmbedText(item) {
  const { dream, interpretations, keywords = [] } = item.metadata;
  const keywordText = keywords.join(' ');
  const contents = Object.values(interpretations)
    .map((v) => v.content)
    .filter(Boolean)
    .join(' ');
  return `${dream}. ${dream} ${keywordText}. ${contents}`;
}

/** 배열을 size 단위로 분할 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function seed() {
  console.log('=== Pinecone 시딩 시작 ===');
  console.log(`대상 인덱스: ${process.env.PINECONE_INDEX_NAME}`);
  console.log(`임베딩 모델: text-embedding-3-large (dimension: 3072)`);
  console.log(`총 레코드: ${dreams.length}개\n`);

  const index = getIndex();
  const batches = chunk(dreams, EMBED_BATCH_SIZE);
  let totalUploaded = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const start = batchIdx * EMBED_BATCH_SIZE + 1;
    const end = start + batch.length - 1;
    console.log(`[${batchIdx + 1}/${batches.length}] 임베딩 중... (${start}~${end}번)`);

    const texts = batch.map(buildEmbedText);
    const vectors = await embedTexts(texts);

    const records = batch.map((item, i) => ({
      id: item.id,
      values: vectors[i],
      metadata: {
        dream: item.metadata.dream,
        dream_no: item.metadata.dream_no,
        keywords: (item.metadata.keywords ?? []).join(', '),
        embed_text: texts[i],
        basic: item.metadata.interpretations.basic?.content ?? '',
        baby: item.metadata.interpretations.baby?.content ?? '',
        random: item.metadata.interpretations.random?.content ?? '',
        reality: item.metadata.interpretations.reality?.content ?? '',
        fortune_telling: item.metadata.interpretations.fortune_telling?.content ?? '',
      },
    }));

    // Pinecone upsert (배치 단위)
    for (const upsertBatch of chunk(records, UPSERT_BATCH_SIZE)) {
      await index.upsert({ records: upsertBatch });
    }

    totalUploaded += records.length;
    console.log(`  ✅ ${totalUploaded}/${dreams.length}개 완료`);
  }

  console.log('\n=== 시딩 완료 ===');
  console.log(`총 ${totalUploaded}개 레코드가 Pinecone에 업로드되었습니다.`);
}

seed().catch((err) => {
  console.error('\n❌ 시딩 실패:', err.message);
  process.exit(1);
});
