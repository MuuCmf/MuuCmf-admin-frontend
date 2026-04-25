import { request } from '@/utils/modules/request';

/**
 * 认证管理 API
 * @description 封装认证管理相关的接口请求
 */

/**
 * 认证信息接口
 */
export interface AuthenticationItem {
  /** ID */
  id: number;
  /** 用户ID */
  uid: number;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  mobile: string;
  /** 头像 */
  avatar: string;
  /** 64px头像 */
  avatar64: string;
  /** 128px头像 */
  avatar128: string;
  /** 256px头像 */
  avatar256: string;
  /** 512px头像 */
  avatar512: string;
  /** 证件类型 */
  card_type: number;
  /** 证件类型显示 */
  card_type_str: string;
  /** 证件正面 */
  front: string;
  /** 证件正面原图 */
  front_original: string;
  /** 证件背面 */
  back: string;
  /** 证件背面原图 */
  back_original: string;
  /** 状态: -1-拒绝, 1-待审核, 2-已通过 */
  status: number;
  /** 状态显示 */
  status_str: string;
  /** 拒绝原因 */
  reason: string;
  /** 创建时间 */
  create_time: number;
  /** 创建时间显示 */
  create_time_str: string;
  /** 更新时间 */
  update_time: number;
  /** 更新时间显示 */
  update_time_str: string;
}

/**
 * 认证列表接口响应数据
 */
export interface AuthenticationListResponse {
  /** 数据列表 */
  data: AuthenticationItem[];
  /** 总数 */
  total: number;
  /** 未审核数量 */
  unverify: number;
  /** 审核未通过数量 */
  false_verify: number;
}

/**
 * 获取认证列表
 * @description 调用后端接口获取认证列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键字
 * @param params.status - 状态: all-全部, 1-未审核, -1-审核未通过, 2-已实名
 * @returns 返回后端接口响应数据，包含认证列表
 */
export const getAuthenticationList = async (params: {
  page: number;
  rows: number;
  keyword?: string;
  status?: string;
}) => {
  const res = await request({
    url: 'admin/Authentication/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 审核认证
 * @description 调用后端接口审核认证
 * @param data - 请求参数
 * @param data.uid - 用户ID
 * @param data.id - 用户ID
 * @param data.status - 状态: 2-通过, -1-拒绝
 * @param data.reason - 拒绝原因
 * @returns 返回后端接口响应数据，包含审核结果
 */
export const verifyAuthentication = async (data: { uid: number; id: number; status: number; reason?: string }) => {
  const res = await request({
    url: 'admin/Authentication/verify',
    method: 'POST',
    data
  });
  return res;
};
