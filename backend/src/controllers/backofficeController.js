const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { getIndex, embedTexts } = require('../services/pinecone');
const { generateKeywords, buildEmbedText } = require('../utils/dreamUtils');

// POST /api/backstage/login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (
    !username || !password ||
    username !== process.env.BACKOFFICE_USERNAME ||
    password !== process.env.BACKOFFICE_PASSWORD
  ) {
    return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }

  const token = jwt.sign(
    { username, role: 'backoffice' },
    process.env.BACKOFFICE_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
};

// POST /api/backstage/dreams
const createDream = async (req, res) => {
  const { category_id, sub_category_id, dream, basic, baby, random, reality, fortune_telling } = req.body;

  if (!category_id || !dream || !basic) {
    return res.status(400).json({ message: 'category_id, dream, basic 필드는 필수입니다.' });
  }

  try {
    // 1. 카테고리 정보 조회 (prefix 생성용)
    res.setHeader('X-Accel-Buffering', 'no'); // SSE/streaming 힌트 (일반 응답이므로 무관)
    console.log(`[백오피스] 꿈 등록 시작: "${dream}"`);

    const { data: category, error: catErr } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', category_id)
      .single();

    if (catErr || !category) {
      return res.status(400).json({ message: '카테고리를 찾을 수 없습니다.' });
    }

    const prefix = category.slug.toUpperCase();
    console.log(`[백오피스] 카테고리: ${category.name} (prefix: ${prefix})`);

    // 2. GPT 키워드 생성
    console.log(`[백오피스] 키워드 생성 중...`);
    const keywords = await generateKeywords(dream);
    console.log(`[백오피스] 키워드: ${keywords.join(', ')}`);

    // 3. embed_text 구성
    const embedText = buildEmbedText(category.name, dream, keywords);
    console.log(`[백오피스] embed_text: ${embedText}`);

    // 4. 임베딩 생성
    console.log(`[백오피스] 임베딩 생성 중...`);
    const [vector] = await embedTexts([embedText]);
    console.log(`[백오피스] 임베딩 완료 (dim: ${vector.length})`);

    // 5. dream_no 생성: prefix 기반 최대 번호 조회
    const { data: maxRow, error: maxErr } = await supabase
      .from('dreams')
      .select('dream_no')
      .like('dream_no', `${prefix}-%`)
      .order('dream_no', { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNum = 1;
    if (!maxErr && maxRow) {
      const parts = maxRow.dream_no.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    const dreamNo = `${prefix}-${nextNum}`;
    console.log(`[백오피스] dream_no: ${dreamNo}`);

    // 6. Pinecone upsert
    console.log(`[백오피스] Pinecone upsert 중...`);
    const index = getIndex();
    await index.upsert([{
      id: dreamNo,
      values: vector,
      metadata: {
        dream,
        category: [category.name],
        keywords,
        embed_text: embedText,
        basic,
        baby: baby || '',
        random: random || '',
        reality: reality || '',
        fortune_telling: fortune_telling || '',
      },
    }]);
    console.log(`[백오피스] Pinecone upsert 완료`);

    // 7. Supabase dreams INSERT
    console.log(`[백오피스] Supabase dreams INSERT 중...`);
    const dreamInsertData = {
      dream_no: dreamNo,
      title: dream,
      summary: embedText,
      category_id,
      basic,
    };
    if (sub_category_id) dreamInsertData.sub_category_id = sub_category_id;
    if (baby) dreamInsertData.baby = baby;
    if (random) dreamInsertData.random = random;
    if (reality) dreamInsertData.reality = reality;
    if (fortune_telling) dreamInsertData.fortune_telling = fortune_telling;

    const { data: newDream, error: dreamErr } = await supabase
      .from('dreams')
      .insert(dreamInsertData)
      .select('id')
      .single();

    if (dreamErr) {
      console.error(`[백오피스] dreams INSERT 오류:`, dreamErr.message);
      // Pinecone 롤백 시도
      try { await index.deleteOne(dreamNo); } catch {}
      return res.status(500).json({ message: `Supabase 저장 오류: ${dreamErr.message}` });
    }

    // 8. Supabase dream_vectors INSERT
    console.log(`[백오피스] Supabase dream_vectors INSERT 중...`);
    const { error: vecErr } = await supabase
      .from('dream_vectors')
      .insert({ dream_id: newDream.id, pinecone_id: dreamNo });

    if (vecErr) {
      console.warn(`[백오피스] dream_vectors INSERT 오류 (무시): ${vecErr.message}`);
    }

    console.log(`[백오피스] 꿈 등록 완료: ${dreamNo}`);
    res.json({
      dream_no: dreamNo,
      pinecone_id: dreamNo,
      keywords,
      embed_text: embedText,
      dream_id: newDream.id,
    });
  } catch (err) {
    console.error(`[백오피스] 꿈 등록 오류: ${err.message}`);
    res.status(500).json({ message: `꿈 등록 중 오류가 발생했습니다: ${err.message}` });
  }
};

module.exports = { login, createDream };
