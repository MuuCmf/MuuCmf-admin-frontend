<template>
  <div class="logo" :class="menuStore.asideCollapsed ? 'closed' : 'opened'">
    <template v-if="!menuStore.asideCollapsed">
      <span class="name">{{ frameInfo.name }}</span>
      <span class="version">{{ frameInfo.version }}</span>
    </template>
    <template v-else>
      <span class="name">{{ firstCharName }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/stores';
import defaultSettings from '@/settings';

// 框架基础数据
const frameInfo: any = defaultSettings;
const firstCharName = frameInfo.name.charAt(0);

// 侧边栏状态
const menuStore = useMenuStore();
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  border: 0;
  border-right: 1px solid #eee;
  height: 50px;
  color: var(--el-color-primary);
  font-size: 20px;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  transition: width 0.3s ease;

  .name {
    padding-right: 5px;
  }
}

.opened {
  width: 220px;
}

.closed {
  width: 60px;
}
</style>
