import { get, post, put, del } from './index'

export const fetchDashboardStats = () => get('/dashboard/stats')

const ordersData = [
  { id: 1001, customer: '王小明', amount: 320, status: '待发货' },
  { id: 1002, customer: '张婷婷', amount: 158, status: '已完成' },
  { id: 1003, customer: '李大锤', amount: 520, status: '待支付' },
  { id: 1004, customer: '陈丽', amount: 240, status: '已完成' },
  { id: 1005, customer: '赵磊', amount: 680, status: '待发货' },
  { id: 1006, customer: '刘娜', amount: 420, status: '待支付' },
  { id: 1007, customer: '孙强', amount: 215, status: '已完成' },
  { id: 1008, customer: '周静', amount: 520, status: '待发货' },
  { id: 1009, customer: '吴涛', amount: 330, status: '已完成' },
  { id: 1010, customer: '郑爽', amount: 410, status: '待支付' }
]

const productsData = [
  { id: 2001, name: '无线鼠标', category: '外设', stock: 120, price: 99, status: '在售' },
  { id: 2002, name: '机械键盘', category: '外设', stock: 58, price: 329, status: '在售' },
  { id: 2003, name: '27寸显示器', category: '显示器', stock: 32, price: 1299, status: '在售' },
  { id: 2004, name: '办公椅', category: '家具', stock: 16, price: 499, status: '下架' },
  { id: 2005, name: '蓝牙音箱', category: '音频', stock: 84, price: 239, status: '在售' }
]

const usersData = [
  { id: 3001, name: 'admin', password: 'admin123', email: 'admin@example.com', role: '管理员', status: '正常' },
  { id: 3002, name: 'editor', password: 'editor123', email: 'editor@example.com', role: '编辑员', status: '正常' },
  { id: 3003, name: '王小明', email: 'wang@example.com', role: '普通用户', status: '正常' },
  { id: 3004, name: '张婷婷', email: 'zhang@example.com', role: '普通用户', status: '冻结' },
  { id: 3005, name: '李大锤', email: 'li@example.com', role: 'VIP', status: '正常' },
  { id: 3006, name: '陈丽', email: 'chen@example.com', role: '普通用户', status: '正常' },
  { id: 3007, name: '赵磊', email: 'zhao@example.com', role: 'VIP', status: '正常' }
]

const afterSalesData = [
  { id: 4001, orderId: 1001, user: '王小明', type: '退货', reason: '商品损坏', status: '待处理' },
  { id: 4002, orderId: 1002, user: '张婷婷', type: '换货', reason: '尺寸不合适', status: '处理中' },
  { id: 4003, orderId: 1003, user: '李大锤', type: '咨询', reason: '配送询问', status: '已完成' }
]

export const fetchOrders = async ({ keyword = '', status = '', page = 1, pageSize = 5 } = {}) => {
  const result = await get<{ data: Array<any>; total: number }>('/orders', {
    params: { keyword, status, page, pageSize }
  })
  return {
    data: result.data?.data || [],
    total: result.data?.total || 0
  }
}

export const batchUpdateOrders = async (ids: number[], status: string) => {
  const result = await post('/orders/batch-update', { ids, status })
  return result.data || { data: [] }
}

export const fetchOrderById = async (id: number) => {
  const result = await get<{ data: any }>(`/orders/${id}`)
  return result.data || { data: null }
}

export const updateOrderStatus = async (id: number, status: string) => {
  const result = await put(`/orders/${id}/status`, { status })
  return result.data || { success: false }
}

export const fetchProducts = async ({ keyword = '', category = '', page = 1, pageSize = 5 } = {}) => {
  const result = await get<{ data: Array<any>; total: number }>('/products', {
    params: { keyword, category, page, pageSize }
  })
  return {
    data: result.data?.data || [],
    total: result.data?.total || 0
  }
}

export const batchUpdateProductStatus = async (ids: number[], status: string) => {
  const result = await post('/products/batch-update', { ids, status })
  return result.data || { data: [] }
}

export const fetchProductById = async (id: number) => {
  const result = await get<{ data: any }>(`/products/${id}`)
  return result.data || { data: null }
}

export const updateProductStock = async (id: number, stock: number) => {
  const result = await put(`/products/${id}/stock`, { stock })
  return result.data || { data: null }
}

export const addProduct = async (product: { name: string; category: string; stock: number; price: number; status: string }) => {
  const result = await post('/products', product)
  return result.data || { data: null }
}

export const fetchUsers = async ({ keyword = '', role = '', status = '', page = 1, pageSize = 5 } = {}) => {
  const result = await get<{ data: Array<any>; total: number }>('/users', {
    params: { keyword, role, status, page, pageSize }
  })
  return {
    data: result.data?.data || [],
    total: result.data?.total || 0
  }
}

export const updateUserStatus = async (id: number, status: string) => {
  const result = await put(`/users/${id}/status`, { status })
  return result.data || { success: false }
}

export const fetchUserProfile = async (id: number) => {
  const result = await get<{ data: any }>(`/users/${id}`)
  return result.data || { data: null }
}

export const updateUserProfile = async (id: number, userData: { name: string; email: string; avatarBase64?: string; remark?: string }) => {
  const result = await put(`/users/${id}`, userData)
  if (!result.success) {
    throw new Error(result.message || '保存用户信息失败')
  }
  return result.data || { data: null }
}

export const updateUserPassword = async (id: number, currentPassword: string, newPassword: string) => {
  const result = await put(`/users/${id}/password`, { currentPassword, newPassword })
  if (!result.success) {
    throw new Error(result.message || '密码重置失败')
  }
  return result.data || { success: true }
}

export const registerUser = async (userData: { name: string; password: string; email: string; role: string }) => {
  const result = await post('/auth/register', userData)
  return result.data
}

export const loginUser = async (username: string, password: string) => {
  const result = await post('/auth/login', { username, password })
  return result.data || null
}

export const fetchAfterSales = async ({ keyword = '', status = '', page = 1, pageSize = 5 } = {}) => {
  const result = await get<{ data: Array<any>; total: number }>('/after-sales', {
    params: { keyword, status, page, pageSize }
  })
  return {
    data: result.data?.data || [],
    total: result.data?.total || 0
  }
}

export const updateAfterSalesStatus = async (id: number, status: string) => {
  const result = await put(`/after-sales/${id}/status`, { status })
  return result.data || { success: false }
}

export const fetchAnalyticsData = async () => {
  const result = await get<{ data: any }>('/analytics')
  return result.data || { data: null }
}

export const getSongs = async (params: { keyword?: string; page?: number; pageSize?: number }) => {
  const result = await get<{ data: any }>('/songs', { params })
  return result.data || { data: null }
}
export const updateSongs = async () => {
  const result = await post<{ data: any }>('/songs')
  return result.data || { data: null }
}

/**
 * 获取播放历史列表
 */
export const getPlayHistory = async (params: { keyword?: string; page?: number; pageSize?: number }) => {
  const result = await get<{ data: any; total: number }>('/history', { params })
  return result.data || { data: [], total: 0 }
}

/**
 * 清空播放历史
 */
export const clearPlayHistory = async () => {
  const result = await del('/history/clear')
  return result.data || { data: null }
}
