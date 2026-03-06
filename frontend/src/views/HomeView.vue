<template>
  <div class="home">

    <!-- ───────── 히어로 ───────── -->
    <section class="hero">
      <!-- 배경 장식 레이어 -->
      <div class="hero-bg-layer" aria-hidden="true">
        <div class="hero-radial"></div>
        <!-- 별 파티클 -->
        <span v-for="i in 22" :key="i" class="star" :class="'star-' + i"></span>
        <!-- 달 장식 -->
        <div class="moon-deco">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="28" fill="rgba(255,255,255,0.07)" />
            <path d="M54 26C46 26 40 32.3 40 40C40 47.7 46 54 54 54C49 54 38 50 38 40C38 30 49 26 54 26Z" fill="rgba(255,255,255,0.15)" />
          </svg>
        </div>
      </div>

      <!-- 콘텐츠 -->
      <div class="hero-content">
        <p class="hero-date">{{ todayLabel }}</p>
        <h1 class="hero-title">오늘의 꿈</h1>
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
              placeholder="꿈 내용을 입력해 보세요"
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

        <!-- 최근 검색어 -->
        <div v-if="recentKeywords.length" class="hero-recent">
          <div class="hero-recent-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
            <span>최근 검색</span>
          </div>
          <div class="hero-keywords">
            <button v-for="kw in recentKeywords.slice(0, 5)" :key="kw" class="kw-chip kw-chip-recent" @click="searchQuery = kw; onSearch()">
              {{ kw }}
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- ───────── 꿈해몽 카테고리 ───────── -->
    <section class="section">
      <div class="category-grid">
        <button
          v-for="cat in dreamCategories"
          :key="cat.label"
          class="category-btn"
          @click="onCategoryClick(cat.label)"
        >
          <img :src="cat.icon" :alt="cat.label" class="category-icon" />
          <span class="category-label">{{ cat.label }}</span>
        </button>
      </div>
    </section>

    <!-- ───────── 인기 꿈해몽 (PoC 비노출 — TODO: 활성화) ───────── -->
    <!-- <section class="section">
      <div class="section-head">
        <h2 class="section-title">🔥 인기 꿈해몽</h2>
        <a href="#" class="section-more">더보기</a>
      </div>
      <div class="dream-scroll">
        <div v-for="dream in popularDreams" :key="dream.id" class="dream-card">
          <div class="dream-emoji">{{ dream.emoji }}</div>
          <div class="dream-content">
            <p class="dream-name">{{ dream.title }}</p>
            <p class="dream-summary">{{ dream.summary }}</p>
          </div>
          <span :class="['dream-tag', dream.tagType]">{{ dream.tag }}</span>
        </div>
      </div>
    </section> -->

    <!-- ───────── 오늘의 사주풀이 (PoC 비노출 — TODO: 사주 개인화 후 활성화) ───────── -->
    <!-- <section class="section">
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
    </section> -->

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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 검색
const searchQuery = ref('')
const searchFocused = ref(false)
const recentKeywords = ref([])

onMounted(() => {
  recentKeywords.value = JSON.parse(localStorage.getItem('dct_recent') || '[]')
})

function onSearch() {
  const q = searchQuery.value.trim()
  if (q) router.push({ path: '/search', query: { q } })
}

// 오늘 날짜
const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}요일`
})

// 꿈해몽 카테고리
const dreamCategories = [
  { icon: new URL('@/assets/icons/categ_icon_feel.png', import.meta.url).href, label: '사람/감정' },
  { icon: new URL('@/assets/icons/icon_apple.png',      import.meta.url).href, label: '동물/식물' },
  { icon: new URL('@/assets/icons/icon_act.png',        import.meta.url).href, label: '행동'      },
  { icon: new URL('@/assets/icons/icon_death.png',      import.meta.url).href, label: '죽음/영혼' },
  { icon: new URL('@/assets/icons/icon_sun.png',        import.meta.url).href, label: '자연현상'  },
  { icon: new URL('@/assets/icons/icon_teapot.png',     import.meta.url).href, label: '생활용품'  },
]

function onCategoryClick(category) {
  router.push({ path: '/search', query: { category } })
}

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
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #1e0533 0%, #3b0764 35%, #5b21b6 70%, #6d28d9 100%);
  padding: 0;
  color: #fff;
}

/* 배경 레이어 */
.hero-bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hero-radial {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 80% 20%, rgba(167,139,250,0.25) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 10% 80%, rgba(109,40,217,0.3) 0%, transparent 55%);
}

/* 별 파티클 */
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
}
@keyframes twinkle {
  0%, 100% { opacity: var(--min-op, 0.2); transform: scale(1); }
  50%       { opacity: var(--max-op, 0.9); transform: scale(1.3); }
}

/* 별 위치/크기/속도 개별 정의 */
.star-1  { width:2px; height:2px; top:8%;  left:12%; --dur:2.8s; --delay:0s;    --min-op:0.3; --max-op:1;   }
.star-2  { width:1px; height:1px; top:15%; left:28%; --dur:3.5s; --delay:0.4s;  --min-op:0.2; --max-op:0.8; }
.star-3  { width:2px; height:2px; top:5%;  left:55%; --dur:2.2s; --delay:1.1s;  --min-op:0.4; --max-op:1;   }
.star-4  { width:1px; height:1px; top:20%; left:70%; --dur:4.1s; --delay:0.7s;  --min-op:0.2; --max-op:0.7; }
.star-5  { width:3px; height:3px; top:10%; left:85%; --dur:3.0s; --delay:0.2s;  --min-op:0.3; --max-op:0.9; }
.star-6  { width:1px; height:1px; top:30%; left:8%;  --dur:2.5s; --delay:1.5s;  --min-op:0.2; --max-op:0.6; }
.star-7  { width:2px; height:2px; top:25%; left:40%; --dur:3.8s; --delay:0.9s;  --min-op:0.3; --max-op:0.8; }
.star-8  { width:1px; height:1px; top:18%; left:62%; --dur:2.9s; --delay:1.8s;  --min-op:0.2; --max-op:0.7; }
.star-9  { width:2px; height:2px; top:35%; left:90%; --dur:3.3s; --delay:0.3s;  --min-op:0.3; --max-op:1;   }
.star-10 { width:1px; height:1px; top:42%; left:22%; --dur:4.5s; --delay:2.0s;  --min-op:0.1; --max-op:0.5; }
.star-11 { width:2px; height:2px; top:50%; left:75%; --dur:2.7s; --delay:1.3s;  --min-op:0.3; --max-op:0.9; }
.star-12 { width:1px; height:1px; top:58%; left:48%; --dur:3.6s; --delay:0.6s;  --min-op:0.2; --max-op:0.6; }
.star-13 { width:2px; height:2px; top:12%; left:94%; --dur:2.4s; --delay:2.2s;  --min-op:0.4; --max-op:1;   }
.star-14 { width:1px; height:1px; top:38%; left:5%;  --dur:3.9s; --delay:1.0s;  --min-op:0.2; --max-op:0.7; }
.star-15 { width:2px; height:2px; top:22%; left:50%; --dur:2.6s; --delay:1.7s;  --min-op:0.3; --max-op:0.9; }
.star-16 { width:1px; height:1px; top:45%; left:35%; --dur:4.2s; --delay:0.5s;  --min-op:0.1; --max-op:0.5; }
.star-17 { width:2px; height:2px; top:7%;  left:38%; --dur:3.1s; --delay:2.5s;  --min-op:0.3; --max-op:0.8; }
.star-18 { width:1px; height:1px; top:55%; left:88%; --dur:2.9s; --delay:1.4s;  --min-op:0.2; --max-op:0.7; }
.star-19 { width:3px; height:3px; top:3%;  left:72%; --dur:3.4s; --delay:0.8s;  --min-op:0.4; --max-op:1;   }
.star-20 { width:1px; height:1px; top:60%; left:15%; --dur:4.0s; --delay:1.9s;  --min-op:0.1; --max-op:0.5; }
.star-21 { width:2px; height:2px; top:28%; left:82%; --dur:2.3s; --delay:2.8s;  --min-op:0.3; --max-op:0.9; }
.star-22 { width:1px; height:1px; top:47%; left:58%; --dur:3.7s; --delay:1.2s;  --min-op:0.2; --max-op:0.6; }

/* 달 장식 */
.moon-deco {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 110px;
  height: 110px;
  opacity: 0.6;
  animation: moonFloat 6s ease-in-out infinite;
}
@keyframes moonFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

/* 히어로 콘텐츠 */
.hero-content {
  position: relative;
  z-index: 1;
  padding: 36px 20px 28px;
}

.hero-date {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.65;
  margin: 0 0 12px;
  letter-spacing: 0.8px;
}
.hero-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.25;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 20px rgba(109,40,217,0.6);
}
.hero-sub {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.75;
  margin: 0;
  letter-spacing: 0.2px;
}

/* ── 검색창 ── */
.search-wrap {
  margin-top: 22px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  border-radius: 16px;
  padding: 0 14px;
  height: 52px;
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
  backdrop-filter: blur(8px);
}
.search-box.focused {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.65);
  box-shadow: 0 0 0 3px rgba(167,139,250,0.25);
}
.search-icon {
  color: rgba(255, 255, 255, 0.75);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: #fff;
  caret-color: #c4b5fd;
  min-width: 0;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
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
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  flex-shrink: 0;
  padding: 0;
}

/* ── 최근 검색 & 빠른 키워드 ── */
.hero-recent {
  margin-top: 14px;
}
.hero-recent-header {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}
.hero-keywords {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.kw-chip {
  height: 28px;
  padding: 0 12px;
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-radius: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #ddd6fe;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.kw-chip:active {
  background: rgba(167, 139, 250, 0.28);
  border-color: rgba(167, 139, 250, 0.6);
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
  color: #F2F0FF;
  margin: 0;
}
.section-more {
  font-size: 12px;
  color: #A78BFA;
  text-decoration: none;
}

/* ── 카테고리 ── */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 8px;
  background: #1B1A2E;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 2px 16px rgba(0,0,0,0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.category-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1px 6px rgba(0,0,0,0.2);
  border-color: rgba(167,139,250,0.4);
  background: #221F3A;
}
@media (hover: hover) {
  .category-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(124,58,237,0.2);
    border-color: rgba(167,139,250,0.35);
  }
}
.category-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.category-label {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #C4B5FD;
  letter-spacing: -0.2px;
  white-space: nowrap;
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
  box-shadow: 0 4px 20px rgba(91,33,182,0.08), 0 1px 4px rgba(0,0,0,0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.dream-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 10px rgba(91,33,182,0.06), 0 1px 2px rgba(0,0,0,0.04);
}
@media (hover: hover) {
  .dream-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(91,33,182,0.14), 0 2px 6px rgba(0,0,0,0.08);
  }
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
  background: #1B1A2E;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 14px 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  text-align: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.zodiac-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
@media (hover: hover) {
  .zodiac-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124,58,237,0.2);
    border-color: rgba(167,139,250,0.3);
  }
}
.zodiac-best {
  border-color: rgba(167,139,250,0.35);
  background: linear-gradient(160deg, #221F3A, #1B1A2E);
}
.zodiac-rank {
  position: absolute;
  top: 6px;
  left: 8px;
  font-size: 9px;
  font-weight: 700;
  color: #C4B5FD;
  background: rgba(124,58,237,0.25);
  padding: 1px 5px;
  border-radius: 8px;
}
.zodiac-emoji {
  font-size: 26px;
}
.zodiac-animal {
  font-size: 13px;
  font-weight: 700;
  color: #F2F0FF;
  margin: 0;
}
.zodiac-years {
  font-size: 9px;
  color: #55516E;
  margin: 0;
  letter-spacing: -0.3px;
}
.zodiac-luck {
  font-size: 10px;
  color: #8882A8;
  margin: 2px 0 0;
  line-height: 1.4;
}
.zodiac-stars {
  font-size: 11px;
  letter-spacing: 1px;
}
.star-on  { color: #f59e0b; }
.star-off { color: #2E2C42; }
</style>
