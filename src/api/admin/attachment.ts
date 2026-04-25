import { request } from '@/utils/modules/request';

/**
 * 附件管理 API
 * @description 封装附件管理相关的接口请求
 */

/**
 * 附件项接口
 */
export interface AttachmentItem {
  /** 附件ID */
  id: number;
  /** 文件名 */
  filename: string;
  /** 文件类型 */
  type: string;
  /** 文件扩展名 */
  ext: string;
  /** MIME类型 */
  mime: string;
  /** 文件大小 */
  size: number;
  /** 存储驱动 */
  driver: string;
  /** 存储驱动显示名称 */
  driver_str: string;
  /** 创建时间 */
  create_time: string;
  /** 创建时间显示 */
  create_time_str: string;
  /** 用户信息 */
  user_info: {
    /** 用户ID */
    id: number;
    /** 用户昵称 */
    nickname: string;
  };
  /** 文件URL */
  url: string;
  /** 缩略图 */
  thumb?: {
    thumb_100?: string;
    thumb_200?: string;
    thumb_300?: string;
    thumb_400?: string;
    thumb_500?: string;
    thumb_600?: string;
    thumb_700?: string;
    thumb_800?: string;
    thumb_original?: string;
  };
  /** MD5值 */
  md5: string;
  /** SHA1值 */
  sha1: string;
}

/**
 * 获取附件列表
 * @description 调用后端接口获取附件列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.rows - 每页条数
 * @param params.keyword - 搜索关键字
 * @param params.type - 文件类型
 * @param params.driver - 存储驱动
 * @returns 返回后端接口响应数据，包含附件列表
 */
export const getAttachmentList = async (params: {
  page: number;
  rows: number;
  keyword?: string;
  type?: string;
  driver?: string;
}) => {
  const res = await request({
    url: 'admin/attachment/list',
    method: 'GET',
    params
  });
  return res;
};

/**
 * 删除附件
 * @description 调用后端接口删除附件
 * @param data - 请求参数
 * @param data.id - 附件ID
 * @returns 返回后端接口响应数据，包含删除结果
 */
export const deleteAttachment = async (data: { id: number }) => {
  const res = await request({
    url: 'admin/attachment/del',
    method: 'POST',
    data
  });
  return res;
};
