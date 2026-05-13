<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>播放历史</h3>
      <div class="header-actions">
        <el-button type="danger" @click="handleClearAll" :disabled="songs.length === 0">
          清除历史
        </el-button>
        <el-button type="primary" @click="refresh">刷新列表</el-button>
      </div>
    </div>

    <div class="filter-row">
      <el-input v-model="searchKeyword" placeholder="搜索歌曲id / 歌曲名称" clearable @clear="handleSearch"
        @keyup.enter.native="handleSearch" style="width: 260px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="songs" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="歌曲编号" width="120" />
      <el-table-column prop="name" label="歌曲名称" width="180" />
      <el-table-column label="歌手" width="150">
        <template #default="{ row }">
          {{ row.ar && row.ar.length > 0 ? row.ar.map((a: any) => a.name).join(' / ') : '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="play_count" label="播放次数" width="120" />
      <el-table-column prop="dt" label="时长" width="120">
        <template #default="{ row }">
          {{ Math.floor(row.dt / 60000) }}:{{ String(Math.floor((row.dt % 60000) / 1000)).padStart(2, '0') }}
        </template>
      </el-table-column>
      <el-table-column label="最近播放" width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination background layout="prev, pager, next, jumper, ->, total" :page-size="pageSize"
        :current-page="currentPage" :total="total" @current-change="handlePageChange" />
    </div>

    <ConfirmDialog v-model:visible="dialogVisible" title="清除播放历史" message="确定要清除所有播放历史吗？"
      @confirm="handleConfirm" @cancel="handleCancel">
      <div>
        确定要清除所有播放历史吗？
      </div>
      <div>
        <p style="color: #f56c6c;">此操作不可恢复，请谨慎操作。</p>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPlayHistory, clearPlayHistory } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const songs = ref<Array<{ id: number; name: string; ar: any[]; dt: number; play_count: number; created_at: string }>>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// Dialog states
const dialogVisible = ref(false)

const loadHistory = async () => {
  loading.value = true
  try {
    const params = {
      keyword: searchKeyword.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await getPlayHistory(params)
    console.log("🚀 ~ loadHistory ~ response:", response)
    songs.value = response.data || []
    total.value = response.total || 0
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100)
  }
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

const refresh = () => {
  currentPage.value = 1
  loadHistory()
}

const handleSearch = () => {
  currentPage.value = 1
  loadHistory()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadHistory()
}

const handleClearAll = () => {
  dialogVisible.value = true
}

const handleConfirm = async () => {
  try {
    const result = await clearPlayHistory()
    console.log("🚀 ~ handleConfirm ~ result:", result)
    // 清空成功后刷新列表
    currentPage.value = 1
    await loadHistory()
  } catch (error) {
    console.error('清空播放历史失败:', error)
  }
  dialogVisible.value = false
}

const handleCancel = () => {
  dialogVisible.value = false
}

onMounted(() => loadHistory())
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

.header-actions {
  display: flex;
  gap: 12px;
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
