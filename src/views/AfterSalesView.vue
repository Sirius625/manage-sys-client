<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>售后管理</h3>
      <el-button type="primary" @click="refresh">刷新列表</el-button>
    </div>

    <div class="filter-row">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索售后编号 / 订单号 / 用户"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch"
        style="width: 320px"
      />
      <el-select
        v-model="statusFilter"
        placeholder="选择状态"
        clearable
        @change="handleSearch"
        style="width: 180px"
      >
        <el-option label="全部状态" value="" />
        <el-option label="待处理" value="待处理" />
        <el-option label="处理中" value="处理中" />
        <el-option label="已完成" value="已完成" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="success" @click="exportCsv">导出售后</el-button>
    </div>

    <el-table :data="records" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="售后编号" width="120" />
      <el-table-column prop="orderId" label="订单号" width="120" />
      <el-table-column prop="user" label="用户" width="160" />
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="reason" label="原因" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button type="text" @click="updateStatus(row.id, '已完成')">标记完成</el-button>
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
import { fetchAfterSales, updateAfterSalesStatus } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const records = ref<Array<{ id: number; orderId: number; user: string; type: string; reason: string; status: string }>>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)

// Dialog states
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
let pendingAction: (() => void) | null = null

const loadRecords = async () => {
  loading.value = true
  try {
    const response = await fetchAfterSales({
      keyword: searchKeyword.value,
      status: statusFilter.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    records.value = response.data
    total.value = response.total
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100) // 模拟加载时间，实际项目中可根据需要调整或去掉
  }
}

const refresh = () => {
  currentPage.value = 1
  loadRecords()
}

const handleSearch = () => {
  currentPage.value = 1
  loadRecords()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadRecords()
}

const updateStatus = (id: number, status: string) => {
  dialogTitle.value = '确认操作'
  dialogMessage.value = `确定要将售后记录 ${id} 标记为"${status}"吗？`
  pendingAction = async () => {
    await updateAfterSalesStatus(id, status)
    loadRecords()
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

const exportCsv = () => {
  const rows = [
    ['售后编号', '订单号', '用户', '类型', '原因', '状态'],
    ...records.value.map((item) => [item.id, item.orderId, item.user, item.type, item.reason, item.status])
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'aftersales.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(loadRecords)
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
.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.pagination-row {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
</style>
