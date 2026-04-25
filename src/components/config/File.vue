<template>
  <div class="config-file">
    <el-upload
      class="file-uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :disabled="uploading"
    >
      <div v-if="displayUrl && !uploading" class="file-info">
        <el-icon class="file-icon"><Document /></el-icon>
        <div class="file-name">{{ getFileName(displayUrl) }}</div>
        <el-icon class="file-delete" @click.stop="handleDelete"><Delete /></el-icon>
      </div>
      <div v-else-if="uploading" class="upload-status">
        <el-icon class="uploading-icon" :class="{ 'is-uploading': uploading }"><Loading /></el-icon>
        <div class="upload-info">
          <div class="upload-text">上传中...</div>
          <el-progress :percentage="uploadProgress" :stroke-width="8" />
        </div>
      </div>
      <el-button v-else type="primary" :icon="Upload" :loading="uploading">上传文件</el-button>
    </el-upload>
    <div v-if="props.remark" class="file-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Delete, Upload, Loading } from '@element-plus/icons-vue';
import { request } from '@/utils/modules/request';

interface Props {
  modelValue?: string;
  url: string;
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const uploadedUrl = ref<string>('');
const uploading = ref<boolean>(false);
const uploadProgress = ref<number>(0);

watch(
  () => props.modelValue,
  () => {
    uploadedUrl.value = '';
  }
);

const displayUrl = computed(() => {
  if (uploadedUrl.value) {
    return uploadedUrl.value;
  }
  if (props.url) {
    return props.url;
  }
  return props.modelValue;
});

const getFileName = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const beforeUpload = (file: File) => {
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  return true;
};

const handleUpload = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options;

  // 开始上传
  uploading.value = true;
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await request({
      url: 'api/file/upload',
      method: 'POST',
      data: formData,
      timeout: 300000, // 5分钟超时时间，适合大文件上传
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percent;
          if (onProgress) {
            onProgress({ percent }, file);
          }
        }
      }
    } as any);

    if (res.code === 200) {
      uploadedUrl.value = res.data.url;
      emit('update:modelValue', res.data.attachment);
      emit('change', res.data.attachment);
      ElMessage.success('上传成功');
      if (onSuccess) {
        onSuccess(res.data, file);
      }
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
    if (onError) {
      onError(error, file);
    }
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const handleDelete = () => {
  uploadedUrl.value = '';
  emit('update:modelValue', '');
  emit('change', '');
};
</script>

<style lang="scss" scoped>
.config-file {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.file-uploader {
  :deep(.el-upload) {
    display: block;
  }
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #ecf5ff;
  border-radius: 4px;
  border: 1px solid #409eff;
}

.uploading-icon {
  font-size: 24px;
  color: #409eff;

  &.is-uploading {
    animation: rotate 1.5s linear infinite;
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

.upload-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-text {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;

  &:hover {
    background-color: #ecf5ff;
    border-color: #409eff;
  }
}

.file-icon {
  font-size: 24px;
  color: #409eff;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-delete {
  font-size: 18px;
  color: #f56c6c;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #f78989;
    transform: scale(1.1);
  }
}

.file-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 8px;
}
</style>
