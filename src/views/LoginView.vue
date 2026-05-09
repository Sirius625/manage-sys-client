<template>
    <div class="login-page">
        <el-card class="login-card">
      <h2>{{ isLoginMode ? '登录后台' : '注册用户' }}</h2>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="登录" name="login"></el-tab-pane>
        <el-tab-pane label="注册" name="register"></el-tab-pane>
      </el-tabs>

      <!-- 登录表单 -->
      <el-form v-if="isLoginMode" :model="loginForm" label-position="top" class="login-form" :rules="loginRules" ref="loginFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" block @click="submitLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-else :model="registerForm" label-position="top" class="login-form" :rules="registerRules" ref="registerFormRef">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="registerForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="普通用户" />
            <el-option label="管理员" value="管理员" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" block @click="submitRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import { registerUser, loginUser } from '@/api/http'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const isLoginMode = computed(() => activeTab.value === 'login')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  password: '',
  confirmPassword: '',
  email: '',
  role: '普通用户' as '普通用户' | '管理员' as '管理员'
})

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const registerRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name
}

const submitLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const user = await loginUser(loginForm.username, loginForm.password)
        if (user) {
          authStore.login(user)
          router.push({ name: 'Dashboard' })
        } else {
          // 这里可以显示错误消息
          console.error('用户名或密码错误')
        }
      } catch (error) {
        console.error('登录失败:', error)
      }
    }
  })
}

const submitRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await registerUser({
          name: registerForm.name,
          password: registerForm.password,
          email: registerForm.email,
          role: registerForm.role
        })
        // 注册成功后自动登录
        const user = {
          id: Date.now(), // 临时ID
          name: registerForm.name,
          email: registerForm.email,
          role: registerForm.role,
          avatar: '', // 默认头像,
          token: '' // 注册后没有token，登录后会获取
        }
        authStore.login(user)
        router.push({ name: 'Dashboard' })
      } catch (error) {
        console.error('注册失败:', error)
      }
    }
  })
}
</script>

<style scoped>
.login-page {
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
}
.login-card {
  width: 420px;
  padding: 32px;
}
.login-card h2 {
  margin: 0 0 24px;
  text-align: center;
}
.login-form {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}
</style>
