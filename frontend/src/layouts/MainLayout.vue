<template>
  <div class="layout-wrapper">
    <!-- 상단 헤더 배너 -->
    <AppHeader :has-notification="false" />

    <!-- 메인 컨텐츠 (스크롤 영역) -->
    <main class="layout-content" ref="contentRef">
      <div class="content-body">
        <RouterView v-slot="{ Component }">
          <keep-alive include="CategoryView">
            <component :is="Component" />
          </keep-alive>
        </RouterView>
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
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const contentRef = ref(null)
const route = useRoute()

watch(() => route.path, async () => {
  await nextTick()
  // keep-alive로 캐시된 CategoryView는 자체적으로 스크롤 복원하므로 제외
  if (contentRef.value && route.name !== 'category') {
    contentRef.value.scrollTop = 0
  }
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  max-width: 600px;
  margin: 0 auto;
  background-color: #111022;
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
