import { request } from '@/utils/modules/request';

// 消息列表接口
export const getMessageList = async (params: {
  page: number;
  rows: number;
  keyword?: string;
  type_id?: string;
  status?: string;
  is_read?: string;
}) => {
  const queryParams: Record<string, any> = {
    page: params.page,
    rows: params.rows
  };
  if (params.keyword !== undefined && params.keyword !== '') {
    queryParams.keyword = params.keyword;
  }
  if (params.type_id !== undefined && params.type_id !== '') {
    queryParams.type_id = params.type_id;
  }
  if (params.status !== undefined && params.status !== '' && params.status !== 'all') {
    queryParams.status = params.status;
  }
  if (params.is_read !== undefined && params.is_read !== '') {
    queryParams.is_read = params.is_read;
  }

  const res = await request({
    url: 'admin/message/list',
    params: queryParams,
    method: 'GET'
  });
  return res;
};

// 消息类型列表接口
export const getMessageTypes = async () => {
  const res = await request({
    url: 'admin/message/type',
    method: 'GET'
  });
  return res;
};

// 编辑消息类型接口
export const editMessageType = async (data: {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: number;
}) => {
  const res = await request({
    url: 'admin/message/type/edit',
    method: 'POST',
    data
  });
  return res;
};

// 更新消息/消息类型状态接口
export const updateMessageStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/message/status',
    method: 'POST',
    data
  });
  return res;
};

// 更新消息类型状态接口
export const updateMessageTypeStatus = async (data: { ids: number | number[]; status: number }) => {
  const res = await request({
    url: 'admin/message/type/status',
    method: 'POST',
    data
  });
  return res;
};

// 上传附件接口
export const uploadAttachment = async (formData: FormData) => {
  const res = await request({
    url: 'api/file/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res;
};
