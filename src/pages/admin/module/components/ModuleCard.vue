<template>
  <div class="app-card">
    <div class="app-card-header">
      <img v-if="data.icon_200" :src="data.icon_200" :alt="data.alias" class="app-icon" />
      <div class="app-info">
        <h3 class="app-title">{{ data.alias || data.name }}</h3>
        <div class="app-version">
          版本: {{ data.version }}
          <span v-if="data.upgrade === 1" class="app-upgrade-inline">可升级到 {{ data.new_version }}</span>
        </div>
        <div class="app-developer">
          开发者:
          <a v-if="data.website" :href="data.website" target="_blank" class="developer-link">{{ data.developer }}</a>
          <span v-else>{{ data.developer }}</span>
        </div>
      </div>
    </div>
    <div class="app-card-body">
      <p class="app-summary text-ellipsis-2">{{ data.summary }}</p>
      <div class="app-meta">
        <div class="meta-item">
          <span class="meta-label">唯一标识:</span>
          <span class="meta-value">{{ data.name }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">来源:</span>
          <span class="meta-value">{{ data.source }}</span>
        </div>
      </div>
    </div>
    <div class="app-card-actions">
      <el-button v-if="data.is_setup === 1" type="primary" size="small" @click="handleEdit">编辑</el-button>
      <el-button v-if="data.is_setup === 1" type="info" size="small" @click="handlePermission">权限菜单/接口</el-button>
      <el-button v-if="data.is_setup === 1" type="warning" size="small" @click="handleUninstall">卸载</el-button>
      <el-button v-else type="success" size="small" @click="handleInstall">安装</el-button>
      <el-button v-if="data.upgrade === 1" type="danger" size="small" @click="handleUpgrade">升级</el-button>
    </div>
    <div v-if="data.is_setup === 1 && data.entry" class="app-card-enter">
      <el-button size="default" style="width: 100%" @click="handleEnterApp">进入应用</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appDataInterface } from '@/pages/admin/module/type';

interface Props {
  data: appDataInterface;
}

interface Emits {
  (e: 'edit', data: any): void;
  (e: 'permission', data: any): void;
  (e: 'install', data: any): void;
  (e: 'uninstall', data: any): void;
  (e: 'upgrade', data: any): void;
  (e: 'enterApp', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleEdit = () => {
  emit('edit', props.data);
};

const handlePermission = () => {
  emit('permission', props.data);
};

const handleInstall = () => {
  emit('install', props.data);
};

const handleUninstall = () => {
  emit('uninstall', props.data);
};

const handleUpgrade = () => {
  emit('upgrade', props.data);
};

const handleEnterApp = () => {
  emit('enterApp', props.data);
};
</script>

<style lang="scss" scoped>
.app-card {
  background-color: var(--el-color-white);
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .app-card-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    .app-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      object-fit: cover;
      margin-right: 16px;
    }

    .app-info {
      flex: 1;

      .app-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .app-version {
        font-size: 12px;
        color: #909399;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 8px;

        .app-upgrade-inline {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          background-color: #fef0f0;
          color: #f56c6c;
          font-size: 11px;
          font-weight: 500;
          border-radius: 3px;
          white-space: nowrap;
        }
      }

      .app-developer {
        font-size: 12px;
        color: #909399;

        .developer-link {
          color: #909399;
          text-decoration: none;
          transition: all 0.3s;

          &:hover {
            text-decoration: none;
            color: #66b1ff;
          }
        }
      }
    }
  }

  .app-card-body {
    padding: 16px;

    .app-summary {
      min-height: 44px;
      font-size: 14px;
      color: #606266;
      line-height: 1.5;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .app-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;

      .meta-item {
        display: flex;
        align-items: center;

        .meta-label {
          font-size: 12px;
          color: #909399;
          margin-right: 4px;
        }

        .meta-value {
          font-size: 12px;
          color: #606266;
          word-break: break-all;
        }
      }
    }
  }

  .app-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    background-color: #fff;
    border-top: 1px solid #f0f0f0;

    .el-button {
      flex: 1;
      margin-left: 0;
    }
  }

  .app-card-enter {
    padding: 0 12px 12px 16px;
    background-color: #fff;
  }
}

.text-success {
  color: #67c23a !important;
}

.text-ellipsis-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 768px) {
  .app-card-header {
    flex-direction: column;
    align-items: flex-start;

    .app-icon {
      margin-bottom: 12px;
    }
  }

  .app-meta {
    grid-template-columns: 1fr;
  }

  .app-card-actions {
    .el-button {
      flex: none;
      width: 100%;
    }
  }
}

// 暗色模式适配
html.dark {
  .app-card {
    background-color: #262626;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.4);
    }

    .app-card-header {
      border-bottom-color: #363636;

      .app-info {
        .app-title {
          color: #e5e5e5;
        }

        .app-version {
          color: #b8b8b8;

          .app-upgrade-inline {
            background-color: rgba(245, 108, 108, 0.2);
            color: #f56c6c;
          }
        }

        .app-developer {
          color: #b8b8b8;

          .developer-link {
            color: #b8b8b8;

            &:hover {
              color: #67b3ff;
            }
          }
        }
      }
    }

    .app-card-body {
      .app-summary {
        color: #e5e5e5;
      }

      .app-meta {
        .meta-item {
          .meta-label {
            color: #9ca3af;
          }

          .meta-value {
            color: #e5e5e5;
          }
        }
      }
    }

    .app-card-actions {
      background-color: #262626;
      border-top-color: #363636;
    }

    .app-card-enter {
      background-color: #262626;
    }
  }
}
</style>
