/**
 * 前端路由配置
 * 
 * 定义管理后台的所有页面路由，包括登录、仪表盘、订单、商品、用户、
 * 文章管理、图片管理、歌曲管理等功能模块。
 * 
 * @module router/index
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'

/** 路由表定义 */
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '仪表盘' }
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('../views/ArticleManageView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '文章管理' }
  },
  {
    path: '/images',
    name: 'Images',
    component: () => import('../views/ImageManageView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '图片管理' }
  },
  {
    path: '/videos',
    name: 'Videos',
    component: () => import('../views/VideoManageView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '视频管理' }
  },
  {
    path: '/likedSongs',
    name: 'LikedSongs',
    component: () => import('../views/LikedSongs.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '喜欢的歌曲' }
  },
  {
    path: '/playHistory',
    name: 'PlayHistory',
    component: () => import('../views/PlayHistory.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '播放历史' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/OrderListView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '订单管理' }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetailView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'] }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/ProductManageView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '商品管理' }
  },
  {
    path: '/products/add',
    name: 'ProductAdd',
    component: () => import('../views/AddProductView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'] }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetailView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'] }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UserManageView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '用户管理' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/UserProfileView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '个人信息' }
  },
  {
    path: '/aftersales',
    name: 'AfterSales',
    component: () => import('../views/AfterSalesView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '售后管理' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/DataAnalysisView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'editor'], showInMenu: true, title: '数据分析' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'], showInMenu: true, title: '设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 路由守卫
 * 处理登录状态验证、角色权限控制、登录页重定向等
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { isLoggedIn, role } = authStore
  const token = authStore.token

  // 如果已登录且访问登录页，跳转到仪表盘
  if (to.name === 'Login' && isLoggedIn && token) {
    return next({ name: 'Dashboard' })
  }

  // 需要认证的页面，检查是否已登录且有有效token
  if (to.meta.requiresAuth) {
    if (!isLoggedIn || !token) {
      return next({ name: 'Login' })
    }
  }

  // 检查角色权限
  if (Array.isArray(to.meta.roles) && !to.meta.roles.includes(role)) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
