<template>
    <div class="app-shell">
        <aside v-if="authStore.isLoggedIn" class="sidebar">
            <h1>管理后台</h1>
            <el-menu v-if="authStore.isLoggedIn" :default-active="currentRouteName" class="menu" router
                :collapse="false" background-color="#1f2937" text-color="#cbd5e1" active-text-color="#3b82f6">
                <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
                    {{ item.name }}
                </el-menu-item>
            </el-menu>
        </aside>

        <section class="panel">
            <header class="topbar">
                <div>
                    <h2>个人博客——后台管理系统</h2>
                    <p class="role-tag">当前身份：{{ authStore.user?.role || '未登录' }}</p>
                </div>
                <el-button type="text" @click="handleLogout" v-if="authStore.isLoggedIn">退出登录</el-button>
            </header>
            <main class="workspace">
                <router-view />
            </main>
        </section>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const currentRouteName = computed(() => route.path)

const gridColumns = computed(() => authStore.isLoggedIn ? '240px 1fr' : '1fr')

const menuItems = computed(() => {
    const routes = router.getRoutes()
    return routes
        .filter(
            (item) =>
                item.meta?.requiresAuth &&
                item.meta?.showInMenu &&
                (item.meta?.roles as string[]).includes(authStore.role)
        )
        .map((item) => ({ path: item.path, name: String(item.meta?.title ?? item.name) }))
})


const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
        authStore.logout()
        router.push({ name: 'Login' })
    }
}
</script>

<style scoped>
.app-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: v-bind(gridColumns);
    background: #f5f7fb;
}

.sidebar {
    padding: 24px 16px;
    background: #1f2937;
    color: #fff;
}

.sidebar h1 {
    font-size: 20px;
    margin-bottom: 24px;
}

.menu {
    border-right: none;
}

.panel {
    /* width: 100%; */
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.topbar {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.role-tag {
    margin: 0;
    font-size: 12px;
    color: #64748b;
}

.workspace {
    padding: 24px;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .sidebar {
        display: none;
    }

    .app-shell {
        grid-template-columns: 1fr !important;
    }

    .topbar {
        padding: 12px 16px;
    }

    .topbar h2 {
        font-size: 16px;
    }

    .workspace {
        padding: 12px;
    }
}
</style>
