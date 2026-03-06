const { getIndex } = require('../services/pinecone');

// 카테고리별 ID 범위 (data/*.json 파일 불필요)
const ID_RANGES = {
  ACT:    115,
  ANIMAL: 731,
  DEATH:   67,
  NATURE: 257,
  GOODS:  510,
  PERSON: 392,
};
const CATEGORIES = Object.keys(ID_RANGES);

// 날짜 문자열(YYYY-MM-DD) → 시드 정수
function dateToSeed(dateStr) {
  let hash = 5381;
  for (const c of dateStr) {
    hash = ((hash << 5) + hash + c.charCodeAt(0)) >>> 0;
  }
  return hash;
}

// LCG 시드 기반 의사난수 (0 ~ max-1)
function seededRandom(seed, max) {
  const next = ((1664525 * seed + 1013904223) >>> 0);
  return next % max;
}

// 오늘 날짜 시드로 카테고리 + 번호 결정
function pickTodayId(seed) {
  const catIndex = seededRandom(seed,       CATEGORIES.length);
  const category = CATEGORIES[catIndex];
  const num      = seededRandom(seed + 1,   ID_RANGES[category]) + 1;
  return `${category}-${num}`;
}

const daily = async (req, res) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seed  = dateToSeed(today);
  const id    = pickTodayId(seed);

  console.log(`[오늘의 꿈해몽] date=${today}, id=${id}`);

  try {
    const index  = getIndex();
    const result = await index.fetch({ ids: [id] });
    const vector = result.records?.[id] ?? result.vectors?.[id];

    if (!vector) {
      console.error(`[오늘의 꿈해몽] 벡터 없음: id=${id}`);
      return res.status(404).json({ message: '오늘의 꿈해몽을 불러올 수 없습니다.' });
    }

    const m = vector.metadata;
    res.json({
      id,
      title:          m.dream,
      category:       (Array.isArray(m.category) ? m.category[0] : m.category || '').replace(/"/g, '').trim(),
      basic:          m.basic          || null,
      fortune_telling: m.fortune_telling || null,
      reality:        m.reality        || null,
      baby:           m.baby           || null,
      random:         m.random         || null,
      score:          1.0,
      date:           today,
    });
  } catch (err) {
    console.error(`[오늘의 꿈해몽 오류] ${err.message}`);
    res.status(500).json({ message: '오늘의 꿈해몽을 불러올 수 없습니다.' });
  }
};

module.exports = { daily };
