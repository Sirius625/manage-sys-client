<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>喜欢的歌曲</h3>
      <el-button type="primary" @click="refresh">刷新列表</el-button>
    </div>

    <div class="filter-row">
      <el-input v-model="searchKeyword" placeholder="搜索歌曲id / 歌曲名称" clearable @clear="handleSearch"
        @keyup.enter.native="handleSearch" style="width: 260px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="songs" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="歌曲编号" width="120" />
      <el-table-column prop="name" label="歌曲名称" width="180" />
      <el-table-column prop="artist" label="歌手" width="120" />
      <el-table-column prop="play_count" label="播放次数" width="120" />
      <el-table-column prop="dt" label="时长" width="120">
        <template #default="{ row }">
          {{ Math.floor(row.dt / 60000) }}:{{ String(Math.floor((row.dt % 60000) / 1000)).padStart(2, '0') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="text" @click="toggleStatus(row)">
            不喜欢
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination background layout="prev, pager, next, jumper, ->, total" :page-size="pageSize"
        :current-page="currentPage" :total="total" @current-change="handlePageChange" />
    </div>

    <ConfirmDialog v-model:visible="dialogVisible" :title="dialogTitle" :message="dialogMessage"
      @confirm="handleConfirm" @cancel="handleCancel">
      <div>
        确定取消喜欢
        <span style="color: #f56c6c;">&lt;&lt;{{ dialogMessage }}&gt;&gt;</span>
        这首歌吗？
      </div>
      <!-- 默认插槽：对话框主体内容 -->
      <div>
        <p>此操作不可恢复，请谨慎操作。</p>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSongs, updateSongs } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const songs = ref<Array<{ id: number; name: string; artist: string; duration: string }>>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// Dialog states
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
let pendingAction: (() => void) | null = null

const loadSongs = async (searchKeyword: string) => {
  loading.value = true
  try {
    const params = {
      keyword: searchKeyword,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await getSongs(params)
    console.log("🚀 ~ loadSongs ~ response:", response)
    songs.value = response.data
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100) // 模拟加载时间，实际项目中可根据需要调整或去掉

  }
}

const refresh = () => {
  currentPage.value = 1
  loadSongs(searchKeyword.value)
}

const handleSearch = () => {
  currentPage.value = 1
  loadSongs(searchKeyword.value)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadSongs(searchKeyword.value)
}

const toggleStatus = (row: any) => {
  console.log("🚀 ~ toggleStatus ~ row:", row)
  dialogVisible.value = true
  dialogTitle.value = '取消喜欢'
  dialogMessage.value = `${row.name}`
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

onMounted(() => loadSongs(searchKeyword.value))
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