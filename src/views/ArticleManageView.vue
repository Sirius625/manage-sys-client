<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>文章管理</h3>
      <el-button type="primary" @click="openCreateDialog">新建文章</el-button>
    </div>

    <div class="filter-row">
      <el-input v-model="searchKeyword" placeholder="搜索文章标题 / 内容" clearable @clear="handleSearch"
        @keyup.enter="handleSearch" style="width: 260px" />
      <el-select v-model="filterCategory" placeholder="选择分类" clearable @change="handleCategoryChange" style="width: 140px">
        <el-option label="全部分类" value="" />
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="refresh">刷新列表</el-button>
    </div>

    <el-table :data="articles" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="summary-text">{{ row.summary || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="100">
        <template #default="{ row }">
          <el-tag :type="getCategoryTagType(row.category)" size="small">
            {{ row.category || '未分类' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="160">
        <template #default="{ row }">
          <div class="tags-wrap">
            <el-tag v-for="tag in (row.tags || [])" :key="tag" size="small" type="info" style="margin: 1px">
              {{ tag }}
            </el-tag>
            <span v-if="!row.tags || row.tags.length === 0" class="no-tags">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="90" />
      <el-table-column prop="likes" label="点赞" width="60" align="center" />
      <el-table-column prop="views" label="浏览" width="60" align="center" />
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">
          {{ row.updated_at ? new Date(row.updated_at).toLocaleString('zh-CN') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="text" style="color: #f56c6c" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination background layout="prev, pager, next, jumper, ->, total" :page-size="pageSize"
        :current-page="currentPage" :total="total" @current-change="handlePageChange" />
    </div>

    <!-- 文章编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEditing ? '编辑文章' : '新建文章'" width="800px"
      :close-on-click-modal="false" append-to-body top="3vh">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="选择分类" style="width: 100%" allow-create filterable>
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple placeholder="输入标签后回车添加" style="width: 100%" allow-create filterable>
            <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="文章摘要（可选）" />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="form.cover" placeholder="封面图片URL（可选）" />
        </el-form-item>
        <el-form-item label="内容" required>
          <div class="editor-wrapper">
            <div class="editor-tabs">
              <span :class="{ active: editorTab === 'write' }" @click="editorTab = 'write'">编辑</span>
              <span :class="{ active: editorTab === 'preview' }" @click="editorTab = 'preview'">预览</span>
            </div>
            <textarea v-if="editorTab === 'write'" v-model="form.content" class="editor-textarea"
              placeholder="支持 Markdown 语法&#10;---&#10;输入文章内容..." />
            <div v-else class="editor-preview markdown-body" v-html="renderedContent"></div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>

    <ConfirmDialog v-model:visible="dialogVisible" title="确认删除" :message="dialogMessage"
      @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchArticles, fetchArticleCategories, createArticle, updateArticle, deleteArticle } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// Markdown 渲染（简单实现）
const renderMarkdown = (md: string): string => {
  if (!md) return ''
  let html = md
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%"/>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 无序列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 分割线
    .replace(/^---$/gm, '<hr>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hulipr])/gm, '<p>')
    .replace(/(<\/?p>)\s*<\/?p>/g, '$1')
  return `<p>${html}</p>`
}

const articles = ref<any[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const filterCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框
const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const editorTab = ref<'write' | 'preview'>('write')

const form = ref({
  title: '',
  content: '',
  summary: '',
  category: '',
  tags: [] as string[],
  cover: ''
})

const allTags = ref<string[]>([])

const renderedContent = computed(() => renderMarkdown(form.value.content))

const getCategoryTagType = (cat: string) => {
  const map: Record<string, string> = {
    '技术': 'primary',
    '生活': 'success',
    '随笔': 'warning',
    '教程': 'danger'
  }
  return map[cat] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const result = await fetchArticles({
      keyword: searchKeyword.value,
      category: filterCategory.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    articles.value = result.data
    total.value = result.total
  } catch (e) {
    console.error('获取文章列表失败:', e)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await fetchArticleCategories()
  } catch (e) {
    console.error('获取分类列表失败:', e)
  }
}

const refresh = () => {
  currentPage.value = 1
  fetchData()
  fetchCategories()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleCategoryChange = (value: string) => {
  filterCategory.value = value
  currentPage.value = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const openCreateDialog = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { title: '', content: '', summary: '', category: '', tags: [], cover: '' }
  editorTab.value = 'write'
  showDialog.value = true
}

const openEditDialog = (row: any) => {
  isEditing.value = true
  editingId.value = row.id
  form.value = {
    title: row.title,
    content: row.content || '',
    summary: row.summary || '',
    category: row.category || '',
    tags: row.tags || [],
    cover: row.cover || ''
  }
  editorTab.value = 'write'
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.value.title.trim()) {
    ElMessage.error('请输入文章标题')
    return
  }
  if (!form.value.content.trim()) {
    ElMessage.error('请输入文章内容')
    return
  }

  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      const result = await updateArticle(editingId.value, form.value)
      if (result && result.success !== false) {
        ElMessage.success('文章更新成功')
        showDialog.value = false
        fetchData()
      } else {
        ElMessage.error('更新失败')
      }
    } else {
      const result = await createArticle(form.value)
      if (result && result.data) {
        ElMessage.success('文章发布成功')
        showDialog.value = false
        fetchData()
      } else {
        ElMessage.error('发布失败')
      }
    }
  } catch (e) {
    console.error('保存文章失败:', e)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 删除确认
const dialogVisible = ref(false)
const dialogMessage = ref('')
const deleteTarget = ref<any>(null)

const handleDelete = (row: any) => {
  deleteTarget.value = row
  dialogMessage.value = `确定要删除文章「${row.title}」吗？此操作不可恢复。`
  dialogVisible.value = true
}

const handleConfirm = async () => {
  if (!deleteTarget.value) return
  try {
    const result = await deleteArticle(deleteTarget.value.id)
    if (result && result.success !== false) {
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
  fetchCategories()
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

.summary-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  color: #64748b;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.no-tags {
  color: #94a3b8;
}

/* 编辑器 */
.editor-wrapper {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #d9d9d9;
  background: #fafafa;
}

.editor-tabs span {
  padding: 8px 20px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.editor-tabs span.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background: #fff;
}

.editor-textarea {
  width: 100%;
  min-height: 350px;
  border: none;
  outline: none;
  padding: 16px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
}

.editor-preview {
  min-height: 350px;
  padding: 16px;
  overflow-y: auto;
  line-height: 1.8;
}

.editor-preview :deep(h1),
.editor-preview :deep(h2),
.editor-preview :deep(h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.editor-preview :deep(p) {
  margin-bottom: 0.8em;
}

.editor-preview :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.editor-preview :deep(code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

.editor-preview :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.editor-preview :deep(ul),
.editor-preview :deep(ol) {
  padding-left: 24px;
  margin-bottom: 0.8em;
}

.editor-preview :deep(hr) {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
}
</style>
