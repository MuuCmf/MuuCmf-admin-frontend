<template>
  <div class="page-container">
    <div class="page-content">
      <div class="with-container">
        <div class="config-form-wrapper">
          <el-form ref="formRef" v-loading="loading" :model="formData" :rules="rules" label-width="140px">
            <el-divider content-position="left">基本信息</el-divider>

            <el-form-item label="企业名称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入企业名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="企业简介" prop="desc">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入企业简介"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-divider content-position="left">接口配置</el-divider>

            <el-form-item label="企业ID" prop="corp_id">
              <el-input v-model="formData.corp_id" placeholder="请输入企业ID" maxlength="50" show-word-limit />
              <div class="form-tip">企业微信后台的企业ID</div>
            </el-form-item>

            <el-form-item label="应用Secret" prop="secret">
              <el-input
                v-model="formData.secret"
                type="password"
                placeholder="请输入应用Secret"
                maxlength="100"
                show-password
              />
              <div class="form-tip">应用的Secret，可在企业微信后台获取</div>
            </el-form-item>

            <el-form-item label="应用ID" prop="agent_id">
              <el-input v-model="formData.agent_id" placeholder="请输入应用ID" maxlength="20" show-word-limit />
              <div class="form-tip">应用的AgentId，可在企业微信后台获取</div>
            </el-form-item>

            <el-form-item label="Token" prop="token">
              <el-input v-model="formData.token" placeholder="请输入Token" maxlength="50" show-word-limit />
              <div class="form-tip">必须与企业微信后台配置的Token一致</div>
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
              <div class="form-tip">将此地址填写到企业微信后台的服务器配置中</div>
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
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import type { FormInstance, FormRules } from 'element-plus';

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitLoading = ref(false);

const formData = reactive({
  id: 0,
  title: '',
  description: '',
  url: '',
  corp_id: '',
  secret: '',
  agent_id: '',
  token: '',
  encoding_aes_key: ''
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  corp_id: [{ required: true, message: '请输入企业ID', trigger: 'blur' }],
  secret: [{ required: true, message: '请输入应用Secret', trigger: 'blur' }],
  agent_id: [{ required: true, message: '请输入应用ID', trigger: 'blur' }],
  token: [{ required: true, message: '请输入Token', trigger: 'blur' }]
};

const getConfig = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat_work/config',
      method: 'GET'
    });

    if (res.code === 200) {
      const data = res.data || {};
      formData.id = data.id || 0;
      formData.title = data.title || '';
      formData.description = data.description || '';
      formData.url = data.url || '';
      formData.corp_id = data.corp_id || data.appid || '';
      formData.secret = data.secret || '';
      formData.agent_id = data.agent_id || '';
      formData.token = data.token || '';
      formData.encoding_aes_key = data.encoding_aes_key || '';
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    ElMessage.error('获取配置失败');
  } finally {
    loading.value = false;
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
        url: 'admin/wechat_work/config',
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

.logo-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-uploader {
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

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.logo-image {
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
