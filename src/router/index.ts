import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteModule } from './types'

const routes: RouteRecordRaw[] = [
  {
    path: '/wang',
    name: 'wang',
    component: () => import('@/views/wang/index.vue'),
    meta: { title: '沉浸式数字空间', fullscreen: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home/index.vue'),
        meta: { title: '首页' }
      }
    ]
  },
  {
    path: '/page',
    name: 'page',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: 'page首页' }
  },
  {
    path: '/ultimate-final',
    name: 'ultimate-final',
    component: () => import('@/views/ultimate-final/index.vue'),
    meta: { title: 'ultimate-final首页' }
  },
  {
    path: '/page-tenxun',
    name: 'page-tenxun',
    component: () => import('@/views/page-tenxun/index.vue'),
    meta: { title: 'page-tenxun首页' }
  },
  {
    path: '/taichi-three-lession',
    name: 'taichi-three-lession',
    component: () => import('@/views/taichi-three-lession/index.vue'),
    meta: { title: 'taichi-three-lession首页' }
  },
  {
    path: '/taichi-three-lession1',
    name: 'taichi-three-lession1',
    component: () => import('@/views/taichi-three-lession/demo/lesson-1.vue'),
    meta: { title: 'taichi-three-lession1首页' }
  },

  {
    path: '/three-effice',
    name: 'three-effice',
    component: () => import('@/views/three-effice/index.vue'),
    meta: { title: 'three-effice首页' }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
