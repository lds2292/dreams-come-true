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
            <span v-for="type in dream.dreamTypes" :key="type" :class="['dream-type-badge', `dt-${type}`]">{{ type }}</span>
          </div>
          <h1 class="detail-title">{{ dream.title }}</h1>
        </div>
      </div>

      <!-- 해몽 섹션 -->
      <div class="sections" ref="sectionsRef">
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

        <!-- 피드백 섹션 -->
        <div class="feedback-section">
          <!-- 미응답 상태 -->
          <template v-if="!feedbackSubmitted">
            <p class="feedback-question">이 꿈해몽이 도움이 되셨나요?</p>
            <div class="feedback-buttons">
              <button class="feedback-btn btn-helpful" @click="submitFeedback(true)">
                👍 도움됐어요
              </button>
              <button class="feedback-btn btn-unhelpful" @click="submitFeedback(false)">
                👎 아쉬워요
              </button>
            </div>
          </template>

          <!-- 응답 완료 상태 -->
          <template v-else>
            <p class="feedback-done-title">감사합니다</p>
            <p class="feedback-done-desc">소중한 피드백이 큰 도움이 됩니다.</p>
          </template>
        </div>

    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDreamStore } from '../stores/dream.js'
import { useSearchStore } from '../stores/search.js'
import api from '../api/index.js'

const router      = useRouter()
const dreamStore  = useDreamStore()
const searchStore = useSearchStore()
const dream       = computed(() => dreamStore.selectedDream)

// ── 피드백 ──────────────────────────────────────────
const FB_KEY = 'dct_fb'
const feedbackSubmitted = ref(false)

function getFeedbackMap() {
  try { return JSON.parse(localStorage.getItem(FB_KEY) || '{}') } catch { return {} }
}

onMounted(() => {
  if (dream.value) {
    feedbackSubmitted.value = !!getFeedbackMap()[dream.value.id]
  }
})

async function submitFeedback(helpful) {
  if (!dream.value || feedbackSubmitted.value) return
  feedbackSubmitted.value = true
  const map = getFeedbackMap()
  map[dream.value.id] = helpful ? 'helpful' : 'unhelpful'
  localStorage.setItem(FB_KEY, JSON.stringify(map))
  try {
    await api.post('/feedback', {
      dreamId:     dream.value.id,
      query:       searchStore.lastQuery,
      helpful,
      aiGenerated: dream.value.aiGenerated ?? false,
    })
  } catch {
    // 피드백 전송 실패는 사용자에게 노출하지 않음
  }
}

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
  background: var(--bg-base);
  min-height: 100%;
}

/* ── 히어로 ── */
.hero {
  position: relative;
  background: linear-gradient(160deg, #4C1D95 0%, #7C3AED 35%, #F9A8D4 75%, #FDE68A 100%);
  padding: 0 20px 36px;
  overflow: hidden;
}
.hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, var(--bg-base));
  pointer-events: none;
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
  background: #ffffff;
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
.dream-type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 20px;
}
.dt-예지몽 { background: rgba(254,249,195,0.3); color: #fde68a; border: 1px solid rgba(253,230,138,0.5); }
.dt-현실몽 { background: rgba(219,234,254,0.3); color: #bfdbfe; border: 1px solid rgba(191,219,254,0.5); }
.dt-태몽   { background: rgba(252,231,243,0.3); color: #fbcfe8; border: 1px solid rgba(251,207,232,0.5); }
.dt-잡몽   { background: rgba(255,255,255,0.2); color: #e2e8f0; border: 1px solid rgba(226,232,240,0.4); }

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
.section-basic   { background: var(--bg-surface); border: 1px solid var(--border-default); border-left: 3px solid var(--color-primary-700); box-shadow: var(--shadow-card); }
.section-fortune { background: var(--bg-surface); border: 1px solid var(--badge-fortune-border); border-left: 3px solid var(--badge-fortune-border); box-shadow: var(--shadow-card); }
.section-reality { background: var(--bg-surface); border: 1px solid var(--badge-reality-border); border-left: 3px solid var(--badge-reality-border); box-shadow: var(--shadow-card); }
.section-baby    { background: var(--bg-surface); border: 1px solid var(--badge-baby-border); border-left: 3px solid var(--badge-baby-border); box-shadow: var(--shadow-card); }
.section-random  { background: var(--bg-surface); border: 1px solid var(--badge-random-border); border-left: 3px solid var(--badge-random-border); box-shadow: var(--shadow-card); }

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
.section-basic   .section-title { color: var(--color-primary-700); }
.section-fortune .section-title { color: var(--badge-fortune-text); }
.section-reality .section-title { color: var(--badge-reality-text); }
.section-baby    .section-title { color: var(--badge-baby-text); }
.section-random  .section-title { color: var(--badge-random-text); }

.section-content {
  font-family: 'Noto Serif KR', serif;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.9;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
}

/* ── 피드백 ── */
.feedback-section {
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}
.feedback-question {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}
.feedback-buttons {
  display: flex;
  gap: 10px;
}
.feedback-btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.feedback-btn:active { transform: scale(0.95); opacity: 0.8; }
.btn-helpful   { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.btn-unhelpful { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }

.feedback-done-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.feedback-done-desc  { font-size: 13px; color: var(--text-muted); margin: 0; }

/* ── 데이터 없음 ── */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
}
.no-data-emoji { font-size: 48px; margin: 0; }
.no-data-text  { font-size: 15px; color: var(--text-muted); margin: 0; }
.no-data-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: var(--color-primary-700);
  color: var(--text-inverse);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
