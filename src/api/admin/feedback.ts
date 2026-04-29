import { request } from '@/utils/modules/request';

/**
 * 反馈管理 API
 * @description 封装反馈管理相关的接口请求
 */

/**
 * 反馈项接口
 */
export interface FeedbackItem {
  id: number;
  uid: number;
  type: string;
  content: string;
  contact: string;
  images: string[];
  status: number;
  reply: string;
  create_time: number;
  update_time: number;
  create_time_str?: string;
  update_time_str?: string;
  user_info?: {
    nickname: string;
    username: string;
    avatar?: string;
    avatar64?: string;
  };
}

/**
 * 获取反馈列表
 * @description 调用后端接口获取反馈列表数据
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @param params.type - 反馈类型
 * @param params.status - 状态筛选
 * @returns 返回后端接口响应数据，包含反馈列表
 */
export const getFeedbackList = async (params: {
  page: number;
  rows: number;
  keyword?: string;
  type?: string;
  status?: string;
}) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.keyword !== undefined && params.keyword !== '') {
    queryParams.keyword = params.keyword;
  }
  if (params.type !== undefined && params.type !== '') {
    queryParams.type = params.type;
  }
  if (params.status !== undefined && params.status !== '' && params.status !== 'all') {
    queryParams.status = params.status;
  }
  const res = await request({
    url: 'admin/feedback/list',
    method: 'GET',
    data: queryParams
  });
  return res;
};

/**
 * 更新反馈状态
 * @description 调用后端接口更新反馈状态
 * @param data - 请求参数
 * @param data.ids - 反馈ID或ID数组
 * @param data.status - 状态值 (-1: 删除, 0: 待处理, 1: 处理中, 2: 已完成)
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const updateFeedbackStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/feedback/status',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 回复反馈
 * @description 调用后端接口回复反馈
 * @param data - 请求参数
 * @param data.id - 反馈ID
 * @param data.reply - 回复内容
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const replyFeedback = async (data: { id: number; reply: string }) => {
  const res = await request({
    url: 'admin/feedback/reply',
    method: 'POST',
    data
  });
  return res;
};
