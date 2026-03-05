const { embedQuery, querySimilar } = require('../services/pinecone');

const search = async (req, res) => {
  const { q, topK = 10 } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ message: '검색어를 입력해주세요.' });
  }

  const keyword = q.trim();
  const startAt = Date.now();
  console.log(`[검색 시작] q="${keyword}", topK=${topK}`);

  try {
    const embedStart = Date.now();
    const vector = await embedQuery(keyword);
    console.log(`[임베딩 완료] ${Date.now() - embedStart}ms`);

    const queryStart = Date.now();
    const matches = await querySimilar(vector, Number(topK));
    console.log(`[Pinecone 조회 완료] ${matches.length}건, ${Date.now() - queryStart}ms`);

    const results = matches.filter((match) => match.score >= 0.5).map((match) => ({
      id: match.id,
      title: match.metadata.dream,
      dream_no: match.metadata.dream_no,
      basic: match.metadata.basic,
      baby: match.metadata.baby,
      random: match.metadata.random,
      reality: match.metadata.reality,
      fortune_telling: match.metadata.fortune_telling,
      score: match.score,
    }));

    console.log(`[검색 완료] 총 ${Date.now() - startAt}ms`);
    res.json({ results, total: results.length });
  } catch (err) {
    console.error(`[검색 오류] ${Date.now() - startAt}ms 경과, 원인: ${err.message}`);
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
};

module.exports = { search };
