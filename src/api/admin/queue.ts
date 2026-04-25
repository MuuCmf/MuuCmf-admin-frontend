import { request } from '@/utils/modules/request';

export const getQueueList = async (params: {
  page: number;
  rows: number;
  name?: string;
  status?: string;
  type?: string;
}) => {
  const res = await request({
    url: 'admin/queue/list',
    method: 'GET',
    params
  });
  return res;
};

export const getQueueStatus = async () => {
  const res = await request({
    url: 'admin/queue/status',
    method: 'GET'
  });
  return res;
};

export const heartbeat = async () => {
  const res = await request({
    url: 'admin/queue/heartbeat',
    method: 'POST'
  });
  return res;
};

export const getQueueMessages = async (params: { queue_id: number; limit: number }) => {
  const res = await request({
    url: 'admin/queue/messages',
    method: 'GET',
    params
  });
  return res;
};

export const startQueue = async (id: number) => {
  const res = await request({
    url: 'admin/queue/start',
    method: 'POST',
    data: { id }
  });
  return res;
};

export const stopQueue = async (id: number) => {
  const res = await request({
    url: 'admin/queue/stop',
    method: 'POST',
    data: { id }
  });
  return res;
};

export const clearQueue = async (id: number) => {
  const res = await request({
    url: 'admin/queue/clear',
    method: 'POST',
    data: { id }
  });
  return res;
};

export const deleteQueue = async (id: number) => {
  const res = await request({
    url: 'admin/queue/delete',
    method: 'POST',
    data: { id }
  });
  return res;
};

export const updateQueue = async (data: any) => {
  const res = await request({
    url: 'admin/queue/update',
    method: 'POST',
    data
  });
  return res;
};

export const createQueue = async (data: any) => {
  const res = await request({
    url: 'admin/queue/create',
    method: 'POST',
    data
  });
  return res;
};
