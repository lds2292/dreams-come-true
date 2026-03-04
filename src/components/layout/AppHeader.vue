<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- 왼쪽: 로고 -->
      <div class="header-logo">
        <span class="logo-text">DreamsComeTrue</span>
      </div>

      <!-- 오른쪽 -->
      <div class="header-actions">
        <!-- 로그인 상태: 알림 아이콘 -->
        <button v-if="auth.isLoggedIn" class="icon-btn" aria-label="알림" @click="$router.push('/notify')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="hasNotification" class="notification-dot"></span>
        </button>

        <!-- 비로그인 상태: 로그인 버튼 -->
        <button v-else class="login-btn" @click="$router.push('/login')">
          로그인
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

defineProps({
  hasNotification: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  max-width: 600px;
  margin: 0 auto;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: #333;
  transition: background-color 0.15s;
}
.icon-btn:active { background-color: #f5f5f5; }

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  background-color: #ff4444;
  border-radius: 50%;
  border: 1.5px solid #fff;
}

.login-btn {
  height: 34px;
  padding: 0 16px;
  background: #5b21b6;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.login-btn:active { background: #4c1d95; }
</style>
