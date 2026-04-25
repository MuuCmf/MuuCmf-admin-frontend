import { request } from '@/utils/modules/request';
import type { GroupInfo } from '@/api/admin/auth';

/**
 * 会员管理 API
 * @description 封装会员管理相关的接口请求
 */

/**
 * 用户信息接口
 */
export interface UserInfo {
  uid: number;
  username: string;
  nickname: string;
  avatar64: string;
  status: number;
  email: string;
  phone: string;
  auth: number;
  reg_time: string;
  last_login_time: string;
  last_login_ip: string;
  login_count: number;
  group_id: number;
}

/**
 * 获取用户列表
 * @description 调用后端接口获取用户列表数据
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @returns 返回后端接口响应数据，包含用户列表
 */
export const getMemberList = async (params: { page: number; rows: number; keyword: string }) => {
  const res = await request({
    url: 'admin/member/index',
    method: 'GET',
    data: params
  });
  return res;
};

/**
 * 修改用户状态
 * @description 调用后端接口修改用户状态
 * @param params - 请求参数
 * @param params.uid - 用户ID或ID数组
 * @param params.status - 状态值 (1: 启用, 0: 禁用, -1: 删除)
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const updateMemberStatus = async (params: { uid: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/member/status',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 重置用户密码
 * @description 调用后端接口重置用户密码为默认值
 * @param params - 请求参数
 * @param params.uid - 用户ID或ID数组
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const resetMemberPassword = async (params: { uid: number | number[] }) => {
  const res = await request({
    url: 'admin/member/initpass',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 保存用户信息
 * @description 调用后端接口新增或编辑用户
 * @param data - 用户数据
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const saveMember = async (data: any) => {
  const res = await request({
    url: 'admin/member/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 上传用户头像
 * @description 调用后端接口上传用户头像
 * @param formData - 包含文件的FormData
 * @returns 返回后端接口响应数据，包含上传结果
 */
export const uploadAvatar = async (formData: FormData) => {
  const res = await request({
    url: 'admin/member/avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res;
};

/**
 * 获取用户详情
 * @description 调用后端接口获取用户详细信息
 * @param params - 请求参数
 * @param params.uid - 用户ID
 * @returns 返回后端接口响应数据，包含用户详情
 */
export const getMemberDetail = async (params: { uid: number }) => {
  const res = await request({
    url: 'admin/member/detail',
    method: 'GET',
    data: params
  });
  return res;
};
