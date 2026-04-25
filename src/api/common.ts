import { request } from '@/utils/modules/request';

/**
 * 登录请求参数接口
 * @description 用于传递用户登录所需的凭证信息
 */
export interface LoginData {
  /** 用户账号（手机号/邮箱/用户名） */
  account: string;
  /** 用户密码 */
  password: string;
  /** 验证码（可选，当需要验证码登录时使用） */
  verify_code?: string;
  /** 验证码Token（可选，用于验证码校验） */
  verify_token?: string;
}

/**
 * 登录响应数据接口
 * @description 登录成功后返回的用户信息及Token
 */
export interface LoginResponse {
  /** 用户Token */
  token: string;
  /** 用户ID */
  uid: number;
  /** 是否记住登录状态（1-是，0-否） */
  remember?: number;
  /** 用户昵称 */
  nickname?: string;
  /** 用户名 */
  username?: string;
}

/**
 * 验证码发送请求参数接口
 * @description 用于传递发送验证码所需的参数
 */
export interface VerifyCodeData {
  /** 验证码类型：mobile-手机号，email-邮箱 */
  type: 'mobile' | 'email';
  /** 接收验证码的账号（手机号或邮箱） */
  account: string;
}

/**
 * 验证码发送响应数据接口
 * @description 发送验证码接口的返回结果
 */
export interface VerifyCodeResponse {
  /** 请求是否成功 */
  success: boolean;
  /** 响应消息（成功/失败原因） */
  message?: string;
}

/**
 * 用户登录接口
 * @description 调用后端登录接口，验证用户凭证并获取Token
 * @param data - 登录参数，包含账号、密码及可选的验证码信息
 * @returns 返回后端接口响应数据，包含Token和用户信息
 */
export const login = async (data: LoginData) => {
  const res = await request<LoginResponse>({
    url: 'api/member/login',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 发送验证码接口
 * @description 调用后端接口向指定手机号或邮箱发送验证码
 * @param data - 验证码参数，包含发送类型和目标账号
 * @returns 返回后端接口响应数据，包含发送结果
 */
export const sendVerifyCode = async (data: VerifyCodeData) => {
  const res = await request<VerifyCodeResponse>({
    url: 'api/verify/send',
    method: 'POST',
    data
  });
  return res;
};

/**
 * 用户退出登录接口
 * @description 调用后端退出登录接口，清除服务端会话状态
 * @returns 返回后端接口响应数据，包含退出操作结果
 */
export const logout = async () => {
  const res = await request<VerifyCodeResponse>({
    url: 'api/member/logout',
    method: 'POST'
  });
  return res;
};

/**
 * 获取用户信息接口
 * @description 调用后端接口获取当前登录用户的详细信息
 * @returns 返回后端接口响应数据，包含用户详细信息
 */
export const getUserInfo = async () => {
  const res = await request<UserInfo>({
    url: 'api/member/user_info',
    method: 'GET'
  });
  return res;
};

/**
 * 获取系统配置
 * @description 调用后端接口获取系统配置信息
 * @returns 返回后端接口响应数据，包含系统配置信息
 */
export const getSystemConfig = async () => {
  const res = await request({
    url: 'api/config/system',
    method: 'GET'
  });
  return res;
};

/**
 * 获取微服务配置
 * @description 调用后端接口获取微服务配置信息
 * @returns 返回后端接口响应数据，包含微服务配置信息
 */
export const getMicroServiceConfig = async () => {
  const res = await request({
    url: 'micro/api/config/get',
    method: 'GET'
  });
  return res;
};
