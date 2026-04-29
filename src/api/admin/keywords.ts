import { request } from '@/utils/modules/request';

/**
 * 关键字管理 API
 * @description 封装关键字管理相关的接口请求
 */

/**
 * 关键字项接口
 */
export interface KeywordItem {
  id: number;
  keyword: string;
  sort: number;
  status: number;
  recommend?: number;
  create_time?: string;
  create_time_str?: string;
  update_time?: string;
  update_time_str?: string;
}

/**
 * 获取关键字列表
 * @description 调用后端接口获取关键字列表数据
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @param params.status - 状态筛选
 * @returns 返回后端接口响应数据，包含关键字列表
 */
export const getKeywordsList = async (params: { page: number; rows: number; keyword?: string; status?: string }) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.keyword !== undefined && params.keyword !== '') {
    queryParams.keyword = params.keyword;
  }
  if (params.status !== undefined && params.status !== '') {
    queryParams.status = params.status;
  }
  const res = await request({
    url: 'admin/keywords/list',
    method: 'GET',
    params: queryParams
  });
  return res;
};

/**
 * 更新关键字状态
 * @description 调用后端接口更新关键字状态
 * @param data - 请求参数
 * @param data.ids - 关键字ID或ID数组
 * @param data.status - 状态值 (-1: 删除, 0: 禁用, 1: 启用)
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const updateKeywordsStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/keywords/status',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 保存关键字
 * @description 调用后端接口添加或编辑关键字
 * @param data - 请求参数
 * @param data.id - 关键字ID（编辑时必填）
 * @param data.keyword - 关键字
 * @param data.sort - 排序
 * @param data.recommend - 是否推荐
 * @param data.status - 状态
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const saveKeyword = async (data: {
  id?: number;
  keyword: string;
  sort: number;
  recommend: number;
  status: number;
}) => {
  const res = await request({
    url: 'admin/keywords/edit',
    method: 'POST',
    data
  });
  return res;
};
