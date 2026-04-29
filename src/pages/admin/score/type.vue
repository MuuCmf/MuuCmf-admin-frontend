<template>
  <div class="page-container">
    <div class="page-content">
      <div class="with-container">
        <!-- 页面标题 -->
        <div class="page-header-section">
          <h1 class="page-title">积分类型设置</h1>
          <p class="page-description">使用中的积分类型与单位</p>
        </div>

        <!-- 卡片列表 -->
        <div v-loading="loading" class="score-type-grid">
          <div v-for="item in list" :key="item.id" class="score-type-card">
            <div class="card-header">
              <div class="card-icon">
                <span class="icon-text">{{ item.title.charAt(0) }}</span>
              </div>
              <div class="card-title-group">
                <h3 class="card-title">{{ item.title }}</h3>
                <span class="card-unit">单位：{{ item.unit }}</span>
              </div>
            </div>
            <div class="card-footer">
              <el-tag :type="item.status === 1 ? 'success' : 'info'" size="small" effect="light">
                {{ item.status === 1 ? '已启用' : '已禁用' }}
              </el-tag>
              <div class="card-actions">
                <el-button type="primary" size="small" link @click="handleEditType(item)"> 编辑 </el-button>
                <el-switch
                  v-model="item.status"
                  :active-value="1"
                  :inactive-value="0"
                  size="small"
                  @change="handleStatusChange(item)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="list.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无积分类型" />
        </div>
      </div>
    </div>

    <!-- 编辑积分类型对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑积分类型"
      width="500px"
      destroy-on-close
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="类型名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入积分类型名称" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="请输入积分单位" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 保存 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getScoreTypeList,
  updateScoreTypeStatus,
  editScoreType,
  type ScoreTypeItem,
  type ScoreTypeFormData
} from '@/api';

const list = ref<ScoreTypeItem[]>([]);
const loading = ref(false);

// 编辑对话框相关
const editDialogVisible = ref(false);
const formRef = ref();
const submitLoading = ref(false);
const formData = reactive<ScoreTypeFormData>({
  title: '',
  unit: '',
  status: 1
});

// 表单验证规则
const formRules = reactive({
  title: [
    { required: true, message: '请输入积分类型名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入积分单位', trigger: 'blur' },
    { min: 1, max: 20, message: '单位长度在 1 到 20 个字符', trigger: 'blur' }
  ]
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await getScoreTypeList();
    if (res.code === 200) {
      list.value = res.data || [];
    }
  } catch (error) {
    console.error('获取积分类型列表失败:', error);
    ElMessage.error('获取积分类型列表失败');
  } finally {
    loading.value = false;
  }
};

const handleStatusChange = async (item: ScoreTypeItem) => {
  try {
    const actionText = item.status === 1 ? '启用' : '禁用';
    const res = await updateScoreTypeStatus({
      ids: item.id,
      status: item.status
    });
    if (res.code === 200) {
      ElMessage.success(`${actionText}成功`);
    } else {
      ElMessage.error(res.msg || `${actionText}失败`);
      item.status = item.status === 1 ? 0 : 1;
    }
  } catch (error) {
    console.error('状态切换失败:', error);
    ElMessage.error('状态切换失败');
    item.status = item.status === 1 ? 0 : 1;
  }
};

// 编辑积分类型
const handleEditType = (item: ScoreTypeItem) => {
  formData.id = item.id;
  formData.title = item.title;
  formData.unit = item.unit;
  formData.status = item.status;
  editDialogVisible.value = true;
};

// 关闭对话框
const handleDialogClose = () => {
  editDialogVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  delete formData.id;
  formData.title = '';
  formData.unit = '';
  formData.status = 1;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const res = await editScoreType(formData);
    if (res.code === 200) {
      ElMessage.success('保存成功');
      handleDialogClose();
      getList();
    } else {
      ElMessage.error(res.msg || '保存失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
}

.page-content {
  padding: 24px;
}

.page-header-section {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 8px 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.page-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.score-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.score-type-card {
  background: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.score-type-card:hover {
  border-color: #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #03b8cf 0%, #028a9b 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 4px 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.card-unit {
  font-size: 13px;
  color: #6b7280;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.empty-state {
  margin-top: 60px;
}
</style>
