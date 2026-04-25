<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!upgrading"
    @close="handleClose"
  >
    <div class="upgrade-content">
      <div v-if="upgrading" class="progress-section">
        <div class="progress-header">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span class="progress-title">{{ progressTitle }}</span>
        </div>
        <el-progress :percentage="progress" :status="progressStatus" :stroke-width="20" :text-inside="true" />
        <div class="progress-info">
          <div class="info-item">
            <span class="info-label">当前版本：</span>
            <span class="info-value">{{ currentVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">目标版本：</span>
            <span class="info-value">{{ targetVersion }}</span>
          </div>
        </div>
        <div class="log-container">
          <div class="log-header">升级日志</div>
          <div ref="logContentRef" class="log-content">
            <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="error-section">
        <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
        <h3 class="error-title">{{ errorTitle }}</h3>
        <div class="error-message">{{ error }}</div>
        <div class="error-actions">
          <el-button type="primary" @click="handleRetry">重试</el-button>
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>

      <div v-else-if="success" class="success-section">
        <el-icon class="success-icon"><SuccessFilled /></el-icon>
        <h3 class="success-title">{{ successTitle }}</h3>
        <p class="success-message">{{ successMessage }}</p>
        <div class="success-actions">
          <el-button type="primary" @click="handleRefresh">立即刷新</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { Loading, CircleCloseFilled, SuccessFilled } from '@element-plus/icons-vue';
import { request } from '@/utils/modules/request';
import { ElMessage } from 'element-plus';

interface PackageItem {
  name: string;
  md5: string;
}

interface Props {
  modelValue: boolean;
  currentVersion: string;
  targetVersion: string;
  appName: string;
  scene: 'setup' | 'upgrade';
  frame?: string;
  installData?: any;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
  (e: 'error', error: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
});

const upgrading = ref(false);
const success = ref(false);
const error = ref('');
const progress = ref(0);
const progressStatus = ref<'success' | 'exception' | 'warning' | undefined>(undefined);
const logs = ref<Array<{ time: string; message: string; type: string }>>([]);
const logContentRef = ref<HTMLElement>();

const packageList = ref<PackageItem[]>([]);
const packageTotal = ref(0);
const packageProgress = ref(0);
// 是否需要重新获取升级信息
const needRetryUpgradeInfo = ref(false);

const dialogTitle = computed(() => {
  return props.scene === 'setup' ? '系统安装' : '系统升级';
});

const errorTitle = computed(() => {
  return props.scene === 'setup' ? '安装失败' : '升级失败';
});

const successTitle = computed(() => {
  return props.scene === 'setup' ? '安装成功' : '升级成功';
});

const successMessage = computed(() => {
  const action = props.scene === 'setup' ? '安装' : '升级';
  return `系统已成功${action}到版本 ${props.targetVersion}`;
});

const progressTitle = ref('');

const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  logs.value.push({ time, message, type });

  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight;
    }
  });
};

const getUpgradeInfo = async () => {
  progressTitle.value = props.scene === 'setup' ? '正在获取安装包，请稍后...' : '正在获取升级包，请稍后...';
  addLog(progressTitle.value, 'info');
  progress.value = 5;

  try {
    const res = await request({
      url: 'admin/update/package',
      method: 'POST',
      data: {
        version: props.targetVersion,
        app_name: props.appName,
        scene: props.scene
      }
    });

    if (res.code === 200) {
      packageList.value = res.data.data || [];
      packageTotal.value = res.data.total || 0;
      addLog(`获取到 ${packageTotal.value} 个升级文件`, 'info');
      progress.value = 10;

      if (props.scene === 'setup') {
        progressTitle.value = '开始安装';
        addLog(progressTitle.value, 'info');
        await upgrade();
      } else if (props.targetVersion !== props.currentVersion) {
        progressTitle.value = '开始升级';
        addLog(progressTitle.value, 'info');
        await upgrade();
      } else {
        sameVersion();
      }
    } else {
      throw new Error(res.msg || '获取升级包信息失败');
    }
  } catch (err: any) {
    const errorMsg = err.message || '获取升级包信息失败';
    addLog(errorMsg, 'error');
    progressStatus.value = 'exception';
    error.value = errorMsg;
    upgrading.value = false;
    emit('error', errorMsg);
  }
};

const upgrade = async () => {
  if (packageTotal.value === 0) {
    await finishUpgrade();
    return;
  }

  if (packageProgress.value >= packageTotal.value) {
    await finishUpgrade();
    return;
  }

  const currentItem = packageList.value[packageProgress.value];

  const fileProgress = (packageProgress.value / packageTotal.value) * 80;
  progress.value = Math.floor(10 + fileProgress);
  addLog(`正在下载: ${currentItem.name} (${packageProgress.value + 1}/${packageTotal.value})`, 'info');

  try {
    const res = await request({
      url: 'admin/update/upgrade',
      method: 'POST',
      data: {
        version: props.targetVersion,
        app_name: props.appName,
        scene: props.scene,
        file: currentItem.name,
        md5: currentItem.md5
      }
    });

    if (res.data === 'same_version') {
      sameVersion();
      return;
    }

    if (res.code !== 200) {
      addLog(`文件 ${currentItem.name} 升级失败: ${res.msg}`, 'error');
      needRetryUpgradeInfo.value = true;
    } else {
      addLog(`文件 ${currentItem.name} 升级成功`, 'success');
    }

    packageProgress.value++;

    if (packageProgress.value >= packageTotal.value) {
      await finishUpgrade();
    } else {
      await upgrade();
    }
  } catch (err: any) {
    const errorMsg = err.message || '升级过程中发生错误';
    addLog(errorMsg, 'error');
    progressStatus.value = 'exception';
    error.value = errorMsg;
    upgrading.value = false;
    emit('error', errorMsg);
  }
};

const sameVersion = () => {
  success.value = true;
  upgrading.value = false;
  progress.value = 100;
  progressStatus.value = 'success';
  addLog('已经是最新版本了', 'success');
  emit('success');
};

const finishUpgrade = async () => {
  if (needRetryUpgradeInfo.value) {
    addLog('检测到升级失败，准备重试...', 'warning');
    await startUpgrade();
    return;
  }

  addLog('正在完成升级...', 'info');
  progress.value = 90;

  try {
    const res = await request({
      url: 'admin/update/finish',
      method: 'POST',
      data: {
        version: props.targetVersion,
        app_name: props.appName,
        scene: props.scene,
        frame: props.frame || '',
        skip: needRetryUpgradeInfo.value ? 1 : 0
      }
    });

    if (res.code === 200) {
      if (props.scene === 'setup') {
        await setupApp();
      } else {
        addLog('升级完成！', 'success');
        progress.value = 100;
        progressStatus.value = 'success';

        await new Promise(resolve => setTimeout(resolve, 500));

        success.value = true;
        upgrading.value = false;
        emit('success');
      }
    } else {
      throw new Error(res.msg || '完成升级失败');
    }
  } catch (err: any) {
    const errorMsg = err.message || '完成升级过程中发生错误';
    addLog(errorMsg, 'error');
    progressStatus.value = 'exception';
    error.value = errorMsg;
    upgrading.value = false;
    emit('error', errorMsg);
  }
};

const setupApp = async () => {
  addLog('正在安装应用...', 'info');
  progressTitle.value = '安装中...';

  try {
    const res = await request({
      url: 'admin/module/install',
      method: 'POST',
      data: {
        frame: props.frame || '',
        name: props.appName,
        ...props.installData
      }
    });

    if (res.code === 200) {
      progressTitle.value = '安装完成';
      addLog('应用安装成功！', 'success');
      progress.value = 100;
      progressStatus.value = 'success';

      await new Promise(resolve => setTimeout(resolve, 500));

      success.value = true;
      upgrading.value = false;
      emit('success');
    } else {
      throw new Error(res.msg || '安装失败');
    }
  } catch (err: any) {
    const errorMsg = err.message || '安装过程中发生错误';
    addLog(errorMsg, 'error');
    progressTitle.value = '发生错误：' + errorMsg;
    progressStatus.value = 'exception';
    error.value = errorMsg;
    upgrading.value = false;
    emit('error', errorMsg);
  }
};

const startUpgrade = async () => {
  const isRetry = needRetryUpgradeInfo.value;

  if (isRetry) {
    addLog('开始重试升级流程...', 'info');
  } else {
    upgrading.value = true;
    success.value = false;
    error.value = '';
    progress.value = 0;
    progressStatus.value = undefined;
    logs.value = [];
    packageProgress.value = 0;
    progressTitle.value = props.scene === 'setup' ? '正在安装中...' : '正在升级中...';
    addLog(props.scene === 'setup' ? '开始安装流程...' : '开始升级流程...', 'info');
  }

  needRetryUpgradeInfo.value = false;

  await getUpgradeInfo();
};

const handleRetry = () => {
  startUpgrade();
};

const handleClose = () => {
  if (upgrading.value) {
    const warningMsg = props.scene === 'setup' ? '安装进行中，请等待完成' : '升级进行中，请等待完成';
    ElMessage.warning(warningMsg);
    return;
  }
  visible.value = false;
};

const handleRefresh = () => {
  window.location.reload();
};

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      startUpgrade();
    }
  }
);

defineExpose({
  startUpgrade
});
</script>

<style scoped lang="scss">
.upgrade-content {
  min-height: 400px;
}

.progress-section {
  .progress-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .loading-icon {
    font-size: 32px;
    color: #409eff;
    margin-right: 12px;
    animation: rotate 1s linear infinite;
  }

  .progress-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .progress-info {
    display: flex;
    justify-content: space-around;
    margin: 24px 0;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .info-item {
    text-align: center;
  }

  .info-label {
    display: block;
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  .info-value {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .log-container {
    margin-top: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
  }

  .log-header {
    padding: 12px 16px;
    background: #f5f7fa;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
  }

  .log-content {
    height: 200px;
    overflow-y: auto;
    padding: 12px;
    background: #fff;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }

  .log-item {
    display: flex;
    padding: 4px 0;
    line-height: 1.6;

    &.info {
      color: #606266;
    }

    &.success {
      color: #67c23a;
    }

    &.error {
      color: #f56c6c;
    }

    &.warning {
      color: #e6a23c;
    }
  }

  .log-time {
    color: #909399;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .log-message {
    flex: 1;
    word-break: break-all;
  }
}

.error-section {
  text-align: center;
  padding: 40px 20px;

  .error-icon {
    font-size: 64px;
    color: #f56c6c;
    margin-bottom: 20px;
  }

  .error-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }

  .error-message {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 24px;
    padding: 16px;
    background: #fef0f0;
    border-radius: 8px;
    border-left: 4px solid #f56c6c;
  }

  .error-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

.success-section {
  text-align: center;
  padding: 40px 20px;

  .success-icon {
    font-size: 64px;
    color: #67c23a;
    margin-bottom: 20px;
  }

  .success-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }

  .success-message {
    font-size: 14px;
    color: #606266;
    margin-bottom: 24px;
  }

  .success-actions {
    display: flex;
    justify-content: center;
  }
}

html.dark {
  .progress-section {
    .progress-title {
      color: #e5e5e5;
    }

    .progress-info {
      background: #333333;
    }

    .info-label {
      color: #a8a7a7;
    }

    .info-value {
      color: #e5e5e5;
    }

    .log-container {
      border-color: #363636;
    }

    .log-header {
      background: #333333;
      color: #e5e5e5;
      border-bottom-color: #363636;
    }

    .log-content {
      background: #262626;

      .log-item {
        &.info {
          color: #c0c4cc;
        }
      }

      .log-time {
        color: #a8a7a7;
      }
    }
  }

  .error-section {
    .error-title {
      color: #e5e5e5;
    }

    .error-message {
      color: #c0c4cc;
      background: #2d1f1f;
      border-left-color: #f56c6c;
    }
  }

  .success-section {
    .success-title {
      color: #e5e5e5;
    }

    .success-message {
      color: #c0c4cc;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
