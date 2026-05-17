/**
 * Pinia 状态管理
 * 
 * 提供全局状态管理，包括用户认证状态（useAuthStore）和系统设置（useSettingsStore）。
 * 
 * @module store/index
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 系统设置 Store
 * 管理主题、用户名等全局设置
 */
export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()

  /** 当前登录用户名 */
  const username = computed(() => authStore.user?.name || '未登录')
  /** 当前主题（深色/浅色） */
  const theme = ref<'dark' | 'light'>('dark')

  /** 设置主题并应用到 DOM */
  const setTheme = (value: 'dark' | 'light') => {
    theme.value = value
    document.documentElement.dataset.theme = value
  }

  return {
    username,
    theme,
    setTheme
  }
})

/**
 * 用户认证 Store
 * 管理登录状态、用户信息、Token，并持久化到 localStorage
 */
export const useAuthStore = defineStore('auth', {
  state: () => {
    // 尝试从 localStorage 恢复用户信息
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token') || ''
    const parsedUser = savedUser ? JSON.parse(savedUser) : null
    return {
      /** 是否已登录 */
      isLoggedIn: !!savedToken && !!parsedUser,
      /** 当前用户信息 */
      user: parsedUser as { id: number; name: string; email: string; role: string; avatar?: string, token?: string } | null,
      /** 认证 Token */
      token: savedToken
    }
  },
  getters: {
    /** 用户角色（admin / editor） */
    role: (state) => state.user?.role === '管理员' ? 'admin' : 'editor'
  },
  actions: {
    /**
     * 登录
     * 保存用户信息和 Token 到状态和 localStorage
     */
    login(user: { id: number; name: string; email: string; role: string, avatar?: string, token: string }) {
      this.isLoggedIn = true
      this.user = user
      this.token = user.token
      localStorage.setItem('token', user.token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    /** 登出，清除所有登录状态 */
    logout() {
      this.isLoggedIn = false
      this.user = null
      this.token = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
