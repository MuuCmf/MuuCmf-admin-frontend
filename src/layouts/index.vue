<template>
  <el-container v-loading="loading" class="main-container">
    <el-header class="layouts-header">
      <Logo />
      <SidebarToggle />
      <MainSidebar />
      <ThemeToggle />
    </el-header>

    <el-container class="mix-container">
      <el-aside class="layouts-aside">
        <Aside ref="aside"></Aside>
      </el-aside>
      <el-main>
        <router-view v-slot="{ Component, route }">
          <transition name="main" mode="out-in" appear>
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppsStore, useMenuStore } from '@/stores';
import { ElMessage } from 'element-plus';

// 通用头部
import Logo from './components/Logo.vue';
import Aside from './components/Aside.vue';
import SidebarToggle from './components/SidebarToggle.vue';
import MainSidebar from './components/MainSidebar.vue';
import ThemeToggle from './components/ThemeToggle.vue';

const loading = ref<boolean>(true);
const menuStore = useMenuStore();
const appsStore = useAppsStore();

// 初始化所有菜单数据
const initMenuData = async () => {
  try {
    menuStore.getAllMenuData(true);
  } catch (error) {
    console.error('菜单加载失败:', error);
    ElMessage.error('菜单加载失败，请刷新重试');
  }
};

// 初始化应用列表数据
const initAppData = async () => {
  try {
    appsStore.getAllApps();
  } catch (error) {
    console.error('应用列表加载失败:', error);
    ElMessage.error('应用列表加载失败，请刷新重试');
  }
};

// 初始化当前应用菜单数据
const initCurrentAppMenusData = async () => {
  try {
    menuStore.getCurrentAppMenusData();
  } catch (error) {
    console.error('应用菜单加载失败:', error);
    ElMessage.error('应用菜单加载失败，请刷新重试');
  }
};

// 初始化当前应用详情数据
const initCurrentAppInfo = async () => {
  try {
    appsStore.getCurrentAppInfo();
  } catch (error) {
    console.error('当前应用详情加载失败:', error);
    ElMessage.error('当前应用详情加载失败，请刷新重试');
  }
};

// 组件挂载时初始化
onMounted(() => {
  Promise.all([initMenuData(), initAppData(), initCurrentAppInfo(), initCurrentAppMenusData()]).then(() => {
    loading.value = false;
  });
});
</script>

<style lang="scss" scoped>
.main-container {
  min-width: 1200px;
  background-color: #f2f2f2;

  .layouts-header {
    display: flex;
    height: 50px;
    margin: 0;
    padding: 0;
    background-color: var(--el-color-white);
    border-bottom: 1px solid #eee;
    align-items: stretch;
    justify-content: space-between;
    overflow: hidden;
  }

  .mix-container {
    height: calc(100vh - 50px);

    .el-main {
      padding: 0;
      overflow: hidden;
    }

    .layouts-aside {
      width: auto;
      background-color: #fff;
      border-right: 1px solid #eee;
      overflow: hidden;
      .aside {
        height: 100%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #ccc #fff;
      }
    }
  }
}
</style>
