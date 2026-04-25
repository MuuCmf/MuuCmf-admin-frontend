<template>
  <div class="tominiprogram-edit-wrapper">
    <div class="edit-header">
      <h3>{{ tominiprogram.id ? '编辑跳转小程序' : '添加跳转小程序' }}</h3>
      <el-button :icon="Close" circle @click="handleClose" />
    </div>
    <div class="edit-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="小程序名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入小程序名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="AppID" prop="appid">
          <el-input v-model="formData.appid" placeholder="请输入小程序AppID" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="微信小程序" value="weixin_mp" />
            <el-option label="支付宝小程序" value="alipay_mp" />
            <el-option label="百度小程序" value="baidu_mp" />
          </el-select>
        </el-form-item>

        <el-form-item label="小程序码" prop="qrcode">
          <div class="qrcode-upload-wrapper">
            <el-upload
              class="qrcode-uploader"
              :show-file-list="false"
              :before-upload="beforeQrcodeUpload"
              :http-request="handleQrcodeUpload"
            >
              <el-icon v-if="qrcodeUploading" class="upload-loading">
                <Loading />
              </el-icon>
              <img v-else-if="formData.qrcode" :src="formData.qrcode_200" class="qrcode-image" />
              <el-icon v-else class="qrcode-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
            <div class="form-tip">建议尺寸：600*600px，支持jpg、png格式</div>
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import type { FormInstance, FormRules, UploadProps } from 'element-plus';

interface TominiprogramInfo {
  id?: number;
  title: string;
  appid: string;
  type: string;
  qrcode: string;
  qrcode_100?: string;
  qrcode_200?: string;
  qrcode_300?: string;
  qrcode_400?: string;
  qrcode_800?: string;
  status: number;
  create_time?: string;
}

interface Props {
  tominiprogram: TominiprogramInfo;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const qrcodeUploading = ref(false);

const formData = reactive({
  id: 0,
  title: '',
  appid: '',
  type: 'weixin_mp',
  qrcode: '',
  qrcode_100: '',
  qrcode_200: '',
  qrcode_300: '',
  qrcode_400: '',
  qrcode_800: '',
  status: 1
});

const rules: FormRules = {
  title: [
    { required: true, message: '请输入小程序名称', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  appid: [{ required: true, message: '请输入小程序AppID', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
};

const resetForm = () => {
  formData.title = '';
  formData.appid = '';
  formData.type = 'weixin_mp';
  formData.qrcode = '';
  formData.qrcode_100 = '';
  formData.qrcode_200 = '';
  formData.qrcode_300 = '';
  formData.qrcode_400 = '';
  formData.qrcode_800 = '';
  formData.status = 1;
  formRef.value?.clearValidate();
};

watch(
  () => props.tominiprogram,
  val => {
    if (val && val.id) {
      formData.title = val.title || '';
      formData.appid = val.appid || '';
      formData.type = val.type || 'weixin_mp';
      formData.qrcode = val.qrcode || '';
      formData.qrcode_100 = val.qrcode_100 || '';
      formData.qrcode_200 = val.qrcode_200 || '';
      formData.qrcode_300 = val.qrcode_300 || '';
      formData.qrcode_400 = val.qrcode_400 || '';
      formData.qrcode_800 = val.qrcode_800 || '';
      formData.status = val.status ?? 1;
    } else {
      resetForm();
    }
  },
  { immediate: true, deep: true }
);

const beforeQrcodeUpload: UploadProps['beforeUpload'] = rawFile => {
  const isImage = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('小程序码只能是 JPG/PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('小程序码大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleQrcodeUpload = async (options: any) => {
  const { file } = options;
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);

  qrcodeUploading.value = true;
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
      formData.qrcode = res.data.attachment || '';
      formData.qrcode_200 = res.data.url || '';
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(res.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    qrcodeUploading.value = false;
  }
};

const handleClose = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const url = 'admin/tominiprogram/edit';
      const data = { ...formData };

      if (props.tominiprogram.id) {
        data.id = props.tominiprogram.id;
      }

      const res = await request({
        url,
        method: 'POST',
        data
      });

      if (res.code === 200) {
        ElMessage.success(props.tominiprogram.id ? '编辑成功' : '添加成功');
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
.tominiprogram-edit-wrapper {
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

.qrcode-upload-wrapper {
  display: flex;
  flex-direction: column;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.qrcode-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.qrcode-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.upload-loading {
  font-size: 28px;
  color: #409eff;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.qrcode-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.edit-footer {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
