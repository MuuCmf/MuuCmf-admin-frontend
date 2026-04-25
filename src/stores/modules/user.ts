import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getUserInfo as getUserInfoApi } from '@/api/common';

/** 当前正在获取用户信息的Promise，用于防止重复请求 */
let pendingUserInfoPromise: Promise<UserInfo> | null = null;

/**
 * 用户信息状态管理
 * @description 管理当前登录用户的信息状态
 */
export const useUserInfoStore = defineStore('user', () => {
  /** 用户信息状态 */
  const userInfo = ref<UserInfo>({} as UserInfo);

  /**
   * 设置用户信息
   * @param val - 用户信息对象
   * @returns 设置后的用户信息
   */
  function setUserInfo(val: UserInfo): UserInfo {
    userInfo.value = val;
    return userInfo.value;
  }

  /**
   * 获取用户信息
   * @description 从后端获取当前登录用户的详细信息，支持防重复请求
   * @returns 返回用户信息Promise
   */
  async function getUserInfo(): Promise<UserInfo> {
    // 如果已经有正在进行的请求，直接返回该Promise
    if (pendingUserInfoPromise) {
      return pendingUserInfoPromise;
    }

    // 如果已有用户信息，直接返回
    if (Object.keys(userInfo.value).length > 0) {
      return Promise.resolve(userInfo.value);
    }

    // 创建新的请求Promise
    pendingUserInfoPromise = new Promise((resolve, reject) => {
      getUserInfoApi()
        .then((res: any) => {
          const data: ResponseData<UserInfo> = res;
          if (data.code === 200) {
            setUserInfo(res.data);
            // 重置失败时间
            resolve(userInfo.value);
          } else {
            // API 返回错误，reject Promise
            const error = new Error(data.msg || '获取用户信息失败');
            (error as any).code = data.code;
            (error as any).data = data;
            reject(error);
          }
        })
        .catch((err: unknown) => {
          console.error('获取用户信息失败：', err);
          reject(err);
        })
        .finally(() => {
          // 请求完成后清空pending promise
          pendingUserInfoPromise = null;
        });
    });

    return pendingUserInfoPromise;
  }

  /**
   * 清除用户信息
   * @description 清除本地存储的用户信息
   */
  function clearUserInfo() {
    userInfo.value = {} as UserInfo;
  }

  return {
    userInfo,
    getUserInfo,
    clearUserInfo
  };
});
