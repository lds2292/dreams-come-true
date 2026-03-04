<template>
  <div class="search-page">

    <!-- ── 검색 입력 영역 ── -->
    <div class="search-header">
      <div class="search-box" :class="{ focused: focused }">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          class="search-input"
          placeholder="당신의 꿈해몽을 도와드립니다"
          enterkeyhint="search"
          @focus="focused = true"
          @blur="focused = false"
          @keyup.enter="doSearch"
        />
        <button v-if="query" class="clear-btn" @click="clearSearch" aria-label="지우기">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── 초기 상태: 추천 검색어 ── -->
    <div v-if="!submitted" class="suggest-area">
      <p class="suggest-label">인기 검색어</p>
      <div class="suggest-chips">
        <button
          v-for="kw in hotKeywords"
          :key="kw"
          class="chip"
          @click="selectKeyword(kw)"
        >{{ kw }}</button>
      </div>

      <p class="suggest-label" style="margin-top:20px">최근 검색어</p>
      <div v-if="recentKeywords.length" class="recent-list">
        <div v-for="kw in recentKeywords" :key="kw" class="recent-item">
          <button class="recent-text" @click="selectKeyword(kw)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
            {{ kw }}
          </button>
          <button class="recent-del" @click="removeRecent(kw)" aria-label="삭제">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <p v-else class="no-recent">최근 검색어가 없습니다.</p>
    </div>

    <!-- ── 결과 영역 ── -->
    <div v-else class="result-area">

      <!-- 로딩 -->
      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
        <p class="loading-text">꿈을 해몽하는 중...</p>
      </div>

      <!-- 결과 있음 -->
      <template v-else-if="results.length">
        <p class="result-count">
          <strong>{{ lastQuery }}</strong> 검색 결과
          <span class="count-badge">{{ results.length }}건</span>
        </p>
        <div class="result-list">
          <div v-for="item in results" :key="item.id" class="result-card">
            <div class="result-emoji">{{ item.emoji }}</div>
            <div class="result-body">
              <div class="result-title-row">
                <p class="result-title" v-html="highlight(item.title)"></p>
                <span :class="['tag', item.tagType]">{{ item.tag }}</span>
              </div>
              <p class="result-summary">{{ item.summary }}</p>
              <p class="result-detail">{{ item.detail }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- 결과 없음 -->
      <div v-else class="empty-wrap">
        <p class="empty-emoji">🌙</p>
        <p class="empty-title">검색 결과가 없습니다</p>
        <p class="empty-desc">
          <strong>{{ lastQuery }}</strong>에 대한 꿈해몽 정보를 찾지 못했어요.<br>
          다른 키워드로 검색해 보세요.
        </p>
        <div class="suggest-chips" style="justify-content:center;margin-top:16px">
          <button v-for="kw in hotKeywords.slice(0,4)" :key="kw" class="chip" @click="selectKeyword(kw)">{{ kw }}</button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const inputRef = ref(null)
const query    = ref('')
const focused  = ref(false)
const loading  = ref(false)
const submitted = ref(false)
const lastQuery = ref('')
const results  = ref([])

// ── 데이터 ──────────────────────────────────────────
const hotKeywords = ['뱀 꿈', '돈 줍는 꿈', '이가 빠지는 꿈', '하늘을 나는 꿈', '불 꿈', '호랑이 꿈', '물에 빠지는 꿈', '아기 꿈']

const recentKeywords = ref(JSON.parse(localStorage.getItem('dct_recent') || '[]'))

const allDreams = [
  { id: 1,  emoji: '🐍', title: '뱀 꿈',          tag: '재물',  tagType: 'tag-money',
    summary: '재물운이 상승하는 길몽. 사업이나 투자에 좋은 신호.',
    detail: '뱀은 예로부터 재물과 풍요를 상징합니다. 특히 황금색이나 흰 뱀을 꿈에서 보면 큰 행운이 찾아온다고 전해집니다. 뱀이 나를 물었다면 횡재수가 있을 수 있으며, 뱀이 똬리를 틀고 있으면 지속적인 재물 상승을 의미합니다.' },
  { id: 2,  emoji: '🌊', title: '물에 빠지는 꿈',  tag: '감정',  tagType: 'tag-emotion',
    summary: '억눌린 감정이 표출되는 신호. 스트레스 해소가 필요한 시기.',
    detail: '물은 감정과 무의식을 상징합니다. 물에 빠지는 꿈은 현실에서 벅차고 어려운 상황에 처해 있음을 나타내기도 합니다. 빠져나왔다면 어려움을 극복할 힘이 있다는 뜻이며, 구조를 받았다면 귀인을 만날 징조입니다.' },
  { id: 3,  emoji: '🦷', title: '이가 빠지는 꿈',  tag: '가족',  tagType: 'tag-family',
    summary: '가족 중 누군가 어려움을 겪을 수 있으니 주변을 살펴보세요.',
    detail: '치아는 가족이나 가까운 사람을 상징합니다. 이가 빠지는 꿈은 가족 중 건강이 나빠지거나 안 좋은 일이 생길 수 있다는 경고일 수 있습니다. 하지만 이가 빠진 자리에 새 이가 나오는 꿈이라면 새로운 시작을 의미하기도 합니다.' },
  { id: 4,  emoji: '🌙', title: '하늘을 나는 꿈',  tag: '길몽',  tagType: 'tag-good',
    summary: '목표 달성이 가까워진 긍정적인 신호. 자신감을 가지세요.',
    detail: '하늘을 나는 꿈은 대표적인 길몽으로, 자유·해방·목표 달성을 상징합니다. 높이 날수록 더 큰 성공을 의미하며, 날다가 떨어지는 꿈은 지나친 욕심에 대한 경고를 나타냅니다. 새처럼 날아다니는 꿈은 승진이나 합격의 좋은 징조입니다.' },
  { id: 5,  emoji: '🔥', title: '불 꿈',            tag: '길몽',  tagType: 'tag-good',
    summary: '열정과 에너지가 넘치는 시기. 새로운 시작에 좋은 징조.',
    detail: '불은 열정·정화·변화를 상징합니다. 활활 타오르는 불을 보는 꿈은 사업 번창이나 재물 운을 의미합니다. 집에 불이 나는 꿈도 가정에 좋은 일이 생길 징조로 보는 경우가 많습니다. 단, 불에 타는 꿈은 건강에 주의가 필요한 신호일 수 있습니다.' },
  { id: 6,  emoji: '👶', title: '아기 꿈',          tag: '새출발', tagType: 'tag-new',
    summary: '새로운 시작이나 계획이 성공할 조짐. 태몽일 가능성도 있음.',
    detail: '아기는 새로운 시작·순수함·가능성을 상징합니다. 아기를 안는 꿈은 좋은 소식이 올 징조이며, 예쁜 아기를 보는 꿈은 행운을 뜻합니다. 임산부가 꾸는 아기 꿈은 태몽일 가능성이 높으며, 아기의 성별과 모습으로 아이의 특성을 예측하기도 합니다.' },
  { id: 7,  emoji: '💰', title: '돈 줍는 꿈',       tag: '재물',  tagType: 'tag-money',
    summary: '예상치 못한 수입이나 행운이 찾아올 수 있는 길몽.',
    detail: '돈을 줍는 꿈은 가장 대표적인 재물 길몽입니다. 지폐를 줍는 꿈은 큰 행운을, 동전을 줍는 꿈은 소소한 이익을 의미합니다. 많은 돈을 줍는 꿈일수록 더 큰 행운이 따른다고 전해지며, 복권이나 투자 등 새로운 기회에 도전해볼 만한 시기입니다.' },
  { id: 8,  emoji: '🐯', title: '호랑이 꿈',        tag: '대인',  tagType: 'tag-relation',
    summary: '강력한 지원자나 후원자가 나타날 징조. 대인관계에 주목.',
    detail: '호랑이는 권위·용기·강력한 에너지를 상징합니다. 호랑이를 타는 꿈은 강력한 후원자를 만나거나 높은 자리에 오를 징조입니다. 호랑이가 나를 쫓아오는 꿈은 강한 경쟁자가 나타날 수 있음을 암시하며, 호랑이를 잡는 꿈은 큰 성공을 의미합니다.' },
  { id: 9,  emoji: '🌸', title: '꽃 꿈',            tag: '길몽',  tagType: 'tag-good',
    summary: '아름다운 꽃을 보는 꿈은 행복과 풍요의 시작.',
    detail: '꽃은 아름다움·행복·사랑을 상징합니다. 활짝 핀 꽃을 꿈에서 보면 기쁜 소식이 올 징조이며, 꽃을 받는 꿈은 좋은 사람과의 인연을 의미합니다. 꽃이 지는 꿈은 이별이나 변화를 나타내지만, 새로운 시작의 의미도 있습니다.' },
  { id: 10, emoji: '🦁', title: '사자 꿈',          tag: '대인',  tagType: 'tag-relation',
    summary: '강한 리더십과 권위를 상징. 리더 자리에 오를 징조.',
    detail: '사자는 왕·권위·리더십을 상징합니다. 사자를 보는 꿈은 지도자적 위치에 오를 징조이며, 사자와 함께 있는 꿈은 강력한 후원자를 얻게 됨을 의미합니다. 사자에게 물리는 꿈은 권력 다툼에 주의하라는 경고일 수 있습니다.' },
  { id: 11, emoji: '🌈', title: '무지개 꿈',        tag: '길몽',  tagType: 'tag-good',
    summary: '희망과 행운의 상징. 소원이 이루어질 징조.',
    detail: '무지개는 행운·희망·꿈의 실현을 상징합니다. 무지개를 보는 꿈은 앞으로 좋은 일이 연속해서 일어날 징조입니다. 무지개 아래에 서 있는 꿈은 특히 강한 행운을 나타내며, 시험·취업·사업 등에서 좋은 결과를 기대할 수 있습니다.' },
  { id: 12, emoji: '⭐', title: '별 꿈',            tag: '길몽',  tagType: 'tag-good',
    summary: '빛나는 미래와 재능이 인정받는 시기.',
    detail: '별은 희망·재능·빛나는 미래를 상징합니다. 별이 쏟아지는 꿈은 큰 행운이나 재물이 찾아올 징조입니다. 별을 따는 꿈은 목표 달성, 별이 떨어지는 꿈은 귀인을 만날 인연을 뜻합니다.' },
]

// ── 유틸 ──────────────────────────────────────────
function saveRecent(kw) {
  const list = [kw, ...recentKeywords.value.filter(k => k !== kw)].slice(0, 10)
  recentKeywords.value = list
  localStorage.setItem('dct_recent', JSON.stringify(list))
}

function removeRecent(kw) {
  recentKeywords.value = recentKeywords.value.filter(k => k !== kw)
  localStorage.setItem('dct_recent', JSON.stringify(recentKeywords.value))
}

function highlight(text) {
  if (!lastQuery.value) return text
  const escaped = lastQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(escaped, 'gi'), m => `<mark>${m}</mark>`)
}

// ── 검색 ──────────────────────────────────────────
async function doSearch() {
  const q = query.value.trim()
  if (!q) return
  inputRef.value?.blur()
  lastQuery.value = q
  submitted.value = true
  loading.value = true
  saveRecent(q)
  router.replace({ path: '/search', query: { q } })

  // 검색 시뮬레이션 (실제 API 연동 시 교체)
  await new Promise(r => setTimeout(r, 600))
  results.value = allDreams.filter(d =>
    d.title.includes(q) || d.summary.includes(q) || d.detail.includes(q) || d.tag.includes(q)
  )
  loading.value = false
}

function selectKeyword(kw) {
  query.value = kw
  doSearch()
}

function clearSearch() {
  query.value = ''
  submitted.value = false
  results.value = []
  inputRef.value?.focus()
  router.replace({ path: '/search' })
}

// ── 초기 진입 (URL 쿼리 처리) ──────────────────────
onMounted(() => {
  const q = route.query.q
  if (q) {
    query.value = String(q)
    doSearch()
  } else {
    inputRef.value?.focus()
  }
})
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
}

/* ── 검색 헤더 ── */
.search-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f7;
  border: 1.5px solid transparent;
  border-radius: 14px;
  padding: 0 14px;
  height: 48px;
  transition: border-color 0.2s, background 0.2s;
}
.search-box.focused {
  background: #fff;
  border-color: #7c3aed;
}
.search-icon { color: #999; flex-shrink: 0; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: #111;
  caret-color: #7c3aed;
  min-width: 0;
}
.search-input::placeholder { color: #aaa; }
.search-input::-webkit-search-decoration,
.search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: #ddd;
  border-radius: 50%;
  cursor: pointer;
  color: #555;
  flex-shrink: 0;
  padding: 0;
}

/* ── 추천/최근 검색어 ── */
.suggest-area { padding: 20px 16px; }
.suggest-label {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  letter-spacing: 0.3px;
  margin: 0 0 10px;
  text-transform: uppercase;
}
.suggest-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 6px 14px;
  background: #f5f3ff;
  color: #5b21b6;
  border: 1px solid #ddd6fe;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.chip:active { background: #ede9fe; }
.recent-list {
  display: flex;
  flex-direction: column;
}
.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.recent-text {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  padding: 0;
}
.recent-text svg { color: #bbb; }
.recent-del {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.no-recent { font-size: 13px; color: #bbb; margin: 8px 0 0; }

/* ── 결과 영역 ── */
.result-area { padding: 0 16px 24px; }
.result-count {
  font-size: 13px;
  color: #666;
  margin: 16px 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.result-count strong { color: #111; }
.count-badge {
  background: #ede9fe;
  color: #5b21b6;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
}
.result-list { display: flex; flex-direction: column; gap: 12px; }
.result-card {
  display: flex;
  gap: 14px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.result-emoji {
  font-size: 30px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f3ff;
  border-radius: 12px;
  flex-shrink: 0;
}
.result-body { flex: 1; min-width: 0; }
.result-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.result-title {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.result-title :deep(mark) {
  background: #fef3c7;
  color: #92400e;
  border-radius: 2px;
  padding: 0 1px;
}
.result-summary {
  font-size: 13px;
  color: #555;
  margin: 0 0 6px;
  line-height: 1.5;
}
.result-detail {
  font-size: 12px;
  color: #888;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}
.tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.tag-money    { background: #fef3c7; color: #b45309; }
.tag-good     { background: #d1fae5; color: #065f46; }
.tag-emotion  { background: #ede9fe; color: #5b21b6; }
.tag-family   { background: #fee2e2; color: #991b1b; }
.tag-new      { background: #dbeafe; color: #1d4ed8; }
.tag-relation { background: #fce7f3; color: #9d174d; }

/* ── 로딩 ── */
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 16px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #ede9fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 14px; color: #888; margin: 0; }

/* ── 빈 결과 ── */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px 40px;
}
.empty-emoji { font-size: 48px; margin: 0 0 16px; }
.empty-title { font-size: 17px; font-weight: 700; color: #111; margin: 0 0 8px; }
.empty-desc  { font-size: 13px; color: #777; line-height: 1.7; margin: 0; }
</style>
