import { request } from '@/utils/modules/request';

/**
 * 公告管理 API
 * @description 封装公告管理相关的接口请求
 */

/**
 * 公告信息接口
 */
export interface AnnounceInfo {
  /** 公告ID */
  id?: number;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 状态: 0-禁用, 1-启用 */
  status: number;
  /** 排序 */
  sort: number;
  /** 终端 */
  teminal: string;
  /** 类型: 0-文字, 1-图片 */
  type: number;
  /** 类型显示 */
  type_str: string;
  /** 封面图片 */
  cover?: string;
  /** 封面80px */
  cover_80?: string;
  /** 封面120px */
  cover_120?: string;
  /** 封面200px */
  cover_200?: string;
  /** 封面400px */
  cover_400?: string;
  /** 创建时间 */
  create_time?: string;
  /** 创建时间显示 */
  create_time_str?: string;
  /** 更新时间显示 */
  update_time_str?: string;
}

/**
 * 获取公告列表
 * @description 调用后端接口获取公告列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键字
 * @param params.status - 状态
 * @returns 返回后端接口响应数据，包含公告列表
 */
export const getAnnounceList = async (params: { page: number; rows: number; keyword?: string; status?: string }) => {
  const res = await request({
    url: 'admin/announce/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 更新公告状态
 * @description 调用后端接口更新公告状态（启用/禁用/删除）
 * @param data - 请求参数
 * @param data.ids - 公告ID或ID数组
 * @param data.status - 状态: -1-删除, 0-禁用, 1-启用
 * @returns 返回后端接口响应数据，包含更新结果
 */
export const updateAnnounceStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/announce/status',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 保存公告
 * @description 调用后端接口添加或编辑公告
 * @param data - 公告数据
 * @returns 返回后端接口响应数据，包含保存结果
 */
export const saveAnnounce = async (data: AnnounceInfo) => {
  const res = await request({
    url: 'admin/announce/edit',
    method: 'POST',
    data
  });
  return res;
};
