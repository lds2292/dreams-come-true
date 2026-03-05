<template>
  <div class="detail-page">

    <!-- 데이터 없음 -->
    <div v-if="!dream" class="no-data">
      <p class="no-data-emoji">🌙</p>
      <p class="no-data-text">꿈 정보를 불러올 수 없습니다.</p>
      <button class="no-data-btn" @click="router.push('/search')">검색으로 이동</button>
    </div>

    <template v-else>

      <!-- 히어로 섹션 -->
      <div class="hero">
        <button class="back-btn" @click="router.back()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          돌아가기
        </button>
        <div class="hero-stars">
          <span v-for="n in 18" :key="n" class="star" :style="starStyle(n)"></span>
        </div>
        <div class="hero-moon">🌙</div>
        <div class="hero-body">
          <div class="detail-badges">
            <span class="score-badge">✦ 유사도 {{ (dream.score * 100).toFixed(1) }}%</span>
            <span v-for="type in dream.dreamTypes" :key="type" :class="['dream-type-badge', `dt-${type}`]">{{ type }}</span>
          </div>
          <h1 class="detail-title">{{ dream.title }}</h1>
        </div>
      </div>

      <!-- 해몽 섹션 -->
      <div class="sections">
        <div v-if="dream.basic" class="section section-basic" style="--delay:0.05s">
          <div class="section-header">
            <span class="section-icon">📖</span>
            <h2 class="section-title">기본 해몽</h2>
          </div>
          <p class="section-content">{{ dream.basic }}</p>
        </div>
        <div v-if="dream.fortune_telling" class="section section-fortune" style="--delay:0.12s">
          <div class="section-header">
            <span class="section-icon">🔮</span>
            <h2 class="section-title">예지몽 해몽</h2>
          </div>
          <p class="section-content">{{ dream.fortune_telling }}</p>
        </div>
        <div v-if="dream.reality" class="section section-reality" style="--delay:0.19s">
          <div class="section-header">
            <span class="section-icon">🌿</span>
            <h2 class="section-title">현실몽 해몽</h2>
          </div>
          <p class="section-content">{{ dream.reality }}</p>
        </div>
        <div v-if="dream.baby" class="section section-baby" style="--delay:0.26s">
          <div class="section-header">
            <span class="section-icon">🌸</span>
            <h2 class="section-title">태몽 해몽</h2>
          </div>
          <p class="section-content">{{ dream.baby }}</p>
        </div>
        <div v-if="dream.random" class="section section-random" style="--delay:0.33s">
          <div class="section-header">
            <span class="section-icon">🌀</span>
            <h2 class="section-title">잡몽 해몽</h2>
          </div>
          <p class="section-content">{{ dream.random }}</p>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDreamStore } from '../stores/dream.js'

const router = useRouter()
const dreamStore = useDreamStore()
const dream = computed(() => dreamStore.selectedDream)

function starStyle(n) {
  const seed = n * 137.508
  const x = (seed * 31) % 100
  const y = (seed * 17) % 100
  const size = 1 + (n % 3)
  const delay = (n * 0.3) % 3
  const dur = 2 + (n % 2)
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${dur}s`,
  }
}
</script>

<style scoped>
/* ── 전체 ── */
.detail-page {
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
  background: #faf9ff;
  min-height: 100%;
}

/* ── 히어로 ── */
.hero {
  position: relative;
  background: linear-gradient(160deg, #1e0a3c 0%, #3b0764 45%, #5b21b6 100%);
  padding: 0 20px 36px;
  overflow: hidden;
}
.back-btn {
  position: relative;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 6px 14px 6px 10px;
  margin: 12px 0 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.back-btn:active { opacity: 0.7; }
.hero-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  opacity: 0.7;
  animation: twinkle var(--dur, 2s) ease-in-out infinite alternate;
}
@keyframes twinkle {
  from { opacity: 0.2; transform: scale(0.8); }
  to   { opacity: 0.9; transform: scale(1.2); }
}
.hero-moon {
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 52px;
  opacity: 0.18;
  animation: float 4s ease-in-out infinite alternate;
  pointer-events: none;
}
@keyframes float {
  from { transform: translateY(0) rotate(-8deg); }
  to   { transform: translateY(-8px) rotate(4deg); }
}
.hero-body {
  position: relative;
  z-index: 1;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.score-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 20px;
  background: rgba(255,255,255,0.15);
  color: #d8b4fe;
  border: 1px solid rgba(216,180,254,0.4);
  letter-spacing: 0.3px;
}
.dream-type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 20px;
}
.dt-예지몽 { background: rgba(254,249,195,0.2); color: #fde68a; border: 1px solid rgba(253,230,138,0.3); }
.dt-현실몽 { background: rgba(219,234,254,0.2); color: #bfdbfe; border: 1px solid rgba(191,219,254,0.3); }
.dt-태몽   { background: rgba(252,231,243,0.2); color: #fbcfe8; border: 1px solid rgba(251,207,232,0.3); }
.dt-잡몽   { background: rgba(241,245,249,0.2); color: #cbd5e1; border: 1px solid rgba(203,213,225,0.3); }

.detail-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 16px rgba(91,33,182,0.4);
}

/* ── 섹션 ── */
.sections {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 16px 0;
}
.section {
  border-radius: 16px;
  padding: 18px;
  animation: fadeUp 0.4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 섹션별 테마 */
.section-basic   { background: #fff;    border: 1px solid #ede9fe; }
.section-fortune { background: #fffbeb; border: 1px solid #fde68a; }
.section-reality { background: #f0fdf4; border: 1px solid #bbf7d0; }
.section-baby    { background: #fdf2f8; border: 1px solid #f9a8d4; }
.section-random  { background: #f8fafc; border: 1px solid #e2e8f0; }

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.section-icon { font-size: 18px; line-height: 1; }
.section-title {
  font-size: 13px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.2px;
}
.section-basic   .section-title { color: #5b21b6; }
.section-fortune .section-title { color: #92400e; }
.section-reality .section-title { color: #065f46; }
.section-baby    .section-title { color: #9d174d; }
.section-random  .section-title { color: #475569; }

.section-content {
  font-family: 'Noto Serif KR', serif;
  font-size: 14px;
  color: #374151;
  line-height: 1.9;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
}

/* ── 데이터 없음 ── */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
}
.no-data-emoji { font-size: 48px; margin: 0; }
.no-data-text  { font-size: 15px; color: #888; margin: 0; }
.no-data-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: #5b21b6;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
