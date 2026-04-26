# MuuCmf Admin Frontend

基于 Vue 3 的 MuuCmf 管理后台前端项目

## 技术栈

- Vue 3.2.8
- TypeScript 4.9.5
- Vite 8.0.10
- Element Plus 2.8.2
- Pinia 3.0.4
- Vue Router 4.1.6
- Axios 1.2.1
- Sass 1.99.0
- ECharts 5.4.1
- VueUse 14.1.0

## 功能特性

- 基于 Vue 3 Composition API 构建
- 完整的权限管理系统（用户、角色、权限）
- 响应式设计，适配多种屏幕尺寸
- 模块化的代码结构
- 支持主题切换（蓝色、深色）
- 丰富的组件库（配置表单组件）
- 微页面可视化编辑
- 多种小程序配置支持（微信、抖音、QQ等）
- 文章、分类、评论管理
- 附件管理
- 消息通知系统
- 配置管理
- 计划任务管理
- 队列管理
- SEO 优化管理

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
# 开发环境
npm run dev

# 生产环境
npm run pro

# 开发服务器（默认模式）
npm run serve
```

### 构建生产版本

```bash
# 生产环境构建
npm run build

# 或
npm run build:pro
```

### 类型检查与构建

```bash
# 开发环境构建（包含类型检查）
npm run build:dev

# 生产环境构建（包含类型检查）
npm run build:pro
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
front_end/
├── src/
│   ├── api/              # API 接口定义（按模块分组：admin、common）
│   ├── assets/           # 静态资源（图片、样式、字体等）
│   ├── components/       # Vue 组件（config 组件库）
│   ├── composables/      # 组合式函数（useAuth、useTable 等）
│   ├── constants/        # 常量定义（缓存键、响应码等）
│   ├── directives/       # 自定义指令（权限指令等）
│   ├── layouts/          # 布局组件（侧边栏、主题切换等）
│   ├── pages/            # 页面组件
│   │   ├── admin/        # 后台管理页面
│   │   ├── articles/     # 文章管理页面
│   │   ├── customApp/    # 自定义应用管理页面
│   │   └── 401.vue、404.vue、login.vue
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数（request、auth、cache 等）
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── .env                  # 环境变量
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
├── vite.config.ts        # Vite 配置
└── package.json          # 项目依赖
```

## 开发说明

### 环境变量

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 组合式 API（Composition API）最佳实践
- 使用 ESLint 和 Prettier 进行代码风格检查

### 代码格式化

```bash
# 使用 Prettier 格式化代码
npm run format
```

### 代码检查

```bash
# 使用 ESLint 检查并修复代码
npm run lint
```

## 许可证

MIT License
