<template>
  <nav class="app-navbar">
    <div class="navbar-inner">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        :aria-label="item.label"
      >
        <div class="nav-icon">
          <component :is="item.icon" :active="isActive(item.to)" />
        </div>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { defineComponent, h } from 'vue'

const route = useRoute()

const isActive = (path) => route.path === path

// 아이콘 컴포넌트 인라인 정의
const IconHome = defineComponent({
  props: { active: Boolean },
  setup(props) {
    return () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', fill: props.active ? 'currentColor' : 'none' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' })
    ])
  }
})

const IconSearch = defineComponent({
  props: { active: Boolean },
  setup() {
    return () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: 11, cy: 11, r: 8 }),
      h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
    ])
  }
})

// 상징: 눈 안에 별 — 꿈 속 의미를 꿰뚫어 보는 통찰
const IconSymbol = defineComponent({
  props: { active: Boolean },
  setup(props) {
    return () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      // 눈 외곽
      h('path', { d: 'M1 12C3.5 6 7.5 3 12 3s8.5 3 11 9c-2.5 6-6.5 9-11 9S3.5 18 1 12z',
        fill: props.active ? 'rgba(109,40,217,0.12)' : 'none' }),
      // 홍채
      h('circle', { cx: 12, cy: 12, r: 3.5,
        fill: props.active ? 'currentColor' : 'none',
        stroke: 'currentColor', 'stroke-width': 1.8 }),
      // 별 빛 (상단)
      h('line', { x1: 12, y1: 1, x2: 12, y2: 3, 'stroke-width': 1.5 }),
      // 별 빛 (좌상)
      h('line', { x1: 5.5, y1: 3.5, x2: 7, y2: 5, 'stroke-width': 1.5 }),
      // 별 빛 (우상)
      h('line', { x1: 18.5, y1: 3.5, x2: 17, y2: 5, 'stroke-width': 1.5 }),
    ])
  }
})

const IconUser = defineComponent({
  props: { active: Boolean },
  setup(props) {
    return () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', fill: props.active ? 'currentColor' : 'none' }),
      h('circle', { cx: 12, cy: 7, r: 4, fill: props.active ? 'currentColor' : 'none' })
    ])
  }
})

// TODO: 로그인 기능 구현 후 마이페이지 재활성화
// { name: 'my', label: '마이페이지', to: '/my', icon: IconUser },
const navItems = [
  { name: 'home',   label: '홈',   to: '/',       icon: IconHome },
  { name: 'search', label: '검색', to: '/search', icon: IconSearch },
  { name: 'symbol', label: '상징', to: '/symbol', icon: IconSymbol },
]
</script>

<style scoped>
.app-navbar {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-default);
  /* 홈바 safe area */
  padding-bottom: env(safe-area-inset-bottom);
}

.navbar-inner {
  display: flex;
  align-items: stretch;
  height: 56px;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-disabled);
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.nav-item.active {
  color: var(--color-primary-700);
}

.nav-item:active {
  opacity: 0.7;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: -0.2px;
}

.nav-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 18px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
