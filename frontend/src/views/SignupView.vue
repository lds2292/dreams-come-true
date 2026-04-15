<template>
  <div class="signup-page">

    <!-- 뒤로가기 -->
    <button class="back-btn" @click="$router.back()" aria-label="뒤로가기">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <!-- 타이틀 -->
    <div class="signup-hero">
      <div class="signup-logo">🌙</div>
      <h1 class="signup-title">회원가입</h1>
      <p class="signup-sub">꿈해몽 사전과 함께 꿈을 이루어보세요</p>
    </div>

    <!-- 단계 표시 -->
    <div class="steps">
      <div v-for="i in 2" :key="i" class="step-item">
        <div class="step-circle" :class="{ active: step === i, done: step > i }">
          <svg v-if="step > i" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-else>{{ i }}</span>
        </div>
        <span class="step-label">{{ i === 1 ? '계정 정보' : '추가 정보' }}</span>
      </div>
      <div class="step-line"></div>
    </div>

    <!-- ── STEP 1: 계정 정보 ── -->
    <form v-if="step === 1" class="signup-form" @submit.prevent="goStep2" novalidate>

      <!-- 이름 -->
      <div class="field" :class="{ error: errors.name }">
        <label class="field-label">이름</label>
        <div class="input-wrap" :class="{ focused: focused === 'name' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <input v-model="form.name" type="text" class="field-input" placeholder="홍길동"
            autocomplete="name" @focus="focused = 'name'" @blur="focused = ''; validate('name')" />
        </div>
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>

      <!-- 이메일 -->
      <div class="field" :class="{ error: errors.email }">
        <label class="field-label">이메일</label>
        <div class="input-wrap" :class="{ focused: focused === 'email' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <input v-model="form.email" type="email" class="field-input" placeholder="example@email.com"
            inputmode="email" autocomplete="email" @focus="focused = 'email'" @blur="focused = ''; validate('email')" />
        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>

      <!-- 비밀번호 -->
      <div class="field" :class="{ error: errors.password }">
        <label class="field-label">비밀번호</label>
        <div class="input-wrap" :class="{ focused: focused === 'password' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input v-model="form.password" :type="showPw ? 'text' : 'password'" class="field-input"
            placeholder="영문·숫자 포함 8자 이상" autocomplete="new-password"
            @focus="focused = 'password'" @blur="focused = ''; validate('password')" />
          <button type="button" class="pw-toggle" @click="showPw = !showPw">
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
        <!-- 비밀번호 강도 -->
        <div class="pw-strength">
          <div v-for="i in 4" :key="i" class="strength-bar" :class="strengthClass(i)"></div>
          <span class="strength-label" :class="'strength-text-' + pwStrength.level">{{ pwStrength.label }}</span>
        </div>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="field" :class="{ error: errors.passwordConfirm }">
        <label class="field-label">비밀번호 확인</label>
        <div class="input-wrap" :class="{ focused: focused === 'passwordConfirm' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input v-model="form.passwordConfirm" :type="showPw ? 'text' : 'password'" class="field-input"
            placeholder="비밀번호를 다시 입력하세요" autocomplete="new-password"
            @focus="focused = 'passwordConfirm'" @blur="focused = ''; validate('passwordConfirm')" />
        </div>
        <p v-if="errors.passwordConfirm" class="field-error">{{ errors.passwordConfirm }}</p>
      </div>

      <button type="submit" class="submit-btn">다음</button>

      <p class="login-link">
        이미 계정이 있으신가요?
        <RouterLink to="/login" class="link">로그인</RouterLink>
      </p>
    </form>

    <!-- ── STEP 2: 추가 정보 ── -->
    <form v-else class="signup-form" @submit.prevent="onSubmit" novalidate>

      <!-- 생년월일 -->
      <div class="field" :class="{ error: errors.birthdate }">
        <label class="field-label">생년월일</label>
        <div class="input-wrap" :class="{ focused: focused === 'birthdate' }">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input v-model="form.birthdate" type="text" class="field-input" placeholder="YYYYMMDD (예: 19900101)"
            inputmode="numeric" maxlength="8"
            @focus="focused = 'birthdate'" @blur="focused = ''; validate('birthdate')" />
        </div>
        <p v-if="errors.birthdate" class="field-error">{{ errors.birthdate }}</p>
      </div>

      <!-- 성별 -->
      <div class="field">
        <label class="field-label">성별</label>
        <div class="gender-btns">
          <button type="button" class="gender-btn" :class="{ selected: form.gender === 'M' }" @click="form.gender = 'M'">남성</button>
          <button type="button" class="gender-btn" :class="{ selected: form.gender === 'F' }" @click="form.gender = 'F'">여성</button>
          <button type="button" class="gender-btn" :class="{ selected: form.gender === 'N' }" @click="form.gender = 'N'">선택 안함</button>
        </div>
      </div>

      <!-- 약관 동의 -->
      <div class="terms-group">
        <label class="terms-all">
          <input type="checkbox" v-model="allChecked" @change="toggleAll" />
          <span class="check-box" :class="{ checked: allChecked }">
            <svg v-if="allChecked" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span class="terms-all-label">전체 동의</span>
        </label>
        <div class="terms-divider"></div>
        <label v-for="term in terms" :key="term.key" class="terms-item">
          <input type="checkbox" v-model="form.terms[term.key]" @change="syncAll" />
          <span class="check-box" :class="{ checked: form.terms[term.key] }">
            <svg v-if="form.terms[term.key]" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span class="terms-label">
            <span v-if="term.required" class="required-badge">필수</span>
            {{ term.label }}
          </span>
          <a href="#" class="terms-view" @click.prevent>보기</a>
        </label>
        <p v-if="errors.terms" class="field-error" style="margin-top:8px">{{ errors.terms }}</p>
      </div>

      <!-- 에러 -->
      <div v-if="signupError" class="signup-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ signupError }}
      </div>

      <div class="step2-actions">
        <button type="button" class="back-step-btn" @click="step = 1">이전</button>
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? '가입 중...' : '가입하기' }}
        </button>
      </div>
    </form>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const step    = ref(1)
const focused = ref('')
const showPw  = ref(false)
const loading = ref(false)
const signupError = ref('')
const allChecked  = ref(false)

const form = reactive({
  name: '', email: '', password: '', passwordConfirm: '',
  birthdate: '', gender: 'N',
  terms: { service: false, privacy: false, marketing: false }
})

const errors = reactive({
  name: '', email: '', password: '', passwordConfirm: '', birthdate: '', terms: ''
})

const terms = [
  { key: 'service',   label: '이용약관 동의',         required: true },
  { key: 'privacy',   label: '개인정보 처리방침 동의', required: true },
  { key: 'marketing', label: '마케팅 정보 수신 동의',  required: false },
]

// 비밀번호 강도
const pwStrength = computed(() => {
  const pw = form.password
  if (!pw) return { score: 0, level: 0, label: '' }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) || /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score: 1, level: 1, label: '매우 약함' }
  if (score === 2) return { score: 2, level: 2, label: '약함' }
  if (score === 3) return { score: 3, level: 3, label: '보통' }
  return { score: 4, level: 4, label: '강함' }
})

function strengthClass(i) {
  if (!form.password) return ''
  const s = pwStrength.value.score
  if (i > s) return ''
  if (s === 1) return 'bar-weak'
  if (s === 2) return 'bar-fair'
  if (s === 3) return 'bar-good'
  return 'bar-strong'
}

// 전체 동의 토글
function toggleAll() {
  const v = allChecked.value
  Object.keys(form.terms).forEach(k => { form.terms[k] = v })
}
function syncAll() {
  allChecked.value = Object.values(form.terms).every(Boolean)
}

// 유효성 검사
function validate(field) {
  switch (field) {
    case 'name':
      errors.name = form.name.trim() ? '' : '이름을 입력해 주세요.'
      break
    case 'email':
      if (!form.email) errors.email = '이메일을 입력해 주세요.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '올바른 이메일 형식이 아닙니다.'
      else errors.email = ''
      break
    case 'password':
      if (!form.password) errors.password = '비밀번호를 입력해 주세요.'
      else if (form.password.length < 8) errors.password = '8자 이상 입력해 주세요.'
      else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) errors.password = '영문과 숫자를 함께 사용해 주세요.'
      else errors.password = ''
      break
    case 'passwordConfirm':
      errors.passwordConfirm = form.password === form.passwordConfirm ? '' : '비밀번호가 일치하지 않습니다.'
      break
    case 'birthdate':
      if (!form.birthdate) { errors.birthdate = ''; break }
      if (!/^\d{8}$/.test(form.birthdate)) errors.birthdate = '8자리 숫자로 입력해 주세요. (예: 19900101)'
      else errors.birthdate = ''
      break
  }
}

function validateStep1() {
  ['name', 'email', 'password', 'passwordConfirm'].forEach(validate)
  return !errors.name && !errors.email && !errors.password && !errors.passwordConfirm
}

function validateStep2() {
  validate('birthdate')
  const requiredOk = terms.filter(t => t.required).every(t => form.terms[t.key])
  errors.terms = requiredOk ? '' : '필수 약관에 동의해 주세요.'
  return !errors.birthdate && requiredOk
}

function goStep2() {
  if (validateStep1()) step.value = 2
}

async function onSubmit() {
  if (!validateStep2()) return
  signupError.value = ''
  loading.value = true

  // 회원가입 API 연동 자리
  await new Promise(r => setTimeout(r, 800))

  auth.login({ email: form.email, name: form.name, id: Date.now() })
  router.replace('/')

  loading.value = false
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
  padding: 0 24px 48px;
  max-width: 600px;
  margin: 0 auto;
}

/* ── 뒤로가기 ── */
.back-btn {
  margin-top: 12px;
  align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  border: none; background: transparent; cursor: pointer; color: var(--text-primary); border-radius: 50%;
}
.back-btn:active { background: var(--bg-elevated); }

/* ── 히어로 ── */
.signup-hero {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 0 28px; gap: 6px;
}
.signup-logo  { font-size: 40px; line-height: 1; }
.signup-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.5px; }
.signup-sub   { font-size: 13px; color: var(--text-muted); margin: 0; }

/* ── 단계 표시 ── */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 28px;
  position: relative;
}
.step-line {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: var(--border-default);
  z-index: 0;
}
.step-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  width: 100px; z-index: 1;
}
.step-circle {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-primary-200); color: var(--text-muted); font-size: 12px; font-weight: 700;
  transition: background 0.2s, color 0.2s;
}
.step-circle.active { background: var(--color-primary-700); color: var(--text-inverse); }
.step-circle.done   { background: #10b981; color: #fff; }
.step-label { font-size: 11px; color: var(--text-muted); }

/* ── 폼 공통 ── */
.signup-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.input-wrap {
  display: flex; align-items: center; gap: 10px;
  border: 1.5px solid var(--border-default); border-radius: 12px;
  padding: 0 14px; height: 52px; background: var(--bg-surface);
  transition: border-color 0.2s, background 0.2s;
}
.input-wrap.focused { border-color: var(--color-primary-700); background: var(--bg-surface); }
.field.error .input-wrap { border-color: #ef4444; }
.input-icon { color: var(--text-disabled); flex-shrink: 0; }
.field-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 15px; color: var(--text-primary); caret-color: var(--color-primary-700); min-width: 0;
}
.field-input::placeholder { color: var(--text-disabled); }
.pw-toggle {
  display: flex; align-items: center; background: none;
  border: none; cursor: pointer; color: var(--text-disabled); padding: 0; flex-shrink: 0;
}
.field-error { font-size: 12px; color: #ef4444; margin: 0; padding-left: 4px; }

/* ── 비밀번호 강도 ── */
.pw-strength {
  display: flex; align-items: center; gap: 4px; margin-top: 2px;
}
.strength-bar {
  flex: 1; height: 4px; border-radius: 2px; background: var(--border-default);
  transition: background 0.3s;
}
.bar-weak   { background: #ef4444; }
.bar-fair   { background: #f97316; }
.bar-good   { background: #eab308; }
.bar-strong { background: #10b981; }
.strength-label { font-size: 11px; width: 48px; text-align: right; }
.strength-text-1 { color: #ef4444; }
.strength-text-2 { color: #f97316; }
.strength-text-3 { color: #eab308; }
.strength-text-4 { color: #10b981; }

/* ── 성별 ── */
.gender-btns { display: flex; gap: 8px; }
.gender-btn {
  flex: 1; height: 46px; border: 1.5px solid var(--border-default);
  border-radius: 12px; background: var(--bg-surface);
  font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer;
  transition: all 0.15s;
}
.gender-btn.selected {
  border-color: var(--color-primary-700); background: var(--color-primary-100); color: var(--color-primary-700);
}

/* ── 약관 ── */
.terms-group {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.terms-all { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.terms-all-label { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.terms-divider { height: 1px; background: var(--divider); }
.terms-item { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.terms-item input[type="checkbox"],
.terms-all  input[type="checkbox"] { display: none; }
.check-box {
  width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
  border: 1.5px solid var(--border-strong); background: var(--bg-surface);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.check-box.checked { background: var(--color-primary-700); border-color: var(--color-primary-700); }
.terms-label { flex: 1; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.required-badge {
  font-size: 10px; font-weight: 700; color: var(--color-primary-700);
  background: var(--color-primary-100); padding: 1px 5px; border-radius: 4px;
}
.terms-view { font-size: 12px; color: var(--text-muted); text-decoration: none; flex-shrink: 0; }

/* ── 에러 배너 ── */
.signup-error {
  display: flex; align-items: center; gap: 6px;
  background: #fff1f2; color: #be123c; font-size: 13px;
  padding: 12px 14px; border-radius: 10px; border: 1px solid #fecdd3;
}

/* ── 버튼 ── */
.submit-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  height: 54px; background: var(--color-primary-700); color: var(--text-inverse);
  border: none; border-radius: 14px; font-size: 16px; font-weight: 700;
  cursor: pointer; transition: background 0.15s; width: 100%;
}
.step2-actions .submit-btn { width: auto; flex: 1; }
.submit-btn:active:not(:disabled) { background: var(--color-primary-900); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.step2-actions { display: flex; gap: 10px; }
.back-step-btn {
  height: 54px; width: 80px; background: var(--bg-elevated);
  border: none; border-radius: 14px; font-size: 15px;
  font-weight: 600; color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
}
.back-step-btn:active { background: var(--color-primary-200); }

.login-link { text-align: center; font-size: 13px; color: var(--text-muted); margin: 4px 0 0; }
.link { color: var(--color-primary-700); font-weight: 600; text-decoration: none; }
</style>
