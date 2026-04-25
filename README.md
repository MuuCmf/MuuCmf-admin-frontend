# MuuCmf Admin Frontend

基于 Vue 3 的 MuuCmf 管理后台前端项目

## 技术栈

- Vue 3.2.8
- TypeScript 4.9.5
- Vite 5.1.0
- Element Plus 2.8.2
- Pinia 3.0.4
- Vue Router 4.1.6
- Axios 1.2.1
- Sass 1.57.1

## 功能特性

- 响应式设计，适配多种屏幕尺寸
- 完整的权限管理系统
- 丰富的组件库和工具函数
- 模块化的代码结构
- 支持主题切换
- 集成富文本编辑器
- 图片裁剪功能
- 数据可视化图表

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
# 开发环境
npm run dev

# 或
npm run serve
```

### 构建生产版本

```bash
# 生产环境构建
npm run build

# 或
npm run build:pro
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── api/              # API 接口定义
├── assets/           # 静态资源（图片、样式、字体等）
├── components/       # Vue 组件
├── composables/      # 组合式函数
├── constants/        # 常量定义
├── directives/       # 自定义指令
├── layouts/          # 布局组件
├── pages/            # 页面组件
├── plugins/          # 插件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── App.vue           # 根组件
├── main.ts           # 入口文件
└── settings.ts       # 项目配置
```

## 开发说明

### 环境变量

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 组合式 API 最佳实践
- 使用 ESLint 和 Prettier 进行代码风格检查

## 许可证

MIT License
