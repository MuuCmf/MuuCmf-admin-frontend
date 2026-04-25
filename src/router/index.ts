import { toRaw } from 'vue';
import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';
import { useMenuStore, useUserInfoStore, useRouterStore } from '@/stores';
import defaultSettings from '@/settings';

export const Layouts = () => import('@/layouts/index.vue');

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

// 初始化默认首页
let defaultIndex = defaultSettings.appName + '/index/index';
let defaultIndexTitle = '控制台';

// 常驻路由
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login.vue')
  },
  {
    path: '/401',
    component: () => import('@/pages/401.vue'),
    meta: { hidden: true }
  },
  {
    path: '/404',
    component: () => import('@/pages/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    name: '/',
    redirect: '/' + defaultIndex,
    component: Layouts,
    children: [
      {
        path: '/' + defaultIndex,
        component: modules['/src/pages/' + defaultIndex + '.vue'] || (() => import('@/pages/404.vue')),
        name: 'index',
        meta: {
          title: defaultIndexTitle,
          icon: 'homepage',
          affix: true,
          keepAlive: true
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
});

// 提供设置默认首页的方法
export const setDefaultIndex = (indexPath: string, title: string = '控制台') => {
  defaultIndex = indexPath;
  defaultIndexTitle = title;

  // 更新根路由的重定向
  const rootRoute = router.getRoutes().find(route => route.name === '/');
  if (rootRoute) {
    // 移除旧的根路由并创建新的根路由
    router.removeRoute('/');
    router.addRoute({
      path: '/',
      name: '/',
      redirect: '/' + defaultIndex,
      component: Layouts,
      children: []
    });
  }
};

/**
 * 更新默认路由配置
 */
export const updateDefaultRoute = (title: string = defaultIndexTitle) => {
  // 先移除旧的默认路由（如果存在）
  const indexRoute = router.getRoutes().find(route => route.name === 'index');
  if (indexRoute) {
    router.removeRoute('index');
  }

  console.log('更新默认路由配置', defaultIndex);

  // 添加新的默认路由作为子路由
  const rootRoute = router.getRoutes().find(route => route.name === '/');
  if (rootRoute) {
    router.addRoute('/', {
      path: '/' + defaultIndex,
      component: modules['/src/pages/' + defaultIndex + '.vue'] || (() => import('@/pages/404.vue')),
      name: 'index',
      meta: {
        title: title,
        icon: 'homepage',
        affix: true,
        keepAlive: true
      }
    });
  }
};

// 路由加载前守卫
router.beforeEach(async (to: any, from: any, next) => {
  // 设置页面标题
  document.title = to.meta.title ? to.meta.title : '管理平台';
  // 检查用户登录状态
  const userInfoStore = useUserInfoStore();

  if (to.path === '/login') {
    // 如果已登录且有用户信息，重定向到首页
    if (Object.keys(userInfoStore.userInfo).length > 0) {
      next({ path: '/', replace: true });
      return;
    }
    next();
  } else {
    // 尝试获取用户信息
    try {
      await userInfoStore.getUserInfo();
      const userInfo = toRaw(userInfoStore.userInfo);

      // 如果获取用户信息失败（返回空），说明session可能已过期
      if (Object.keys(userInfo).length == 0) {
        console.log('未登录：session 已过期');
        next({
          path: '/login',
          query: { redirect: to.fullPath },
          replace: true
        });
        return;
      }

      const routerStore = useRouterStore();

      // 如果已经加载过动态路由，直接放行
      if (routerStore.hasLoadedDynamicRoutes) {
        next();
        return;
      }

      const menuStore = useMenuStore();

      try {
        // 等待菜单数据加载完成
        await menuStore.getAllMenuData();
        await menuStore.getCurrentAppMenusData();

        // 动态设置默认首页
        const defaultIndexInfo = menuStore.getDefaultIndexInfo();
        setDefaultIndex(defaultIndexInfo.path, defaultIndexInfo.title);
        updateDefaultRoute(defaultIndexInfo.title);

        const allMenusData = menuStore.allMenusData;
        const currentAppMenusData = menuStore.currentAppMenusData;

        // 判断currentAppMenusData对象是否为空
        let mergedMenusData: any[] = [];
        let dynamicRoutes: RouteRecordRaw[] = [];
        if (Object.keys(currentAppMenusData).length > 0) {
          // 合并所有菜单数据和当前应用菜单数据
          mergedMenusData = [...allMenusData, currentAppMenusData];
        } else {
          // 合并所有菜单数据
          mergedMenusData = [...allMenusData];
        }

        // 生成动态路由
        dynamicRoutes = await routerStore.generateRoutes(mergedMenusData);
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });

        // 添加404路由作为最后一个路由
        router.addRoute({
          name: '404',
          path: '/:pathMatch(.*)*',
          component: () => import('@/pages/404.vue')
        });

        // 标记已经加载过动态路由
        routerStore.setHasLoadedDynamicRoutes(true);
      } catch (error) {
        console.error('路由加载失败:', error);
        // 加载失败时跳转到登录页
        next({ path: '/login', replace: true });
        return;
      }

      // 根据当前路由路径激活对应的菜单
      menuStore.activateMenuByPath(to.path);

      // 重新导航以确保新路由生效
      next({ ...to, replace: true });
      return;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 获取用户信息失败，跳转到登录页
      next({ path: '/login', query: { redirect: to.fullPath }, replace: true });
      return;
    }
  }
});

/** 重置路由 */
export function resetRouter() {
  // 重置动态路由加载标志
  const routerStore = useRouterStore();
  routerStore.reset();

  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach(route => {
      const { name } = route;
      if (name) {
        if (router.hasRoute(name)) {
          router.removeRoute(name);
        }
      }
    });
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload();
  }
}

export default router;
