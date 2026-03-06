const { embedQuery, querySimilar } = require('../services/pinecone');
const { applySymonyms } = require('../utils/synonymMap');
const { interpretDream } = require('../services/aiDream');

const search = async (req, res) => {
  const { q, topK = 10 } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ message: '검색어를 입력해주세요.' });
  }

  const keyword = q.trim();
  const normalized = applySymonyms(keyword);
  const startAt = Date.now();
  if (normalized !== keyword) {
    console.log(`[동의어 치환] "${keyword}" → "${normalized}"`);
  }
  console.log(`[검색 시작] q="${normalized}", topK=${topK}`);

  try {
    const embedStart = Date.now();
    const vector = await embedQuery(normalized);
    console.log(`[임베딩 완료] ${Date.now() - embedStart}ms`);

    const queryStart = Date.now();
    const matches = await querySimilar(vector, Number(topK));
    console.log(`[Pinecone 조회 완료] ${matches.length}건, ${Date.now() - queryStart}ms`);

    const results = matches.filter((match) => match.score >= 0.55).map((match) => ({
      id: match.id,
      title: match.metadata.dream,
      dream_no: match.metadata.dream_no,
      category: (Array.isArray(match.metadata.category) ? match.metadata.category[0] : match.metadata.category || '').replace(/"/g, '').trim(),
      basic: match.metadata.basic,
      baby: match.metadata.baby,
      random: match.metadata.random,
      reality: match.metadata.reality,
      fortune_telling: match.metadata.fortune_telling,
      score: match.score,
    }));

    const maxScore = results.length > 0 ? results[0].score : 0;

    // 결과 없음 → AI 단독 폴백
    if (results.length === 0) {
      console.log(`[AI 폴백 시작] q="${keyword}"`);
      const aiStart = Date.now();
      const aiResult = await interpretDream(keyword);
      console.log(`[AI 폴백 완료] ${Date.now() - aiStart}ms`);

      if (!aiResult) {
        console.log(`[무관 검색어] q="${keyword}" — 꿈 해몽 불가 판정, 총 ${Date.now() - startAt}ms`);
        return res.json({ results: [], total: 0 });
      }

      return res.json({ results: [aiResult], total: 1, ai_generated: true });
    }

    // 최고 유사도 75% 미만 → AI 결과를 최상단에 추가
    if (maxScore < 0.75) {
      console.log(`[AI 보강 시작] 최고 유사도 ${(maxScore * 100).toFixed(1)}% < 75%, q="${keyword}"`);
      const aiStart = Date.now();
      const aiResult = await interpretDream(keyword);
      console.log(`[AI 보강 완료] ${Date.now() - aiStart}ms`);

      if (aiResult) {
        console.log(`[검색 완료 + AI 보강] 총 ${Date.now() - startAt}ms`);
        return res.json({ results: [aiResult, ...results], total: results.length + 1 });
      }
    }

    console.log(`[검색 완료] 총 ${Date.now() - startAt}ms`);
    res.json({ results, total: results.length });
  } catch (err) {
    console.error(`[검색 오류] ${Date.now() - startAt}ms 경과, 원인: ${err.message}`);
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
};

module.exports = { search };
