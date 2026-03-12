/**
 * 꿈해몽 데이터 처리 유틸리티
 * rebuild-keywords.js / rebuild-embed-text.js 에서 공통 로직 분리
 */

const OpenAI = require('openai');

const GPT_MODEL = 'gpt-4o-mini';

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 환경변수가 없습니다.');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/**
 * 단일 꿈에 대한 keywords 생성 (GPT-4o-mini)
 * @param {string} dream  꿈 내용 텍스트
 * @returns {Promise<string[]>}  4~5개 키워드 배열
 */
async function generateKeywords(dream) {
  const openai = getOpenAI();

  const prompt = `당신은 꿈해몽 검색 서비스의 키워드 전문가입니다.
아래 꿈에 대해 키워드를 4~5개 생성해주세요.

구성 규칙:
- 앞 2개: "핵심명사+꿈" 형태의 직접 검색어 (예: "치아 빠지는 꿈", "이빨 꿈")
- 뒤 2~3개: 구체적 행위나 상황을 담은 구(phrase) (예: "이빨이 흔들리다 빠지다", "치아가 갑자기 떨어지다")

추가 규칙:
- 꿈의 행위, 등장 대상, 상황만 기반으로 작성
- 해석 결과(길몽/흉몽/행운/불길 등 의미)는 절대 포함하지 않음
- "경험하다", "느끼다", "목격하다" 같은 generic 동사로 끝내지 말 것
- 동의어·유사 표현 포함으로 검색 커버리지 확대
- 반드시 아래 JSON 형식으로만 응답 (설명 없이)

꿈: ${dream}

응답 형식:
{"keywords": ["키워드1", "키워드2", "키워드3", "키워드4"]}`;

  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content;
  const parsed = JSON.parse(raw);
  const keywords = parsed.keywords ?? Object.values(parsed)[0];

  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new Error(`GPT 키워드 파싱 실패: ${raw}`);
  }

  return keywords;
}

/**
 * embed_text 구성
 * 구조: "{category} {dream}. {keywords joined}"
 * @param {string} category  카테고리 이름
 * @param {string} dream     꿈 내용
 * @param {string[]} keywords
 * @returns {string}
 */
function buildEmbedText(category, dream, keywords) {
  const keywordText = Array.isArray(keywords) ? keywords.join(' ') : keywords;
  const parts = [];
  if (category) parts.push(category);
  parts.push(`${dream}.`);
  if (keywordText) parts.push(keywordText);
  return parts.join(' ').trim();
}

module.exports = { generateKeywords, buildEmbedText };
