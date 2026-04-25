<template>
  <div class="sidebar-toggle" aria-label="切换侧边栏" @click="menuStore.toggleSetAsideCollapsed">
    <safe-icon icon="bars" />
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/stores';

const menuStore = useMenuStore();
</script>

<style lang="scss" scoped>
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: var(--el-color-primary);
  cursor: pointer;

  .svg-inline--fa {
    font-size: 13px;
  }
}
</style>
