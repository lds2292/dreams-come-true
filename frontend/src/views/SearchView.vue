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
      <div class="suggest-label-row">
        <p class="suggest-label">최근 검색어</p>
        <button v-if="recentKeywords.length" class="recent-clear-all" @click="clearRecent">전체 삭제</button>
      </div>
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
        <p class="loading-text">{{ loadingMsg }}</p>
      </div>

      <!-- 결과 있음 -->
      <template v-else-if="results.length">
        <p class="result-count">
          <strong>{{ lastQuery }}</strong> 검색 결과
          <span class="count-badge">{{ results.length }}건</span>
        </p>
        <div class="result-list">
          <div v-for="item in results" :key="item.id" :class="['result-card', { 'result-card-ai': item.aiGenerated }]" @click="goToDetail(item)">
            <div :class="['result-icon', item.aiGenerated ? 'result-icon-ai' : 'result-icon-dream']">
              <component :is="getCardIcon(item)" />
            </div>
            <div class="result-body">
              <div class="result-title-row">
                <p class="result-title" v-html="highlight(item.title)"></p>
                <div class="result-badges">
                  <span v-if="isDebug && !item.aiGenerated" class="score-badge">{{ (item.score * 100).toFixed(1) }}%</span>
                  <span v-if="item.category" class="category-badge">{{ item.category }}</span>
                  <span :class="['tag', item.tagType]">{{ item.tag }}</span>
                </div>
              </div>
              <div v-if="item.dreamTypes.length" class="dream-types">
                <span v-for="type in item.dreamTypes" :key="type" :class="['dream-type-badge', `dt-${type}`]">{{ type }}</span>
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
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/index.js'
import { useDreamStore } from '../stores/dream.js'
import { useSearchStore } from '../stores/search.js'

// ── 검색결과 카드 아이콘 ─────────────────────────────
const S  = '#C4B5FD'
const sw = '1.8'

const IconPerson = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('circle', { cx: '20', cy: '12', r: '5', stroke: S, 'stroke-width': sw }),
  h('path',   { d: 'M9 35c0-6.1 4.9-11 11-11s11 4.9 11 11', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path',   { d: 'M31 10C30 9.5 27 7.5 27 5.5C27 4 28 3.5 29 3.5C30 3.5 30.5 4 31 4.5C31.5 4 32 3.5 33 3.5C34 3.5 35 4 35 5.5C35 7.5 32 9.5 31 10Z', fill: S }),
]) }})

const IconAnimal = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('ellipse', { cx: '20', cy: '27', rx: '7', ry: '8', stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '11', cy: '17', r: '3',   stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '29', cy: '17', r: '3',   stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '15', cy: '11', r: '2.5', stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '25', cy: '11', r: '2.5', stroke: S, 'stroke-width': sw }),
]) }})

const IconAction = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('path', { d: 'M23 5L12 22h10l-5 13L33 17H22L23 5z', stroke: S, 'stroke-width': sw, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
]) }})

const IconDeath = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('path',   { d: 'M20 8c-6.6 0-12 5.4-12 12 0 4 2 7.6 5 9.8V34h14v-4.2c3-2.2 5-5.8 5-9.8 0-6.6-5.4-12-12-12z', stroke: S, 'stroke-width': sw, 'stroke-linejoin': 'round' }),
  h('circle', { cx: '15.5', cy: '21', r: '2', fill: S }),
  h('circle', { cx: '24.5', cy: '21', r: '2', fill: S }),
  h('path',   { d: 'M17 34v2h6v-2', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
]) }})

const IconNature = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('circle', { cx: '20', cy: '20', r: '6', stroke: S, 'stroke-width': sw }),
  ...[[20,5,20,10],[20,30,20,35],[5,20,10,20],[30,20,35,20],
      [9.4,9.4,12.8,12.8],[27.2,27.2,30.6,30.6],
      [30.6,9.4,27.2,12.8],[9.4,30.6,12.8,27.2]].map(([x1,y1,x2,y2]) =>
    h('line', { x1: String(x1), y1: String(y1), x2: String(x2), y2: String(y2), stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' })
  ),
]) }})

const IconGoods = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('path', { d: 'M10 17h18v12c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V17z', stroke: S, 'stroke-width': sw }),
  h('path', { d: 'M28 21h3c1.7 0 3 1.3 3 3s-1.3 3-3 3h-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path', { d: 'M15 13c0-1.2.8-2 .8-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path', { d: 'M20 12c0-1.2.8-2 .8-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path', { d: 'M25 13c0-1.2.8-2 .8-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
]) }})

// 기본(카테고리 불명): 초승달 + 별
const IconDream = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
  h('path',   { d: 'M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z', fill: '#A78BFA' }),
  h('circle', { cx: '18.5', cy: '4.5', r: '1.2', fill: '#C4B5FD' }),
  h('circle', { cx: '15',   cy: '2.5', r: '0.8', fill: '#DDD6FE' }),
  h('circle', { cx: '21',   cy: '8',   r: '0.7', fill: '#C4B5FD' }),
]) }})

const CATEGORY_ICON_MAP = {
  '사람/감정': IconPerson,
  '동물/식물': IconAnimal,
  '행동':      IconAction,
  '죽음/영혼': IconDeath,
  '자연현상':  IconNature,
  '생활용품':  IconGoods,
}

function getCardIcon(item) {
  if (item.aiGenerated) return IconAI
  return CATEGORY_ICON_MAP[item.category] ?? IconDream
}

// AI꿈해몽: 스파클 + 신경망 노드
const IconAI = defineComponent({
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', width: '26', height: '26' }, [
      // 중앙 스파클 (4-pointed star)
      h('path', { d: 'M12 3L13.2 9.8L20 11L13.2 12.2L12 19L10.8 12.2L4 11L10.8 9.8Z', fill: '#60a5fa' }),
      // 작은 스파클 우상단
      h('path', { d: 'M19 2L19.6 4.4L22 5L19.6 5.6L19 8L18.4 5.6L16 5L18.4 4.4Z', fill: '#93c5fd' }),
      // 점 좌하단
      h('circle', { cx: '5', cy: '19', r: '1.2', fill: '#93c5fd' }),
      // 연결선 (노드 느낌)
      h('line', { x1: '6', y1: '18', x2: '10', y2: '14', stroke: '#3b82f6', 'stroke-width': '1', 'stroke-opacity': '0.5', 'stroke-linecap': 'round' }),
    ])
  }
})

const route       = useRoute()
const isDebug     = computed(() => route.query.debug === '1')
const router      = useRouter()
const dreamStore  = useDreamStore()
const searchStore = useSearchStore()

const inputRef  = ref(null)
const focused   = ref(false)
const loading    = ref(false)
const loadingMsg = ref('')

const LOADING_STEPS = [
  { delay: 0,    msg: '꿈속의 기억을 살펴보는 중...' },
  { delay: 1500, msg: '상징과 의미를 찾아보는 중...' },
  { delay: 3000, msg: 'AI가 꿈을 해석하고 있어요...' },
  { delay: 5000, msg: '조금만 기다려 주세요...' },
]

let loadingTimers = []

function startLoadingMessages() {
  loadingMsg.value = LOADING_STEPS[0].msg
  loadingTimers = LOADING_STEPS.slice(1).map(({ delay, msg }) =>
    setTimeout(() => { loadingMsg.value = msg }, delay)
  )
}

function stopLoadingMessages() {
  loadingTimers.forEach(clearTimeout)
  loadingTimers = []
}
const query     = ref(searchStore.query)
const submitted = ref(searchStore.submitted)
const lastQuery = ref(searchStore.lastQuery)
const results   = ref(searchStore.results)

// ── 데이터 ──────────────────────────────────────────
const hotKeywords = ['용꿈', '돼지꿈', '하늘을 나는 꿈', '돈꿈', '이빨꿈']

const recentKeywords = ref(JSON.parse(localStorage.getItem('dct_recent') || '[]'))

const DREAM_TYPE_LABELS = [
  { key: 'fortune_telling', label: '예지몽' },
  { key: 'reality',         label: '현실몽' },
  { key: 'baby',            label: '태몽'   },
  { key: 'random',          label: '잡몽'   },
]

function toCard(d) {
  const basic = d.basic || ''
  const dreamTypes = DREAM_TYPE_LABELS
    .filter(({ key }) => d[key])
    .map(({ label }) => label)
  return {
    id: d.id,
    emoji: '✨',
    title: d.title,
    category: d.category || '',
    tag: d.ai_generated ? 'AI해몽' : '꿈해몽',
    tagType: 'tag-emotion',
    summary: basic.length > 60 ? basic.slice(0, 60) + '…' : basic,
    detail: basic,
    score: d.score ?? 0,
    aiGenerated: d.ai_generated ?? false,
    dreamTypes,
    // 상세 페이지용 원본 필드
    basic: d.basic,
    fortune_telling: d.fortune_telling,
    reality: d.reality,
    baby: d.baby,
    random: d.random,
  }
}

function goToDetail(item) {
  dreamStore.select(item)
  router.push({ name: 'dream-detail', params: { id: item.id } })
}

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

function clearRecent() {
  recentKeywords.value = []
  localStorage.removeItem('dct_recent')
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
  startLoadingMessages()
  saveRecent(q)
  router.replace({ path: '/search', query: { q, ...(isDebug.value ? { debug: '1' } : {}) } })

  try {
    const data = await api.get('/dreams/search', { params: { q } })
    results.value = data.results.map(toCard)
  } catch {
    results.value = []
  } finally {
    stopLoadingMessages()
    loading.value = false
    searchStore.save({ query: query.value, lastQuery: lastQuery.value, results: results.value, submitted: submitted.value })
  }
}

function selectKeyword(kw) {
  query.value = kw
  doSearch()
}

function clearSearch() {
  query.value = ''
  submitted.value = false
  results.value = []
  searchStore.clear()
  inputRef.value?.focus()
  router.replace({ path: '/search' })
}

// ── 초기 진입 (URL 쿼리 처리) ──────────────────────
onMounted(() => {
  const q = route.query.q
  if (q && String(q) === searchStore.lastQuery && searchStore.results.length) {
    // 뒤로가기: 스토어에 동일한 검색 결과가 있으면 복원
    return
  }
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
  background: #111022;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1B1A2E;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0 14px;
  height: 48px;
  transition: border-color 0.2s, background 0.2s;
}
.search-box.focused {
  background: #221F3A;
  border-color: #7c3aed;
}
.search-icon { color: #55516E; flex-shrink: 0; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: #F2F0FF;
  caret-color: #A78BFA;
  min-width: 0;
}
.search-input::placeholder { color: #3D3B55; }
.search-input::-webkit-search-decoration,
.search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: #2E2C42;
  border-radius: 50%;
  cursor: pointer;
  color: #8882A8;
  flex-shrink: 0;
  padding: 0;
}

/* ── 추천/최근 검색어 ── */
.suggest-area { padding: 20px 16px; }
.suggest-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 10px;
}
.suggest-label {
  font-size: 12px;
  font-weight: 700;
  color: #3D3B55;
  letter-spacing: 0.3px;
  margin: 0;
  text-transform: uppercase;
}
.recent-clear-all {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: #55516E;
  cursor: pointer;
}
.suggest-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 6px 14px;
  background: rgba(124,58,237,0.15);
  color: #A78BFA;
  border: 1px solid rgba(124,58,237,0.25);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.chip:active { background: rgba(124,58,237,0.25); }
.recent-list {
  display: flex;
  flex-direction: column;
}
.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.recent-text {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 14px;
  color: #A0A0C8;
  cursor: pointer;
  padding: 0;
}
.recent-text svg { color: #3D3B55; }
.recent-del {
  background: none;
  border: none;
  color: #3D3B55;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.no-recent { font-size: 13px; color: #3D3B55; margin: 8px 0 0; }

/* ── 결과 영역 ── */
.result-area { padding: 0 16px 24px; }
.result-count {
  font-size: 13px;
  color: #55516E;
  margin: 16px 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.result-count strong { color: #F2F0FF; }
.count-badge {
  background: rgba(124,58,237,0.2);
  color: #A78BFA;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
}
.result-list { display: flex; flex-direction: column; gap: 12px; }
.result-card {
  display: flex;
  gap: 14px;
  background: #1B1A2E;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.result-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
@media (hover: hover) {
  .result-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(124,58,237,0.2);
    border-color: rgba(167,139,250,0.25);
  }
}
.result-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}
.result-icon svg {
  width: 28px;
  height: 28px;
}
.result-icon-dream {
  background: #1E1B35;
}
.result-icon-ai {
  background: #111D35;
}
.result-body { flex: 1; min-width: 0; }
.result-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.result-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.score-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 20px;
  background: rgba(16,185,129,0.15);
  color: #34d399;
  border: 1px solid rgba(16,185,129,0.25);
}
.ai-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 20px;
  background: rgba(124,58,237,0.25);
  color: #C4B5FD;
  border: 1px solid rgba(167,139,250,0.35);
  letter-spacing: 0.3px;
}
.result-card-ai {
  border-color: rgba(124,58,237,0.25);
  background: linear-gradient(135deg, #1B1A2E 0%, #1E1A35 100%);
}
.result-title {
  font-size: 15px;
  font-weight: 700;
  color: #F2F0FF;
  margin: 0;
}
.result-title :deep(mark) {
  background: rgba(245,158,11,0.2);
  color: #fbbf24;
  border-radius: 2px;
  padding: 0 1px;
}
.dream-types {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}
.dream-type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}
.dt-예지몽 { background: rgba(245,158,11,0.15); color: #fbbf24; }
.dt-현실몽 { background: rgba(59,130,246,0.15); color: #60a5fa; }
.dt-태몽   { background: rgba(236,72,153,0.15); color: #f472b6; }
.dt-잡몽   { background: rgba(100,116,139,0.15); color: #94a3b8; }

.result-summary {
  font-size: 13px;
  color: #8882A8;
  margin: 0 0 6px;
  line-height: 1.5;
}
.result-detail {
  font-size: 12px;
  color: #55516E;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}
.category-badge {
  font-size: 10px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  color: #6B6888;
}
.tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.tag-money    { background: rgba(245,158,11,0.15); color: #fbbf24; }
.tag-good     { background: rgba(16,185,129,0.15); color: #34d399; }
.tag-emotion  { background: rgba(124,58,237,0.2);  color: #A78BFA; }
.tag-family   { background: rgba(239,68,68,0.15);  color: #f87171; }
.tag-new      { background: rgba(59,130,246,0.15); color: #60a5fa; }
.tag-relation { background: rgba(236,72,153,0.15); color: #f472b6; }

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
  border: 3px solid rgba(124,58,237,0.2);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 14px; color: #55516E; margin: 0; }

/* ── 빈 결과 ── */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px 40px;
}
.empty-emoji { font-size: 48px; margin: 0 0 16px; }
.empty-title { font-size: 17px; font-weight: 700; color: #F2F0FF; margin: 0 0 8px; }
.empty-desc  { font-size: 13px; color: #55516E; line-height: 1.7; margin: 0; }
</style>
