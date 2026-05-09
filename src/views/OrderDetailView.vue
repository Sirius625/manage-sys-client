<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>订单详情 - {{ order.id }}</h3>
      <el-button type="primary" @click="backToList">返回订单列表</el-button>
    </div>
    <el-descriptions title="订单信息" :column="1" border>
      <el-descriptions-item label="订单号">{{ order.id }}</el-descriptions-item>
      <el-descriptions-item label="客户">{{ order.customer }}</el-descriptions-item>
      <el-descriptions-item label="电话">{{ order.phone }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ order.address }}</el-descriptions-item>
      <el-descriptions-item label="金额">¥{{ order.amount }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-select v-model="order.status" style="width: 160px;">
          <el-option label="待发货" value="待发货" />
          <el-option label="待支付" value="待支付" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
      </el-descriptions-item>
    </el-descriptions>

    <div class="detail-actions" style="margin-top: 16px;">
      <el-button type="primary" @click="saveStatus">保存状态</el-button>
      <el-button type="default" @click="backToList">返回订单列表</el-button>
    </div>

    <el-table :data="order.items" stripe style="width: 100%; margin-top: 24px;">
      <el-table-column prop="name" label="商品" />
      <el-table-column prop="qty" label="数量" width="100" />
      <el-table-column prop="price" label="单价" width="120">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchOrderById, updateOrderStatus } from '@/api/http'

const route = useRoute()
const router = useRouter()
const order = ref({
  id: 0,
  customer: '',
  amount: 0,
  status: '',
  address: '',
  phone: '',
  items: [] as Array<{ name: string; qty: number; price: number }>
})

const orderId = Number(route.params.id)

const loadOrder = async () => {
  const response = await fetchOrderById(orderId)
  order.value = response.data
}

const backToList = () => {
  router.push({ name: 'Orders' })
}

const saveStatus = async () => {
  await updateOrderStatus(order.value.id, order.value.status)
  backToList()
}

onMounted(loadOrder)
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
</style>
