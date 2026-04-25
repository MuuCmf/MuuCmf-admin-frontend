import { request } from '@/utils/modules/request';

/**
 * 权限管理 API
 * @description 封装权限管理相关的接口请求
 */

/**
 * 权限组信息接口
 */
export interface GroupInfo {
  id: number;
  title: string;
  description: string;
  user_count: number;
  status: number;
}

/**
 * 获取权限组列表
 * @description 调用后端接口获取权限组列表数据
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @returns 返回后端接口响应数据，包含权限组列表
 */
export const getGroupList = async (params: { page: number; rows: number; keyword: string }) => {
  const res = await request({
    url: 'admin/auth/group/list',
    method: 'GET',
    params: params
  });
  return res;
};

/**
 * 修改权限组状态
 * @description 调用后端接口启用、禁用或删除权限组
 * @param params - 请求参数
 * @param params.id - 权限组ID
 * @param params.status - 状态值 (1: 启用, 0: 禁用, -1: 删除)
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const updateGroupStatus = async (params: { id: number; status: number }) => {
  const res = await request({
    url: 'admin/auth/group/status',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 保存权限组
 * @description 调用后端接口新增或编辑权限组
 * @param data - 权限组数据
 * @param data.id - 权限组ID（存在时为编辑）
 * @param data.title - 权限组名称
 * @param data.description - 权限组描述
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const saveGroup = async (data: { id: number; title: string; description: string }) => {
  const res = await request({
    url: 'admin/auth/group/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 权限树节点接口
 */
export interface PermissionNode {
  rule_id: number;
  title: string;
  _child: PermissionNode[];
}

/**
 * 获取权限树
 * @description 调用后端接口获取权限树和权限组已有权限
 * @param params - 请求参数
 * @param params.group_id - 权限组ID
 * @returns 返回后端接口响应数据，包含权限树和已有权限ID列表
 */
export const getPermissionTree = async (params: { group_id: number }) => {
  const res = await request<{
    node_tree: PermissionNode[];
    group_rules: number[] | string;
  }>({
    url: 'admin/auth/access',
    method: 'GET',
    data: params
  });
  return res;
};

/**
 * 保存权限分配
 * @description 调用后端接口保存权限组分配的权限
 * @param params - 请求参数
 * @param params.id - 权限组ID
 * @param params.rules - 权限ID数组
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const savePermissions = async (params: { id: number; rules: number[] }) => {
  const res = await request({
    url: 'admin/auth/access',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 获取权限组用户列表
 * @description 调用后端接口获取指定权限组下的用户列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.group_id - 权限组ID
 * @param params.keyword - 搜索关键词
 * @returns 返回后端接口响应数据，包含用户列表
 */
export const getGroupUsers = async (params: { page: number; group_id: number; keyword: string }) => {
  const res = await request({
    url: 'admin/auth/user',
    method: 'GET',
    data: params
  });
  return res;
};

/**
 * 从权限组移除用户
 * @description 调用后端接口将用户从权限组中移除
 * @param params - 请求参数
 * @param params.uid - 用户ID
 * @param params.group_id - 权限组ID
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const removeUserFromGroup = async (params: { uid: number; group_id: number }) => {
  const res = await request({
    url: 'admin/auth/group/user/remove',
    method: 'POST',
    data: params
  });
  return res;
};
