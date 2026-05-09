<template>
  <div class="page-card">
    <h3>设置</h3>
    <el-form :model="settingsStore" label-width="90px" class="settings-form">
      <el-form-item label="用户名">
        <el-input v-model="settingsStore.username" disabled />
      </el-form-item>
      <el-form-item label="主题">
        <el-select v-model="settingsStore.theme" placeholder="请选择主题">
          <el-option label="深色" value="dark" />
          <el-option label="浅色" value="light" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useSettingsStore } from '@/store'

const settingsStore = useSettingsStore()

watch(
  () => settingsStore.theme,
  (value) => {
    document.documentElement.dataset.theme = value
  },
  { immediate: true }
)

const saveSettings = () => {
  settingsStore.setTheme(settingsStore.theme)
}
</script>

<style scoped>
.page-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.settings-form {
  max-width: 420px;
}
</style>
