<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>用户管理</h3>
      <el-button type="primary" @click="refresh">刷新列表</el-button>
    </div>

    <div class="filter-row">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名 / 邮箱"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch"
        style="width: 260px"
      />
      <el-select
        v-model="roleFilter"
        placeholder="选择角色"
        clearable
        @change="handleSearch"
        style="width: 180px"
      >
        <el-option label="全部角色" value="" />
        <el-option label="管理员" value="管理员" />
        <el-option label="普通用户" value="普通用户" />
      </el-select>
      <el-select
        v-model="statusFilter"
        placeholder="选择状态"
        clearable
        @change="handleSearch"
        style="width: 180px"
      >
        <el-option label="全部状态" value="" />
        <el-option label="正常" value="正常" />
        <el-option label="冻结" value="冻结" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="success" @click="exportCsv">导出用户</el-button>
    </div>

    <el-table :data="users" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="用户编号" width="120" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column prop="email" label="邮箱" width="220" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="remark" label="备注" width="120" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button
            type="text"
            @click="toggleStatus(row.id, row.status === '正常' ? '冻结' : '正常')"
          >
            {{ row.status === '正常' ? '冻结用户' : '恢复' }}
          </el-button>
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
import { fetchUsers, updateUserStatus } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const users = ref<Array<{ id: number; name: string; email: string; role: string; status: string }>>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)

// Dialog states
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
let pendingAction: (() => void) | null = null

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await fetchUsers({
      keyword: searchKeyword.value,
      status: statusFilter.value,
      role: roleFilter.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    users.value = response.data
    total.value = response.total
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100) // 模拟加载时间，实际项目中可根据需要调整或去掉
  }
}

const refresh = () => {
  currentPage.value = 1
  loadUsers()
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const toggleStatus = (id: number, status: string) => {
  const action = status === '冻结' ? '冻结' : '恢复'
  dialogTitle.value = '确认操作'
  dialogMessage.value = `确定要${action}用户 ${id} 吗？`
  pendingAction = async () => {
    await updateUserStatus(id, status)
    loadUsers()
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
    ['用户编号', '姓名', '角色', '邮箱', '状态'],
    ...users.value.map((user) => [user.id, user.name, user.role, user.email, user.status])
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'users.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(loadUsers)
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
