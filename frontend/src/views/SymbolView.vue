<template>
  <div class="symbol-page">

    <!-- 헤더 -->
    <div class="symbol-header">
      <div class="symbol-icon-wrap">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A78BFA"
             stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12C3.5 6 7.5 3 12 3s8.5 3 11 9c-2.5 6-6.5 9-11 9S3.5 18 1 12z"
                fill="rgba(167,139,250,0.12)"/>
          <circle cx="12" cy="12" r="3.5" fill="rgba(167,139,250,0.3)" stroke="#A78BFA" stroke-width="1.6"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke-width="1.5"/>
          <line x1="5.5" y1="3.5" x2="7" y2="5" stroke-width="1.5"/>
          <line x1="18.5" y1="3.5" x2="17" y2="5" stroke-width="1.5"/>
        </svg>
      </div>
      <h1 class="symbol-title">대표적인 꿈의 상징풀이</h1>
    </div>

    <!-- 설명 카드 -->
    <div class="intro-card">
      <p class="intro-text">
        꿈이란 무의식 속에서 자신도 모르게 심리적인 영향이 형상으로 표출되는 것입니다.<br><br>
        꿈해몽에서 가장 중요한 것은 꿈으로 인해 자신이 느끼는 감정입니다.
        아무리 좋은 상징이 나타나는 꿈이라도 행동과 감정에 따라 꿈이 표현하는 의미가 달라집니다.<br><br>
        꿈에 주로 나타나는 대표적인 상징이 가지고 있는 일반적인 의미를 알려드립니다.
      </p>
    </div>

    <!-- 준비중 팝업 -->
    <Transition name="popup">
      <div v-if="showPopup" class="popup-overlay" @click="showPopup = false">
        <div class="popup-box" @click.stop>
          <div class="popup-emoji">🌙</div>
          <p class="popup-title">곧 만나볼 수 있어요</p>
          <p class="popup-desc">지금 열심히 준비하고 있습니다.<br>조금만 기다려 주세요!</p>
          <button class="popup-close" @click="showPopup = false">확인</button>
        </div>
      </div>
    </Transition>

    <!-- 카테고리 -->
    <div class="symbol-categories">
      <button v-for="cat in categories" :key="cat.id" class="symbol-cat-card" @click="showPopup = true">
        <div class="cat-icon-wrap" :style="{ background: cat.bg }">
          <component :is="cat.icon" />
        </div>
        <div class="cat-body">
          <p class="cat-title">{{ cat.title }}</p>
          <p class="cat-desc">{{ cat.desc }}</p>
        </div>
        <svg class="cat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'

const showPopup = ref(false)

// 태몽: 초승달 + 작은 별 (태아의 탄생)
const IconBaby = defineComponent({
  render: () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: '#F9A8D4', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z', fill: 'rgba(249,168,212,0.2)' }),
    h('circle', { cx: 17, cy: 4, r: 1, fill: '#F9A8D4', stroke: 'none' }),
    h('circle', { cx: 20, cy: 7, r: 0.7, fill: '#F9A8D4', stroke: 'none' }),
    h('circle', { cx: 15, cy: 2, r: 0.6, fill: '#F9A8D4', stroke: 'none' }),
  ])
})

// 예지몽: 수정구슬 (미래를 보는 눈)
const IconProphetic = defineComponent({
  render: () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: '#7DD3FC', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: 12, cy: 11, r: 7, fill: 'rgba(125,211,252,0.15)' }),
    h('path', { d: 'M9 11c0-1.66 1.34-3 3-3', stroke: '#BAE6FD', 'stroke-width': 1.4 }),
    h('circle', { cx: 10.5, cy: 9.5, r: 0.8, fill: '#7DD3FC', stroke: 'none' }),
    h('path', { d: 'M8 20h8M10 18v2M14 18v2', 'stroke-width': 1.6 }),
  ])
})

// 왜 이런 꿈: 물음표 + 생각 구름
const IconWhy = defineComponent({
  render: () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: '#86EFAC', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M8.5 4.5A5 5 0 0 1 17 8c0 3-2.5 4-2.5 6', fill: 'none' }),
    h('path', { d: 'M3 10c0-1.1.9-2 2-2h1a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2z', fill: 'rgba(134,239,172,0.15)' }),
    h('circle', { cx: 14.5, cy: 17, r: 1, fill: '#86EFAC', stroke: 'none' }),
    h('circle', { cx: 19, cy: 5, r: 1.2, fill: 'rgba(134,239,172,0.3)' }),
    h('circle', { cx: 21, cy: 8, r: 0.8, fill: 'rgba(134,239,172,0.2)' }),
  ])
})

// 길몽/흉몽: 저울 (좋고 나쁨의 균형)
const IconLuck = defineComponent({
  render: () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: '#FCD34D', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: 12, y1: 3, x2: 12, y2: 21 }),
    h('path', { d: 'M5 21h14' }),
    h('path', { d: 'M5 8l-3 6a3 3 0 0 0 6 0L5 8z', fill: 'rgba(252,211,77,0.2)' }),
    h('path', { d: 'M19 8l-3 6a3 3 0 0 0 6 0L19 8z', fill: 'rgba(252,211,77,0.1)' }),
    h('path', { d: 'M5 8h14', 'stroke-width': 1.4 }),
  ])
})

const categories = [
  {
    id: 'baby',
    icon: IconBaby,
    title: '태몽일까?',
    desc: '새 생명의 탄생을 예고하는 꿈의 특징',
    bg: 'rgba(249,168,212,0.1)',
  },
  {
    id: 'prophetic',
    icon: IconProphetic,
    title: '어떤 꿈이 예지몽일까?',
    desc: '미래의 일을 암시하는 꿈을 구별하는 법',
    bg: 'rgba(125,211,252,0.1)',
  },
  {
    id: 'why',
    icon: IconWhy,
    title: '왜 이런 꿈을 꾸는 걸까?',
    desc: '꿈이 만들어지는 심리적·신체적 원인',
    bg: 'rgba(134,239,172,0.1)',
  },
  {
    id: 'luck',
    icon: IconLuck,
    title: '길몽일까? 흉몽일까?',
    desc: '좋은 꿈과 나쁜 꿈을 판단하는 기준',
    bg: 'rgba(252,211,77,0.1)',
  },
]
</script>

<style scoped>
.symbol-page {
  padding: 24px 16px 40px;
  min-height: 100%;
}

/* ── 헤더 ── */
.symbol-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  text-align: center;
}
.symbol-icon-wrap {
  width: 64px;
  height: 64px;
  background: var(--color-primary-100);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.symbol-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.3px;
}

/* ── 팝업 ── */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}
.popup-box {
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 32px 24px 24px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-elevated);
}
.popup-emoji {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 4px;
}
.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.popup-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 16px;
  line-height: 1.7;
}
.popup-close {
  width: 100%;
  padding: 14px;
  background: var(--color-primary-700);
  border: none;
  border-radius: 12px;
  color: var(--text-inverse);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.popup-close:active {
  background: var(--color-primary-900);
}

/* 팝업 트랜지션 */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s;
}
.popup-enter-active .popup-box,
.popup-leave-active .popup-box {
  transition: transform 0.2s;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}
.popup-enter-from .popup-box {
  transform: scale(0.9);
}

/* ── 카테고리 ── */
.symbol-categories {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.symbol-cat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  box-shadow: var(--shadow-card);
  transition: background 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.symbol-cat-card:active {
  background: var(--bg-elevated);
  box-shadow: none;
}
.cat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cat-body {
  flex: 1;
  min-width: 0;
}
.cat-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}
.cat-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}
.cat-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ── 소개 카드 ── */
.intro-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-left: 3px solid var(--color-primary-700);
  border-radius: 14px;
  padding: 18px;
  box-shadow: var(--shadow-card);
}
.intro-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}
</style>
