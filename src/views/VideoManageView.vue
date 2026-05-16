<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>视频管理</h3>
      <el-button type="primary" @click="showUploadDialog = true">上传视频</el-button>
    </div>

    <div class="filter-row">
      <el-input v-model="searchKeyword" placeholder="搜索视频标题 / 描述" clearable @clear="handleSearch"
        @keyup.enter="handleSearch" style="width: 260px" />
      <el-select v-model="filterIsPublic" placeholder="可见性" clearable @change="handleIsPublicChange" style="width: 120px">
        <el-option label="全部" value="" />
        <el-option label="公开" value="1" />
        <el-option label="私密" value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="refresh">刷新列表</el-button>
    </div>

    <el-table :data="videos" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column label="视频" width="160">
        <template #default="{ row }">
          <video
            :src="UPLOAD_BASE_URL + row.url"
            style="width: 140px; height: 80px; cursor: pointer; object-fit: cover; border-radius: 4px; background: #000"
            muted
            @mouseenter="($event.target as HTMLVideoElement)?.play()"
            @mouseleave="($event.target as HTMLVideoElement)?.pause()"
            @click="previewVideo(UPLOAD_BASE_URL + row.url)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="author" label="上传者" width="120" />
      <el-table-column label="可见性" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_public ? 'success' : 'danger'" size="small">
            {{ row.is_public ? '公开' : '私密' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="100">
        <template #default="{ row }">
          {{ formatFileSize(row.file_size) }}
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="180">
        <template #default="{ row }">
          {{ row.created_at ? new Date(row.created_at).toLocaleString('zh-CN') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="text" style="color: #f56c6c" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination background layout="prev, pager, next, jumper, ->, total" :page-size="pageSize"
        :current-page="currentPage" :total="total" @current-change="handlePageChange" />
    </div>

    <!-- 上传视频对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传视频" width="550px" :close-on-click-modal="false" append-to-body>
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="视频文件" required>
          <el-upload ref="uploadRef" :auto-upload="false" :show-file-list="false" :on-change="handleFileChange"
            accept="video/mp4,video/webm,video/ogg">
            <el-button type="primary">选择视频</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 MP4/WebM/Ogg，最大 100MB</div>
            </template>
          </el-upload>
          <div v-if="previewUrl" class="upload-preview">
            <video :src="previewUrl" style="max-width: 100%; max-height: 200px" controls />
          </div>
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="uploadForm.title" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="请输入视频描述（可选）" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-radio-group v-model="uploadForm.isPublic">
            <el-radio :value="true">公开</el-radio>
            <el-radio :value="false">私密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          {{ uploading ? '上传中...' : '确认上传' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 视频预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="视频预览" width="800px" top="5vh" destroy-on-close>
      <div style="text-align: center">
        <video :src="previewVideoUrl" style="max-width: 100%; max-height: 70vh" controls autoplay />
      </div>
    </el-dialog>

    <ConfirmDialog v-model:visible="dialogVisible" title="确认删除" :message="dialogMessage" @confirm="handleConfirm"
      @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchVideos, uploadVideo, deleteVideo } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:3030'

const videos = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const filterIsPublic = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 上传相关
const showUploadDialog = ref(false)
const uploading = ref(false)
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)
const uploadForm = ref({
  title: '',
  description: '',
  isPublic: true
})

// 视频预览
const showPreviewDialog = ref(false)
const previewVideoUrl = ref('')

const previewVideo = (url: string) => {
  previewVideoUrl.value = url
  showPreviewDialog.value = true
}

// 删除确认
const dialogVisible = ref(false)
const dialogMessage = ref('')
const deleteTarget = ref<any>(null)

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const fetchData = async () => {
  loading.value = true
  try {
    const result = await fetchVideos({
      keyword: searchKeyword.value,
      isPublic: filterIsPublic.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    videos.value = result.data
    total.value = result.total
  } catch (e) {
    console.error('获取视频列表失败:', e)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  currentPage.value = 1
  fetchData()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleIsPublicChange = (value: string) => {
  filterIsPublic.value = value
  currentPage.value = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleFileChange = (file: any) => {
  const rawFile = file.raw as File | undefined
  if (!rawFile) return

  if (rawFile.size > 100 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 100MB')
    return
  }

  if (!rawFile.type.startsWith('video/')) {
    ElMessage.error('仅支持 MP4/WebM/Ogg 格式')
    return
  }

  selectedFile.value = rawFile
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(rawFile)
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请选择视频文件')
    return
  }
  if (!uploadForm.value.title) {
    ElMessage.error('请输入视频标题')
    return
  }

  uploading.value = true
  try {
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(selectedFile.value!)
    })

    const result = await uploadVideo({
      title: uploadForm.value.title,
      description: uploadForm.value.description,
      isPublic: uploadForm.value.isPublic,
      videoBase64: base64
    })

    if (result && result.data) {
      ElMessage.success('上传成功')
      showUploadDialog.value = false
      uploadForm.value.title = ''
      uploadForm.value.description = ''
      uploadForm.value.isPublic = true
      previewUrl.value = ''
      selectedFile.value = null
      fetchData()
    } else {
      ElMessage.error('上传失败')
    }
  } catch (e) {
    console.error('上传失败:', e)
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const handleDelete = (row: any) => {
  deleteTarget.value = row
  dialogMessage.value = `确定要删除视频「${row.title}」吗？此操作不可恢复。`
  dialogVisible.value = true
}

const handleConfirm = async () => {
  if (!deleteTarget.value) return
  try {
    const result = await deleteVideo(deleteTarget.value.id)
    if (result && result.success) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (e) {
    console.error('删除失败:', e)
    ElMessage.error('删除失败')
  } finally {
    dialogVisible.value = false
    deleteTarget.value = null
  }
}

const handleCancel = () => {
  dialogVisible.value = false
  deleteTarget.value = null
}

onMounted(() => {
  fetchData()
})
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

.upload-preview {
  margin-top: 10px;
  padding: 10px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  text-align: center;
}
</style>
