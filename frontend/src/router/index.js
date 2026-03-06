import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // TODO: 로그인/회원가입 기능 미제공 — 재활성화 시 아래 주석 해제
    // { path: '/login',  name: 'login',  component: () => import('@/views/LoginView.vue') },
    // { path: '/signup', name: 'signup', component: () => import('@/views/SignupView.vue') },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/views/SearchView.vue')
        },
        {
          path: 'symbol',
          name: 'symbol',
          component: () => import('@/views/SymbolView.vue')
        },
        {
          path: 'my',
          name: 'my',
          component: () => import('@/views/MyView.vue')
        },
        {
          path: 'dream/:id',
          name: 'dream-detail',
          component: () => import('@/views/DreamDetailView.vue')
        },
        {
          path: 'category',
          name: 'category',
          component: () => import('@/views/CategoryView.vue')
        }
      ]
    }
  ]
})

export default router
