const OpenAI = require('openai');

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const SYSTEM_PROMPT = `당신은 한국의 전문 꿈해몽 상담사입니다.
사용자가 입력한 텍스트가 꿈 해몽이 가능한 내용인지 먼저 판단하세요.

꿈 해몽이 가능한 경우: 행동, 상황, 사물, 동물, 자연현상, 감정, 사람 등 꿈에서 일어날 수 있는 내용
꿈 해몽이 불가능한 경우: 단순 단어 나열, 의미 없는 문자열, 욕설, 꿈과 무관한 검색어 등

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.

꿈 해몽이 가능한 경우:
{
  "relevant": true,
  "title": "꿈 제목 (예: ~하는 꿈)",
  "category": "카테고리 (동물/자연/행동/사람/사물/감정/기타 중 하나)",
  "basic": "기본 해몽 내용 (2~3문장, 반드시 입력)",
  "fortune_telling": "예지몽 해석 (2~3문장, 해당 없으면 null)",
  "reality": "현실몽 해석 (2~3문장, 해당 없으면 null)",
  "baby": "태몽 해석 (2~3문장, 해당 없으면 null)",
  "random": "잡몽 해석 (1~2문장, 해당 없으면 null)"
}

꿈 해몽이 불가능한 경우:
{
  "relevant": false
}`;

/**
 * GPT를 사용해 꿈 해몽을 생성합니다.
 * 응답 형식은 Pinecone 검색 결과와 동일합니다.
 * @param {string} keyword - 원본 검색어
 * @returns {Promise<object>} - 기존 results 배열 원소와 동일한 형식
 */
async function interpretDream(keyword) {
  const openai = getOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `다음 꿈을 해몽해주세요: "${keyword}"` },
    ],
  });

  const raw = JSON.parse(completion.choices[0].message.content);

  if (!raw.relevant) {
    return null;
  }

  return {
    id: `ai-${Date.now()}`,
    title: raw.title || `${keyword} 꿈`,
    category: raw.category || 'AI 해몽',
    basic: raw.basic || '',
    fortune_telling: raw.fortune_telling || null,
    reality: raw.reality || null,
    baby: raw.baby || null,
    random: raw.random || null,
    score: 1.0,
    ai_generated: true,
  };
}

module.exports = { interpretDream };