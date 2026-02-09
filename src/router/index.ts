import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteModule } from './types'

const routes: RouteRecordRaw[] = [
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
    path: '/three-wangzhan',
    name: 'three-wangzhan',
    component: () => import('@/views/three-wangzhan/index.vue'),
    meta: { title: 'three-wangzhan首页' }
  },
  {
    path: '/future-portal',
    name: 'future-portal',
    component: () => import('@/views/future-portal/index.vue'),
    meta: { title: 'future-portal首页' }
  },
  {
    path: '/professional-portal',
    name: 'professional-portal',
    component: () => import('@/views/future-portal/ProfessionalPortal.vue'),
    meta: { title: '专业级未来门户' }
  },
  {
    path: '/corporate-website',
    name: 'corporate-website',
    component: () => import('@/views/next-gen-corporate/CorporateWebsite.vue'),
    meta: { title: '下一代企业网站' }
  },
  {
    path: '/enhanced-corporate',
    name: 'enhanced-corporate',
    component: () => import('@/views/next-gen-corporate/EnhancedCorporateWebsite.vue'),
    meta: { title: '增强版企业网站' }
  },
  {
    path: '/ultra-advanced-portal',
    name: 'ultra-advanced-portal',
    component: () => import('@/views/ultra-advanced-portal/UltraAdvancedPortal.vue'),
    meta: { title: '超高级量子门户' }
  },
  {
    path: '/ultra-enterprise-portal',
    name: 'ultra-enterprise-portal',
    component: () => import('@/views/ultra-enterprise-portal/UltraEnterprisePortal.vue'),
    meta: { title: '超企业门户' }
  },
  {
    path: '/next-gen-enterprise',
    name: 'next-gen-enterprise',
    component: () => import('@/views/next-gen-corporate/NextGenEnterprise.vue'),
    meta: { title: '下一代企业官网' }
  },
  {
    path: '/luxury-spa',
    name: 'luxury-spa',
    component: () => import('@/views/luxury-spa/LuxurySpa.vue'),
    meta: { title: '奢华水疗中心' }
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
