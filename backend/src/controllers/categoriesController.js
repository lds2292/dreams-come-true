const supabase = require('../lib/supabase');

// 대분류 + 소분류 전체 트리 반환
const getTree = async (req, res) => {
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug, icon, display_order')
    .order('display_order');

  if (catErr) return res.status(500).json({ message: '카테고리 조회 오류' });

  const { data: subCategories, error: subErr } = await supabase
    .from('sub_categories')
    .select('id, category_id, name, slug, display_order')
    .order('display_order');

  if (subErr) return res.status(500).json({ message: '소분류 조회 오류' });

  const tree = categories.map((cat) => ({
    ...cat,
    sub_categories: subCategories.filter((s) => s.category_id === cat.id),
  }));

  res.json({ categories: tree });
};

// 특정 카테고리의 꿈 목록
const getDreamsByCategory = async (req, res) => {
  const { slug } = req.params;
  const { sub, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // slug로 category_id 조회
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (catErr || !category) return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });

  let query = supabase
    .from('dreams')
    .select('id, title, summary, rating, basic, baby, random, reality, fortune_telling, sub_category_id, sub_categories(name, slug)', { count: 'exact' })
    .eq('category_id', category.id)
    .order('id')
    .range(offset, offset + Number(limit) - 1);

  // 소분류 필터 (옵션)
  if (sub) {
    const { data: subCat } = await supabase
      .from('sub_categories')
      .select('id')
      .eq('slug', sub)
      .eq('category_id', category.id)
      .single();

    if (subCat) query = query.eq('sub_category_id', subCat.id);
  }

  const { data: dreams, count, error } = await query;

  if (error) return res.status(500).json({ message: '꿈 목록 조회 오류' });

  res.json({ dreams, total: count, page: Number(page), limit: Number(limit) });
};

module.exports = { getTree, getDreamsByCategory };
