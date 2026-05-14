<template>
  <el-dialog
    :model-value="visible"
    title="卸载应用"
    width="500px"
    :before-close="handleClose"
    @update:model-value="handleUpdateVisible"
  >
    <div class="uninstall-info">
      <div class="app-header">
        <img
          v-if="appData?.icon"
          :src="appData.icon_200"
          :alt="appData?.alias || appData?.name || ''"
          class="app-icon"
        />
        <div class="app-details">
          <h3 class="app-name">{{ appData?.alias || appData?.name || '' }}</h3>
          <div class="app-meta">
            <span class="meta-item">版本: {{ appData?.version || '' }}</span>
            <span class="meta-item">开发者: {{ appData?.developer || '' }}</span>
          </div>
        </div>
      </div>
      <div class="warning-box">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <span class="warning-text">卸载应用将移除该应用及其相关功能</span>
      </div>
    </div>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
      <el-form-item label="数据处理" prop="withoutData">
        <el-radio-group v-model="formData.withoutData">
          <el-radio :value="0">保留数据</el-radio>
          <el-radio :value="1">删除数据</el-radio>
        </el-radio-group>
        <div v-if="formData.withoutData === 0" class="form-tip">选择保留数据，重新安装时可以恢复之前的数据</div>
        <div v-else class="form-tip">选择删除数据，该应用的所有数据将被永久删除，无法恢复</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" :loading="loading" @click="handleSubmit">确定卸载</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import { appDataInterface } from '@/pages/admin/module/type';
import { uninstallModule } from '@/api/admin/module';

interface Props {
  visible: boolean;
  data?: appDataInterface;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}) as appDataInterface
});

const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const appData = ref<appDataInterface>();
const formData = ref({
  id: 0,
  withoutData: 0
});

const formRules = {};

watch(
  () => props.data,
  newData => {
    if (newData && Object.keys(newData).length > 0) {
      appData.value = { ...newData };
      formData.value = {
        id: newData.id || 0,
        withoutData: 0
      };
    }
  },
  { immediate: true }
);

const handleUpdateVisible = (value: boolean) => {
  emit('update:visible', value);
};

const handleClose = () => {
  emit('update:visible', false);
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    loading.value = true;
    try {
      const res = await uninstallModule(formData.value);
      if (res.code === 200) {
        ElMessage.success('卸载成功');
        emit('update:visible', false);
        formRef.value?.clearValidate();
        emit('success');
      } else {
        ElMessage.error(res.msg || '卸载失败');
      }
    } catch (error) {
      console.error('卸载失败:', error);
      ElMessage.error('卸载失败');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.uninstall-info {
  background-color: #fef0f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .app-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .app-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      object-fit: cover;
      margin-right: 16px;
    }

    .app-details {
      flex: 1;

      .app-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .app-meta {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: #909399;

        .meta-item {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .warning-box {
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #fde2e2;
    border-radius: 6px;
    padding: 12px 16px;

    .warning-icon {
      font-size: 20px;
      color: #f56c6c;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .warning-text {
      font-size: 14px;
      color: #f56c6c;
      line-height: 1.5;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>

<style lang="scss">
html.dark .uninstall-info {
  background-color: #262626;
  border: 1px solid #363636;

  .app-header {
    .app-icon {
      background-color: #1f1f1f;
    }

    .app-details {
      .app-name {
        color: #e5e5e5;
      }

      .app-meta {
        color: #a8a7a7;
      }
    }
  }

  .warning-box {
    background-color: #1f1f1f;
    border-color: #363636;

    .warning-icon {
      color: #f56c6c;
    }

    .warning-text {
      color: #f56c6c;
    }
  }
}

html.dark .form-tip {
  color: #a8a7a7;
}
</style>
