<template>
  <div class="main-sidebar">
    <div class="navbar-system-menu">
      <ul class="navbar-nav">
        <li
          v-for="(item, index) in allMenusData"
          :key="index"
          :class="index === mainMenusActiveIndex && defaultSettings.appName === 'admin' ? 'active' : ''"
          @click="goToRoute(index, item.url)"
        >
          <safe-icon :icon="item.icon" />
          <span class="title">{{ item.title || '' }}</span>
        </li>
      </ul>
    </div>

    <div class="navbar-common-menu">
      <ul class="navbar-nav">
        <li title="清理缓存" aria-label="清理缓存" @click="clearCache">
          <safe-icon icon="fas trash" />
        </li>
        <li title="访问前台" aria-label="访问前台" @click="visitFrontend">
          <safe-icon icon="fas copy" />
        </li>
        <li class="user user-menu">
          <el-dropdown>
            <div class="base">
              <img :src="userInfo.avatar64" class="user-image" alt="User Image" @error="handleAvatarError" />
              <div class="nickname text-ellipsis">{{ userInfo.nickname || '用户' }}</div>
            </div>
            <template #dropdown>
              <div class="user-menu-card">
                <div class="user-header">
                  <div class="avatar">
                    <img :src="userInfo.avatar64" class="img-circle" alt="User Avatar" @error="handleAvatarError" />
                  </div>
                  <div class="nickname text-ellipsis">
                    {{ userInfo.nickname || '用户' }}
                  </div>
                  <div class="signature text-ellipsis-2">
                    {{ userInfo.signature || '暂无签名' }}
                  </div>
                </div>
                <div class="user-footer">
                  <div class="btn" @click="handleUserSettings">用户设置</div>
                  <div class="btn confirm" @click="handleLogout">退出登录</div>
                </div>
              </div>
            </template>
          </el-dropdown>
        </li>
        <li title="全屏切换" aria-label="全屏切换" @click="toggleFullScreen">
          <safe-icon icon="fas arrows-alt" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts" name="MainSidebar">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import router from '@/router';
import { useUserInfoStore, useMenuStore } from '@/stores';
import { request } from '@/utils/modules/request.ts';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuth } from '@/composables/useAuth';
import { RESPONSE_CODE } from '@/constants/responseCode';
import { handleAvatarError } from '@/utils/modules/public';
import defaultSettings from '@/settings';

const menuStore = useMenuStore();
const userInfoStore = useUserInfoStore();
const auth = useAuth();

// 主导航激活索引
const mainMenusActiveIndex = ref<number>(menuStore.mainMenusActive);

// 清除缓存loading状态
const clearingCache = ref(false);

// 用户数据 - 使用computed保持响应式
const userInfo = computed<UserInfo>(() => userInfoStore.userInfo);

// 菜单
const allMenusData = computed(() => menuStore.allMenusData);

// 初始化菜单状态
const initMenuState = () => {
  const currentPath = router.currentRoute.value.path;

  // 根据当前路由路径激活对应的菜单
  menuStore.activateMenuByPath(currentPath);

  mainMenusActiveIndex.value = menuStore.mainMenusActive;
};

// 路由至页面
const goToRoute = (index: number, path: string): void => {
  if (!path || path.trim() === '') {
    ElMessage.warning('菜单URL为空，无法跳转');
    return;
  }

  if (defaultSettings.appName === 'admin') {
    router
      .push({
        path: '/' + path.trim(),
        query: {}
      })
      .catch(err => {
        console.error('路由跳转失败:', err);
        ElMessage.error('页面跳转失败');
      });
  } else {
    let url = window.location.origin + '/static/admin/#/' + path.trim();
    window.location.href = url;
  }
};

// 监听主导航激活状态变化
watch(
  () => menuStore.mainMenusActive,
  newValue => {
    if (newValue !== undefined) {
      mainMenusActiveIndex.value = newValue;
    }
  },
  { immediate: true }
);

// 监听路由变化，自动更新主导航激活状态
watch(
  () => router.currentRoute.value.path,
  newPath => {
    // 路由变化时，尝试激活对应的菜单
    menuStore.activateMenuByPath(newPath);
  }
);

// 清除缓存
const clearCache = async () => {
  if (clearingCache.value) {
    return;
  }

  try {
    clearingCache.value = true;
    const res: ResponseData<unknown> = await request({
      url: 'admin/common/clearCache'
    });
    if (res.code === RESPONSE_CODE.SUCCESS) {
      localStorage.removeItem('all_menu_data');
      ElMessage.success('缓存清除成功');
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('清除缓存失败:', error);
    ElMessage.error('清除缓存失败');
  } finally {
    clearingCache.value = false;
  }
};

// 访问前台
const visitFrontend = () => {
  const frontendUrl = window.location.origin;
  window.location.href = frontendUrl;
};

/**
 * 全屏相关功能
 */
const isFullScreen = ref(false);

const checkFullScreen = () => {
  isFullScreen.value = !!document.fullscreenElement;
};

const handleFullScreenChange = () => {
  checkFullScreen();
};

const exitFullScreen = () => {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      /* Safari */
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      /* Firefox */
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      /* IE/Edge */
      (document as any).msExitFullscreen();
    }
  } catch (error) {
    console.error('退出全屏失败:', error);
  }
};

const enterFullScreen = () => {
  document.documentElement.requestFullscreen().catch(err => {
    console.error('进入全屏失败：', err);
    ElMessage.error('进入全屏失败');
  });
};

const toggleFullScreen = () => {
  if (!document.fullscreenEnabled) {
    ElMessage.warning('当前浏览器不支持全屏模式');
    return;
  }

  checkFullScreen();
  if (isFullScreen.value) {
    exitFullScreen();
  } else {
    enterFullScreen();
  }
};

// 处理用户菜单操作
const handleUserSettings = () => {
  window.location.href = '/ucenter/config/index.html';
};

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 执行退出登录操作
    await auth.logout();
  } catch (error) {
    // 用户取消操作或跳转失败
    if (error !== 'cancel') {
      console.error('退出登录失败:', error);
      ElMessage.error('退出登录失败');
    }
  }
};

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullScreenChange);
  initMenuState();
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullScreenChange);
});
</script>

<style lang="scss" scoped>
.main-sidebar {
  flex: 1;
  display: flex;

  .navbar-system-menu {
    flex: 1;

    .navbar-nav {
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      height: 100%;

      li {
        padding: 0 10px;
        font-weight: 600;
        color: var(--text-color-light);
        cursor: pointer;
        display: flex;
        align-items: center;

        .svg-inline--fa {
          font-size: 13px;
        }

        .title {
          padding: 0 5px;
          transition: all 0.8s ease;
        }
      }

      li:hover {
        .title {
        }
      }

      li.active {
        color: var(--el-color-primary);
      }
    }
  }

  .navbar-common-menu {
    width: 280px;

    .navbar-nav {
      display: flex;
      justify-content: flex-end;
      align-items: stretch;

      li {
        display: flex;
        align-items: center;
        padding: 0 10px;
        color: var(--text-color-light);
        cursor: pointer;

        .svg-inline--fa {
          font-size: 13px;
        }

        .title {
          padding: 0 5px;
        }
      }

      li.user-menu {
        .base {
          display: flex;
          padding-top: 13px;
          padding-bottom: 12px;

          .user-image {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            margin-right: 10px;
          }

          .nickname {
            flex: 1;
            line-height: 25px;
            color: var(--text-color-light);
          }
        }
      }
    }
  }
}

.user-menu-card {
  padding: 10px;
  width: 280px;

  .user-header {
    padding: 24px 10px;

    .avatar {
      margin: 0 auto;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .nickname {
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      line-height: 28px;
    }

    .signature {
      text-align: center;
    }
  }

  .user-footer {
    display: flex;

    .btn {
      flex: 1;
      line-height: 36px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
