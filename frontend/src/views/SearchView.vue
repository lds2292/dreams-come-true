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
import api from '../api/index.js'

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
const hotKeywords = ['용꿈', '돼지꿈', '뱀꿈', '이빨꿈', '물꿈']

const recentKeywords = ref(JSON.parse(localStorage.getItem('dct_recent') || '[]'))

const EMOJI_MAP = { 용꿈: '🐉', 돼지꿈: '🐷', 뱀꿈: '🐍', 이빨꿈: '🦷', 물꿈: '🌊' }
const TAG_TYPE_MAP = { 길몽: 'tag-good', 흉몽: 'tag-family', '길몽/흉몽': 'tag-emotion' }

function toCard(d) {
  return {
    id: d.id,
    emoji: EMOJI_MAP[d.title] ?? '✨',
    title: d.title,
    tag: d.category,
    tagType: TAG_TYPE_MAP[d.category] ?? 'tag-good',
    summary: d.summary,
    detail: d.interpretation,
  }
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

  try {
    const data = await api.get('/dreams/search', { params: { q } })
    results.value = data.results.map(toCard)
  } catch {
    results.value = []
  } finally {
    loading.value = false
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
  box-shadow: 0 4px 20px rgba(91,33,182,0.08), 0 1px 4px rgba(0,0,0,0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.result-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 10px rgba(91,33,182,0.06), 0 1px 2px rgba(0,0,0,0.04);
}
@media (hover: hover) {
  .result-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(91,33,182,0.14), 0 2px 6px rgba(0,0,0,0.08);
  }
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
