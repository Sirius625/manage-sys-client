<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>订单管理</h3>
      <div class="page-actions">
        <el-button type="primary" @click="refresh">刷新列表</el-button>
        <el-button type="success" :disabled="!hasSelection" @click="batchUpdate('已完成')">批量标记已完成</el-button>
        <el-button type="warning" :disabled="!hasSelection" @click="batchUpdate('待发货')">批量标记待发货</el-button>
        <el-button type="danger" :disabled="!hasSelection" @click="batchUpdate('已取消')">批量取消</el-button>
        <el-button type="info" @click="exportCsv">导出结果</el-button>
      </div>
    </div>

    <div class="filter-row">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索订单号 / 客户"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch"
        style="width: 260px"
      />
      <el-select
        v-model="statusFilter"
        placeholder="选择状态"
        clearable
        @change="handleSearch"
        style="width: 180px"
      >
        <el-option label="全部状态" value="" />
        <el-option label="待发货" value="待发货" />
        <el-option label="待支付" value="待支付" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已取消" value="已取消" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table
      :data="orders"
      v-loading="loading"
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
      ref="orderTable"
    >
      <el-table-column type="selection" width="60" />
      <el-table-column prop="id" label="订单号" width="120" />
      <el-table-column prop="customer" label="客户" width="160" />
      <el-table-column prop="amount" label="金额" width="120">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="text" @click="openDetail(row.id)">查看详情</el-button>
          <el-button type="text" @click="setStatus(row.id, '已完成')">已完成</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <ConfirmDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :message="dialogMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchOrders, batchUpdateOrders } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const orders = ref<Array<{ id: number; customer: string; amount: number; status: string }>>([])
const selectedOrders = ref<Array<{ id: number; customer?: string; amount?: number; status?: string }>>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const hasSelection = ref(false)
const loading = ref(false)

// Dialog states
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
let pendingAction: (() => void) | null = null
const loadOrders = async () => {
  loading.value = true
  try {
    const response = await fetchOrders({
      keyword: searchKeyword.value,
      status: statusFilter.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })

    orders.value = response.data
    total.value = response.total
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100) // 模拟加载时间，实际项目中可根据需要调整或去掉
  }
}

const refresh = () => {
  selectedOrders.value = []
  handleSelectionChange([])
  currentPage.value = 1
  loadOrders()
}

const handleSearch = () => {
  currentPage.value = 1
  loadOrders()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadOrders()
}

const handleSelectionChange = (selection: Array<{ id: number }>) => {
  selectedOrders.value = selection
  hasSelection.value = selection.length > 0
}

const openDetail = (id: number) => {
  router.push({ name: 'OrderDetail', params: { id } })
}

const exportCsv = () => {
  const csvRows = [
    ['订单号', '客户', '金额', '状态'],
    ...orders.value.map((order) => [order.id, order.customer, `¥${order.amount}`, order.status])
  ]
  const csvContent = csvRows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'orders.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const batchUpdate = (status: string) => {
  if (!selectedOrders.value.length) return
  dialogTitle.value = '确认批量操作'
  dialogMessage.value = `确定要将选中的 ${selectedOrders.value.length} 个订单状态设置为"${status}"吗？`
  pendingAction = async () => {
    await batchUpdateOrders(selectedOrders.value.map((item) => item.id), status)
    selectedOrders.value = []
    hasSelection.value = false
    loadOrders()
  }
  dialogVisible.value = true
}

const setStatus = (id: number, status: string) => {
  dialogTitle.value = '确认操作'
  dialogMessage.value = `确定要将订单 ${id} 状态设置为"${status}"吗？`
  pendingAction = async () => {
    await batchUpdateOrders([id], status)
    loadOrders()
  }
  dialogVisible.value = true
}

const handleConfirm = () => {
  if (pendingAction) {
    pendingAction()
    pendingAction = null
  }
  dialogVisible.value = false
}

const handleCancel = () => {
  pendingAction = null
  dialogVisible.value = false
}

onMounted(loadOrders)
</script>

<style scoped>
.page-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.page-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.pagination-row {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
</style>
