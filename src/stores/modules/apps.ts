import { ref } from 'vue';
import { defineStore } from 'pinia';
import defaultSettings from '@/settings';
import { getAllModules, getModulesInfo } from '@/api/admin/module';

/**
 * 应用模块状态管理
 * @description 管理应用模块相关的状态和操作
 */
export const useAppsStore = defineStore('apps', () => {
  /** 应用模块列表 */
  const apps = ref<any[]>([]);
  /** 当前应用详情 */
  const currentAppInfo = ref<any | boolean>(false);

  /**
   * 获取应用模块列表
   * @description 从后端获取所有应用模块信息并更新状态
   */
  const getAllApps = async () => {
    if (defaultSettings.appName === 'admin') {
      const res = await getAllModules();
      apps.value = res.data || [];
    }
  };

  /**
   * 获取当前应用详情
   * @description 根据当前应用名称获取应用模块详情并更新状态
   */
  const getCurrentAppInfo = async () => {
    if (defaultSettings.appName == 'admin') {
      currentAppInfo.value = false;
      localStorage.setItem('app_name', 'admin');
    } else {
      const res = await getModulesInfo(defaultSettings.appName);
      currentAppInfo.value = res.data || {};
      console.log(currentAppInfo.value);
      localStorage.setItem('app_name', defaultSettings.appName);
    }
  };

  return {
    apps,
    currentAppInfo,
    getAllApps,
    getCurrentAppInfo
  };
});
