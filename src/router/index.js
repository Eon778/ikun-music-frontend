import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue')
  },
  {
    path: '/my-music',
    name: 'MyMusic',
    component: () => import('@/views/MyMusic.vue')
  },
  {
    path: '/lyrics',
    name: 'Lyrics',
    component: () => import('@/views/LyricsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router