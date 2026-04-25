import type { App } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(piniaPluginPersistedstate);

// 全局注册 store
export function setupStore(app: App<Element>) {
  app.use(store);
}

export * from './modules/apps.ts';
export * from './modules/config.ts';
export * from './modules/menu.ts';
export * from './modules/router.ts';
export * from './modules/user.ts';

export { store };
