/**
 * HTTP 请求工具模块
 * 
 * 基于 Axios 封装的请求工具，提供统一的请求/响应拦截、错误处理、Token 管理等功能。
 * 
 * @module api/index
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

/** 统一请求结果类型 */
export interface RequestResult<T = any> {
  success: boolean
  code: number
  message: string
  data: T | null
  error?: any
}

/** 扩展的请求配置 */
export interface RequestConfig<T = any> extends AxiosRequestConfig {
  showSuccess?: boolean   // 是否显示成功提示
  showError?: boolean     // 是否显示错误提示
  successMessage?: string // 自定义成功消息
}

/** Axios 实例 */
const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ==================== 响应拦截器 ====================

/** 统一处理 401 未授权错误，清除登录状态并跳转到登录页 */
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // 登录接口的 401 是业务错误（用户名或密码错误），不做全局处理
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== 请求拦截器 ====================

/** 自动从 localStorage 获取 Token 并注入请求头 */
http.interceptors.request.use(config => {
  const newtoken = localStorage.getItem('token')
  if (newtoken) {
    config.headers.Authorization = `${newtoken}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 通用请求方法
 * 封装了成功/失败提示、错误处理等逻辑
 * 
 * @param config - 请求配置
 * @returns 统一格式的响应结果
 */
export const request = async <T = any>(config: RequestConfig): Promise<RequestResult<T>> => {
  const { showSuccess = false, showError = true, successMessage, ...axiosConfig } = config

  try {
    const response = await http.request<T>(axiosConfig)
    const message = successMessage || '请求成功'

    if (showSuccess) {
      ElMessage.success(message)
    }

    return {
      success: true,
      code: response.status,
      message,
      data: response.data as T
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      '请求失败，请稍后重试'

    if (showError) {
      ElMessage.error(message)
    }

    return {
      success: false,
      code: error?.response?.status || 500,
      message,
      data: null,
      error
    }
  }
}

/** GET 请求快捷方法 */
export const get = async <T = any>(url: string, config: RequestConfig = {}) =>
  request<T>({ url, method: 'GET', ...config })

/** POST 请求快捷方法 */
export const post = async <T = any>(url: string, data?: any, config: RequestConfig = {}) =>
  request<T>({ url, method: 'POST', data, ...config })

/** PUT 请求快捷方法 */
export const put = async <T = any>(url: string, data?: any, config: RequestConfig = {}) =>
  request<T>({ url, method: 'PUT', data, ...config })

/** DELETE 请求快捷方法 */
export const del = async <T = any>(url: string, config: RequestConfig = {}) =>
  request<T>({ url, method: 'DELETE', ...config })
