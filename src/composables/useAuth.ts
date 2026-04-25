import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserInfoStore, useRouterStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { isPhone, isEmail } from '@/utils/modules/validate';
import { login as loginApi, sendVerifyCode as sendVerifyCodeApi, logout as logoutApi } from '@/api';

/**
 * 认证状态管理 Composable
 * @description 提供用户登录、登出、验证码发送等认证相关功能
 * @returns 包含认证状态和操作方法的对象
 */
export function useAuth() {
  /** Vue Router 实例，用于页面跳转 */
  const router = useRouter();
  /** 当前路由实例，用于获取路由信息 */
  const route = useRoute();
  /** 用户信息 Store */
  const userInfoStore = useUserInfoStore();
  /** 路由状态 Store */
  const routerStore = useRouterStore();

  /**
   * 是否已认证的计算属性
   * @description 通过判断用户信息对象是否为空来确定认证状态
   */
  const isAuthenticated = computed(() => {
    return Object.keys(userInfoStore.userInfo).length > 0;
  });

  /** 登录请求的 loading 状态 */
  const loading = ref(false);

  /**
   * 用户登录方法
   * @description 调用登录接口，成功后获取用户信息并跳转到目标页面
   * @param credentials - 登录凭证，包含账号、密码及可选的验证码信息
   * @returns 登录结果对象，包含 success 布尔值和可选的错误消息
   */
  const login = async (credentials: any) => {
    /** 设置 loading 状态为 true */
    loading.value = true;
    try {
      /** 调用登录 API */
      const response = await loginApi(credentials);

      /** 判断登录是否成功（后端返回 code 为 200 表示成功） */
      if (response.code === 200) {
        /** 获取用户信息 */
        await userInfoStore.getUserInfo();
        /** 获取重定向路径，默认为首页 */
        const redirectPath = route.query.redirect || '/';

        /** 等待路由准备就绪 */
        await router.isReady();

        /** 跳转到目标页面 */
        await router.replace(redirectPath as string);

        /** 展示登录成功提示 */
        ElMessage.success('登录成功！');
        return { success: true };
      }
      /** 展示登录失败提示 */
      ElMessage.error(response.msg || '登录失败，请稍后重试');
      return { success: false, message: response.msg || '登录失败' };
    } catch (error: any) {
      /** 展示错误提示 */
      ElMessage.error(error.message || '登录失败，请稍后重试');
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试'
      };
    } finally {
      /** 无论成功失败，都重置 loading 状态 */
      loading.value = false;
    }
  };

  /**
   * 发送验证码方法
   * @description 根据输入的账号类型（手机号或邮箱）发送验证码
   * @param account - 接收验证码的账号（手机号或邮箱地址）
   * @returns 发送结果对象，包含 success 布尔值和可选的错误消息
   */
  const sendVerifyCode = async (account: string) => {
    /** 验证码类型：mobile-手机号，email-邮箱 */
    let type: 'mobile' | 'email' | '' = '';

    /** 判断账号类型并设置 type */
    if (isPhone(account)) {
      type = 'mobile';
    } else if (isEmail(account)) {
      type = 'email';
    } else {
      /** 账号格式无效，提示用户 */
      ElMessage.warning('请输入有效的手机号或邮箱');
      return { success: false };
    }

    try {
      /** 调用发送验证码 API */
      const response = await sendVerifyCodeApi({
        type,
        account
      });

      /** 判断发送是否成功 */
      if (response.code === 200) {
        /** 展示发送成功提示 */
        ElMessage.success('验证码发送成功！');
        return { success: true };
      }

      /** 展示发送失败提示 */
      ElMessage.error(response.msg || '验证码发送失败');
      return { success: false, message: response.msg || '验证码发送失败' };
    } catch (error: any) {
      /** 展示错误提示 */
      ElMessage.error(error.message || '验证码发送失败，请稍后重试');
      return {
        success: false,
        message: error.message || '验证码发送失败，请稍后重试'
      };
    }
  };

  /**
   * 用户退出登录方法
   * @description 调用退出登录接口，清除本地用户信息并跳转到前台首页
   */
  const logout = async () => {
    try {
      /** 调用退出登录 API */
      const response = await logoutApi();

      /** 判断退出是否成功 */
      if (response.code === 200) {
        /** 清除本地用户信息 */
        userInfoStore.clearUserInfo();
        /** 重置路由状态 */
        routerStore.reset();
        /** 展示退出成功提示 */
        ElMessage.success('已退出登录');
        /** 获取前台首页地址 */
        const frontendUrl = window.location.origin;
        /** 跳转到前台首页 */
        window.location.href = frontendUrl;
      }
    } catch (error: any) {
      /** 展示错误提示 */
      ElMessage.error(error.message || '退出登录失败，请稍后重试');
    }
  };

  /**
   * 检查认证状态方法
   * @description 验证用户是否已认证，若未认证则跳转到登录页
   */
  const checkAuth = () => {
    /** 判断是否未认证 */
    if (!isAuthenticated.value) {
      /** 跳转到登录页，携带当前页面路径作为重定向参数 */
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      });
    }
  };

  /**
   * useAuth Composable 返回值
   * @description 暴露给外部使用的状态和方法
   */
  return {
    /** 是否已认证 */
    isAuthenticated,
    /** 登录 loading 状态 */
    loading,
    /** 登录方法 */
    login,
    /** 发送验证码方法 */
    sendVerifyCode,
    /** 退出登录方法 */
    logout,
    /** 检查认证状态方法 */
    checkAuth
  };
}
