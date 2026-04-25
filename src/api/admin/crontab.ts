import { request } from '@/utils/modules/request';

/**
 * 定时任务管理 API
 * @description 封装定时任务管理相关的接口请求
 */

/**
 * 定时任务数据结构
 */
export interface CrontabItem {
  /** ID */
  id: number;
  /** 任务名称 */
  title: string;
  /** 任务描述 */
  description: string;
  /** 执行命令 */
  execute: string;
  /** 执行周期 */
  cycle: string;
  /** 日期 */
  day: string;
  /** 小时 */
  hour: string;
  /** 分钟 */
  minute: string;
  /** 状态 */
  status: number;
  /** 更新时间 */
  update_time: number;
  /** 更新时间显示 */
  update_time_str?: string;
  /** 执行周期显示 */
  cycle_str?: string;
}

/**
 * 定时任务表单数据
 */
export interface CrontabFormData {
  /** ID */
  id?: number;
  /** 任务名称 */
  title: string;
  /** 任务描述 */
  description: string;
  /** 执行命令 */
  execute: string;
  /** 执行周期 */
  cycle: string;
  /** 日期 */
  day?: string;
  /** 小时 */
  hour?: string;
  /** 分钟 */
  minute?: string;
  /** 状态 */
  status: number;
}

/**
 * 获取定时任务列表
 * @description 调用后端接口获取定时任务列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.title - 任务名称
 * @param params.status - 状态
 * @returns 返回后端接口响应数据，包含定时任务列表
 */
export const getCrontabList = async (params: { page: number; rows: number; title?: string; status?: string }) => {
  const res = await request({
    url: 'admin/crontab/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 编辑定时任务
 * @description 调用后端接口添加或更新定时任务
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const editCrontab = async (data: CrontabFormData) => {
  const res = await request({
    url: 'admin/crontab/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 更新定时任务状态
 * @description 调用后端接口更新定时任务状态（启用/禁用/删除）
 * @param data - 请求参数
 * @param data.ids - ID列表
 * @param data.status - 状态: -1-删除, 0-禁用, 1-启用
 * @returns 返回后端接口响应数据
 */
export const updateCrontabStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/crontab/status',
    method: 'POST',
    data
  });
  return res;
};
