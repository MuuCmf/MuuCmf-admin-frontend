import { ref } from 'vue';
import { defineStore } from 'pinia';
import { constantRoutes } from '@/router';
import { type RouteRecordRaw } from 'vue-router';
import defaultSettings from '@/settings';

const Layouts = () => import('@/layouts/index.vue');

const allModules = import.meta.glob('@/pages/**/**.vue');

const getAppModules = (appName: string) => {
  const appPath = `/src/pages/${appName}/`;
  const filtered: Record<string, () => Promise<any>> = {};
  for (const [path, module] of Object.entries(allModules)) {
    if (
      path.startsWith(appPath) ||
      path.startsWith('/src/pages/error/') ||
      path === '/src/pages/login.vue' ||
      path === '/src/pages/reload.vue'
    ) {
      filtered[path] = module;
    }
  }
  return filtered;
};

const modules = getAppModules(defaultSettings.appName);

export const useRouterStore = defineStore('router', () => {
  const hasLoadedDynamicRoutes = ref(false);

  function setHasLoadedDynamicRoutes(value: boolean) {
    hasLoadedDynamicRoutes.value = value;
  }

  function reset() {
    hasLoadedDynamicRoutes.value = false;
  }

  /** 可访问的路由 */
  const routes = ref<RouteRecordRaw[]>([]);

  /**
   * 生成动态路由
   */
  async function generateRoutes(data: any) {
    // 转换数据格式 添加动态路由
    const dynamicRoutes = transformMenusRoutes(data);
    routes.value = constantRoutes.concat(dynamicRoutes);

    return dynamicRoutes;
  }

  /**
   * 后台返回的数组转为路由数据格式
   * @param menu_data
   * @returns
   */
  const transformMenusRoutes = (menu_arr: any) => {
    const asyncRoutes: RouteRecordRaw[] = [];

    menu_arr.forEach((menu: any) => {
      const tmpArr = { ...menu };

      if (tmpArr.url) {
        tmpArr.path = '/' + tmpArr.url;
        delete tmpArr['url'];
      }

      if (!tmpArr.meta) {
        tmpArr.meta = {
          title: tmpArr.title,
          icon: tmpArr.icon,
          affix: true,
          keepAlive: true
        };
        delete tmpArr['title'];
        delete tmpArr['icon'];
      }

      if (tmpArr.id) {
        delete tmpArr['id'];
      }
      if (tmpArr.pid) {
        delete tmpArr['pid'];
      }
      if (tmpArr.module) {
        delete tmpArr['module'];
      }
      if (tmpArr.type) {
        delete tmpArr['type'];
      }

      if (tmpArr._child) {
        tmpArr.component = Layouts;
        const tmpChildArr: any = [];
        tmpArr._child.forEach((child_arr: any) => {
          const tmpArr2 = { ...child_arr };
          tmpArr2.lists.forEach((child_lists_arr: any) => {
            const tmpArr3 = { ...child_lists_arr };
            if (tmpArr3.url) {
              tmpArr3.path = '/' + tmpArr3.url;
              delete tmpArr3['url'];
            }
            const component = modules[`/src/pages${tmpArr3.path}.vue`];

            if (component) {
              tmpArr3.component = component;
            } else {
              tmpArr3.component = modules['/src/pages/404.vue'];
            }
            tmpArr3.meta = {
              title: tmpArr3.title,
              icon: tmpArr3.icon,
              affix: true,
              keepAlive: true
            };
            delete tmpArr3['title'];
            delete tmpArr3['icon'];
            tmpChildArr.push(tmpArr3);

            // 处理子菜单
            if (tmpArr3._child && Array.isArray(tmpArr3._child)) {
              tmpArr3._child.forEach((child_lists_arr: any) => {
                const tmpArr4 = { ...child_lists_arr };
                if (tmpArr4.url) {
                  tmpArr4.path = '/' + tmpArr4.url;
                  delete tmpArr4['url'];
                }
                const component = modules[`/src/pages${tmpArr4.path}.vue`];
                if (component) {
                  tmpArr4.component = component;
                } else {
                  tmpArr4.component = modules['/src/pages/404.vue'];
                }
                tmpArr4.meta = {
                  title: tmpArr4.title,
                  icon: tmpArr4.icon,
                  affix: true,
                  keepAlive: true
                };
                delete tmpArr4['title'];
                delete tmpArr4['icon'];
                tmpChildArr.push(tmpArr4);
              });

              delete tmpArr3['_child'];
            }
          });
        });

        delete tmpArr['_child'];
        tmpArr.children = tmpChildArr;
      }

      asyncRoutes.push(tmpArr);
    });

    return asyncRoutes;
  };

  return {
    hasLoadedDynamicRoutes,
    setHasLoadedDynamicRoutes,
    reset,
    routes,
    generateRoutes
  };
});
