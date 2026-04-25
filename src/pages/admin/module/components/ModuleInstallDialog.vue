<template>
  <el-dialog
    :model-value="visible"
    title="安装应用"
    width="500px"
    :before-close="handleClose"
    @update:model-value="handleUpdateVisible"
  >
    <div class="install-info">
      <div class="app-header">
        <img v-if="appData?.icon" :src="appData.icon_200" :alt="appData.alias || appData.name" class="app-icon" />
        <div class="app-details">
          <h3 class="app-name">{{ appData?.alias || appData?.name || '' }}</h3>
          <div class="app-meta">
            <span class="meta-item">版本: {{ appData?.version || '' }}</span>
            <span class="meta-item">开发者: {{ appData?.developer || '' }}</span>
          </div>
        </div>
      </div>
      <div class="app-description">
        <p class="description-label">应用描述:</p>
        <p class="description-text">{{ appData?.summary || '' }}</p>
      </div>
    </div>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
      <el-form-item label="应用名称" prop="alias">
        <el-input v-model="formData.alias" placeholder="请输入应用名称" clearable />
        <div class="form-tip">自定义应用名称，方便识别和管理</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定安装</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import { appDataInterface } from '@/pages/admin/module/type';

interface Props {
  visible: boolean;
  data?: appDataInterface;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
  (e: 'cloudInstall', data: any): void;
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
  name: '',
  alias: ''
});

const formRules = {
  alias: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
};

watch(
  () => props.data,
  newData => {
    if (newData && Object.keys(newData).length > 0) {
      appData.value = { ...newData };
      console.log(appData);
      formData.value = {
        id: newData.id || 0,
        name: newData.name || '',
        alias: newData.alias || newData.name || ''
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

    if (appData.value?.source === 'cloud') {
      emit('cloudInstall', { ...formData.value, appData: appData.value });
      emit('update:visible', false);
      formRef.value?.clearValidate();
      return;
    }

    loading.value = true;
    try {
      const res = await request({
        url: 'admin/module/install',
        method: 'POST',
        data: formData.value
      });
      if (res.code === 200) {
        ElMessage.success('安装成功');
        emit('update:visible', false);
        formRef.value?.clearValidate();
        emit('success');
      } else {
        ElMessage.error(res.msg || '安装失败');
      }
    } catch (error) {
      console.error('安装失败:', error);
      ElMessage.error('安装失败');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.install-info {
  background-color: #f5f7fa;
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

  .app-description {
    .description-label {
      font-size: 13px;
      font-weight: 500;
      color: #606266;
      margin: 0 0 6px 0;
    }

    .description-text {
      font-size: 14px;
      color: #909399;
      line-height: 1.6;
      margin: 0;
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
}

html.dark {
  .install-info {
    background-color: #333333;

    .app-header {
      .app-details {
        .app-name {
          color: #e5e5e5;
        }

        .app-meta {
          color: #a8a7a7;
        }
      }
    }

    .app-description {
      .description-label {
        color: #c0c4cc;
      }

      .description-text {
        color: #a8a7a7;
      }
    }
  }

  .form-tip {
    color: #a8a7a7;
  }
}
</style>
