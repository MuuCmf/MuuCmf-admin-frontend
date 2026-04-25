/**
 * 缓存相关常量
 */
export const CACHE_EXPIRATION = {
  /** 菜单数据缓存时间（秒）- 2小时 */
  MENU_DATA: 7200,
  /** 用户信息缓存时间（秒）- 1小时 */
  USER_INFO: 3600,
  /** 配置数据缓存时间（秒）- 24小时 */
  CONFIG: 86400
} as const;

/**
 * 存储Key常量
 */
export const STORAGE_KEYS = {
  TOKEN: 'user_token',
  MENU_DATA: 'all_menu_data',
  USER_INFO: 'user_info',
  MAIN_ACTIVE: 'mainActive',
  ASIDE_ACTIVE: 'asideActive',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed'
} as const;
