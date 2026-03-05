/**
 * 꿈 데이터에 검색 키워드 자동 추가 스크립트
 *
 * 사용법:
 *   node scripts/add-keywords.js --preview      # 처음 5개만 생성 후 검토
 *   node scripts/add-keywords.js --preview 10   # 처음 N개만 생성 후 검토
 *   node scripts/add-keywords.js                # 전체 생성 (person_pinecone_dreams.json 덮어씀)
 *
 * 출력:
 *   --preview: data/person_pinecone_dreams_preview.json
 *   전체:      data/person_pinecone_dreams.json (원본 덮어씀)
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const OpenAI = require('openai');

const DATA_PATH    = path.resolve(__dirname, '../../data/person_pinecone_dreams.json');
const PREVIEW_PATH = path.resolve(__dirname, '../../data/person_pinecone_dreams_preview.json');

const isPreview   = process.argv.includes('--preview');
const previewSize = parseInt(process.argv[process.argv.indexOf('--preview') + 1]) || 5;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateKeywords(dream, interpretation) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: '당신은 꿈해몽 검색 최적화 전문가입니다. 사용자가 꿈 검색창에 입력할 법한 짧은 키워드를 생성합니다.',
      },
      {
        role: 'user',
        content: `다음 꿈 해몽의 검색 키워드를 생성해줘.

꿈: "${dream}"
해몽: "${interpretation}"

조건:
- 사용자가 검색창에 입력할 만한 짧고 직관적인 키워드
- 꿈 제목의 축약형, 핵심 단어, 유사 표현 포함
- 5개 이내
- JSON 배열 형태로만 응답 (설명 없이): ["키워드1", "키워드2", ...]`,
      },
    ],
  });

  try {
    const text = response.choices[0].message.content.trim();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const dreams = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const targets = isPreview ? dreams.slice(0, previewSize) : dreams;
  const outPath = isPreview ? PREVIEW_PATH : DATA_PATH;

  console.log(`=== 키워드 생성 시작 ===`);
  console.log(`모드: ${isPreview ? `프리뷰 (${previewSize}개)` : `전체 (${dreams.length}개)`}`);
  console.log(`출력: ${outPath}\n`);

  const updated = [];

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const dream = item.metadata.dream;
    const interpretation = Object.values(item.metadata.interpretations)
      .map((v) => v.content)
      .filter(Boolean)
      .join(' ')
      .slice(0, 200); // 토큰 절약

    process.stdout.write(`[${i + 1}/${targets.length}] ${dream} → `);

    const keywords = await generateKeywords(dream, interpretation);
    console.log(JSON.stringify(keywords));

    updated.push({
      ...item,
      metadata: {
        ...item.metadata,
        keywords,
      },
    });
  }

  // 전체 모드면 나머지 항목도 그대로 유지
  const output = isPreview ? updated : updated;

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ 완료: ${outPath}`);
  if (isPreview) {
    console.log('\n프리뷰 파일을 검토한 후 전체 실행:');
    console.log('  node scripts/add-keywords.js');
  }
}

main().catch((err) => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
