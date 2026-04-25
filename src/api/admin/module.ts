import { request } from '@/utils/modules/request';

/**
 * 应用模块 API
 * @description 封装应用模块相关的接口请求
 */

/**
 * 获取所有应用模块列表
 * @description 调用后端接口获取系统中所有的应用模块信息
 * @returns 返回后端接口响应数据，包含应用模块列表
 */
export const getAllModules = async () => {
  const res = await request({
    url: 'admin/module/all',
    method: 'GET'
  });
  return res;
};

/**
 * 获取指定应用模块详情
 * @description 调用后端接口获取指定应用模块的详细信息
 * @param app - 应用模块名称
 * @returns 返回后端接口响应数据，包含应用模块详情
 */
export const getModuleInfo = async (app: string) => {
  const res = await request({
    url: 'admin/module/info',
    method: 'GET',
    data: { app }
  });
  return res;
};
