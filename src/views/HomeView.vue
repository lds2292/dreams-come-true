<template>
  <div class="home">

    <!-- ───────── 히어로 ───────── -->
    <section class="hero">
      <p class="hero-date">{{ todayLabel }}</p>
      <h1 class="hero-title">오늘의 꿈, 오늘의 운세</h1>
      <p class="hero-sub">당신의 꿈이 이루어지는 곳</p>

      <!-- 검색창 -->
      <div class="search-wrap">
        <div class="search-box" :class="{ focused: searchFocused }">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="당신의 꿈해몽을 도와드립니다"
            enterkeyhint="search"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            @keyup.enter="onSearch"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" aria-label="지우기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ───────── 인기 꿈해몽 ───────── -->
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">🔥 인기 꿈해몽</h2>
        <a href="#" class="section-more">더보기</a>
      </div>
      <div class="dream-scroll">
        <div
          v-for="dream in popularDreams"
          :key="dream.id"
          class="dream-card"
        >
          <div class="dream-emoji">{{ dream.emoji }}</div>
          <div class="dream-content">
            <p class="dream-name">{{ dream.title }}</p>
            <p class="dream-summary">{{ dream.summary }}</p>
          </div>
          <span :class="['dream-tag', dream.tagType]">{{ dream.tag }}</span>
        </div>
      </div>
    </section>

    <!-- ───────── 오늘의 사주풀이 ───────── -->
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">🪬 오늘의 사주풀이</h2>
        <a href="#" class="section-more">내 사주 보기</a>
      </div>
      <div class="saju-card">
        <div class="saju-pillars">
          <div v-for="pillar in sajuPillars" :key="pillar.label" class="pillar">
            <span class="pillar-label">{{ pillar.label }}</span>
            <span class="pillar-hanja">{{ pillar.hanja }}</span>
            <span class="pillar-korean">{{ pillar.korean }}</span>
          </div>
        </div>
        <div class="saju-divider"></div>
        <div class="saju-fortune">
          <p class="saju-headline">{{ todaySaju.headline }}</p>
          <p class="saju-body">{{ todaySaju.body }}</p>
        </div>
        <div class="saju-scores">
          <div v-for="score in todaySaju.scores" :key="score.label" class="score-item">
            <span class="score-label">{{ score.label }}</span>
            <div class="score-bar-wrap">
              <div class="score-bar" :style="{ width: score.value + '%', backgroundColor: score.color }"></div>
            </div>
            <span class="score-value">{{ score.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── 십이지신 운세 ───────── -->
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">🐉 십이지신 오늘의 운세</h2>
        <a href="#" class="section-more">전체보기</a>
      </div>
      <div class="zodiac-grid">
        <div
          v-for="zodiac in zodiacList"
          :key="zodiac.animal"
          class="zodiac-card"
          :class="{ 'zodiac-best': zodiac.rank <= 3 }"
        >
          <div class="zodiac-rank" v-if="zodiac.rank <= 3">{{ zodiac.rank }}위</div>
          <span class="zodiac-emoji">{{ zodiac.emoji }}</span>
          <p class="zodiac-animal">{{ zodiac.animal }}</p>
          <p class="zodiac-years">{{ zodiac.years }}</p>
          <p class="zodiac-luck">{{ zodiac.luck }}</p>
          <div class="zodiac-stars">
            <span v-for="i in 5" :key="i" :class="i <= zodiac.stars ? 'star-on' : 'star-off'">★</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 검색
const searchQuery = ref('')
const searchFocused = ref(false)
function onSearch() {
  const q = searchQuery.value.trim()
  if (q) router.push({ path: '/search', query: { q } })
}

// 오늘 날짜
const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}요일`
})

// 인기 꿈해몽
const popularDreams = [
  { id: 1, emoji: '🐍', title: '뱀 꿈',         summary: '재물운이 상승하는 길몽. 사업이나 투자에 좋은 신호.',       tag: '재물', tagType: 'tag-money' },
  { id: 2, emoji: '🌊', title: '물에 빠지는 꿈', summary: '억눌린 감정이 표출되는 신호. 스트레스 해소가 필요한 시기.', tag: '감정', tagType: 'tag-emotion' },
  { id: 3, emoji: '🦷', title: '이가 빠지는 꿈', summary: '가족 중 누군가 어려움을 겪을 수 있으니 주변을 살펴보세요.',  tag: '가족', tagType: 'tag-family' },
  { id: 4, emoji: '🌙', title: '하늘을 나는 꿈', summary: '목표 달성이 가까워진 긍정적인 신호. 자신감을 가지세요.',    tag: '길몽', tagType: 'tag-good' },
  { id: 5, emoji: '🔥', title: '불 꿈',          summary: '열정과 에너지가 넘치는 시기. 새로운 시작에 좋은 징조.',    tag: '길몽', tagType: 'tag-good' },
  { id: 6, emoji: '👶', title: '아기 꿈',         summary: '새로운 시작이나 계획이 성공할 조짐. 태몽일 가능성도 있음.',  tag: '새출발', tagType: 'tag-new' },
  { id: 7, emoji: '💰', title: '돈 줍는 꿈',      summary: '예상치 못한 수입이나 행운이 찾아올 수 있는 길몽.',         tag: '재물', tagType: 'tag-money' },
  { id: 8, emoji: '🐯', title: '호랑이 꿈',       summary: '강력한 지원자나 후원자가 나타날 징조. 대인관계에 주목.',    tag: '대인', tagType: 'tag-relation' },
]

// 오늘의 사주
const sajuPillars = [
  { label: '년주', hanja: '丙午', korean: '병오' },
  { label: '월주', hanja: '甲寅', korean: '갑인' },
  { label: '일주', hanja: '壬子', korean: '임자' },
  { label: '시주', hanja: '庚申', korean: '경신' },
]

const todaySaju = {
  headline: '오늘은 물과 금의 기운이 조화를 이루는 날',
  body: '차분하고 냉철한 판단력이 돋보이는 하루입니다. 중요한 결정이나 계약은 오늘 진행하면 유리하며, 오후 늦게 뜻밖의 좋은 소식이 찾아올 수 있습니다. 대인관계에서는 먼저 손을 내밀면 좋은 결과가 따릅니다.',
  scores: [
    { label: '재물운', value: 82, color: '#f59e0b' },
    { label: '애정운', value: 65, color: '#ec4899' },
    { label: '건강운', value: 74, color: '#10b981' },
    { label: '직장운', value: 90, color: '#6366f1' },
  ]
}

// 십이지신
const zodiacList = [
  { emoji: '🐉', animal: '용',    years: '76·88·00·12·24', luck: '큰 행운이 찾아오는 최고의 날', stars: 5, rank: 1 },
  { emoji: '🐍', animal: '뱀',    years: '77·89·01·13·25', luck: '재물과 지혜가 빛나는 날',      stars: 5, rank: 2 },
  { emoji: '🐉', animal: '말',    years: '78·90·02·14·26', luck: '활기찬 에너지로 앞날이 밝음',   stars: 4, rank: 3 },
  { emoji: '🐭', animal: '쥐',    years: '60·72·84·96·08', luck: '계획한 일이 순탄하게 풀림',    stars: 4, rank: 4 },
  { emoji: '🐯', animal: '호랑이', years: '62·74·86·98·10', luck: '용기 있는 도전이 빛을 발함',   stars: 3, rank: 5 },
  { emoji: '🐰', animal: '토끼',  years: '63·75·87·99·11', luck: '인간관계에서 좋은 소식',        stars: 3, rank: 6 },
  { emoji: '🐑', animal: '양',    years: '55·67·79·91·03', luck: '평온하고 안정적인 하루',        stars: 3, rank: 7 },
  { emoji: '🐒', animal: '원숭이', years: '56·68·80·92·04', luck: '새로운 아이디어가 빛을 발함',   stars: 3, rank: 8 },
  { emoji: '🐔', animal: '닭',    years: '57·69·81·93·05', luck: '성실함이 인정받는 날',          stars: 2, rank: 9 },
  { emoji: '🐶', animal: '개',    years: '58·70·82·94·06', luck: '주변 정리에 집중하세요',        stars: 2, rank: 10 },
  { emoji: '🐷', animal: '돼지',  years: '59·71·83·95·07', luck: '무리한 결정은 미루세요',        stars: 2, rank: 11 },
  { emoji: '🐂', animal: '소',    years: '61·73·85·97·09', luck: '인내심이 필요한 하루',          stars: 1, rank: 12 },
]
</script>

<style scoped>
.home {
  padding-bottom: 24px;
}

/* ── 히어로 ── */
.hero {
  background: linear-gradient(135deg, #3b0764 0%, #5b21b6 60%, #7c3aed 100%);
  padding: 32px 20px 28px;
  color: #fff;
}
.hero-date {
  font-size: 12px;
  opacity: 0.75;
  margin: 0 0 8px;
  letter-spacing: 0.3px;
}
.hero-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}
.hero-sub {
  font-size: 13px;
  opacity: 0.8;
  margin: 0;
}

/* ── 검색창 ── */
.search-wrap {
  margin-top: 20px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  padding: 0 14px;
  height: 50px;
  transition: background 0.2s, border-color 0.2s;
  backdrop-filter: blur(4px);
}
.search-box.focused {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.7);
}
.search-icon {
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: #fff;
  caret-color: #fff;
  min-width: 0;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
/* iOS에서 search 타입 기본 스타일 제거 */
.search-input::-webkit-search-decoration,
.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  flex-shrink: 0;
  padding: 0;
}

/* ── 공통 섹션 ── */
.section {
  padding: 24px 16px 0;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.section-more {
  font-size: 12px;
  color: #7c3aed;
  text-decoration: none;
}

/* ── 인기 꿈해몽 ── */
.dream-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dream-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 14px 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.dream-emoji {
  font-size: 28px;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f3ff;
  border-radius: 12px;
}
.dream-content {
  flex: 1;
  min-width: 0;
}
.dream-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 3px;
}
.dream-summary {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.dream-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.tag-money   { background: #fef3c7; color: #b45309; }
.tag-good    { background: #d1fae5; color: #065f46; }
.tag-emotion { background: #ede9fe; color: #5b21b6; }
.tag-family  { background: #fee2e2; color: #991b1b; }
.tag-new     { background: #dbeafe; color: #1d4ed8; }
.tag-relation{ background: #fce7f3; color: #9d174d; }

/* ── 사주 ── */
.saju-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.saju-pillars {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pillar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: #f5f3ff;
  border-radius: 12px;
  margin: 0 3px;
}
.pillar-label {
  font-size: 10px;
  color: #7c3aed;
  font-weight: 600;
}
.pillar-hanja {
  font-size: 18px;
  font-weight: 800;
  color: #3b0764;
  letter-spacing: -1px;
}
.pillar-korean {
  font-size: 11px;
  color: #555;
}
.saju-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 0 14px;
}
.saju-headline {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}
.saju-body {
  font-size: 13px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 16px;
}
.saju-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.score-label {
  font-size: 12px;
  color: #444;
  width: 36px;
  flex-shrink: 0;
}
.score-bar-wrap {
  flex: 1;
  height: 7px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.score-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.score-value {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  width: 24px;
  text-align: right;
}

/* ── 십이지신 ── */
.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.zodiac-card {
  position: relative;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 14px 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  text-align: center;
}
.zodiac-best {
  border-color: #c4b5fd;
  background: linear-gradient(160deg, #faf5ff, #fff);
}
.zodiac-rank {
  position: absolute;
  top: 6px;
  left: 8px;
  font-size: 9px;
  font-weight: 700;
  color: #7c3aed;
  background: #ede9fe;
  padding: 1px 5px;
  border-radius: 8px;
}
.zodiac-emoji {
  font-size: 26px;
}
.zodiac-animal {
  font-size: 13px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.zodiac-years {
  font-size: 9px;
  color: #999;
  margin: 0;
  letter-spacing: -0.3px;
}
.zodiac-luck {
  font-size: 10px;
  color: #555;
  margin: 2px 0 0;
  line-height: 1.4;
}
.zodiac-stars {
  font-size: 11px;
  letter-spacing: 1px;
}
.star-on  { color: #f59e0b; }
.star-off { color: #e5e7eb; }
</style>
