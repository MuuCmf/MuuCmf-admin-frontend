import { request } from '@/utils/modules/request';

/**
 * 配置管理 API
 * @description 封装配置管理相关的接口请求
 */

/**
 * 获取配置分组列表
 * @description 调用后端接口获取配置分组列表
 * @returns 返回后端接口响应数据，包含配置分组列表
 */
export const getConfigGroupList = async () => {
  const res = await request({
    url: 'admin/config/group/list',
    method: 'GET'
  });
  return res;
};

/**
 * 获取配置分组数据
 * @description 调用后端接口获取指定配置分组的数据
 * @param params - 请求参数
 * @param params.group - 配置分组标识
 * @returns 返回后端接口响应数据，包含配置分组信息和配置列表
 */
export const getConfigGroupData = async (params: { group: string | number }) => {
  const res = await request({
    url: 'admin/config/group',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 保存配置分组数据
 * @description 调用后端接口保存配置分组的配置数据
 * @param data - 请求参数
 * @param data.config - 配置数据对象
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const saveConfigGroupData = async (data: { config: Record<string, any> }) => {
  const res = await request({
    url: 'admin/config/group',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 获取配置列表
 * @description 调用后端接口获取配置列表数据
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键词
 * @param params.group - 配置分组
 * @returns 返回后端接口响应数据，包含配置列表
 */
export const getConfigList = async (params: { page: number; rows: number; keyword: string; group: string }) => {
  const res = await request({
    url: 'admin/config/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 保存配置
 * @description 调用后端接口新增或编辑配置
 * @param data - 配置数据
 * @param data.id - 配置ID（编辑时必填）
 * @param data.title - 配置名称
 * @param data.name - 配置标识
 * @param data.group - 配置分组
 * @param data.type - 配置类型
 * @param data.value - 配置值
 * @param data.description - 配置描述
 * @param data.sort - 配置排序
 * @param data.status - 配置状态
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const saveConfig = async (data: Partial<ConfigItem>) => {
  const res = await request({
    url: 'admin/config/edit',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 删除配置
 * @description 调用后端接口删除配置
 * @param params - 请求参数
 * @param params.id - 配置ID
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const deleteConfig = async (data: { id: number }) => {
  const res = await request({
    url: 'admin/config/del',
    method: 'POST',
    data
  });
  return res;
};
