<template>
  <div class="page-container">
    <div class="page-content">
      <div class="with-container">
        <div class="config-form-wrapper">
          <el-form ref="formRef" v-loading="loading" :model="formData" :rules="rules" label-width="140px">
            <el-divider content-position="left">基本信息</el-divider>

            <el-form-item label="公众号名称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入公众号名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="公众号简介" prop="desc">
              <el-input
                v-model="formData.desc"
                type="textarea"
                :rows="3"
                placeholder="请输入公众号简介"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="公众号封面" prop="cover">
              <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :http-request="handleCoverUpload"
              >
                <el-icon v-if="coverUploading" class="upload-loading">
                  <Loading />
                </el-icon>
                <img v-else-if="formData.cover" :src="formData.cover_url" class="cover-image" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="form-tip">建议尺寸：600*600px，支持jpg、png格式</div>
            </el-form-item>

            <el-form-item label="公众号二维码" prop="qrcode">
              <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :http-request="handleQrcodeUpload"
              >
                <el-icon v-if="qrcodeUploading" class="upload-loading">
                  <Loading />
                </el-icon>
                <img v-else-if="formData.qrcode" :src="formData.qrcode_url" class="cover-image" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="form-tip">建议尺寸：600*600px，支持jpg、png格式</div>
            </el-form-item>

            <el-divider content-position="left">接口配置</el-divider>

            <el-form-item label="AppID" prop="appid">
              <el-input v-model="formData.appid" placeholder="请输入公众号AppID" maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="AppSecret" prop="secret">
              <el-input
                v-model="formData.secret"
                type="password"
                placeholder="请输入公众号AppSecret"
                maxlength="100"
                show-password
              />
            </el-form-item>

            <el-form-item label="Token" prop="token">
              <el-input v-model="formData.token" placeholder="请输入Token" maxlength="50" show-word-limit />
              <div class="form-tip">必须与公众号后台配置的Token一致</div>
            </el-form-item>

            <el-form-item label="EncodingAESKey" prop="encoding_aes_key">
              <el-input
                v-model="formData.encoding_aes_key"
                placeholder="请输入EncodingAESKey"
                maxlength="100"
                show-word-limit
              />
              <div class="form-tip">消息加密密钥，可选填</div>
            </el-form-item>

            <el-form-item label="服务器地址">
              <el-input v-model="formData.url" readonly>
                <template #append>
                  <el-button @click="handleCopyUrl">复制</el-button>
                </template>
              </el-input>
              <div class="form-tip">将此地址填写到公众号后台的服务器配置中</div>
            </el-form-item>

            <el-divider content-position="left">功能配置</el-divider>

            <el-form-item label="授权登录">
              <div class="switch-wrapper">
                <el-switch v-model="formData.auth_login" :active-value="1" :inactive-value="0" />
              </div>
              <div class="form-tip">开启后支持公众号授权登录</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存配置</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitLoading = ref(false);
const coverUploading = ref(false);
const qrcodeUploading = ref(false);

const formData = reactive({
  id: 0,
  title: '',
  desc: '',
  cover: '',
  cover_url: '',
  qrcode: '',
  qrcode_url: '',
  url: '',
  appid: '',
  secret: '',
  token: '',
  encoding_aes_key: '',
  auth_login: 1
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入公众号名称', trigger: 'blur' }],
  appid: [{ required: true, message: '请输入公众号AppID', trigger: 'blur' }],
  secret: [{ required: true, message: '请输入公众号AppSecret', trigger: 'blur' }],
  token: [{ required: true, message: '请输入Token', trigger: 'blur' }]
};

const getConfig = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat/config',
      method: 'GET'
    });

    if (res.code === 200) {
      const data = res.data || {};
      formData.id = data.id || 0;
      formData.title = data.title || '';
      formData.desc = data.desc || '';
      formData.cover = data.cover || '';
      formData.cover_url = data.cover_url || '';
      formData.qrcode = data.qrcode || '';
      formData.qrcode_url = data.qrcode_url || '';
      formData.url = data.url || '';
      formData.appid = data.appid || '';
      formData.secret = data.secret || '';
      formData.token = data.token || '';
      formData.encoding_aes_key = data.encoding_aes_key || '';
      formData.auth_login = data.auth_login ?? 1;
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    ElMessage.error('获取配置失败');
  } finally {
    loading.value = false;
  }
};

const beforeCoverUpload: UploadProps['beforeUpload'] = rawFile => {
  const isImage = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('封面图片只能是 JPG/PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleCoverUpload = async (options: any) => {
  const { file } = options;
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);

  coverUploading.value = true;
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
      formData.cover_url = res.data.url || '';
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(res.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    coverUploading.value = false;
  }
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
      formData.qrcode_url = res.data.url || '';
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

const handleCopyUrl = () => {
  if (formData.url) {
    navigator.clipboard
      .writeText(formData.url)
      .then(() => {
        ElMessage.success('复制成功');
      })
      .catch(() => {
        ElMessage.error('复制失败');
      });
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const res = await request({
        url: 'admin/wechat/config',
        method: 'POST',
        data: formData
      });

      if (res.code === 200) {
        ElMessage.success('保存成功');
        getConfig();
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleReset = () => {
  getConfig();
};

onMounted(() => {
  getConfig();
});
</script>

<style lang="scss" scoped>
.page-content {
  background-color: var(--el-color-white);
}

.config-form-wrapper {
  max-width: 800px;
  padding: 30px;
  border-radius: 4px;
  margin: 0 auto;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
  display: block;
  width: 100%;
  clear: both;
  margin-left: 0;
  float: none;
}

:deep(.el-form-item__content) {
  .form-tip {
    margin-left: 0 !important;
    display: block !important;
    width: 100% !important;
  }
}

.cover-uploader {
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

  .form-tip {
    margin-top: 12px;
  }
}

.cover-uploader-icon {
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

.cover-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

:deep(.el-divider) {
  margin: 24px 0;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #303133;
}

.switch-wrapper {
  display: flex;
  align-items: center;
}
</style>
