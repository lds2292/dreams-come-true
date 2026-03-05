<template>
  <div class="my-page">

    <!-- ── 로그인 상태 ── -->
    <template v-if="auth.isLoggedIn">
      <!-- 프로필 -->
      <div class="profile-section">
        <div class="avatar">{{ auth.user.name.charAt(0) }}</div>
        <div class="profile-info">
          <p class="profile-name">{{ auth.user.name }}</p>
          <p class="profile-email">{{ auth.user.email }}</p>
        </div>
      </div>

      <!-- 메뉴 -->
      <div class="menu-group">
        <p class="menu-label">내 활동</p>
        <div class="menu-list">
          <button v-for="item in myMenus" :key="item.label" class="menu-item">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="menu-group">
        <p class="menu-label">설정</p>
        <div class="menu-list">
          <button v-for="item in settingMenus" :key="item.label" class="menu-item">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 로그아웃 -->
      <div class="logout-section">
        <button class="logout-btn" @click="confirmLogout = true">로그아웃</button>
      </div>
    </template>

    <!-- ── 비로그인 상태 ── -->
    <div v-else class="guest-section">
      <p class="guest-emoji">🌙</p>
      <p class="guest-title">로그인이 필요합니다</p>
      <p class="guest-desc">로그인하고 나만의 꿈해몽과<br>운세 서비스를 이용해 보세요.</p>
      <button class="go-login-btn" @click="$router.push('/login')">로그인 / 회원가입</button>
    </div>

    <!-- ── 로그아웃 확인 다이얼로그 ── -->
    <Teleport to="body">
      <div v-if="confirmLogout" class="dialog-overlay" @click.self="confirmLogout = false">
        <div class="dialog">
          <p class="dialog-title">로그아웃</p>
          <p class="dialog-desc">정말 로그아웃 하시겠습니까?</p>
          <div class="dialog-actions">
            <button class="dialog-cancel" @click="confirmLogout = false">취소</button>
            <button class="dialog-confirm" @click="doLogout">로그아웃</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const confirmLogout = ref(false)

function doLogout() {
  confirmLogout.value = false
  auth.logout()
  router.replace('/')
}

const myMenus = [
  { icon: '📖', label: '나의 꿈해몽 기록' },
  { icon: '⭐', label: '즐겨찾기' },
  { icon: '🔔', label: '알림 설정' },
]

const settingMenus = [
  { icon: '👤', label: '회원정보 수정' },
  { icon: '🔒', label: '비밀번호 변경' },
  { icon: '❓', label: '고객센터' },
]
</script>

<style scoped>
.my-page {
  padding: 0 0 32px;
}

/* ── 프로필 ── */
.profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  border-bottom: 8px solid #f5f5f7;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b21b6, #7c3aed);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile-name  { font-size: 17px; font-weight: 700; color: #111; margin: 0 0 4px; }
.profile-email { font-size: 13px; color: #888; margin: 0; }

/* ── 메뉴 ── */
.menu-group { padding: 20px 20px 0; }
.menu-label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 8px;
}
.menu-list {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  overflow: hidden;
}
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid #f5f5f7;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: #fafafa; }
.menu-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.menu-text { flex: 1; font-size: 15px; color: #222; }
.menu-arrow { color: #ccc; flex-shrink: 0; }

/* ── 로그아웃 ── */
.logout-section {
  padding: 28px 20px 0;
}
.logout-btn {
  width: 100%;
  height: 50px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  transition: background 0.15s;
}
.logout-btn:active { background: #fff1f2; }

/* ── 비로그인 ── */
.guest-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 24px 40px;
}
.guest-emoji { font-size: 52px; margin: 0 0 16px; }
.guest-title { font-size: 18px; font-weight: 700; color: #111; margin: 0 0 8px; }
.guest-desc  { font-size: 14px; color: #888; line-height: 1.7; margin: 0 0 28px; }
.go-login-btn {
  width: 100%;
  max-width: 280px;
  height: 52px;
  background: #5b21b6;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.go-login-btn:active { background: #4c1d95; }

/* ── 다이얼로그 ── */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding: 0 0 env(safe-area-inset-bottom);
}
.dialog {
  width: 100%;
  max-width: 600px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 28px 24px 24px;
}
.dialog-title { font-size: 17px; font-weight: 700; color: #111; margin: 0 0 8px; }
.dialog-desc  { font-size: 14px; color: #666; margin: 0 0 24px; }
.dialog-actions { display: flex; gap: 10px; }
.dialog-cancel {
  flex: 1;
  height: 50px;
  background: #f5f5f7;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}
.dialog-confirm {
  flex: 1;
  height: 50px;
  background: #ef4444;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}
.dialog-confirm:active { background: #dc2626; }
</style>
