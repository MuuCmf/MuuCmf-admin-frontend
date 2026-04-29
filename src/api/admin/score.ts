import { request } from '@/utils/modules/request';

/**
 * 积分管理 API
 * @description 封装积分管理相关的接口请求
 */

/**
 * 积分类型数据结构
 */
export interface ScoreTypeItem {
  /** ID */
  id: number;
  /** 类型名称 */
  title: string;
  /** 单位 */
  unit: string;
  /** 状态 */
  status: number;
}

/**
 * 积分类型表单数据结构
 */
export interface ScoreTypeFormData {
  /** ID */
  id?: number;
  /** 类型名称 */
  title: string;
  /** 单位 */
  unit: string;
  /** 状态 */
  status: number;
}

/**
 * 积分日志数据结构
 */
export interface ScoreLogItem {
  /** ID */
  id: number;
  /** 用户ID */
  user_id: number;
  /** 用户信息 */
  user_info: {
    uid: number;
    nickname: string;
    avatar?: string;
  };
  /** 类型: 1:积分, 2:经验值 */
  type: number;
  /** 调整类型 */
  adjust_type: number;
  /** 积分变动值 */
  value: number;
  /** 最终积分值 */
  final_value: number;
  /** 描述 */
  description: string;
  /** 创建时间 */
  create_time: string;
}

/**
 * 获取积分类型列表
 * @description 调用后端接口获取积分类型列表
 * @param params - 查询参数
 * @param params.keyword - 搜索关键词
 * @returns 返回后端接口响应数据，包含积分类型列表
 */
export const getScoreTypeList = async (params?: { keyword?: string }) => {
  const res = await request({
    url: 'admin/score/type',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 编辑积分类型
 * @description 调用后端接口添加或更新积分类型
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const editScoreType = async (data: ScoreTypeFormData) => {
  const res = await request({
    url: 'admin/score/type/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 删除积分类型
 * @description 调用后端接口删除积分类型
 * @param data - 请求参数
 * @param data.ids - ID
 * @returns 返回后端接口响应数据
 */
export const deleteScoreType = async (data: { ids: number }) => {
  const res = await request({
    url: 'admin/score/type/delete',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 更新积分类型状态
 * @description 调用后端接口更新积分类型状态
 * @param data - 请求参数
 * @param data.ids - ID
 * @param data.status - 状态
 * @returns 返回后端接口响应数据
 */
export const updateScoreTypeStatus = async (data: { ids: number; status: number }) => {
  const res = await request({
    url: 'admin/score/type/status',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 获取积分日志列表
 * @description 调用后端接口获取积分日志列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @returns 返回后端接口响应数据，包含积分日志列表
 */
export const getScoreLogList = async (params: { page: number; rows: number; keyword?: string }) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.keyword !== undefined && params.keyword !== '') {
    queryParams.keyword = params.keyword;
  }
  const res = await request({
    url: 'admin/score/log',
    method: 'GET',
    params: queryParams
  });
  return res;
};

/**
 * 清空积分日志
 * @description 调用后端接口清空所有积分日志
 * @returns 返回后端接口响应数据
 */
export const clearScoreLog = async () => {
  const res = await request({
    url: 'admin/score/clear',
    method: 'POST'
  });
  return res;
};
