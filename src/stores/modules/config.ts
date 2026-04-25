import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { cache } from '@/utils/modules/cache';
import { getSystemConfig, getMicroServiceConfig } from '@/api';

/**
 * 系统配置状态管理
 * @description 管理系统配置、微服务配置和主题相关状态
 */
export const useConfigStore = defineStore('config', () => {
  /** 系统配置信息 */
  const config = ref({});
  /** 微服务配置信息 */
  const microConfig = ref({});

  /** 主题状态：'light' | 'dark' | 'blue' */
  const theme = ref<string>(cache('theme') || import.meta.env.VITE_DEFAULT_THEME || 'light');

  /** 主题类型定义 */
  const themeTypes = ['light', 'dark', 'blue'] as const;
  /** 主题类型 */
  type ThemeType = (typeof themeTypes)[number];

  /**
   * 切换主题
   * @description 循环切换主题类型
   */
  function toggleTheme() {
    const currentIndex = themeTypes.indexOf(theme.value as ThemeType);
    const nextIndex = (currentIndex + 1) % themeTypes.length;
    theme.value = themeTypes[nextIndex];
    applyTheme();
  }

  /**
   * 设置主题
   * @description 设置指定的主题类型
   * @param newTheme - 新的主题类型
   */
  function setTheme(newTheme: string) {
    if (themeTypes.includes(newTheme as ThemeType)) {
      theme.value = newTheme;
      applyTheme();
    }
  }

  /**
   * 应用主题
   * @description 将主题应用到 DOM 并保存到缓存
   */
  function applyTheme() {
    const html = document.documentElement;

    // 移除所有主题类
    html.classList.remove('dark', 'blue');

    // 添加当前主题类
    if (theme.value === 'dark') {
      html.classList.add('dark');
    } else if (theme.value === 'blue') {
      html.classList.add('blue');
    }

    // 保存到缓存，有效期365天
    cache('theme', theme.value, 3600 * 365);
  }

  /** 监听主题变化，自动应用 */
  watch(
    () => theme.value,
    () => {
      applyTheme();
    }
  );

  /** 初始化时应用主题 */
  if (typeof window !== 'undefined') {
    applyTheme();
  }

  /**
   * 获取系统配置
   * @description 从后端获取系统配置信息并更新状态
   * @returns 返回 Promise，包含后端接口响应数据
   */
  async function getConfig() {
    return new Promise((resolve, reject) => {
      getSystemConfig()
        .then((res: any) => {
          if (res.code == 200) {
            config.value = res.data;
          }
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * 获取微服务配置
   * @description 从微服务接口获取配置信息并更新状态
   * @returns 返回 Promise，包含微服务接口响应数据
   */
  async function getMicroConfig() {
    return new Promise((resolve, reject) => {
      getMicroServiceConfig()
        .then((res: any) => {
          if (res.code == 200) {
            microConfig.value = res.data;
          }
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  return {
    config,
    microConfig,
    theme,
    themeTypes,
    toggleTheme,
    setTheme,
    applyTheme,
    getConfig,
    getMicroConfig
  };
});
