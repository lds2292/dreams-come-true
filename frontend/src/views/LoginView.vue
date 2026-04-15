<template>
  <div class="login-page">

    <!-- 상단 뒤로가기 -->
    <button class="back-btn" @click="$router.back()" aria-label="뒤로가기">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <!-- 로고 & 타이틀 -->
    <div class="login-hero">
      <div class="login-logo">🌙</div>
      <h1 class="login-title">꿈해몽 사전</h1>
      <p class="login-sub">꿈과 운세의 모든 것</p>
    </div>

    <!-- 폼 -->
    <form class="login-form" @submit.prevent="onSubmit" novalidate>

      <!-- 이메일 -->
      <div class="field" :class="{ error: errors.email }">
        <label class="field-label">이메일</label>
        <div class="input-wrap" :class="{ focused: focusedField === 'email' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <input
            v-model="form.email"
            type="email"
            class="field-input"
            placeholder="example@email.com"
            inputmode="email"
            autocomplete="email"
            @focus="focusedField = 'email'"
            @blur="focusedField = ''; validateEmail()"
          />
        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>

      <!-- 비밀번호 -->
      <div class="field" :class="{ error: errors.password }">
        <label class="field-label">비밀번호</label>
        <div class="input-wrap" :class="{ focused: focusedField === 'password' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            v-model="form.password"
            :type="showPw ? 'text' : 'password'"
            class="field-input"
            placeholder="비밀번호를 입력하세요"
            autocomplete="current-password"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''; validatePassword()"
          />
          <button type="button" class="pw-toggle" @click="showPw = !showPw" :aria-label="showPw ? '숨기기' : '보기'">
            <svg v-if="!showPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>

      <!-- 로그인 실패 에러 -->
      <div v-if="loginError" class="login-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ loginError }}
      </div>

      <!-- 로그인 버튼 -->
      <button type="submit" class="submit-btn" :disabled="loading">
        <span v-if="loading" class="btn-spinner"></span>
        <span>{{ loading ? '로그인 중...' : '로그인' }}</span>
      </button>

      <!-- 비밀번호 찾기 -->
      <div class="form-links">
        <a href="#" class="form-link">비밀번호 찾기</a>
        <span class="dot-divider">·</span>
        <RouterLink to="/signup" class="form-link">회원가입</RouterLink>
      </div>
    </form>

    <!-- 소셜 로그인 -->
    <div class="social-section">
      <div class="social-divider">
        <span class="divider-line"></span>
        <span class="divider-text">간편 로그인</span>
        <span class="divider-line"></span>
      </div>
      <div class="social-btns">
        <button class="social-btn kakao" @click="socialLogin('kakao')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 11c0 2.89 1.617 5.426 4.053 6.974l-.978 3.617a.25.25 0 0 0 .379.276L9.64 19.54A11.3 11.3 0 0 0 12 19.8c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/></svg>
          카카오 로그인
        </button>
        <button class="social-btn naver" @click="socialLogin('naver')">
          <span class="naver-n">N</span>
          네이버 로그인
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const focusedField = ref('')
const showPw    = ref(false)
const loading   = ref(false)
const loginError = ref('')

function validateEmail() {
  if (!form.email) {
    errors.email = '이메일을 입력해 주세요.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.'
  } else {
    errors.email = ''
  }
}

function validatePassword() {
  if (!form.password) {
    errors.password = '비밀번호를 입력해 주세요.'
  } else if (form.password.length < 6) {
    errors.password = '비밀번호는 6자 이상이어야 합니다.'
  } else {
    errors.password = ''
  }
}

async function onSubmit() {
  validateEmail()
  validatePassword()
  if (errors.email || errors.password) return

  loginError.value = ''
  loading.value = true

  // 로그인 API 연동 전 임시 처리
  await new Promise(r => setTimeout(r, 800))

  // 테스트 계정: test@test.com / 123456
  if (form.email === 'test@test.com' && form.password === '123456') {
    auth.login({ email: form.email, name: '드림유저', id: 1 })
    router.replace('/')
  } else {
    loginError.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
  }
  loading.value = false
}

function socialLogin(provider) {
  // 소셜 로그인 API 연동 자리
  console.log('social login:', provider)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
  padding: 0 24px 40px;
  max-width: 600px;
  margin: 0 auto;
}

/* ── 뒤로가기 ── */
.back-btn {
  margin-top: 12px;
  align-self: flex-start;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #333;
  border-radius: 50%;
}
.back-btn:active { background: #f5f5f5; }

/* ── 히어로 ── */
.login-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 36px;
  gap: 8px;
}
.login-logo  { font-size: 48px; line-height: 1; }
.login-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.5px; }
.login-sub   { font-size: 13px; color: var(--text-muted); margin: 0; }

/* ── 폼 ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid var(--border-default);
  border-radius: 12px;
  padding: 0 14px;
  height: 52px;
  background: var(--bg-surface);
  transition: border-color 0.2s, background 0.2s;
}
.input-wrap.focused {
  border-color: var(--color-primary-700);
  background: var(--bg-surface);
}
.field.error .input-wrap { border-color: #ef4444; }
.input-icon { color: #bbb; flex-shrink: 0; }
.field-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: var(--text-primary);
  caret-color: var(--color-primary-700);
  min-width: 0;
}
.field-input::placeholder { color: var(--text-disabled); }
.pw-toggle {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  padding: 0;
  flex-shrink: 0;
}
.field-error {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
  padding-left: 4px;
}

/* ── 로그인 에러 ── */
.login-error {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff1f2;
  color: #be123c;
  font-size: 13px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #fecdd3;
}

/* ── 제출 버튼 ── */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 54px;
  background: var(--color-primary-700);
  color: var(--text-inverse);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.15s;
}
.submit-btn:active:not(:disabled) { background: var(--color-primary-900); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── 하단 링크 ── */
.form-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.form-link    { font-size: 13px; color: var(--text-muted); text-decoration: none; }
.dot-divider  { color: var(--border-default); font-size: 12px; }

/* ── 소셜 로그인 ── */
.social-section { margin-top: 28px; }
.social-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.divider-line { flex: 1; height: 1px; background: var(--border-default); }
.divider-text { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
.social-btns  { display: flex; flex-direction: column; gap: 10px; }
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.social-btn:active { opacity: 0.8; }
.kakao { background: #FEE500; color: #191919; }
.naver { background: #03C75A; color: #fff; }
.naver-n { font-size: 15px; font-weight: 900; }
</style>
