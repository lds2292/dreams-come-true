const dreams = require('../data/dreams');

const search = (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ message: '검색어를 입력해주세요.' });
  }

  const keyword = q.trim().toLowerCase();

  const results = dreams.filter((dream) => {
    const titleMatch = dream.title.toLowerCase().includes(keyword);
    const keywordMatch = dream.keywords.some((k) =>
      k.toLowerCase().includes(keyword)
    );
    return titleMatch || keywordMatch;
  });

  res.json({ results, total: results.length });
};

module.exports = { search };
