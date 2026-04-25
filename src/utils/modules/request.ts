import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { RESPONSE_CODE } from '@/constants/responseCode';

// 响应数据类型
interface ResponseData<T = any> {
  code: number;
  data: T;
  msg: string;
}

const ENV = import.meta.env;

const errorHandle = (status: number): void => {
  switch (status) {
    case 400:
      ElMessage.error('语义有误，当前请求无法被服务器理解');
      break;
    case 401:
      //ElMessage.error("服务器认证失败，请重新登录");
      router.push('/401');
      break;
    case 403:
      ElMessage.error('服务器已经理解请求，但是拒绝执行它');
      break;
    case 404:
      ElMessage.error('请检查网络请求地址');
      break;
    case 500:
      ElMessage.error('服务器遇到了一个未曾预料的状况');
      break;
    case 502:
      ElMessage.error('网关或代理服务器接收到无效的响应');
      break;
    default:
      //ElMessage.error("请求失败");
      break;
  }
};

interface RequestConfig {
  url: string;
  method?: string;
  params?: any;
  data?: any;
  headers?: any;
  timeout?: number;
  onUploadProgress?: (progressEvent: any) => void;
}

/**
  构造api地址,
  @params action thinkphp 中的 模块名/控制器/方法名，格式为 'wxapp/home/navs'
  @params querystring 格式为 {参数名1 : 值1, 参数名2 : 值2}
*/
const buildUrl = (action: string, querystring?: any) => {
  // 构造请求URL
  let request_url: string = '';
  if (ENV.MODE == 'development') {
    request_url = action + '?shopid=' + ENV.VITE_APP_SHOPID + '&';
  } else {
    const siteroot = window.location.protocol + '//' + window.location.host + '/';
    request_url = siteroot + action + '?shopid=' + ENV.VITE_APP_SHOPID + '&';
  }

  if (querystring && typeof querystring === 'object') {
    for (const param in querystring) {
      if (param && Object.prototype.hasOwnProperty.call(querystring, param)) {
        request_url += param + '=' + querystring[param] + '&';
      }
    }
  }

  // 移除最后一个&
  if (request_url.charAt(request_url.length - 1) === '&') {
    request_url = request_url.slice(0, -1);
  }

  return request_url;
};

// INIT
const instance = axios.create({
  baseURL: '/',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const res = response.data;

    // 处理业务错误码
    if (res.code !== RESPONSE_CODE.SUCCESS) {
      errorHandle(res.code);
    }

    return res;
  },
  async error => {
    console.log('请求错误:', error);
    if (error.response) {
      const status = error.response.status;
      // 其他错误直接处理
      errorHandle(status);
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请重试');
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络连接失败，请检查网络');
    } else {
      ElMessage.error('请求失败，请稍后重试');
    }
    return Promise.reject(error);
  }
);

/**
 * 发送请求
 * @param option 请求配置
 * @returns 响应数据
 */
const request = <T = any>(option: RequestConfig): Promise<ResponseData<T>> => {
  const method = option.method?.toLowerCase() || 'get';
  if (method === 'get') {
    // 构建包含参数的 URL，然后清空 params 和 data 以避免重复
    option.url = buildUrl(option.url, { ...option.params, ...option.data });
    option.params = undefined;
    option.data = undefined;
  } else {
    option.url = buildUrl(option.url, option.params);
    option.params = undefined;
  }

  return instance.request(option) as Promise<ResponseData<T>>;
};

/**
 * 发送GET请求
 * @param url 请求URL
 * @param params 请求参数
 * @returns 响应数据
 */
const get = async (url: string, params: object = {}) => {
  const request_url = buildUrl(url, params);
  const res = await instance.get(request_url, { params });
  return res;
};

/**
 * 发送POST请求
 * @param url 请求URL
 * @param params 请求参数
 * @returns 响应数据
 */
const post = async (url: string, params: object = {}) => {
  const request_url = buildUrl(url);
  const res = await instance.post(request_url, params);
  return res;
};

export { request, get, post, buildUrl as url };
