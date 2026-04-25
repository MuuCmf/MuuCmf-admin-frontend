import axios from 'axios';

export * from './admin/message';
export * from './admin/queue';
export * from './admin/role';
export * from './admin/module';
export * from './admin/config';
export * from './admin/menu';
export * from './admin/member';
export * from './admin/auth';
export * from './admin/attachment';
export * from './admin/announce';
export * from './admin/authentication';
export * from './admin/action';
export * from './admin/score';
export * from './admin/crontab';
export * from './admin/extend';
export * from './common';

const api = axios.create({
  baseURL: '/api',
  timeout: 1000 * 60,
  responseType: 'json'
});

export default api;
