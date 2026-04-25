<template>
  <div class="announce-edit-wrapper">
    <div class="edit-header">
      <h3>{{ announce.id ? '编辑公告' : '添加公告' }}</h3>
      <el-button :icon="Close" circle @click="handleClose" />
    </div>
    <div class="edit-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="终端" prop="teminal">
          <el-select v-model="formData.teminal" placeholder="请选择终端" style="width: 100%">
            <el-option label="移动端" value="mobile" />
            <el-option label="PC端" value="pc" />
          </el-select>
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="文字" :value="0" />
            <el-option label="图片" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="formData.type === 1" label="上传图片">
          <el-upload
            class="cover-uploader"
            :http-request="handleCoverUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            accept="image/*"
          >
            <el-icon v-if="uploadLoading" class="upload-loading">
              <Loading />
            </el-icon>
            <img v-else-if="formData.cover" :src="formData.cover_200" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入公告标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <Editor v-model="formData.content" :rows="10" placeholder="请输入公告内容" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <div class="sort-input-wrapper">
            <el-input-number v-model="formData.sort" :min="0" :max="9999" placeholder="请输入排序值" />
            <div class="form-tip">数值越大排序越靠前</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Close, Plus, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import Editor from '@/components/config/Editor.vue';

interface AnnounceInfo {
  id?: number;
  title: string;
  content: string;
  status: number;
  sort: number;
  teminal: string;
  type: number;
  type_str: string;
  cover?: string;
  cover_80?: string;
  cover_120?: string;
  cover_200?: string;
  cover_400?: string;
}

interface Props {
  announce: AnnounceInfo;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const submitLoading = ref(false);
const uploadLoading = ref(false);

const formData = reactive({
  id: 0,
  title: '',
  content: '',
  status: 1,
  sort: 0,
  teminal: 'mobile',
  type: 0,
  type_str: '文字',
  cover: '',
  cover_80: '',
  cover_120: '',
  cover_200: '',
  cover_400: ''
});

const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择公告状态', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
};

const resetForm = () => {
  formData.id = 0;
  formData.title = '';
  formData.content = '';
  formData.status = 1;
  formData.sort = 0;
  formData.teminal = 'mobile';
  formData.type = 0;
  formData.type_str = '文字';
  formData.cover = '';
  formData.cover_80 = '';
  formData.cover_120 = '';
  formData.cover_200 = '';
  formData.cover_400 = '';
  formRef.value?.clearValidate();
};

const beforeUpload = (file: any) => {
  const isImage = file.type.includes('image/');
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

const handleCoverUpload = async (options: any) => {
  const { file } = options;
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);

  uploadLoading.value = true;
  try {
    const res = await request({
      url: 'api/file/upload',
      method: 'POST',
      data: uploadFormData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.code === 200) {
      formData.cover = res.data.attachment || '';
      formData.cover_200 = res.data.url || '';
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(res.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    uploadLoading.value = false;
  }
};

watch(
  () => props.announce,
  val => {
    if (val && val.id) {
      formData.id = val.id || 0;
      formData.title = val.title || '';
      formData.content = val.content || '';
      formData.status = val.status ?? 1;
      formData.sort = val.sort ?? 0;
      formData.type = val.type ?? 0;
      formData.cover = val.cover || '';
      formData.cover_80 = val.cover_80 || '';
      formData.cover_120 = val.cover_120 || '';
      formData.cover_200 = val.cover_200 || '';
      formData.cover_400 = val.cover_400 || '';
      formData.teminal = val.teminal || '';
    } else {
      resetForm();
    }
  },
  { immediate: true, deep: true }
);

const handleClose = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const url = 'admin/announce/edit';
      const data = { ...formData };

      if (props.announce.id) {
        data.id = props.announce.id;
      }

      const res = await request({
        url,
        method: 'POST',
        data
      });

      if (res.code === 200) {
        ElMessage.success(props.announce.id ? '编辑成功' : '添加成功');
        emit('success');
        emit('close');
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.announce-edit-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.edit-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    background-color: #fafafa;
    width: 200px;
    height: 200px;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: #f0f9ff;
    }
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
  }
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}

.cover-uploader-icon {
  font-size: 48px;
  color: #8c939d;
  transition: all 0.3s;
}

.upload-loading {
  font-size: 48px;
  color: var(--el-color-primary);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.cover-uploader {
  &:hover {
    .cover-uploader-icon {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.sort-input-wrapper {
  display: flex;
  flex-direction: column;
}

.edit-footer {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
