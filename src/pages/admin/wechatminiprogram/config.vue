<template>
  <div class="page-container">
    <div class="page-content">
      <div class="with-container">
        <div class="config-form-wrapper">
          <el-form ref="formRef" v-loading="loading" :model="formData" :rules="rules" label-width="140px">
            <el-divider content-position="left">基本信息</el-divider>

            <el-form-item label="小程序名称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入小程序名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="小程序简介" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入小程序简介"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-divider content-position="left">接口配置</el-divider>

            <el-form-item label="原始ID" prop="originalid">
              <el-input v-model="formData.originalid" placeholder="请输入小程序原始ID" maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="AppID" prop="appid">
              <el-input v-model="formData.appid" placeholder="请输入小程序AppID" maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="AppSecret" prop="secret">
              <el-input
                v-model="formData.secret"
                type="password"
                placeholder="请输入小程序AppSecret"
                maxlength="100"
                show-password
              />
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
  originalid: '',
  appid: '',
  secret: ''
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入小程序名称', trigger: 'blur' }],
  appid: [{ required: true, message: '请输入小程序AppID', trigger: 'blur' }],
  secret: [{ required: true, message: '请输入小程序AppSecret', trigger: 'blur' }]
};

const getConfig = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat_mp/config',
      method: 'GET'
    });

    if (res.code === 200) {
      const data = res.data || {};
      formData.id = data.id || 0;
      formData.title = data.title || '';
      formData.description = data.description || '';
      formData.originalid = data.originalid || '';
      formData.appid = data.appid || '';
      formData.secret = data.secret || '';
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    ElMessage.error('获取配置失败');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const res = await request({
        url: 'admin/wechat_mp/config',
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
</style>
