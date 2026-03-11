<template>
  <div class="category-page">

    <!-- 헤더 -->
    <div class="cat-header">
      <button class="back-btn" @click="router.back()" aria-label="뒤로가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="cat-title-wrap">
        <div class="breadcrumb">
          <span
            class="bc-item"
            :class="selectedSubName ? 'bc-link' : 'bc-active'"
            @click="selectedSubName ? selectSub('') : null"
          >{{ categoryName }}</span>
          <template v-if="selectedSubName">
            <span class="bc-sep">›</span>
            <span class="bc-item bc-active">{{ selectedSubName }}</span>
          </template>
        </div>
        <span class="cat-total">총 {{ total.toLocaleString() }}개</span>
      </div>
    </div>

    <!-- 소분류 탭 -->
    <div v-if="subCategories.length > 0" class="sub-tabs">
      <button
        v-for="sub in [{ slug: '', name: '전체' }, ...subCategories]"
        :key="sub.slug"
        class="sub-tab"
        :class="{ active: selectedSub === sub.slug }"
        @click="selectSub(sub.slug)"
      >{{ sub.name }}</button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading && dreams.length === 0" class="skeleton-list">
      <div v-for="i in 5" :key="i" class="skeleton-card">
        <div class="sk-icon"></div>
        <div class="sk-body">
          <div class="sk-line long"></div>
          <div class="sk-line short"></div>
        </div>
      </div>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="empty-msg">목록을 불러올 수 없습니다.</div>

    <!-- 목록 -->
    <template v-else>
      <div class="dream-list">
        <div
          v-for="dream in dreams"
          :key="dream.id"
          class="dream-card"
          @click="goToDetail(dream)"
        >
          <div class="dream-icon">
            <component :is="CATEGORY_SLUG_MAP[categorySlug] ?? IconDream" />
          </div>
          <div class="dream-body">
            <p class="dream-title">{{ dream.title }}</p>
            <div class="dream-type-badges">
              <span v-if="dream.fortune_telling" class="dt-badge dt-fortune">예지몽</span>
              <span v-if="dream.reality"         class="dt-badge dt-reality">현실몽</span>
              <span v-if="dream.baby"            class="dt-badge dt-baby">태몽</span>
              <span v-if="dream.random"          class="dt-badge dt-random">잡몽</span>
            </div>
            <p class="dream-summary">{{ dream.basic?.slice(0, 55) }}{{ dream.basic?.length > 55 ? '…' : '' }}</p>
          </div>
          <svg class="dream-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      <!-- 더 보기 -->
      <button
        v-if="hasMore"
        class="load-more"
        :disabled="loading"
        @click="loadMore"
      >
        <span v-if="loading">불러오는 중…</span>
        <span v-else>더 보기 ({{ remaining.toLocaleString() }}개 남음)</span>
      </button>

      <p v-else-if="dreams.length > 0" class="list-end">전체 {{ total.toLocaleString() }}개를 모두 확인했습니다.</p>

      <div v-if="dreams.length === 0 && !loading" class="empty-msg">
        해당 카테고리에 꿈해몽이 없습니다.
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated, nextTick, defineOptions } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/index.js'
import { useDreamStore } from '../stores/dream.js'
import { IconDream, CATEGORY_SLUG_MAP } from '../components/icons/categoryIcons.js'

defineOptions({ name: 'CategoryView' })

const DREAM_TYPE_LABELS = [
  { key: 'fortune_telling', label: '예지몽' },
  { key: 'reality',         label: '현실몽' },
  { key: 'baby',            label: '태몽'   },
  { key: 'random',          label: '잡몽'   },
]

const route      = useRoute()
const router     = useRouter()
const dreamStore = useDreamStore()

const categoryName = computed(() => route.query.name || '')
const categorySlug = computed(() => route.query.slug || '')
const LIMIT = 20

const dreams       = ref([])
const total        = ref(0)
const page         = ref(1)
const loading      = ref(false)
const error        = ref(false)
const subCategories = ref([])
const selectedSub  = ref('')

const hasMore        = computed(() => dreams.value.length < total.value)
const remaining      = computed(() => total.value - dreams.value.length)
const selectedSubName = computed(() =>
  subCategories.value.find(s => s.slug === selectedSub.value)?.name ?? ''
)

async function fetchSubCategories() {
  try {
    const data = await api.get('/categories')
    const cat = data.categories.find(c => c.slug === categorySlug.value)
    subCategories.value = cat?.sub_categories ?? []
  } catch { /* 탭 없이 진행 */ }
}

async function fetchPage(pageNum) {
  loading.value = true
  try {
    const params = { page: pageNum, limit: LIMIT }
    if (selectedSub.value) params.sub = selectedSub.value
    const data = await api.get(`/categories/${categorySlug.value}/dreams`, { params })
    total.value = data.total
    dreams.value.push(...data.dreams)
    page.value = pageNum
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function selectSub(slug) {
  if (selectedSub.value === slug) return
  selectedSub.value = slug
  dreams.value = []
  page.value = 1
  total.value = 0
  error.value = false
  fetchPage(1)
}

function loadMore() {
  fetchPage(page.value + 1)
}

function goToDetail(dream) {
  fromDetail = true
  const dreamTypes = DREAM_TYPE_LABELS
    .filter(({ key }) => dream[key])
    .map(({ label }) => label)

  dreamStore.select({
    ...dream,
    tag:         '꿈해몽',
    tagType:     'tag-emotion',
    summary:     (dream.basic || '').slice(0, 60),
    detail:      dream.basic,
    aiGenerated: false,
    dreamTypes,
  })
  router.push({ name: 'dream-detail', params: { id: dream.id } })
}

const savedScroll = ref(0)
let fromDetail = false

onDeactivated(() => {
  const el = document.querySelector('.layout-content')
  if (el) savedScroll.value = el.scrollTop
})

onActivated(() => {
  if (fromDetail) {
    // 상세페이지에서 뒤로가기 → 캐시 유지, 스크롤 복원
    nextTick(() => {
      const el = document.querySelector('.layout-content')
      if (el) el.scrollTop = savedScroll.value
    })
  } else {
    // 홈 등 다른 경로에서 진입 → 초기화 후 재호출
    dreams.value      = []
    subCategories.value = []
    page.value        = 1
    total.value       = 0
    error.value       = false
    selectedSub.value = ''
    fetchSubCategories()
    fetchPage(1)
  }
  fromDetail = false
})

onMounted(() => {
  if (!categorySlug.value) {
    router.replace({ name: 'home' })
    return
  }
  fetchSubCategories()
  fetchPage(1)
})
</script>

<style scoped>
.category-page {
  padding: 0 0 32px;
  min-height: 100%;
}

/* ── 헤더 ── */
.cat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 12px;
  position: sticky;
  top: 0;
  background: #111022;
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.back-btn {
  background: none;
  border: none;
  padding: 4px;
  color: #A78BFA;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.cat-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
}
.bc-item {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.bc-active {
  color: #F2F0FF;
}
.bc-link {
  color: #6B6888;
  cursor: pointer;
}
.bc-link:active {
  color: #A78BFA;
}
.bc-sep {
  font-size: 16px;
  color: #3D3B55;
  line-height: 1;
}
.cat-total {
  font-size: 12px;
  color: #55516E;
}

/* ── 소분류 탭 ── */
.sub-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(167,139,250,0.2);
  background: transparent;
  color: #6B6888;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.sub-tab.active {
  background: #5B21B6;
  border-color: #5B21B6;
  color: #fff;
}

/* ── 스켈레톤 ── */
.skeleton-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skeleton-card {
  background: #1B1A2E;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.sk-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #2E2C42;
  flex-shrink: 0;
}
.sk-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sk-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2E2C42 25%, #3A3858 50%, #2E2C42 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.sk-line.long  { width: 70%; }
.sk-line.short { width: 45%; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── 목록 ── */
.dream-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dream-card {
  background: #1B1A2E;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.dream-card:active {
  background: #22213A;
}
.dream-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1E1B35;
  border-radius: 10px;
  flex-shrink: 0;
}
.dream-body {
  flex: 1;
  min-width: 0;
}
.dream-title {
  font-size: 14px;
  font-weight: 600;
  color: #F2F0FF;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dream-type-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 4px 0;
}
.dt-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}
.dt-fortune { background: rgba(245,158,11,0.15);  color: #fbbf24; }
.dt-baby    { background: rgba(236,72,153,0.15);  color: #f472b6; }
.dt-reality { background: rgba(59,130,246,0.15);  color: #60a5fa; }
.dt-random  { background: rgba(100,116,139,0.15); color: #94a3b8; }

.dream-summary {
  font-size: 12px;
  color: #6B6888;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dream-arrow {
  color: #3D3B55;
  flex-shrink: 0;
}

/* ── 더 보기 / 완료 ── */
.load-more {
  display: block;
  width: calc(100% - 32px);
  margin: 8px 16px 0;
  padding: 14px;
  background: #1B1A2E;
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 12px;
  color: #A78BFA;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.load-more:active:not(:disabled) {
  background: #22213A;
}
.load-more:disabled {
  opacity: 0.5;
  cursor: default;
}
.list-end {
  text-align: center;
  font-size: 12px;
  color: #3D3B55;
  margin: 16px 0 0;
}
.empty-msg {
  text-align: center;
  font-size: 14px;
  color: #55516E;
  padding: 48px 16px;
}
</style>
