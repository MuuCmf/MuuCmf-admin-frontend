import { request } from '@/utils/modules/request';

/**
 * 历史记录管理 API
 * @description 封装历史记录管理相关的接口请求
 */

/**
 * 历史记录项接口
 */
export interface HistoryItem {
  id: number;
  uid: number;
  info_id: number;
  info_type: string;
  module_name: string;
  status: number;
  shopid: number;
  app: string;
  create_time?: number;
  create_time_str?: string;
  create_time_friendly_str?: string;
  update_time?: number;
  update_time_str?: string;
  update_time_friendly_str?: string;
  user_info?: {
    uid: number;
    nickname: string;
    avatar: string;
    status: number;
  };
  products?: {
    title: string;
    desc: string;
    cover: string;
  };
  metadata?: {
    title: string;
    desc: string;
    cover: string;
  };
}

/**
 * 获取历史记录列表
 * @description 调用后端接口获取历史记录列表数据
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @returns 返回后端接口响应数据，包含历史记录列表
 */
export const getHistoryList = async (params: { page: number; rows: number; keyword?: string }) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.keyword !== undefined && params.keyword !== '') {
    queryParams.keyword = params.keyword;
  }
  const res = await request({
    url: 'admin/history/list',
    method: 'GET',
    data: queryParams
  });
  return res;
};

/**
 * 更新历史记录状态
 * @description 调用后端接口更新历史记录状态
 * @param data - 请求参数
 * @param data.ids - 历史记录ID或ID数组
 * @param data.status - 状态值 (-1: 删除)
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const updateHistoryStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/history/status',
    method: 'POST',
    data
  });
  return res;
};
