import { request } from '@/utils/modules/request';

/**
 * 扩展配置管理 API
 * @description 封装扩展配置管理相关的接口请求
 */

/**
 * 获取配置分组列表
 * @description 调用后端接口获取配置分组
 * @returns 返回后端接口响应数据，包含配置分组
 */
export const getExtendGroupList = async () => {
  const res = await request({
    url: 'admin/extend/group/list',
    method: 'GET'
  });
  return res;
};

/**
 * 获取扩展配置列表
 * @description 调用后端接口获取扩展配置列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @param params.group - 配置分组
 * @param params.load - 加载方式，'all' 表示加载全部
 * @returns 返回后端接口响应数据，包含扩展配置列表
 */
export const getExtendList = async (params: {
  page?: number;
  rows?: number;
  keyword?: string;
  group?: string;
  load?: string;
}) => {
  const res = await request({
    url: 'admin/extend/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 编辑扩展配置
 * @description 调用后端接口添加或更新扩展配置
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const editExtend = async (data: Partial<ConfigItem>) => {
  const res = await request({
    url: 'admin/extend/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 删除扩展配置
 * @description 调用后端接口删除扩展配置
 * @param data - 请求参数
 * @param data.id - 扩展配置ID
 * @returns 返回后端接口响应数据
 */
export const deleteExtend = async (data: { id: number }) => {
  const res = await request({
    url: 'admin/extend/del',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 保存存储配置
 * @description 调用后端接口保存存储配置
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const saveExtendStore = async (data: Record<string, any>) => {
  const res = await request({
    url: 'admin/extend/store',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 保存短信配置
 * @description 调用后端接口保存短信配置
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const saveExtendSms = async (data: Record<string, any>) => {
  const res = await request({
    url: 'admin/extend/sms',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 保存支付配置
 * @description 调用后端接口保存支付配置
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const saveExtendPayment = async (data: Record<string, any>) => {
  const res = await request({
    url: 'admin/extend/payment',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 保存点播配置
 * @description 调用后端接口保存点播配置
 * @param data - 请求参数
 * @returns 返回后端接口响应数据
 */
export const saveExtendVod = async (data: Record<string, any>) => {
  const res = await request({
    url: 'admin/extend/vod',
    method: 'POST',
    data
  });
  return res;
};
