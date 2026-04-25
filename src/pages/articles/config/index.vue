<template>
  <div class="page-container">
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="config-container">
          <div class="section-block">
            <div class="section-title">
              <div class="title-left">
                <safe-icon icon="fas power-off" class="section-icon" />
                <span>应用状态</span>
              </div>
              <el-button type="primary" size="small" @click="statusDrawerVisible = true">
                <safe-icon icon="fas cog" />
                设置
              </el-button>
            </div>
            <div class="section-content">
              <div class="info-item">
                <span class="info-label">应用状态</span>
                <span class="info-value" :class="{ 'status-disabled': formData.status === 0 }">
                  {{ formData.status === 1 ? '启用' : '关闭' }}
                </span>
              </div>
              <div v-if="formData.status === 0" class="info-item">
                <span class="info-label">关闭原因</span>
                <span class="info-value">{{ formData.close_desc || '未设置' }}</span>
              </div>
            </div>
          </div>

          <div class="section-block">
            <div class="section-title">
              <div class="title-left">
                <safe-icon icon="fas comments" class="section-icon" />
                <span>评论设置</span>
              </div>
              <el-button type="primary" size="small" @click="commentDrawerVisible = true">
                <safe-icon icon="fas cog" />
                设置
              </el-button>
            </div>
            <div class="section-content">
              <div class="info-item">
                <span class="info-label">评论功能</span>
                <span class="info-value">{{ formData.comment_status === 1 ? '开启' : '关闭' }}</span>
              </div>
              <div v-if="formData.comment_status === 1" class="info-item">
                <span class="info-label">评论审核</span>
                <span class="info-value">{{ formData.comment_audit === 1 ? '开启' : '关闭' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-drawer v-model="statusDrawerVisible" title="应用状态设置" direction="rtl" size="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="应用状态">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item v-if="formData.status === 0" label="关闭原因">
          <el-input
            v-model="formData.close_desc"
            type="textarea"
            :rows="3"
            placeholder="请输入关闭原因，将显示给用户"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="drawer-footer">
        <el-button @click="statusDrawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleStatusSave">确定</el-button>
      </div>
    </el-drawer>

    <el-drawer v-model="commentDrawerVisible" title="评论设置" direction="rtl" size="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="评论功能">
          <el-switch
            v-model="formData.comment_status"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item v-if="formData.comment_status === 1" label="评论审核">
          <el-switch
            v-model="formData.comment_audit"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
      </el-form>
      <div class="drawer-footer">
        <el-button @click="commentDrawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleCommentSave">确定</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';

const loading = ref(false);

const statusDrawerVisible = ref(false);
const commentDrawerVisible = ref(false);

const formData = reactive({
  status: 1,
  close_desc: '',
  comment_status: 1,
  comment_audit: 1
});

const getConfig = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/config/index',
      method: 'GET'
    });
    if (response.code === 200) {
      const data = response.data || {};
      formData.status = Number(data.status);
      formData.close_desc = data.close_desc || '';
      formData.comment_status = Number(data.comment?.status);
      formData.comment_audit = Number(data.comment?.audit);
      console.log(formData);
    } else {
      ElMessage.error(response.msg || '获取配置失败');
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    ElMessage.error('获取配置失败');
  } finally {
    loading.value = false;
  }
};

const handleStatusSave = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/config/index',
      method: 'POST',
      data: {
        status: formData.status,
        close_desc: formData.close_desc
      }
    });
    if (response.code === 200) {
      ElMessage.success('保存成功');
      statusDrawerVisible.value = false;
    } else {
      ElMessage.error(response.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};

const handleCommentSave = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/config/index',
      method: 'POST',
      data: {
        comment: {
          status: formData.comment_status,
          audit: formData.comment_audit
        }
      }
    });
    if (response.code === 200) {
      ElMessage.success('保存成功');
      commentDrawerVisible.value = false;
    } else {
      ElMessage.error(response.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getConfig();
});
</script>

<style lang="scss" scoped>
$color-primary: #409eff;
$color-success: #67c23a;
$color-danger: #f56c6c;
$color-warning: #e6a23c;
$color-text-primary: #303133;
$color-text-regular: #606266;
$color-text-secondary: #909399;
$color-border: #ebeef5;
$color-bg-light: #f5f7fa;
$color-bg-white: #ffffff;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 20px;
$spacing-xxl: 24px;

.page-content {
  background-color: transparent;
}

.config-container {
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
}

.section-block {
  margin-bottom: 10px;
  border: 1px solid $color-border;
  background-color: $color-bg-white;
  border-radius: 8px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg $spacing-xl;
  background-color: $color-bg-white;
  border-bottom: 1px solid $color-border;
  font-size: 15px;
  font-weight: 600;
  color: $color-text-primary;

  .title-left {
    display: flex;
    align-items: center;
  }

  .section-icon {
    margin-right: $spacing-sm;
    font-size: 16px;
    color: $color-primary;
  }

  .el-button {
    padding: $spacing-xs $spacing-md;
    font-size: 13px;
  }
}

.section-content {
  padding: $spacing-lg $spacing-xl;
}

.info-item {
  display: flex;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1px solid $color-border;

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    min-width: 120px;
    color: $color-text-secondary;
    font-size: 14px;
  }

  .info-value {
    flex: 1;
    color: $color-text-primary;
    font-size: 14px;
    font-weight: 500;

    &.status-disabled {
      color: $color-danger;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-top: 1px solid $color-border;
}

// 暗黑模式适配
html.dark {
  .page-content {
    background-color: transparent;
  }

  .config-container {
    background-color: transparent;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .section-block {
    background-color: #1f1f1f;
    border-color: #363637;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .section-title {
    background-color: #262626;
    border-bottom-color: #363637;
    color: #e5eaf3;

    .title-left {
      color: #e5eaf3;

      .section-icon {
        color: #67b3ff;
      }
    }
  }

  .info-item {
    border-bottom-color: #363637;

    .info-label {
      color: #9ca3af;
    }

    .info-value {
      color: #e5eaf3;

      &.status-disabled {
        color: #f56c6c;
      }
    }
  }

  .drawer-footer {
    background-color: #262626;
    border-top-color: #363637;
  }

  :deep(.el-form-item__label) {
    color: #e5eaf3;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    background-color: #1a1a1a;
    box-shadow: 0 0 0 1px #363637 inset;

    &:focus {
      box-shadow: 0 0 0 1px #67b3ff inset;
    }

    &:hover {
      box-shadow: 0 0 0 1px #4a4a4a inset;
    }
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    color: #e5eaf3;
    background-color: #1a1a1a;
  }

  :deep(.el-input__inner::placeholder) {
    color: #6b7280;
  }

  :deep(.el-drawer) {
    background-color: #1f1f1f;
  }

  :deep(.el-drawer__header) {
    background-color: #262626;
    border-bottom-color: #363637;
    color: #e5eaf3;
  }

  :deep(.el-drawer__title) {
    color: #e5eaf3;
  }

  :deep(.el-drawer__body) {
    background-color: #1f1f1f;
  }

  :deep(.el-switch__label) {
    color: #e5eaf3;
  }

  :deep(.el-switch__label.is-active) {
    color: #67b3ff;
  }

  :deep(.el-button--default) {
    background-color: #262626;
    border-color: #363637;
    color: #e5eaf3;

    &:hover {
      background-color: #363637;
      border-color: #4a4a4a;
      color: #ffffff;
    }
  }

  :deep(.el-button--primary) {
    background-color: #409eff;
    border-color: #409eff;
    color: #ffffff;

    &:hover {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-textarea__inner) {
    background-color: #1a1a1a;
    border-color: #363637;
    color: #e5eaf3;

    &:focus {
      border-color: #67b3ff;
    }

    &:hover {
      border-color: #4a4a4a;
    }
  }

  :deep(.el-textarea__inner::placeholder) {
    color: #6b7280;
  }

  :deep(.el-input__count) {
    color: #6b7280;
    background-color: #1a1a1a;
  }
}
</style>
