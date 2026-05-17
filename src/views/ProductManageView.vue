<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>商品管理</h3>
      <div class="page-actions">
        <el-button type="primary" @click="refresh">刷新列表</el-button>
        <el-button type="success" @click="addProduct">添加商品</el-button>
      </div>
    </div>

    <div class="filter-row">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称 / ID"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch"
        style="width: 260px"
      />
      <el-select
        v-model="categoryFilter"
        placeholder="选择分类"
        clearable
        @change="handleSearch"
        style="width: 180px"
      >
        <el-option label="全部分类" value="" />
        <el-option label="外设" value="外设" />
        <el-option label="显示器" value="显示器" />
        <el-option label="家具" value="家具" />
        <el-option label="音频" value="音频" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="success" @click="exportCsv">导出商品</el-button>
    </div>

    <el-table :data="products" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="商品编号" width="120" />
      <el-table-column prop="name" label="名称" width="220" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="text" @click="viewDetail(row.id)">查看详情</el-button>
          <el-button type="text" @click="updateStock(row)">修改库存</el-button>
          <el-button type="text" @click="updateStatus(row.id, row.status === '在售' ? '下架' : '在售')">
            {{ row.status === '在售' ? '下架' : '上架' }}
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

    <!-- 修改库存弹窗 -->
    <el-dialog
      v-model="stockDialogVisible"
      title="修改库存"
      width="400px"
    >
      <div class="stock-form">
        <p><strong>商品：</strong>{{ currentProduct?.name }}</p>
        <p><strong>当前库存：</strong>{{ currentProduct?.stock }}</p>
        <el-form :model="stockForm" label-width="80px">
          <el-form-item label="新库存">
            <el-input-number
              v-model="stockForm.newStock"
              :min="0"
              :max="99999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateStock">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { fetchProducts, batchUpdateProductStatus, updateProductStock } from '@/api/http'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()

const products = ref<Array<{ id: number; name: string; category: string; stock: number; price: number; status: string }>>([])
const searchKeyword = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const loading = ref(false)

// Dialog states
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
let pendingAction: (() => void) | null = null

// Stock dialog states
const stockDialogVisible = ref(false)
const currentProduct = ref<{ id: number; name: string; category: string; stock: number; price: number; status: string } | null>(null)
const stockForm = ref({ newStock: 0 })

const loadProducts = async () => {
  loading.value = true
  try {
    const response = await fetchProducts({
      keyword: searchKeyword.value,
      category: categoryFilter.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    products.value = response.data
    total.value = response.total
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 100) // 模拟加载时间，实际项目中可根据需要调整或去掉
  }
}

const refresh = () => {
  currentPage.value = 1
  loadProducts()
}

const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadProducts()
}

const updateStatus = (id: number, status: string) => {
  const action = status === '下架' ? '下架' : '上架'
  dialogTitle.value = '确认操作'
  dialogMessage.value = `确定要${action}商品 ${id} 吗？`
  pendingAction = async () => {
    await batchUpdateProductStatus([id], status)
    loadProducts()
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

const addProduct = () => {
  router.push({ name: 'ProductAdd' })
}

const viewDetail = (id: number) => {
  // 跳转到商品详情页面
  router.push({ name: 'ProductDetail', params: { id } })
}

const updateStock = (product: { id: number; name: string; category: string; stock: number; price: number; status: string }) => {
  currentProduct.value = product
  stockForm.value.newStock = product.stock
  stockDialogVisible.value = true
}

const confirmUpdateStock = async () => {
  if (!currentProduct.value) return
  
  try {
    await updateProductStock(currentProduct.value.id, stockForm.value.newStock)
    ElMessage.success('库存更新成功')
    stockDialogVisible.value = false
    loadProducts() // 重新加载数据
  } catch (error) {
    ElMessage.error('库存更新失败')
  }
}

const exportCsv = () => {
  const rows = [
    ['商品编号', '名称', '分类', '库存', '价格', '状态'],
    ...products.value.map((item) => [item.id, item.name, item.category, item.stock, item.price, item.status])
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'products.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(loadProducts)
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
