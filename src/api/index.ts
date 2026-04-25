import axios from 'axios';

export * from './admin/message';
export * from './admin/queue';
export * from './admin/role';
export * from './admin/module';
export * from './admin/config';
export * from './admin/menu';
export * from './admin/member';
export * from './admin/auth';
export * from './common';

const api = axios.create({
  baseURL: '/api',
  timeout: 1000 * 60,
  responseType: 'json'
});

export default api;
