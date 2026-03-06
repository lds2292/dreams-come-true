/**
 * Pinecone 모든 인덱스 내 데이터(벡터) 전체 삭제 스크립트
 *
 * 실행 방법:
 *   cd backend
 *   npm run pinecone:delete-all
 *
 * 사전 준비:
 *   .env 파일에 PINECONE_API_KEY 설정 필요
 *
 * ⚠️  경고: 이 스크립트는 모든 인덱스 내 벡터 데이터를 영구 삭제합니다.
 *          인덱스 자체(구조)는 유지됩니다.
 */

require('dotenv').config();

const { Pinecone } = require('@pinecone-database/pinecone');
const readline = require('readline');

async function confirm(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

async function main() {
  if (!process.env.PINECONE_API_KEY) {
    console.error('❌ PINECONE_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

  console.log('📋 Pinecone 인덱스 목록 조회 중...');
  const { indexes } = await pc.listIndexes();

  if (!indexes || indexes.length === 0) {
    console.log('ℹ️  삭제할 인덱스가 없습니다.');
    return;
  }

  console.log(`\n발견된 인덱스 (${indexes.length}개):`);
  indexes.forEach((idx) => console.log(`  - ${idx.name} (dimension: ${idx.dimension}, status: ${idx.status?.state})`));

  const ok = await confirm('\n⚠️  위 인덱스들의 모든 벡터 데이터를 영구 삭제하겠습니까? (인덱스 구조는 유지됩니다)');
  if (!ok) {
    console.log('취소되었습니다.');
    return;
  }

  for (const idx of indexes) {
    process.stdout.write(`  🗑️  ${idx.name} 데이터 삭제 중...`);
    await pc.index(idx.name).deleteAll();
    console.log(' 완료');
  }

  console.log(`\n✅ ${indexes.length}개 인덱스의 벡터 데이터 삭제 완료. (인덱스 구조는 유지됨)`);
}

main().catch((err) => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});