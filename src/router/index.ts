import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store'

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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { isLoggedIn, role } = authStore
  
//   if (token) {
//     if(to.path === '/login') {
//       return next({ name: 'Dashboard' })
//     } else {
//       if(role && role.length > 0) {
//         return next()
//       } else {
//         return next({ name: 'Login' })
//       }
//     }
//   }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'Login' })
  }

  if (Array.isArray(to.meta.roles) && !to.meta.roles.includes(role)) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
