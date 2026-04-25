import { request } from '@/utils/modules/request';

/**
 * 获取角色用户列表
 */
export const getRoleUserList = (params: any) => {
  return request({
    url: 'admin/role/list',
    method: 'GET',
    params
  });
};

/**
 * 获取角色列表
 */
export const getRoleList = (params: any) => {
  return request({
    url: 'admin/role/list',
    method: 'GET',
    params
  });
};

/**
 * 编辑角色
 */
export const editRole = (data: any) => {
  return request({
    url: 'admin/role/edit',
    method: 'POST',
    data
  });
};

/**
 * 设置角色状态
 */
export const setRoleStatus = (data: any) => {
  return request({
    url: 'admin/role/status',
    method: 'POST',
    data
  });
};

/**
 * 删除角色
 */
export const deleteRole = (data: any) => {
  return request({
    url: 'admin/role/del',
    method: 'POST',
    data
  });
};

/**
 * 检查角色绑定
 */
export const checkRoleBind = (data: any) => {
  return request({
    url: 'admin/role/check/bind',
    method: 'POST',
    data
  });
};

/**
 * 角色审核
 */
export const verifyRole = (data: any) => {
  return request({
    url: 'admin/role/verify',
    method: 'POST',
    data
  });
};

/**
 * 获取角色分组列表
 */
export const getRoleGroupList = (params: any) => {
  return request({
    url: 'admin/role/group',
    method: 'GET',
    params
  });
};

/**
 * 编辑角色分组
 */
export const editRoleGroup = (data: any) => {
  return request({
    url: 'admin/role/group/edit',
    method: 'POST',
    data
  });
};

/**
 * 设置角色分组状态
 */
export const setRoleGroupStatus = (data: any) => {
  return request({
    url: 'admin/role/group/status',
    method: 'POST',
    data
  });
};
