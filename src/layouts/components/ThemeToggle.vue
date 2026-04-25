<template>
  <div class="theme-toggle">
    <el-dropdown trigger="click" @command="handleThemeChange">
      <div class="toggle-button">
        <el-tooltip content="切换主题" placement="bottom">
          <safe-icon icon="fas palette" />
        </el-tooltip>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="light">
            <div class="theme-color-item">
              <div class="color-block light"></div>
              <span>亮色</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="dark">
            <div class="theme-color-item">
              <div class="color-block dark"></div>
              <span>暗色</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="blue">
            <div class="theme-color-item">
              <div class="color-block blue"></div>
              <span>蓝色</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/stores';

const configStore = useConfigStore();

const handleThemeChange = (value: string) => {
  configStore.setTheme(value);
};
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .toggle-button {
    width: 36px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    .svg-inline--fa {
      font-size: 13px;
      color: var(--text-color-light);
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;

  .theme-color-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .color-block {
      width: 24px;
      height: 24px;
      min-width: 24px;
      min-height: 24px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      display: inline-block;

      &.light {
        background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
      }

      &.dark {
        background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
        border: 1px solid #000;
      }

      &.blue {
        background: linear-gradient(135deg, #409eff 0%, #03b8cf 100%);
        border: 1px solid #03b8cf;
      }
    }
  }
}
</style>
