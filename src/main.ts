import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 引入 FontAwesome SVG 组件 - 用于组件方式
import { library } from '@fortawesome/fontawesome-svg-core';

// 引入所有 FontAwesome 图标（实心图标集和品牌图标集）
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// 将所有图标添加到库中
library.add(fas, fab);

// 公共样式
import '@/assets/styles/globals.scss';
// 暗黑主题样式
import 'element-plus/theme-chalk/dark/css-vars.css';
// 自定义暗黑主题部分
import '@/assets/styles/theme/dark.scss';
// 蓝色主题样式
import '@/assets/styles/theme/blue.scss';
// 引入图标字体
import '@/assets/iconfont/iconfont.css';

// 应用主组件
import App from './App.vue';
import router from './router';
import { setupStore } from '@/stores';
import permissionDirective from '@/directives/permission';
import { setupErrorHandler } from '@/plugins/errorHandler';
import { setupProgress } from '@/plugins/progress';
import SafeIcon from '@/components/SafeIcon.vue';

// 创建 Vue 应用实例
const app = createApp(App);

// 全局注册 FontAwesome 图标组件 - 用于组件方式
app.component('SafeIcon', SafeIcon);

// 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 全局注册 状态管理(store) - 这里已经包含了 Pinia 的注册
setupStore(app);

// 全局注册自定义指令
app.directive('permission', permissionDirective);

// 全局注册错误处理
setupErrorHandler(app);

app.use(ElementPlus);
app.use(router);

// 设置路由进度条
setupProgress(router);

app.mount('#app');
