<template>
  <div class="config-pic">
    <el-upload
      class="pic-uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :disabled="uploading"
    >
      <div v-if="previewUrl" class="pic-preview">
        <img :src="previewUrl" class="pic-image" />
        <div v-if="uploading" class="uploading-mask">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div class="delete-icon" @mousedown.stop.prevent @click.stop.prevent="handleDelete">
          <el-icon><Close /></el-icon>
        </div>
      </div>
      <div v-else-if="uploading" class="uploading-placeholder">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <div v-else class="pic-uploader-icon">
        <safe-icon icon="fas cloud-upload-alt" />
        <div class="upload-text">点击上传</div>
        <div v-if="props.tip" class="upload-tip">{{ props.tip }}</div>
      </div>
    </el-upload>
    <div v-if="props.remark" class="pic-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading, Close } from '@element-plus/icons-vue';
import SafeIcon from '@/components/SafeIcon.vue';
import { request } from '@/utils/modules/request';

interface Props {
  modelValue?: string;
  thumb?: string;
  url?: string;
  remark?: string;
  tip?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  thumb: '',
  url: '',
  remark: '',
  tip: ''
});

const emit = defineEmits<Emits>();

// 上传成功返回图片URL
const uploadedUrl = ref<string>('');
// 标记是否是上传操作导致的modelValue变化
const isUploading = ref(false);
// 标记是否是删除操作导致的modelValue变化
const isDeleting = ref(false);
// 上传状态
const uploading = ref(false);
// 标记是否已删除
const isDeleted = ref(false);

watch(
  () => props.modelValue,
  () => {
    // 当不是上传操作导致的modelValue变化时重置uploadedUrl
    if (!isUploading.value && !isDeleting.value) {
      uploadedUrl.value = '';
      // 如果 modelValue 重新有值了（比如重新加载），重置删除标志
      if (props.modelValue || props.thumb || props.url) {
        isDeleted.value = false;
      }
    }
    // 重置删除标志
    isDeleting.value = false;
  }
);

// 预览图片
const previewUrl = computed(() => {
  // 如果已删除，不显示预览
  if (isDeleted.value) {
    return '';
  }
  // 优先显示新上传的图片
  if (uploadedUrl.value) {
    return uploadedUrl.value;
  }
  // 如果有缩略图，显示缩略图
  if (props.thumb) {
    return props.thumb;
  }
  // 如果有 URL，显示 URL
  if (props.url) {
    return props.url;
  }

  // 都没有，返回空
  return '';
});

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleUpload = async (options: any) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);

  uploading.value = true;

  try {
    const res = await request({
      url: 'api/file/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.code === 200) {
      isUploading.value = true;
      uploadedUrl.value = res.data.url;
      isDeleted.value = false; // 重置删除标志
      emit('update:modelValue', res.data.attachment);
      emit('change', res.data.attachment);
      // 等待一个tick，确保emit完成后再重置标志
      setTimeout(() => {
        isUploading.value = false;
      }, 0);
      ElMessage.success('上传成功');
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
};

const handleDelete = () => {
  if (uploading.value) {
    return;
  }
  isDeleting.value = true;
  uploadedUrl.value = '';
  isDeleted.value = true;
  // 删除时清空 modelValue，无论图片是新增还是已有的
  emit('update:modelValue', '');
  emit('change', '');
};
</script>

<style lang="scss" scoped>
.config-pic {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.pic-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    width: 150px;
    height: 150px;

    &:hover {
      border-color: #409eff;
    }
  }
}

.pic-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.pic-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background-color: #f5f7fa;
}

.pic-uploader-icon {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  font-size: 14px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.uploading-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f5f7fa;
  border-radius: 6px;

  .el-icon {
    font-size: 32px;
    color: #409eff;
    animation: rotate 1.5s linear infinite;
  }

  span {
    font-size: 14px;
    color: #409eff;
  }
}

.uploading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  .el-icon {
    font-size: 32px;
    color: #fff;
  }
}

.pic-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 8px;
}

.delete-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
  z-index: 10;
  pointer-events: auto;

  &:hover {
    background-color: rgba(245, 108, 108, 0.8);
  }
}
</style>
