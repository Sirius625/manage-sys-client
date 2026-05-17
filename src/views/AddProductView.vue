<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>新增商品</h3>
      <el-button @click="goBack">返回列表</el-button>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="product-form">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类">
          <el-option label="外设" value="外设" />
          <el-option label="显示器" value="显示器" />
          <el-option label="家具" value="家具" />
          <el-option label="音频" value="音频" />
        </el-select>
      </el-form-item>
      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="form.price" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="在售" value="在售" />
          <el-option label="下架" value="下架" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addProduct } from '@/api/http'

const router = useRouter()
const form = ref({
  name: '',
  category: '',
  stock: 0,
  price: 0,
  status: '在售'
})
const formRef = ref()

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  stock: [{ required: true, type: 'number', min: 0, message: '请输入有效库存', trigger: 'change' }],
  price: [{ required: true, type: 'number', min: 0, message: '请输入有效价格', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const goBack = () => {
  router.push({ name: 'Products' })
}

const submitForm = () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      await addProduct({
        name: form.value.name,
        category: form.value.category,
        stock: form.value.stock,
        price: form.value.price,
        status: form.value.status
      })
      ElMessage.success('商品已新增')
      router.push({ name: 'Products' })
    } catch (error) {
      ElMessage.error('新增商品失败')
    }
  })
}
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
.product-form {
  max-width: 600px;
}
</style>