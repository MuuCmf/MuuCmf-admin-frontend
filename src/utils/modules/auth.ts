/**
 * Token管理
 */

const TOKEN_KEY = 'access_token';

/**
 * 获取记住密码状态
 * @returns 记住密码状态（0：不记住，1：记住）
 */
export const getRemember = (): number => {
  return Number(localStorage.getItem('remember') || 0);
};

/**
 * 获取Token（从localStorage和sessionStorage）
 * @returns Token字符串（如果存在）或null
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
};

/**
 * 设置Token
 * @param token 要设置的Token字符串
 * @param remember 记住密码状态（0：不记住，1：记住）
 * @returns 设置操作是否成功
 */
export const setToken = (token: string, remember: number): boolean => {
  if (remember == 1) {
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } else if (remember == 0) {
    sessionStorage.setItem(TOKEN_KEY, token);
    return true;
  }
  return false;
};

/**
 * 移除Token（从localStorage和sessionStorage）
 * @returns 移除操作是否成功
 */
export const removeToken = (): boolean => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  return true;
};
