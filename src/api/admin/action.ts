import { request } from '@/utils/modules/request';

/**
 * 行为管理 API
 * @description 封装行为管理相关的接口请求
 */

/**
 * 积分规则数据结构
 */
export interface RuleItem {
  /** 表名 */
  table: string;
  /** 积分类型 */
  field: number | null;
  /** 积分操作 */
  rule: number;
  /** 周期（小时） */
  cycle: number;
  /** 最大限制次数 */
  max: number;
}

/**
 * 行为规则数据结构
 */
export interface ActionItem {
  /** ID */
  id?: number;
  /** 标识 */
  name: string;
  /** 名称 */
  title: string;
  /** 日志模板 */
  log: string;
  /** 积分规则 */
  rule?: RuleItem[];
  /** 模块 */
  module?: string;
  /** 描述 */
  remark?: string;
  /** 状态 */
  status: number;
  /** 更新时间 */
  update_time?: string;
  /** 创建时间 */
  create_time?: string;
}

/**
 * 行为日志数据结构
 */
export interface ActionLogItem {
  /** ID */
  id: number;
  /** 用户ID */
  uid: number;
  /** 行为ID */
  action_id: number;
  /** 用户信息 */
  user_info: {
    /** 昵称 */
    nickname: string;
  };
  /** 行为信息 */
  action: {
    /** 名称 */
    title: string;
  };
  /** IP地址 */
  action_ip: string;
  /** 日志内容 */
  remark: string;
  /** 创建时间 */
  create_time: string;
  /** 创建时间显示 */
  create_time_str?: string;
}

/**
 * 限制规则数据结构
 */
export interface LimitItem {
  /** ID */
  id: number;
  /** 名称 */
  title: string;
  /** 唯一标识 */
  name: string;
  /** 频率 */
  frequency: number;
  /** 时间数量 */
  time_number: number;
  /** 时间单位 */
  time_unit: string;
  /** 处罚方式 */
  punish: string;
  /** 是否发送消息 */
  if_message: string | number;
  /** 消息内容 */
  message_content: string;
  /** 行为列表 */
  action_list: string;
  /** 状态 */
  status: number;
  /** 时间显示 */
  time_str?: string;
  /** 模块 */
  module?: string;
  /** 关联行为显示 */
  action_list_info?: string;
  /** 处罚方式显示 */
  punish_info?: string;
}

/**
 * 列表响应数据结构
 */
export interface ListResponse<T> {
  /** 数据列表 */
  data: T[];
  /** 总数 */
  total: number;
}

/**
 * 获取行为规则列表
 * @description 调用后端接口获取行为规则列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键字
 * @param params.status - 状态
 * @returns 返回后端接口响应数据，包含行为规则列表
 */
export const getActionList = async (params: { page: number; rows: number; keyword?: string; status?: string }) => {
  const res = await request({
    url: 'admin/action/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 编辑行为规则
 * @description 调用后端接口添加或更新行为规则
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const editAction = async (data: ActionItem) => {
  const res = await request({
    url: 'admin/action/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 批量更新行为规则状态
 * @description 调用后端接口批量更新行为规则状态（启用/禁用/删除）
 * @param data - 请求参数
 * @param data.ids - ID列表，多个用逗号分隔
 * @param data.status - 状态: -1-删除, 0-禁用, 1-启用
 * @returns 返回后端接口响应数据
 */
export const updateActionStatus = async (data: { ids: number | string; status: number }) => {
  const res = await request({
    url: 'admin/action/status',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 获取行为日志列表
 * @description 调用后端接口获取行为日志列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.uid - 用户ID
 * @param params.sTime - 开始时间
 * @param params.eTime - 结束时间
 * @param params.select - 选择条件
 * @returns 返回后端接口响应数据，包含行为日志列表
 */
export const getActionLogList = async (params: {
  page: number;
  rows: number;
  uid?: string;
  sTime?: string;
  eTime?: string;
  select?: number;
}) => {
  const res = await request({
    url: 'admin/action/log',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 删除行为日志
 * @description 调用后端接口删除行为日志
 * @param data - 请求参数
 * @param data.ids - ID列表，多个用逗号分隔
 * @returns 返回后端接口响应数据
 */
export const deleteActionLog = async (data: { ids: string }) => {
  const res = await request({
    url: 'admin/action/log/delete',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 清空行为日志
 * @description 调用后端接口清空所有行为日志
 * @returns 返回后端接口响应数据
 */
export const clearActionLog = async () => {
  const res = await request({
    url: 'admin/action/clear',
    method: 'POST'
  });
  return res;
};

/**
 * 获取限制规则列表
 * @description 调用后端接口获取限制规则列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.action - 搜索行为名称
 * @returns 返回后端接口响应数据，包含限制规则列表
 */
export const getLimitList = async (params: { page: number; rows: number; action?: string }) => {
  const res = await request({
    url: 'admin/action/limit',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 编辑限制规则
 * @description 调用后端接口添加或更新限制规则
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const editLimit = async (data: {
  id?: number;
  title: string;
  name: string;
  frequency: number;
  time_number: number;
  time_unit: string;
  action_list: string;
  punish: string;
  if_message: string | number;
  message_content: string;
  status: number;
  module?: string;
}) => {
  const res = await request({
    url: 'admin/action/limit/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 批量更新限制规则状态
 * @description 调用后端接口批量更新限制规则状态（启用/禁用/删除）
 * @param data - 请求参数
 * @param data.ids - ID列表，多个用逗号分隔
 * @param data.status - 状态: -1-删除, 0-禁用, 1-启用
 * @returns 返回后端接口响应数据
 */
export const updateLimitStatus = async (data: { ids: number | string; status: number }) => {
  const res = await request({
    url: 'admin/action/limit/status',
    method: 'POST',
    data
  });
  return res;
};
