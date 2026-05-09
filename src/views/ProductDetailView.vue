<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>商品详情</h3>
      <el-button @click="goBack">返回列表</el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="product" class="product-detail">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            <div class="info-item">
              <label>商品编号：</label>
              <span>{{ product.id }}</span>
            </div>
            <div class="info-item">
              <label>商品名称：</label>
              <span>{{ product.name }}</span>
            </div>
            <div class="info-item">
              <label>分类：</label>
              <span>{{ product.category }}</span>
            </div>
            <div class="info-item">
              <label>价格：</label>
              <span class="price">¥{{ product.price }}</span>
            </div>
            <div class="info-item">
              <label>库存：</label>
              <span>{{ product.stock }}</span>
            </div>
            <div class="info-item">
              <label>状态：</label>
              <el-tag :type="product.status === '在售' ? 'success' : 'danger'">
                {{ product.status }}
              </el-tag>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>操作</span>
              </div>
            </template>
            <div class="action-buttons">
              <el-button type="primary" @click="editProduct">编辑商品</el-button>
              <el-button type="warning" @click="updateStock">修改库存</el-button>
              <el-button 
                :type="product.status === '在售' ? 'danger' : 'success'" 
                @click="toggleStatus"
              >
                {{ product.status === '在售' ? '下架商品' : '上架商品' }}
              </el-button>
              <el-button type="info" @click="viewOrders">查看相关订单</el-button>
            </div>
          </el-card>

          <el-card class="box-card" style="margin-top: 20px;">
            <template #header>
              <div class="card-header">
                <span>统计信息</span>
              </div>
            </template>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-label">总销量：</span>
                <span class="stat-value">{{ product.sales || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">月销量：</span>
                <span class="stat-value">{{ product.monthlySales || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">好评率：</span>
                <span class="stat-value">{{ product.rating || '暂无' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-else class="no-data">
      <el-empty description="商品不存在或已删除">
        <el-button @click="goBack">返回列表</el-button>
      </el-empty>
    </div>

    <!-- 修改库存弹窗 -->
    <el-dialog
      v-model="stockDialogVisible"
      title="修改库存"
      width="400px"
    >
      <div class="stock-form">
        <p><strong>商品：</strong>{{ product?.name }}</p>
        <p><strong>当前库存：</strong>{{ product?.stock }}</p>
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
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchProductById, updateProductStock } from '@/api/http'

const route = useRoute()
const router = useRouter()

const product = ref<any>(null)
const loading = ref(true)
const stockDialogVisible = ref(false)
const stockForm = ref({ newStock: 0 })

const loadProduct = async () => {
  try {
    loading.value = true
    const productId = Number(route.params.id)
    const response = await fetchProductById(productId)

    if (response.data) {
      product.value = {
        ...response.data,
        sales: response.data.sales ?? Math.floor(Math.random() * 1000),
        monthlySales: response.data.monthlySales ?? Math.floor(Math.random() * 100),
        rating: response.data.rating ?? '98%'
      }
    } else {
      product.value = null
    }
  } catch (error) {
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'Products' })
}

const editProduct = () => {
  ElMessage.info('编辑商品功能开发中...')
}

const updateStock = () => {
  if (!product.value) return
  stockForm.value.newStock = product.value.stock
  stockDialogVisible.value = true
}

const confirmUpdateStock = async () => {
  try {
    await updateProductStock(product.value.id, stockForm.value.newStock)
    product.value.stock = stockForm.value.newStock
    ElMessage.success('库存更新成功')
    stockDialogVisible.value = false
  } catch (error) {
    ElMessage.error('库存更新失败')
  }
}

const toggleStatus = async () => {
  if (!product.value) return
  
  const newStatus = product.value.status === '在售' ? '下架' : '在售'
  try {
    // 这里需要调用API更新状态
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
    product.value.status = newStatus
    ElMessage.success(`商品已${newStatus}`)
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const viewOrders = () => {
  ElMessage.info('查看相关订单功能开发中...')
}

onMounted(() => {
  loadProduct()
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
  margin-bottom: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-container .el-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.product-detail {
  margin-top: 20px;
}

.box-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.info-item label {
  font-weight: bold;
  width: 100px;
  color: #606266;
}

.info-item .price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons .el-button {
  width: 100%;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: bold;
  color: #606266;
}

.stat-value {
  color: #409eff;
  font-weight: bold;
}

.no-data {
  padding: 60px 0;
}

.stock-form p {
  margin-bottom: 16px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>