import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';
import { cache } from '@/utils/modules/cache';
import { CACHE_EXPIRATION } from '@/constants/cache';
import defaultSettings from '@/settings';
import { getMenuTree } from '@/api/admin/menu';

/**
 * 导航菜单状态管理
 * @description 管理后台系统的导航菜单、侧边栏状态和菜单激活状态
 */
export const useMenuStore = defineStore('menu', () => {
  /** 侧边栏是否展开 */
  const asideCollapsed = ref<boolean>(false);

  /** 所有菜单数据 */
  const allMenusData = ref<MenuItem[]>([]);

  /** 侧边栏需要更新的标记 */
  const asideNeedsUpdate = ref<number>(0);

  /** 主导航当前索引 */
  const mainMenusActive = ref<number>(0);

  /** 当前应用菜单数据 */
  const currentAppMenusData = ref<MenuItem>({} as MenuItem);

  /** 侧边栏当前索引 */
  const asideMenusActive = reactive<AsideMenusActive>({
    group_key: 0,
    menu_key: 0
  });

  /**
   * 切换侧边栏展开状态
   * @description 切换 asideCollapsed 状态
   */
  const toggleSetAsideCollapsed = () => {
    asideCollapsed.value = !asideCollapsed.value;
    console.log('asideCollapsed.value', asideCollapsed.value);
  };

  /**
   * 处理菜单URL格式
   * @description 将后端返回的URL转换为前端可识别的格式
   * @param vo - 菜单项对象
   * @returns 处理后的菜单项对象
   */
  const handleMenuUrl = (vo: any): any => {
    if (!vo.url) {
      return vo;
    }

    const urlArr: Array<string> = vo.url.split('/');

    // 边界检查：确保数组有足够的元素
    if (urlArr.length < 3) {
      console.warn('菜单URL格式不正确：', vo.url);
      return vo;
    }

    let urlParams2: string = urlArr[1] || '';
    if (urlArr[1] && urlArr[1].includes('.')) {
      const urlArrParam2Arr: Array<string> = urlArr[1].split('.');
      if (urlArrParam2Arr.length > 1) {
        urlParams2 = urlArrParam2Arr[1];
      }
    }
    const url = urlArr[0] + '/' + urlParams2 + '/' + urlArr[2];
    vo.url = url.toLowerCase();

    return vo;
  };

  /**
   * 获取所有菜单数据
   * @description 从缓存或服务器获取所有菜单数据
   * @param api - 是否从服务器获取数据（默认false，优先从缓存获取）
   * @returns 返回所有菜单数据数组
   */
  const getAllMenuData = async (api: boolean = false): Promise<any[]> => {
    return new Promise(resolve => {
      let all_menu_data: any[] = [];
      if (api === false) {
        all_menu_data = cache('all_menu_data');
      }

      if (all_menu_data && all_menu_data.length > 0) {
        allMenusData.value = all_menu_data;
        resolve(all_menu_data);
      } else {
        getMenuTree('admin')
          .then(async (res: any) => {
            if (res.code === 200 && Array.isArray(res.data)) {
              const data: any[] = res.data;
              data.forEach((vo: any) => {
                handleMenuUrl(vo);
                if (vo._child && Array.isArray(vo._child)) {
                  vo._child.forEach((c_vo: any) => {
                    if (c_vo.lists && Array.isArray(c_vo.lists)) {
                      c_vo.lists.forEach((c_l_vo: any) => {
                        handleMenuUrl(c_l_vo);
                        if (c_l_vo._child && Array.isArray(c_l_vo._child)) {
                          c_l_vo._child.forEach((c_l_l_vo: any) => {
                            handleMenuUrl(c_l_l_vo);
                          });
                        }
                      });
                    }
                  });
                }
              });
              // 缓存菜单数据，避免重复请求服务器
              cache('all_menu_data', data, CACHE_EXPIRATION.MENU_DATA);
              allMenusData.value = data;
              resolve(data);
            } else {
              console.error('获取菜单失败：', res);
              resolve([]);
            }
          })
          .catch((err: any) => {
            console.error('获取菜单请求失败：', err);
            resolve([]);
          });
      }
    });
  };

  /**
   * 设置左侧菜单数据
   * @description 根据主菜单索引获取对应的侧边栏菜单数据
   * @param mainMenusIndex - 主菜单索引
   * @returns 返回侧边栏菜单数据数组
   */
  const setAsideMenus = async (mainMenusIndex: number): Promise<any[]> => {
    return new Promise(resolve => {
      getAllMenuData()
        .then((data: any[]) => {
          // 边界检查：确保索引有效
          if (!data || data.length === 0) {
            console.warn('菜单数据为空');
            resolve([]);
            return;
          }
          const mainMenuItem = data[mainMenusIndex];
          if (!mainMenuItem) {
            console.warn(`主导航索引 ${mainMenusIndex} 超出范围`);
            resolve([]);
            return;
          }
          const aside_menus = mainMenuItem._child || [];
          resolve(aside_menus);
        })
        .catch((err: any) => {
          console.error('获取侧边栏菜单失败：', err);
          resolve([]);
        });
    });
  };

  /**
   * 获取默认首页信息
   * @description 从菜单数据中查找默认首页路径和标题
   * @returns 返回包含路径和标题的对象
   */
  const getDefaultIndexInfo = () => {
    // 优先从当前应用菜单数据中查找
    if (currentAppMenusData.value && currentAppMenusData.value._child && currentAppMenusData.value._child.length > 0) {
      for (const child of currentAppMenusData.value._child) {
        if (child.lists && child.lists.length > 0) {
          for (const menuItem of child.lists) {
            if (menuItem.url) {
              return {
                path: menuItem.url,
                title: menuItem.title || '控制台'
              };
            }
          }
        }
      }
    }

    // 如果当前应用菜单数据中没有找到，从所有菜单数据中查找
    if (allMenusData.value && allMenusData.value.length > 0) {
      for (const menuGroup of allMenusData.value) {
        if (menuGroup._child && menuGroup._child.length > 0) {
          for (const child of menuGroup._child) {
            if (child.lists && child.lists.length > 0) {
              for (const menuItem of child.lists) {
                if (menuItem.url) {
                  return {
                    path: menuItem.url,
                    title: menuItem.title || '控制台'
                  };
                }
              }
            }
          }
        }
      }
    }

    // 默认返回admin/index/index和默认标题
    return {
      path: defaultSettings.appName + '/index/index',
      title: '控制台'
    };
  };

  /**
   * 获取当前应用菜单数据
   * @description 从服务器获取当前应用对应的菜单数据
   */
  const getCurrentAppMenusData = async () => {
    if (defaultSettings.appName === 'admin') {
      currentAppMenusData.value = {} as MenuItem;
    } else {
      const res = await getMenuTree(defaultSettings.appName);

      if (res.code === 200 && Array.isArray(res.data)) {
        const data: any[] = res.data;
        data.forEach((vo: any) => {
          handleMenuUrl(vo);
          if (vo._child && Array.isArray(vo._child)) {
            vo._child.forEach((c_vo: any) => {
              if (c_vo.lists && Array.isArray(c_vo.lists)) {
                c_vo.lists.forEach((c_l_vo: any) => {
                  handleMenuUrl(c_l_vo);

                  if (c_l_vo._child && Array.isArray(c_l_vo._child)) {
                    c_l_vo._child.forEach((c_l_l_vo: any) => {
                      handleMenuUrl(c_l_l_vo);
                    });
                  }
                });
              }
            });
          }
        });
        currentAppMenusData.value = data[0] || ({} as MenuItem);
      } else {
        console.error('获取当前应用菜单失败：', res);
        currentAppMenusData.value = {} as MenuItem;
      }
    }
  };

  /**
   * 根据当前路由激活对应的菜单
   * @description 根据路由路径找到对应的菜单并设置激活状态
   * @param path - 当前路由路径
   */
  const activateMenuByPath = (path: string) => {
    if (!path) {
      return;
    }

    const normalizedPath = path.replace(/^\/+|\/+$/g, '').toLowerCase();

    if (
      currentAppMenusData.value &&
      currentAppMenusData.value._child &&
      Array.isArray(currentAppMenusData.value._child)
    ) {
      for (let groupIndex = 0; groupIndex < currentAppMenusData.value._child.length; groupIndex++) {
        const group = currentAppMenusData.value._child[groupIndex];

        if (group.lists && Array.isArray(group.lists)) {
          for (let menuIndex = 0; menuIndex < group.lists.length; menuIndex++) {
            const menuItem = group.lists[menuIndex];

            if (menuItem.url) {
              const normalizedMenuUrl = menuItem.url.replace(/^\/+|\/+$/g, '').toLowerCase();

              if (normalizedMenuUrl === normalizedPath) {
                asideMenusActive.group_key = groupIndex;
                asideMenusActive.menu_key = menuIndex;
                return;
              }
            }
          }
        }
      }
    }

    if (!allMenusData.value || allMenusData.value.length === 0) {
      return;
    }

    for (let mainIndex = 0; mainIndex < allMenusData.value.length; mainIndex++) {
      const mainMenu = allMenusData.value[mainIndex];

      if (mainMenu._child && Array.isArray(mainMenu._child)) {
        for (let groupIndex = 0; groupIndex < mainMenu._child.length; groupIndex++) {
          const group = mainMenu._child[groupIndex];

          if (group.lists && Array.isArray(group.lists)) {
            for (let menuIndex = 0; menuIndex < group.lists.length; menuIndex++) {
              const menuItem = group.lists[menuIndex];

              if (menuItem.url) {
                const normalizedMenuUrl = menuItem.url.replace(/^\/+|\/+$/g, '').toLowerCase();

                if (normalizedMenuUrl === normalizedPath) {
                  mainMenusActive.value = mainIndex;
                  asideMenusActive.group_key = groupIndex;
                  asideMenusActive.menu_key = menuIndex;
                  return;
                }
              }
            }
          }
        }
      }
    }
  };

  return {
    asideCollapsed,
    toggleSetAsideCollapsed,
    allMenusData,
    asideNeedsUpdate,
    mainMenusActive,
    asideMenusActive,
    getAllMenuData,
    setAsideMenus,
    currentAppMenusData,
    getCurrentAppMenusData,
    getDefaultIndexInfo,
    activateMenuByPath
  };
});
