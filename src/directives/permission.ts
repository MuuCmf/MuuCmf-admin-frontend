import type { Directive } from 'vue';
import { useUserInfoStore } from '@/stores';

const permission: Directive = {
  mounted(el, binding) {
    const userInfoStore = useUserInfoStore();
    const { value } = binding;

    if (value && value instanceof Array && value.length > 0) {
      const permissions = userInfoStore.userInfo?.permissions || [];
      const hasPermission = value.some((permission: string) => permissions.includes(permission));

      if (!hasPermission) {
        el.parentNode?.removeChild(el);
      }
    } else {
      throw new Error('需要指定权限！如 v-permission="[\'admin/user\']"');
    }
  }
};

export default permission;
