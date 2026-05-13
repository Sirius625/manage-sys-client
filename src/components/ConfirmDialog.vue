<template>
  <el-dialog :model-value="visible" :title="title" width="400px" :before-close="handleCancel"
    @update:model-value="updateVisible">
    <!-- 正确使用 #header 插槽 -->
    <template #header>
      <slot name="header">
        <!-- 可选：提供默认标题，如果父组件没传 header 则显示这个 -->
        <span>{{ title }}</span>
      </slot>
    </template>
    <slot>
      <p> 确定执行此操作吗？ </p>
    </slot>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelText ? cancelText : '取消' }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{ confirmText ? confirmText : '确认' }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  title: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

const updateVisible = (value: boolean) => {
  emit('update:visible', value)
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>