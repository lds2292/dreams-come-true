<template>
  <div class="subcategory-page">

    <!-- 헤더 -->
    <div class="sub-header">
      <button class="back-btn" @click="router.back()" aria-label="뒤로가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="header-text">
        <p class="header-hint">카테고리</p>
        <h1 class="header-title">{{ categoryName }}</h1>
      </div>
    </div>

    <!-- 로딩 스켈레톤 -->
    <div v-if="loading" class="grid-wrap">
      <div class="all-card sk-pulse"></div>
      <div class="sub-grid">
        <div v-for="i in 6" :key="i" class="sub-card sk-pulse"></div>
      </div>
    </div>

    <!-- 소분류 없음 → 바로 전체 이동 안내 -->
    <div v-else-if="subCategories.length === 0" class="empty-wrap">
      <p class="empty-text">소분류가 없습니다.</p>
      <button class="goto-all-btn" @click="goToCategory('')">전체 목록 보기</button>
    </div>

    <!-- 소분류 선택 그리드 -->
    <div v-else class="grid-wrap">

      <!-- 전체 보기 카드 -->
      <button class="all-card" @click="goToCategory('')">
        <div class="all-icon">
          <component :is="categoryIcon" />
        </div>
        <div class="all-body">
          <span class="all-label">전체 보기</span>
          <span class="all-desc">{{ categoryName }} 전체 꿈 목록</span>
        </div>
        <svg class="card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <!-- 소분류 그리드 -->
      <div class="sub-grid">
        <button
          v-for="sub in subCategories"
          :key="sub.slug"
          class="sub-card"
          @click="goToCategory(sub.slug, sub.name)"
        >
          <span class="sub-name">{{ sub.name }}</span>
          <svg class="sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/index.js'
import { IconDream, CATEGORY_SLUG_MAP } from '../components/icons/categoryIcons.js'

const route  = useRoute()
const router = useRouter()

const categoryName = computed(() => route.query.name || '')
const categorySlug = computed(() => route.query.slug || '')
const categoryIcon = computed(() => CATEGORY_SLUG_MAP[categorySlug.value] ?? IconDream)

const subCategories = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!categorySlug.value) {
    router.replace({ name: 'home' })
    return
  }
  try {
    const data = await api.get('/categories')
    const cat = data.categories.find(c => c.slug === categorySlug.value)
    subCategories.value = cat?.sub_categories ?? []
  } catch {
    subCategories.value = []
  } finally {
    loading.value = false
  }
})

function goToCategory(subSlug, subName) {
  const query = { slug: categorySlug.value, name: categoryName.value }
  if (subSlug) {
    query.sub = subSlug
    query.subName = subName
  }
  router.push({ name: 'category-list', query })
}
</script>

<style scoped>
.subcategory-page {
  padding: 0 0 40px;
  min-height: 100%;
}

/* ── 헤더 ── */
.sub-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 14px;
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
  -webkit-tap-highlight-color: transparent;
}
.header-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.header-hint {
  font-size: 11px;
  color: #55516E;
  margin: 0;
  font-weight: 500;
}
.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #F2F0FF;
  margin: 0;
}

/* ── 그리드 래퍼 ── */
.grid-wrap {
  padding: 20px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── 전체 보기 카드 ── */
.all-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #1E1B35, #251F40);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.all-card:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #251F40, #2D2550);
}
.all-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 14px;
  flex-shrink: 0;
}
.all-icon :deep(svg) {
  width: 32px;
  height: 32px;
}
.all-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.all-label {
  font-size: 15px;
  font-weight: 700;
  color: #F2F0FF;
}
.all-desc {
  font-size: 12px;
  color: #6B6888;
}
.card-arrow {
  color: #4A4766;
  flex-shrink: 0;
}

/* ── 소분류 그리드 ── */
.sub-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.sub-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1B1A2E;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
  gap: 8px;
}
.sub-card:active {
  background: #22213A;
  border-color: rgba(167, 139, 250, 0.3);
  transform: scale(0.97);
}
.sub-name {
  font-size: 14px;
  font-weight: 600;
  color: #C4B5FD;
  line-height: 1.4;
  flex: 1;
}
.sub-arrow {
  color: #3D3B55;
  flex-shrink: 0;
}

/* ── 스켈레톤 ── */
.sk-pulse {
  animation: pulse 1.4s ease-in-out infinite;
}
.sk-pulse.all-card {
  height: 84px;
  background: #1B1A2E;
  border-color: transparent;
}
.sk-pulse.sub-card {
  height: 56px;
  background: #1B1A2E;
  border-color: transparent;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── 빈 상태 ── */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 16px;
}
.empty-text {
  font-size: 14px;
  color: #55516E;
  margin: 0;
}
.goto-all-btn {
  padding: 10px 24px;
  background: #5B21B6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}
</style>
