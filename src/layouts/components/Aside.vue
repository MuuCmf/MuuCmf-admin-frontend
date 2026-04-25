<template>
  <div class="aside" :class="menuStore.asideCollapsed ? 'closed' : 'opened'">
    <!-- currentAppInfo内容不为空时，显示应用信息和应用菜单 -->
    <template v-if="currentAppInfo">
      <!-- 应用信息展示 -->
      <div v-if="currentAppInfo" class="app-info">
        <el-tooltip v-if="menuStore.asideCollapsed" :content="currentAppInfo.alias || ''" placement="right">
          <div class="app-icon-wrapper">
            <img v-if="currentAppInfo.icon_100" class="app-icon" :src="currentAppInfo.icon_100" />
            <safe-icon v-else icon="cube" />
          </div>
        </el-tooltip>
        <div v-else class="app-detail">
          <img v-if="currentAppInfo.icon_100" class="app-icon" :src="currentAppInfo.icon_100" />
          <safe-icon v-else icon="cube" />
          <div class="app-meta">
            <div class="app-name">{{ currentAppInfo.alias || '' }}</div>
            <div class="app-version">{{ currentAppInfo.version || '' }}</div>
          </div>
        </div>
      </div>

      <!-- 应用菜单 -->
      <ul v-for="(item, index) in currentAppMenus._child" :key="index" class="sidebar-menu muu-tree">
        <li v-if="item?.lists && item.lists.length > 0" class="treeview menu-open">
          <el-tooltip v-if="menuStore.asideCollapsed" :content="item.group || ''" placement="right">
            <div class="group" :class="index === asideMenusActiveIndex.group_key ? 'active' : ''">
              <span class="group-text">{{ item.group || '' }}</span>
            </div>
          </el-tooltip>
          <div v-else class="group" :class="index === asideMenusActiveIndex.group_key ? 'active' : ''">
            <span class="group-text">{{ item.group || '' }}</span>
            <span class="pull-right-container">
              <safe-icon class="pull-right" icon="angle-down" />
            </span>
          </div>
          <ul class="treeview-menu menu-open">
            <li
              v-for="(v, menuIndex) in item.lists"
              :key="menuIndex"
              :class="
                Number(index) === asideMenusActiveIndex.group_key &&
                Number(menuIndex) === asideMenusActiveIndex.menu_key
                  ? 'active'
                  : ''
              "
              @click="goToRoute({ group_key: Number(index), menu_key: Number(menuIndex) }, v.url ?? '', v.title ?? '')"
            >
              <el-tooltip v-if="menuStore.asideCollapsed" :content="v.title || ''" placement="right">
                <div class="menu-item-wrapper">
                  <safe-icon :icon="v.icon" />
                </div>
              </el-tooltip>
              <div v-else class="menu-item-wrapper">
                <safe-icon :icon="v.icon" />
                <span class="title">{{ v.title || '' }}</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </template>
    <!-- 当前应用详情为空时，显示默认边栏菜单 -->
    <template v-else>
      <ul v-for="(item, index) in thisAsideMenus" :key="index" class="sidebar-menu muu-tree">
        <li v-if="item?.lists && item.lists.length > 0" class="treeview menu-open">
          <el-tooltip v-if="menuStore.asideCollapsed" :content="item.group || ''" placement="right">
            <div class="group" :class="index === asideMenusActiveIndex.group_key ? 'active' : ''">
              <span class="group-text">{{ item.group || '' }}</span>
            </div>
          </el-tooltip>
          <div v-else class="group" :class="index === asideMenusActiveIndex.group_key ? 'active' : ''">
            <span class="group-text">{{ item.group || '' }}</span>
            <span class="pull-right-container">
              <safe-icon class="pull-right" icon="angle-down" />
            </span>
          </div>
          <ul class="treeview-menu menu-open">
            <li
              v-for="(v, menuIndex) in item.lists"
              :key="menuIndex"
              :class="
                index === asideMenusActiveIndex.group_key && menuIndex === asideMenusActiveIndex.menu_key
                  ? 'active'
                  : ''
              "
              @click="goToRoute({ group_key: index, menu_key: menuIndex }, v.url ?? '', v.title ?? '')"
            >
              <el-tooltip v-if="menuStore.asideCollapsed" :content="v.title || ''" placement="right">
                <div class="menu-item-wrapper">
                  <safe-icon :icon="v.icon" />
                </div>
              </el-tooltip>
              <div v-else class="menu-item-wrapper">
                <safe-icon :icon="v.icon" />
                <span class="title">{{ v.title || '' }}</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>

      <!-- 应用入口 -->
      <ul v-if="mainMenusActiveIndex === 0" class="sidebar-menu module-menu">
        <li class="treeview menu-open">
          <el-tooltip v-if="menuStore.asideCollapsed" content="应用入口" placement="right">
            <div class="group">
              <span class="group-text">应用入口</span>
            </div>
          </el-tooltip>
          <div v-else class="group">
            <span class="group-text">应用入口</span>
            <span class="pull-right-container">
              <safe-icon class="pull-right" icon="angle-down" />
            </span>
          </div>
          <ul class="treeview-menu menu-open">
            <li v-for="(v, menuIndex) in apps" :key="menuIndex" class="app-item" @click="goToApp(v)">
              <el-tooltip v-if="menuStore.asideCollapsed" :content="v.alias || ''" placement="right">
                <div class="menu-item-wrapper">
                  <img v-if="v.icon_100" class="app-icon" :src="v.icon_100" />
                  <safe-icon v-else icon="cube" />
                </div>
              </el-tooltip>
              <div v-else class="menu-item-wrapper">
                <img v-if="v.icon_100" class="app-icon" :src="v.icon_100" />
                <safe-icon v-else icon="cube" />
                <span class="title">{{ v.alias || '' }}</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import router from '@/router';
import { useMenuStore } from '@/stores';
import { useAppsStore } from '@/stores/modules/apps';

// 若 AsideMenusActive 类型未定义，可在此补充或从实际来源引入
interface AsideMenusActive {
  group_key: number;
  menu_key: number;
}
// 如 MenuItemGroup 类型未定义，可在此补充或从实际来源引入
interface MenuItemGroup {
  group?: string;
  lists?: Array<{
    title?: string;
    url?: string;
    icon?: string;
  }>;
}

// 菜单存储模块
const menuStore = useMenuStore();
const appsStore = useAppsStore();

// 获取应用列表
const apps = computed<any[]>(() => appsStore.apps);

// 主导航索引值
const mainMenusActiveIndex = computed<number>(() => menuStore.mainMenusActive);

// 侧边栏索引值
const asideMenusActiveIndex = ref<AsideMenusActive>({
  group_key: 0,
  menu_key: 0
});

// 侧边栏菜单数据
const thisAsideMenus = ref<MenuItemGroup[]>([]);

// 获取当前应用详情
const currentAppInfo = computed<any>(() => appsStore.currentAppInfo);
// 获取当前应用菜单数据
const currentAppMenus = computed<any>(() => menuStore.currentAppMenusData);

// 路由至页面
const goToRoute = (index: AsideMenusActive, path: string, title?: string): void => {
  if (!path || path.trim() === '') {
    console.warn('菜单URL为空，无法跳转', { title });
    return;
  }
  // 规范化路径，移除多余斜杠
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  router
    .push({
      path: '/' + normalizedPath,
      query: {}
    })
    .catch(err => {
      console.error('路由跳转失败:', err);
    });
};

// 路由至应用
const goToApp = (app: any): void => {
  if (!app || !app.alias || app.alias.trim() === '') {
    console.warn('应用名称为空，无法跳转', { app });
    return;
  }

  let url = '';
  // 判断应用路径
  if (app.entry_spa && app.entry_spa == true) {
    url = window.location.origin + '/static/' + app.name + '/admin/';
    window.location.href = url;
  } else {
    url = window.location.origin + '/' + app.entry;
  }

  window.location.href = url;
};

// 监听主导航索引值
watch(
  () => menuStore.mainMenusActive,
  newValue => {
    menuStore
      .setAsideMenus(newValue)
      .then(arr => {
        thisAsideMenus.value = arr;
      })
      .catch(err => {
        console.error('切换菜单失败:', err);
      });
  },
  { immediate: true }
);

// 监听侧边栏菜单激活状态
watch(
  () => menuStore.asideMenusActive,
  newValue => {
    if (newValue) {
      asideMenusActiveIndex.value = newValue;
    }
  },
  { immediate: true }
);

// 监听侧边栏需要更新的标记
watch(
  () => menuStore.asideNeedsUpdate,
  () => {
    // 当标记变化时，重新加载侧边栏数据
    menuStore
      .setAsideMenus(mainMenusActiveIndex.value)
      .then(arr => {
        thisAsideMenus.value = arr;
      })
      .catch(err => {
        console.error('重新加载侧边栏菜单失败:', err);
      });
  }
);

// 监听路由变化，自动激活对应的菜单
watch(
  () => router.currentRoute.value.path,
  newPath => {
    // 路由变化时，尝试激活对应的菜单
    menuStore.activateMenuByPath(newPath);
  }
);
</script>

<style lang="scss" scoped>
.opened {
  width: 219px;
}

.closed {
  width: 59px;
}

.layouts-aside {
  background-color: var(--el-color-white);
  height: calc(100vh - 50px);
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
  transition: width 0.3s ease;
  scrollbar-width: thin;
  scrollbar-color: #ccc #fff;

  .sidebar-menu,
  .sidebar-menu > li.header {
    background-color: var(--el-color-white);
    white-space: nowrap;
    overflow: hidden;
    list-style: none;
    margin: 0;
    padding: 0;

    > li {
      position: relative;
      margin: 0;
      padding: 0;

      .group {
        position: relative;
        color: #888;
        padding: 12px 5px 12px 20px;
        border-left: 3px solid transparent;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .group-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pull-right-container {
          position: absolute;
          right: 10px;
          top: 50%;
          margin-top: -8px;

          .svg-inline--fa {
            font-size: 12px;
          }
        }
      }

      .group.active {
        border-left: 3px solid var(--el-color-primary);
      }

      .treeview-menu {
        position: relative;
        padding: 0;
        padding-right: 3px;
        list-style: none;
        border-bottom: 1px solid #f2f2f2;

        > li {
          margin: 0;
          font-weight: 600;
          color: var(--text-color-light);
          padding: 8px 5px 8px 20px;

          cursor: pointer;
          display: flex;
          align-items: center;

          .menu-item-wrapper {
            display: flex;
            align-items: center;
            width: 100%;
          }

          :deep(.svg-inline--fa) {
            flex-shrink: 0;
          }

          .title {
            margin-left: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: all 0.8s ease;
          }

          .svg-inline--fa {
            width: 22px;
          }

          &:hover {
            .title {
              margin-left: 11px;
            }

            .svg-inline--fa {
              color: var(--el-color-primary);
            }
          }
        }

        .active {
          color: var(--el-color-primary);

          .svg-inline--fa {
            color: var(--el-color-primary);
          }
        }
      }
    }

    &:hover {
      > li {
        .group {
          border-left: 3px solid var(--el-color-primary);
        }
      }
    }
  }
}

.closed {
  .sidebar-menu {
    > li {
      .group {
        padding: 12px 0;
        justify-content: center;

        .group-text {
          display: none;
        }
      }

      .treeview-menu {
        > li {
          padding: 12px 0;
          justify-content: center;

          .menu-item-wrapper {
            justify-content: center;
          }

          .title {
            display: none;
          }

          i {
            margin-left: 0;
          }
        }
      }
    }
  }
}

.app-info {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;

  .app-icon-wrapper {
    display: flex;
    justify-content: center;

    .app-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      object-fit: cover;
    }
  }

  .app-detail {
    display: flex;
    align-items: center;

    .app-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      margin-right: 10px;
      object-fit: cover;
    }

    .app-meta {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .app-name {
        font-weight: 600;
        font-size: 14px;
        color: #333;
        margin-bottom: 2px;
      }

      .app-version {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.module-menu {
  .app-item {
    .app-icon {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      object-fit: cover;
    }

    .fas {
      font-size: 20px;
      color: #909399;
    }

    &:hover .title {
      color: var(--el-color-primary);
    }
  }
}

.closed {
  .module-menu {
    .app-item {
      .app-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
      }

      .fas {
        font-size: 24px;
      }
    }
  }
}
</style>
