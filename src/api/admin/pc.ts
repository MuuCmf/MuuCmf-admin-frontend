import { request } from '@/utils/modules/request';

/**
 * PC端导航管理API
 * @description 封装PC端导航配置相关的接口请求
 */

/**
 * Footer导航项接口
 */
export interface FooterItem {
  id: string;
  type: string;
  app: string;
  title: string;
  url: string;
  sort: number;
  target: number;
  status: number;
  block?: string;
}

/**
 * Navbar导航项接口
 */
export interface NavbarItem {
  id: string;
  type: string;
  app: string;
  title: string;
  url: string;
  sort: number;
  target: number;
  status: number;
  block?: string;
}

/**
 * User导航项接口
 */
export interface UserNavItem {
  id: string;
  type: string;
  app: string;
  title: string;
  url: string;
  sort: number;
  target: number;
  status: number;
  block?: string;
}

/**
 * 导航配置数据结构
 */
interface NavConfig {
  type: string[];
  app: string[];
  title: string[];
  url: string[];
  target: number[];
  sort?: number[];
}

/**
 * 获取Footer导航配置
 */
export const getFooterList = async () => {
  const res = await request({
    url: 'admin/pc/footer',
    method: 'GET',
    data: {
      output: 'json'
    }
  });
  return res;
};

/**
 * 保存Footer导航配置
 */
export const saveFooterConfig = async (nav: NavConfig) => {
  const res = await request({
    url: 'admin/pc/footer',
    method: 'POST',
    data: { nav }
  });
  return res;
};

/**
 * 获取Navbar导航配置
 */
export const getNavbarList = async () => {
  const res = await request({
    url: 'admin/pc/navbar',
    method: 'GET',
    data: {
      output: 'json'
    }
  });
  return res;
};

/**
 * 保存Navbar导航配置
 */
export const saveNavbarConfig = async (nav: NavConfig) => {
  const res = await request({
    url: 'admin/pc/navbar',
    method: 'POST',
    data: { nav }
  });
  return res;
};

/**
 * 获取User导航配置
 */
export const getUserNavList = async () => {
  const res = await request({
    url: 'admin/pc/user',
    method: 'GET',
    data: {
      output: 'json'
    }
  });
  return res;
};

/**
 * 保存User导航配置
 */
export const saveUserNavConfig = async (nav: NavConfig) => {
  const res = await request({
    url: 'admin/pc/user',
    method: 'POST',
    data: { nav }
  });
  return res;
};
