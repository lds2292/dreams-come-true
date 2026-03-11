/**
 * data/*.json 파일의 id를 배열 순서 기준으로 재부여
 * PERSON-1, PERSON-2, ... / ANIMAL-1, ANIMAL-2, ...
 */

const path = require('path');
const fs = require('fs');

const FILES = ['PERSON', 'ANIMAL', 'ACT', 'GOODS', 'DEATH', 'NATURE'];
const DATA_DIR = path.resolve(__dirname, '../../../data');

for (const prefix of FILES) {
  const filePath = path.join(DATA_DIR, `${prefix}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const updated = data.map((item, i) => ({
    ...item,
    id: `${prefix}-${i + 1}`,
  }));

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`${prefix}: ${updated.length}개 id 재부여 완료`);
}

console.log('\n✅ 전체 완료');
