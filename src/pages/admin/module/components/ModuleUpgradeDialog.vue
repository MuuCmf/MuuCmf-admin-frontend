<template>
  <el-dialog
    v-model="dialogVisible"
    title="升级确认"
    width="600px"
    destroy-on-close
    custom-class="upgrade-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" class="upgrade-log-container">
      <div class="dialog-header">
        <h4 class="dialog-title">更新日志</h4>
        <p class="dialog-subtitle">
          模块：{{ data?.alias || data?.name }}
          <span v-if="data?.new_version"> 版本：{{ data?.version }} → {{ data?.new_version }} </span>
        </p>
      </div>
      <div class="upgrade-log-list">
        <div v-for="(log, index) in logList" :key="index" class="upgrade-log-item">
          <div class="log-header">
            <div class="log-version">{{ log.version }}</div>
            <div class="log-date">{{ log.date }}</div>
          </div>
          <div class="log-content" v-html="log.remark"></div>
        </div>
        <div v-if="logList.length === 0" class="empty-log">
          <el-empty description="暂无更新日志" />
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="default" @click="handleClose">取消</el-button>
        <el-button type="primary" size="default" @click="handleConfirm">确定升级</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { appDataInterface } from '@/pages/admin/module/type';
import { getModuleChangeLogList } from '@/api/admin/module';

const props = defineProps<{
  visible: boolean;
  data?: appDataInterface;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm'): void;
}>();

const dialogVisible = ref(props.visible);
const loading = ref(false);
const logList = ref<any[]>([]);

watch(
  () => props.visible,
  newValue => {
    dialogVisible.value = newValue;
    if (newValue && props.data) {
      fetchUpgradeLogs();
    }
  }
);

watch(
  () => dialogVisible.value,
  newValue => {
    emit('update:visible', newValue);
  }
);

const fetchUpgradeLogs = async () => {
  if (!props.data) return;

  loading.value = true;
  try {
    const res = await getModuleChangeLogList(props.data.name);
    if (res.code === 200) {
      logList.value = res.data.data || [];
    } else {
      logList.value = [];
    }
  } catch (error) {
    console.error('获取更新日志失败:', error);
    logList.value = [];
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
};

const handleConfirm = () => {
  emit('confirm');
  dialogVisible.value = false;
};

onMounted(() => {
  if (props.visible && props.data) {
    fetchUpgradeLogs();
  }
});
</script>

<style lang="scss" scoped>
.upgrade-dialog {
  .el-dialog__header {
    padding: 20px 24px;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
  }

  .el-dialog__body {
    padding: 20px 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
  }
}

.upgrade-log-container {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  margin-bottom: 20px;

  .dialog-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .dialog-subtitle {
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

.upgrade-log-list {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.upgrade-log-item {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #ffffff;
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .log-version {
    font-weight: 600;
    color: #409eff;
    font-size: 14px;
  }

  .log-date {
    font-size: 12px;
    color: #909399;
  }

  .log-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;

    p {
      margin: 8px 0;
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.empty-log {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
}
</style>

<style lang="scss">
html.dark .upgrade-dialog {
  .el-dialog__header {
    background-color: #262626;
    border-bottom: 1px solid #363636;
  }

  .el-dialog__title {
    color: #e5e5e5;
  }

  .el-dialog__body {
    background-color: #1f1f1f;
  }

  .el-dialog__footer {
    background-color: #262626;
    border-top: 1px solid #363636;
  }
}

html.dark .upgrade-log-container {
  .dialog-title {
    color: #e5e5e5;
  }

  .dialog-subtitle {
    color: #a8a7a7;
  }
}

html.dark .upgrade-log-list {
  border-color: #363636;
  background-color: #262626;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
}

html.dark .upgrade-log-item {
  border-bottom-color: #363636;
  background-color: #1f1f1f;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.5);

  .log-version {
    color: #409eff;
  }

  .log-date {
    color: #a8a7a7;
  }

  .log-content {
    color: #e5e5e5;
  }
}

html.dark .empty-log {
  background-color: #1f1f1f;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.5);
}
</style>
