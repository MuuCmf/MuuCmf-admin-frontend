import { request } from '@/utils/modules/request';

/**
 * 菜单管理 API
 * @description 封装菜单管理相关的接口请求
 */

/**
 * 获取菜单树形结构
 * @description 调用后端接口获取指定应用的菜单树形结构数据
 * @param app - 应用标识，默认为 'admin'
 * @returns 返回后端接口响应数据，包含菜单树形结构
 */
export const getMenuTree = async (app: string = 'admin') => {
  const res = await request<MenuItem[]>({
    url: 'admin/menu/tree',
    method: 'GET',
    params: { app }
  });
  return res;
};

/**
 * 获取菜单列表
 * @description 调用后端接口获取菜单列表数据
 * @returns 返回后端接口响应数据，包含菜单列表
 */
export const getMenuIndex = async () => {
  const res = await request({
    url: 'admin/menu/index',
    method: 'GET'
  });
  return res;
};

/**
 * 编辑菜单
 * @description 调用后端接口新增或编辑菜单
 * @param data - 菜单数据对象
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const editMenu = async (data: {
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
}) => {
  const res = await request({
    url: 'admin/menu/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 删除菜单
 * @description 调用后端接口删除指定菜单
 * @param id - 菜单ID
 * @returns 返回后端接口响应数据，包含删除操作结果
 */
export const deleteMenu = async (id: string) => {
  const res = await request({
    url: 'admin/menu/del',
    method: 'POST',
    data: { id }
  });
  return res;
};
