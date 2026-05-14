import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
export interface RequestResult<T = any> {
  success: boolean
  code: number
  message: string
  data: T | null
  error?: any
}

export interface RequestConfig<T = any> extends AxiosRequestConfig {
  showSuccess?: boolean
  showError?: boolean
  successMessage?: string
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token 过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.error('登录已过期，请重新登录')
      // 跳转到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
// 请求拦截器 更新token
http.interceptors.request.use(config => {
  const newtoken = localStorage.getItem('token'); // 从 localStorage 获取最新的 token
  if (newtoken) {
    config.headers.Authorization = `${newtoken}`; // 设置 token 到 header 中
  }
  return config;
}, error => {
  return Promise.reject(error);
});

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

export const get = async <T = any>(url: string, config: RequestConfig = {}) =>
  request<T>({ url, method: 'GET', ...config })

export const post = async <T = any>(url: string, data?: any, config: RequestConfig = {}) =>
  request<T>({ url, method: 'POST', data, ...config })

export const put = async <T = any>(url: string, data?: any, config: RequestConfig = {}) =>
  request<T>({ url, method: 'PUT', data, ...config })

export const del = async <T = any>(url: string, config: RequestConfig = {}) =>
  request<T>({ url, method: 'DELETE', ...config })
