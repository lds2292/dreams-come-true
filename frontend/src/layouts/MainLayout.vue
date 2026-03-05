<template>
  <div class="layout-wrapper">
    <!-- 상단 헤더 배너 -->
    <AppHeader :has-notification="false" />

    <!-- 메인 컨텐츠 (스크롤 영역) -->
    <main class="layout-content">
      <div class="content-body">
        <RouterView />
      </div>
      <AppFooter />
    </main>

    <!-- 하단 탭 내비게이션 -->
    <AppNavBar />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNavBar from '@/components/layout/AppNavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { RouterView } from 'vue-router'
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.content-body {
  flex: 1;
}
</style>
