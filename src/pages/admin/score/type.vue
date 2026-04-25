<template>
  <div class="page-container">
    <div class="page-header">
      <div class="score-type-toolbar">
        <div class="header-active">
          <el-button type="primary" @click="handleAddType"> 新增积分类型 </el-button>
        </div>
        <div class="search-form">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索积分类型名称"
                clearable
                style="width: 300px; margin-right: 12px"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="list" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="title" label="类型名称" min-width="180" align="left" />
            <el-table-column prop="unit" label="单位" width="180" align="left" />
            <el-table-column prop="status" label="状态" width="120" align="center">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="right" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleEditType(scope.row)"> 编辑 </el-button>
                <el-button type="danger" size="small" @click="handleDeleteType(scope.row)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <!-- 编辑积分类型对话框 -->
    <el-dialog
      v-model="editDrawerVisible"
      :title="editDrawerTitle"
      width="500px"
      destroy-on-close
      @close="handleDrawerClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" style="margin-top: 20px">
        <el-form-item label="类型" prop="title">
          <el-input v-model="formData.title" placeholder="请输入积分类型名称" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="请输入积分单位" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDrawerClose">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ formData.id ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

// 积分类型数据结构
interface ScoreTypeItem {
  id: number;
  title: string;
  unit: string;
  status: number;
}

// 表单数据结构
interface FormData {
  id?: number;
  title: string;
  unit: string;
  status: number;
}

// 响应式数据
const list = ref<ScoreTypeItem[]>([]);
const loading = ref(false);
const searchForm = ref({
  keyword: ''
});

// 编辑对话框相关
const editDrawerVisible = ref(false);
const editDrawerTitle = ref('');
const formRef = ref();
const submitLoading = ref(false);
const formData = reactive<FormData>({
  title: '',
  unit: '',
  status: 1
});

// 表单验证规则
const formRules = reactive({
  title: [
    { required: true, message: '请输入积分类型标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入积分单位', trigger: 'blur' },
    { min: 1, max: 20, message: '单位长度在 1 到 20 个字符', trigger: 'blur' }
  ]
});

// 获取积分类型列表
const getList = async () => {
  loading.value = true;
  try {
    const data: Record<string, any> = {
      keyword: searchForm.value.keyword
    };

    const res = await request({
      url: 'admin/score/type',
      data: data,
      method: 'GET'
    });

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

// 搜索
const handleSearch = () => {
  getList();
};

// 重置
const handleReset = () => {
  searchForm.value.keyword = '';
  getList();
};

// 添加积分类型
const handleAddType = () => {
  handleEditType();
};

// 新增、编辑积分类型统一方法
const handleEditType = (item?: ScoreTypeItem) => {
  if (item) {
    // 编辑模式
    formData.id = item.id;
    formData.title = item.title;
    formData.unit = item.unit;
    formData.status = item.status;
    editDrawerTitle.value = '编辑积分类型';
  } else {
    // 添加模式
    resetForm();
    editDrawerTitle.value = '添加积分类型';
  }
  editDrawerVisible.value = true;
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

// 关闭对话框
const handleDrawerClose = () => {
  editDrawerVisible.value = false;
  resetForm();
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const res = await request({
      url: 'admin/score/type/edit',
      method: 'POST',
      data: formData
    });

    if (res.code === 200) {
      ElMessage.success(formData.id ? '更新成功' : '创建成功');
      handleDrawerClose();
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || (formData.id ? '更新失败' : '创建失败'));
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

// 删除积分类型
const handleDeleteType = async (item: ScoreTypeItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除积分类型 "${item.title}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 调用删除接口
    const res = await request({
      url: 'admin/score/type/delete',
      method: 'POST',
      data: {
        ids: item.id
      }
    });

    if (res.code === 200) {
      ElMessage.success('删除成功');
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除积分类型失败:', error);
      ElMessage.error('删除积分类型失败');
    }
  }
};

// 切换状态
const handleStatusChange = async (item: ScoreTypeItem) => {
  try {
    const actionText = item.status === 1 ? '启用' : '禁用';
    const res = await request({
      url: 'admin/score/type/status',
      method: 'POST',
      data: {
        ids: item.id,
        status: item.status
      }
    });

    if (res.code === 200) {
      ElMessage.success(`${actionText}成功`);
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || `${actionText}失败`);
      // 恢复原状态
      item.status = item.status === 1 ? 0 : 1;
    }
  } catch (error) {
    console.error('状态切换失败:', error);
    ElMessage.error('状态切换失败');
    // 恢复原状态
    item.status = item.status === 1 ? 0 : 1;
  }
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.page-header {
  .score-type-toolbar {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-active {
      display: flex;
      align-items: center;

      .el-button + .el-button {
        margin-left: 12px;
      }
    }

    .search-form {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;
      }
    }
  }
}

.page-content {
  padding: 10px;
}
</style>
