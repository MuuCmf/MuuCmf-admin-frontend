import { request } from '@/utils/modules/request';

/**
 * SEO管理 API
 * @description 封装SEO规则管理相关的接口请求
 */

/**
 * SEO规则接口
 */
export interface SeoRule {
  id: number;
  title: string;
  app: string;
  controller: string;
  action: string;
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
  status: number;
  create_time: string;
}

/**
 * SEO规则列表查询参数
 */
interface SeoListParams {
  page: number;
  rows: number;
  app?: string;
  keyword?: string;
}

/**
 * SEO规则状态更新参数
 */
interface SeoStatusParams {
  ids: number | number[] | string;
  status: number;
}

/**
 * SEO规则保存参数
 */
interface SeoSaveParams {
  id?: number;
  title: string;
  app: string;
  controller: string;
  action: string;
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
  status: number;
}

/**
 * 获取SEO规则列表
 * @param params - 查询参数
 * @returns 返回后端接口响应数据，包含SEO规则列表
 */
export const getSeoList = async (params: SeoListParams) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.keyword !== undefined && params.keyword !== '') {
    queryParams.keyword = params.keyword;
  }
  if (params.app !== undefined && params.app !== '') {
    queryParams.app = params.app;
  }
  const res = await request({
    url: 'admin/seo/list',
    method: 'GET',
    params: queryParams
  });
  return res;
};

/**
 * 更新SEO规则状态（包括删除、启用、禁用）
 * @param params - 状态更新参数
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const updateSeoStatus = async (params: SeoStatusParams) => {
  const res = await request({
    url: 'admin/seo/status',
    method: 'POST',
    data: params
  });
  return res;
};

/**
 * 保存SEO规则（添加或编辑）
 * @param params - 规则保存参数
 * @returns 返回后端接口响应数据，包含操作结果
 */
export const saveSeoRule = async (params: SeoSaveParams) => {
  const res = await request({
    url: 'admin/seo/edit',
    method: 'POST',
    data: {
      ...params,
      action2: params.action
    }
  });
  return res;
};
