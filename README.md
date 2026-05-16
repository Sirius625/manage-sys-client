# 后台管理系统 - 前端 (Manage System Client)

一个基于 Vue 3 + TypeScript + Vite 的企业级后台管理系统前端。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 请求**: Axios
- **图表**: ECharts

## 功能模块

### 🔐 登录认证
- 用户登录/注册
- JWT Token 鉴权
- 基于角色的权限控制（管理员/编辑员）

### 📊 仪表盘 (Dashboard)
- 数据统计概览
- 订单总数、营收、活跃用户、待发货数量

### 📦 订单管理 (Orders)
- 订单列表查询（支持关键词、状态筛选）
- 订单详情查看
- 订单状态更新
- 批量更新订单状态

### 🏷️ 商品管理 (Products)
- 商品列表查询（支持关键词、分类筛选）
- 商品详情查看
- 商品库存管理
- 商品状态批量更新
- 新增商品

### 👥 用户管理 (Users)
- 用户列表查询（支持关键词、角色、状态筛选）
- 用户状态管理（正常/冻结）
- 用户信息编辑
- 密码修改

### 📝 文章管理 (Articles)
- 文章列表查询（支持关键词、分类筛选）
- 文章详情查看
- 新建/编辑文章（支持 Markdown 编辑与预览）
- 文章删除
- 文章分类管理

### 🖼️ 图片管理 (Images)
- 图片列表查询（支持关键词、分类、可见性筛选）
- 图片上传（支持标题、描述、分类、可见性设置）
- 图片预览
- 图片删除

### 🎵 喜欢的歌曲 (Liked Songs)
- 歌曲列表展示
- 歌曲搜索
- 喜欢/取消喜欢操作

### 📜 播放历史 (Play History)
- 播放历史列表
- 清空播放历史

### 🔄 售后管理 (After Sales)
- 售后记录查询
- 售后状态更新

### 📈 数据分析 (Analytics)
- 销售趋势图表
- 商品分类占比图表

### ⚙️ 设置 (Settings)
- 系统设置（仅管理员）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 环境变量

在 `.env` 中配置：

```env
VITE_API_BASE_URL=http://localhost:3030/api
```

## 项目结构

```
src/
├── api/              # API 请求层
│   ├── index.ts      # Axios 封装（请求/响应拦截器）
│   └── http.ts       # 业务 API 接口
├── components/       # 公共组件
│   └── ConfirmDialog.vue # 确认对话框
├── router/           # 路由配置（含路由守卫）
├── store/            # Pinia 状态管理（认证、设置）
├── views/            # 页面视图
│   ├── LoginView.vue              # 登录页
│   ├── DashboardView.vue          # 仪表盘
│   ├── OrderListView.vue          # 订单列表
│   ├── OrderDetailView.vue        # 订单详情
│   ├── ProductManageView.vue      # 商品管理
│   ├── AddProductView.vue         # 新增商品
│   ├── ProductDetailView.vue      # 商品详情
│   ├── UserManageView.vue         # 用户管理
│   ├── UserProfileView.vue        # 个人信息
│   ├── ArticleManageView.vue      # 文章管理
│   ├── ImageManageView.vue        # 图片管理
│   ├── LikedSongs.vue             # 喜欢的歌曲
│   ├── PlayHistory.vue            # 播放历史
│   ├── AfterSalesView.vue         # 售后管理
│   ├── DataAnalysisView.vue       # 数据分析
│   └── SettingsView.vue           # 设置
└── App.vue           # 根组件（侧边栏 + 顶栏布局）
```

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| editor | editor123 | 编辑员 |
