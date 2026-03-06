const { getIndex } = require('../services/pinecone');

const MAX_PAGE = 10; // 최대 100건까지만 접근 허용

const CATEGORY_MAP = {
  '사람/감정': { prefix: 'PERSON', max: 392 },
  '동물/식물': { prefix: 'ANIMAL', max: 731 },
  '행동':      { prefix: 'ACT',    max: 115 },
  '죽음/영혼': { prefix: 'DEATH',  max:  67 },
  '자연현상':  { prefix: 'NATURE', max: 257 },
  '생활용품':  { prefix: 'GOODS',  max: 510 },
};

const category = async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;

  const meta = CATEGORY_MAP[name];
  if (!meta) {
    return res.status(400).json({ message: '알 수 없는 카테고리입니다.' });
  }

  const pageNum  = Math.max(1, parseInt(page));
  if (pageNum > MAX_PAGE) {
    return res.status(403).json({ message: `최대 ${MAX_PAGE}페이지까지만 조회할 수 있습니다.` });
  }
  const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
  const start    = (pageNum - 1) * limitNum + 1;

  if (start > meta.max) {
    return res.json({ results: [], total: meta.max, page: pageNum, limit: limitNum });
  }

  const end = Math.min(start + limitNum - 1, meta.max);
  const ids = Array.from({ length: end - start + 1 }, (_, i) => `${meta.prefix}-${start + i}`);

  console.log(`[카테고리 조회] name="${name}", page=${pageNum}, ids=${ids[0]}~${ids[ids.length - 1]}`);

  try {
    const index   = getIndex();
    const result  = await index.fetch({ ids });
    const records = result.records ?? result.vectors ?? {};

    const results = ids
      .filter(id => records[id])
      .map(id => {
        const m = records[id].metadata;
        return {
          id,
          title:           m.dream,
          category:        (Array.isArray(m.category) ? m.category[0] : m.category || '').replace(/"/g, '').trim(),
          basic:           m.basic           || null,
          fortune_telling: m.fortune_telling || null,
          reality:         m.reality         || null,
          baby:            m.baby            || null,
          random:          m.random          || null,
          score:           1.0,
        };
      });

    res.json({ results, total: meta.max, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(`[카테고리 조회 오류] ${err.message}`);
    res.status(500).json({ message: '카테고리 목록을 불러올 수 없습니다.' });
  }
};

module.exports = { category };
