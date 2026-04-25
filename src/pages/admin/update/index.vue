<template>
  <div class="page-container">
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="version-section">
          <div class="section-header">
            <h2 class="section-title">版本信息</h2>
            <el-tag v-if="updateInfo.upgrade" type="warning" size="large">有新版本</el-tag>
            <el-tag v-else type="success" size="large">已是最新版本</el-tag>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">应用名称</div>
              <div class="info-value">{{ updateInfo.app_name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">本地版本</div>
              <div class="info-value">
                <el-tag type="info" size="large">{{ updateInfo.local_version }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">云端版本</div>
              <div class="info-value">
                <el-tag
                  v-if="updateInfo.cloud_version.version !== updateInfo.local_version"
                  type="warning"
                  size="large"
                >
                  {{ updateInfo.cloud_version.version }}
                </el-tag>
                <el-tag v-else type="success" size="large">
                  {{ updateInfo.cloud_version.version }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">发布时间</div>
              <div class="info-value">
                {{ formatTimestamp(updateInfo.cloud_version.create_time) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="updateInfo.upgrade" class="upgrade-section">
          <div class="section-header">
            <h2 class="section-title">升级操作</h2>
          </div>

          <div class="alert-box warning">
            <el-icon class="alert-icon"><Warning /></el-icon>
            <div class="alert-content">
              <p>
                发现新版本 {{ updateInfo.cloud_version.version }}，当前版本为
                {{ updateInfo.local_version }}
              </p>
              <p>升级过程中请勿关闭浏览器或刷新页面</p>
            </div>
          </div>

          <div class="log-section">
            <h3 class="log-title">更新日志</h3>
            <div class="log-content" v-html="updateInfo.cloud_version.remark"></div>
          </div>

          <div class="checkbox-section">
            <el-checkbox v-model="agreements.backup">我已经做好了相关数据的备份工作</el-checkbox>
            <el-checkbox v-model="agreements.risk">认同官方的更新行为并自愿承担更新所存在的风险</el-checkbox>
            <el-checkbox v-model="agreements.gratitude">理解官方的辛勤劳动并报以感恩的心态点击升级按钮</el-checkbox>
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" :disabled="!allAgreed" @click="showUpgradeDialog">
              <safe-icon icon="fas cloud-download-alt" style="margin-right: 8px" />
              立即升级
            </el-button>
            <el-button size="large" @click="checkUpdate">
              <safe-icon icon="fas sync-alt" style="margin-right: 8px" />
              检查更新
            </el-button>
          </div>
        </div>

        <div v-else class="status-section">
          <div class="section-header">
            <h2 class="section-title">当前状态</h2>
          </div>

          <div class="success-state">
            <el-icon class="success-icon"><SuccessFilled /></el-icon>
            <h3 class="success-title">系统已是最新版本</h3>
            <el-button type="primary" size="large" @click="checkUpdate">
              <safe-icon icon="fas sync-alt" style="margin-right: 8px" />
              重新检查
            </el-button>
          </div>
        </div>

        <UpgradeProgress
          v-model="upgradeDialogVisible"
          :current-version="updateInfo.local_version"
          :target-version="updateInfo.cloud_version.version"
          :app-name="updateInfo.app_name"
          :frame="updateInfo.frame"
          scene="upgrade"
          @success="handleUpgradeSuccess"
          @error="handleUpgradeError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning, SuccessFilled } from '@element-plus/icons-vue';
import UpgradeProgress from '@/components/UpgradeProgress.vue';

interface CloudVersion {
  version: string;
  remark: string;
  create_time: number;
}

interface UpdateInfo {
  local_version: string;
  cloud_version: CloudVersion;
  upgrade: boolean;
  backup_path: string;
  app_name: string;
  frame?: string;
}

const loading = ref(false);
const upgradeDialogVisible = ref(false);
const agreements = ref({
  backup: false,
  risk: false,
  gratitude: false
});

const allAgreed = computed(() => {
  return agreements.value.backup && agreements.value.risk && agreements.value.gratitude;
});

const updateInfo = ref<UpdateInfo>({
  local_version: '',
  cloud_version: {
    version: '',
    remark: '',
    create_time: 0
  },
  upgrade: false,
  backup_path: '',
  app_name: ''
});

/**
 * 获取升级信息
 */
const getUpdateInfo = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/update/index',
      method: 'GET'
    });
    if (res.code === 200) {
      updateInfo.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取升级信息失败');
    }
  } catch (error) {
    ElMessage.error('获取升级信息失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const checkUpdate = () => {
  getUpdateInfo();
  ElMessage.success('正在检查更新...');
};

const showUpgradeDialog = () => {
  ElMessageBox.confirm(
    `确定要升级到版本 ${updateInfo.value.cloud_version.version} 吗？\n升级过程中请勿关闭浏览器或刷新页面`,
    '确认升级',
    {
      confirmButtonText: '确定升级',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  )
    .then(() => {
      upgradeDialogVisible.value = true;
    })
    .catch(() => {
      ElMessage.info('已取消升级');
    });
};

const handleUpgradeSuccess = () => {
  ElMessage.success('升级成功，正在刷新页面...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

const handleUpgradeError = (error: string) => {
  ElMessage.error(error || '升级失败');
};

const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  getUpdateInfo();
});
</script>

<style scoped lang="scss">
.page-content {
  background-color: transparent;
  padding: 0;
}

.version-section,
.upgrade-section,
.status-section {
  background: #fff;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  transition: all 0.3s ease;

  &:hover {
    background: #ecf5ff;
    border-left-color: #66b1ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.alert-box {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  background: #fef0f0;
  border: 1px solid #fde2e2;

  &.warning {
    background: #fdf6ec;
    border-color: #faecd8;
  }
}

.alert-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning .alert-icon {
  color: #e6a23c;
}

.alert-content {
  flex: 1;

  p {
    margin: 6px 0;
    line-height: 1.6;
    color: #606266;
  }
}

.log-section {
  margin-bottom: 24px;
}

.log-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.log-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
  min-height: 100px;

  :deep(p) {
    margin: 8px 0;
    line-height: 1.8;
    color: #606266;
  }

  :deep(ul) {
    margin: 8px 0;
    padding-left: 20px;

    li {
      margin: 6px 0;
      line-height: 1.6;
      color: #606266;
    }
  }
}

.checkbox-section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 4px solid #e6a23c;

  :deep(.el-checkbox) {
    display: flex;
    align-items: flex-start;
    margin: 0;
    padding: 8px 12px;
    background: #fff;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background: #ecf5ff;
      transform: translateX(4px);
    }

    .el-checkbox__label {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      font-weight: 500;
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: #409eff;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px 0;
}

.success-state {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 80px;
  color: #67c23a;
  margin-bottom: 20px;
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

html.dark {
  .version-section,
  .upgrade-section,
  .status-section {
    background: #262626;
  }

  .section-header {
    border-bottom-color: #363636;
  }

  .section-title {
    color: #e5e5e5;
  }

  .info-item {
    background: #333333;
    border-left-color: #409eff;

    &:hover {
      background: #404040;
      border-left-color: #66b1ff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
    }
  }

  .info-label {
    color: #a8a7a7;
  }

  .info-value {
    color: #e5e5e5;
  }

  .alert-box {
    background: #2d2d2d;
    border-color: #404040;

    &.warning {
      background: #3d3528;
      border-color: #5c4d3a;
    }
  }

  .warning .alert-icon {
    color: #e6a23c;
  }

  .alert-content {
    p {
      color: #c0c4cc;
    }
  }

  .log-title {
    color: #e5e5e5;
  }

  .log-content {
    background: #333333;
    border-left-color: #67c23a;

    :deep(p),
    :deep(ul) li {
      color: #c0c4cc;
    }
  }

  .checkbox-section {
    background: #333333;
    border-left-color: #e6a23c;

    :deep(.el-checkbox) {
      background: #404040;

      &:hover {
        background: #4d4d4d;
      }

      .el-checkbox__label {
        color: #c0c4cc;
      }

      .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #409eff;
      }
    }
  }

  .success-icon {
    color: #67c23a;
  }

  .success-title {
    color: #e5e5e5;
  }
}
</style>
