import { request } from '@/utils/modules/request';

/**
 * 模块管理 API
 * @description 封装模块/应用管理相关的接口请求
 */

/**
 * 模块应用接口
 */
export interface ModuleItem {
  id: number;
  alias: string;
  name: string;
  version: string;
  upgrade: number;
  new_version: string;
  is_setup: number;
  entry: string;
  expired: number;
  website: string;
  developer: string;
  spa: boolean;
  source: string;
  summary: string;
  status: number;
  sort: number;
  icon: string;
  icon_100: string;
  icon_200: string;
  icon_300: string;
  icon_400: string;
  entry_spa?: boolean;
}

/**
 * 菜单项接口
 */
export interface MenuItem {
  id: string;
  pid: string;
  title: string;
  url: string;
  icon?: string;
  sort: number;
  hide: number;
  type: number;
  module: string;
  group?: string;
  is_dev?: number;
  tip?: string;
  _child?: MenuItem[];
  type_str?: string;
  hide_str?: string;
}

/**
 * 模块列表查询参数
 */
interface ModuleListParams {
  page: number;
  rows: number;
  type?: string;
}

/**
 * 模块编辑参数
 */
interface ModuleEditParams {
  id: number;
  alias: string;
  summary: string;
  icon: string;
  developer: string;
  sort: number;
}

/**
 * 模块安装参数
 */
interface ModuleInstallParams {
  id: number;
  name: string;
  alias: string;
}

/**
 * 模块卸载参数
 */
interface ModuleUninstallParams {
  id: number;
  withoutData: number;
}

/**
 * 菜单编辑参数
 */
interface MenuEditParams {
  id?: string;
  title: string;
  pid: string;
  url: string;
  icon: string;
  sort: number;
  type: number;
  module: string;
  group: string;
  hide: number;
  is_dev: number;
  tip: string;
}

/**
 * 获取模块分页列表
 * @param params - 查询参数
 * @returns 返回后端接口响应数据，包含模块列表
 */
export const getModuleList = async (params: ModuleListParams) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.type && params.type !== 'all') {
    queryParams.type = params.type;
  }
  const res = await request({
    url: 'admin/module/list',
    method: 'GET',
    params: queryParams
  });
  return res;
};

/**
 * 获取模块列表
 * @param params - 查询参数
 * @returns 返回后端接口响应数据，包含模块列表
 */
export const getAllModules = async () => {
  const res = await request({
    url: 'admin/module/all',
    method: 'GET'
  });
  return res;
};

export const getModulesInfo = async (name: string) => {
  const res = await request({
    url: 'admin/module/info',
    method: 'GET',
    params: {
      app: name
    }
  });
  return res;
};

/**
 * 编辑模块
 * @param params - 模块编辑参数
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const editModule = async (params: ModuleEditParams) => {
  const res = await request({
    url: 'admin/module/edit',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 安装模块
 * @param params - 模块安装参数
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const installModule = async (params: ModuleInstallParams) => {
  const res = await request({
    url: 'admin/module/install',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 卸载模块
 * @param params - 模块卸载参数
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const uninstallModule = async (params: ModuleUninstallParams) => {
  const res = await request({
    url: 'admin/module/uninstall',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 升级模块
 * @param params - 包含模块ID
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const upgradeModule = async (params: { id: number }) => {
  const res = await request({
    url: 'admin/module/upgrade',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 获取模块更新日志
 * @param name - 模块名称
 * @returns 返回后端接口响应数据，包含更新日志列表
 */
export const getModuleChangeLogList = async (name: string) => {
  const res = await request({
    url: 'admin/module/cvlist',
    method: 'GET',
    params: { name }
  });
  return res;
};

/**
 * 获取菜单列表
 * @param app - 应用名称
 * @returns 返回后端接口响应数据，包含菜单列表
 */
export const getModuleMenuList = async (app: string) => {
  const res = await request({
    url: 'admin/module/menu',
    method: 'GET',
    params: { app }
  });
  return res;
};

/**
 * 删除菜单
 * @param id - 菜单ID
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const deleteModuleMenu = async (id: string) => {
  const res = await request({
    url: 'admin/module/menu/del',
    method: 'POST',
    data: { id }
  });
  return res;
};

/**
 * 编辑菜单
 * @param params - 菜单编辑参数
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const editModuleMenu = async (params: MenuEditParams) => {
  const res = await request({
    url: 'admin/module/menu/edit',
    method: 'POST',
    data: params
  });
  return res;
};
