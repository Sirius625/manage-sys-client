<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>图片管理</h3>
      <el-button type="primary" @click="showUploadDialog = true">上传图片</el-button>
    </div>

    <div class="filter-row">
      <el-input v-model="searchKeyword" placeholder="搜索图片标题 / 描述" clearable @clear="handleSearch"
        @keyup.enter.native="handleSearch" style="width: 260px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="refresh">刷新列表</el-button>
    </div>

    <el-table :data="images" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column label="图片" width="120">
        <template #default="{ row }">
          <el-image :src="'http://localhost:3030' + row.url" style="width: 80px; height: 60px; cursor: pointer"
            fit="cover" @click="previewImage('http://localhost:3030' + row.url)" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="author" label="上传者" width="120" />
      <el-table-column prop="likes" label="点赞数" width="80" />
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

    <!-- 上传图片对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传图片" width="500px" :close-on-click-modal="false">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="图片文件" required>
          <el-upload ref="uploadRef" :auto-upload="false" :show-file-list="false" :on-change="handleFileChange"
            accept="image/jpeg,image/png,image/webp">
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 JPG/PNG/WebP，最大 5MB</div>
            </template>
          </el-upload>
          <div v-if="previewUrl" class="upload-preview">
            <el-image :src="previewUrl" style="max-width: 100%; max-height: 200px" fit="contain" />
          </div>
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="uploadForm.title" placeholder="请输入图片标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="请输入图片描述（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          {{ uploading ? '上传中...' : '确认上传' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="图片预览" width="800px" top="5vh" destroy-on-close>
      <div style="text-align: center">
        <el-image :src="previewImageUrl" style="max-width: 100%; max-height: 70vh" fit="contain" />
      </div>
    </el-dialog>

    <ConfirmDialog v-model:visible="dialogVisible" title="确认删除" :message="dialogMessage" @confirm="handleConfirm"
      @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchImages, uploadImage, deleteImage } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const images = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
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
  description: ''
})

// 图片预览
const showPreviewDialog = ref(false)
const previewImageUrl = ref('')

const previewImage = (url: string) => {
  previewImageUrl.value = url
  showPreviewDialog.value = true
}

// 删除确认
const dialogVisible = ref(false)
const dialogMessage = ref('')
const deleteTarget = ref<any>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const result = await fetchImages({
      keyword: searchKeyword.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    images.value = result.data
    total.value = result.total
  } catch (e) {
    console.error('获取图片列表失败:', e)
    ElMessage.error('获取图片列表失败')
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100) // 模拟加载时间，实际项目中可根据需要调整或去掉
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

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleFileChange = (file: any) => {
  const rawFile = file.raw as File | undefined
  if (!rawFile) return

  if (rawFile.size > 5 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 5MB')
    return
  }

  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('仅支持 JPG/PNG/WebP 格式')
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
    ElMessage.error('请选择图片文件')
    return
  }
  if (!uploadForm.value.title) {
    ElMessage.error('请输入图片标题')
    return
  }

  uploading.value = true
  try {
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(selectedFile.value!)
    })

    const result = await uploadImage({
      title: uploadForm.value.title,
      description: uploadForm.value.description,
      imageBase64: base64
    })

    if (result && result.data) {
      ElMessage.success('上传成功')
      showUploadDialog.value = false
      uploadForm.value.title = ''
      uploadForm.value.description = ''
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
  dialogMessage.value = `确定要删除图片「${row.title}」吗？此操作不可恢复。`
  dialogVisible.value = true
}

const handleConfirm = async () => {
  if (!deleteTarget.value) return
  try {
    const result = await deleteImage(deleteTarget.value.id)
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
