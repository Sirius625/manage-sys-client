<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>用户信息</h3>
    </div>

    <div class="profile-grid">
      <div class="profile-card">
        <h4>基本信息</h4>
        <div class="avatar-section">
          <el-avatar :size="120" :src="avatarPreview || defaultAvatar" />
          <el-upload
            class="avatar-uploader"
            accept="image/*"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-change="handleAvatarChange"
          >
            <el-button type="primary" size="small">上传头像</el-button>
          </el-upload>
        </div>

        <el-form :model="profile" :rules="profileRules" ref="profileFormRef" label-width="100px" class="profile-form">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="profile.name" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="profile.email" />
          </el-form-item>
          <el-form-item label="角色">
            <el-input v-model="profile.role" disabled />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="profile.remark" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitProfile">保存信息</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="profile-card">
        <h4>密码重置</h4>
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" class="profile-form">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input type="password" v-model="passwordForm.currentPassword" placeholder="请输入当前密码" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitPassword">重置密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store'
import { ElMessage } from 'element-plus'
import { fetchUserProfile, updateUserProfile, updateUserPassword } from '@/api/http'
import type { FormInstance } from 'element-plus'

const authStore = useAuthStore()
const userId = computed(() => authStore.user?.id || 0)
const defaultAvatar = 'https://via.placeholder.com/120?text=头像'

const profile = reactive({
  id: 0,
  name: '',
  email: '',
  role: '',
  avatar: '',
  avatarBase64: '',
  remark: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const avatarPreview = ref('')

const profileRules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的新密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loadUserProfile = async () => {
  if (!userId.value) {
    ElMessage.error('用户未登录，无法加载信息')
    return
  }
  try {
    const response = await fetchUserProfile(userId.value)
    if (response.data) {
      Object.assign(profile, response.data)
      avatarPreview.value = response.data.avatar ? import.meta.env.VITE_UPLOAD_BASE_URL + response.data.avatar : ''
      console.log('用户信息加载成功:', avatarPreview)
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  }
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const beforeUpload = () => false

const handleAvatarChange = async (file: any) => {
  try {
    const base64 = await toBase64(file.raw)
    profile.avatarBase64 = base64
    avatarPreview.value = base64
  } catch (error) {
    ElMessage.error('头像读取失败')
  }
}

const submitProfile = async () => {
  if (!profileFormRef.value) return
  profileFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!userId.value) {
      ElMessage.error('用户未登录，无法保存信息')
      return
    }
    try {
      await updateUserProfile(userId.value, {
        name: profile.name,
        email: profile.email,
        avatarBase64: profile.avatarBase64 || undefined,
        remark: profile.remark
      })
      ElMessage.success('用户信息已保存')
      profile.avatarBase64 = ''
    } catch (error: any) {
      ElMessage.error(error?.message || '保存失败')
    }
  })
}

const submitPassword = async () => {
  if (!passwordFormRef.value || !userId.value) return
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await updateUserPassword(userId.value, passwordForm.currentPassword, passwordForm.newPassword)
      ElMessage.success('密码已重置')
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.message || '密码重置失败')
    }
  })
}

onMounted(loadUserProfile)
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
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.profile-card {
  background: #fafafa;
  border-radius: 16px;
  padding: 20px;
}
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.avatar-uploader {
  display: inline-flex;
  align-items: center;
}
.profile-form {
  max-width: 100%;
}
@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
