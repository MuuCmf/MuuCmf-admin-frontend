import { request } from '@/utils/modules/request';

/**
 * 提现管理 API
 * @description 封装提现管理相关的接口请求
 */

/**
 * 提现项接口
 */
export interface WithdrawItem {
  id: number;
  uid: number;
  order_no: string;
  price: number;
  channel: string;
  pay_channel: string;
  paid: number;
  paid_str: string;
  status_str: string;
  create_time?: number;
  create_time_str?: string;
  paid_time?: number;
  paid_time_str?: string;
  user_info?: {
    uid: number;
    username: string;
    nickname: string;
    avatar: string;
    avatar64?: string;
    avatar128?: string;
    avatar256?: string;
    avatar512?: string;
    email?: string;
    mobile?: string;
  };
}

/**
 * 提现列表查询参数
 */
interface WithdrawListParams {
  page: number;
  rows: number;
  order_no?: string;
}

/**
 * 获取提现列表
 * @param params - 查询参数
 * @returns 返回后端接口响应数据，包含提现列表
 */
export const getWithdrawList = async (params: WithdrawListParams) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.order_no !== undefined && params.order_no !== '') {
    queryParams.order_no = params.order_no;
  }
  const res = await request({
    url: 'admin/withdraw/list',
    method: 'GET',
    params: queryParams
  });
  return res;
};

/**
 * 获取提现详情
 * @param id - 提现记录ID
 * @returns 返回后端接口响应数据，包含提现详情
 */
export const getWithdrawDetail = async (id: number) => {
  const res = await request({
    url: 'admin/withdraw/detail',
    method: 'GET',
    data: { id }
  });
  return res;
};

/**
 * 处理提现
 * @param id - 提现记录ID
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const processWithdraw = async (id: number) => {
  const res = await request({
    url: 'admin/withdraw/action',
    method: 'POST',
    data: { id }
  });
  return res;
};

/**
 * 取消提现
 * @param id - 提现记录ID
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const cancelWithdraw = async (id: number) => {
  const res = await request({
    url: 'admin/withdraw/cancel',
    method: 'POST',
    data: { id }
  });
  return res;
};
