<template>
  <div class="backstage-login">
    <div class="login-card">
      <div class="login-header">
        <div class="lock-icon">🔐</div>
        <h1>관리자 로그인</h1>
        <p>꿈해몽 사전 백오피스</p>
      </div>

      <form @submit.prevent="onSubmit" class="login-form">
        <div class="field">
          <label>아이디</label>
          <input
            v-model="username"
            type="text"
            placeholder="아이디 입력"
            autocomplete="username"
            :disabled="loading"
          />
        </div>
        <div class="field">
          <label>비밀번호</label>
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호 입력"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const backstageApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

async function onSubmit() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = '아이디와 비밀번호를 입력해주세요.'
    return
  }
  loading.value = true
  try {
    const { data } = await backstageApi.post('/backstage/login', {
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('dct_backstage_token', data.token)
    router.push('/backstage/dream/new')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '로그인 실패. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.backstage-login {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0a1e;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 20px;
  padding: 40px 32px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.lock-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.login-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}

.login-header p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.field input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #7c3aed;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.field input:disabled {
  opacity: 0.5;
}

.error-msg {
  font-size: 13px;
  color: #f87171;
  text-align: center;
  padding: 8px 12px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
}

.login-btn {
  margin-top: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn:not(:disabled):active {
  opacity: 0.8;
}
</style>
