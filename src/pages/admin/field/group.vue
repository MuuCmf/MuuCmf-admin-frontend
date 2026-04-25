<template>
  <div class="page-container">
    <div class="page-header">
      <div class="field-toolbar">
        <div class="header-active">
          <el-button type="primary" @click="handleAdd">添加分组</el-button>
          <el-button type="success" :disabled="selectedIds.length === 0" @click="batchEnable">批量启用</el-button>
          <el-button type="warning" :disabled="selectedIds.length === 0" @click="batchDisable">批量禁用</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchDelete">批量删除</el-button>
        </div>
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入分组名称"
                style="width: 300px; margin-right: 12px"
              >
                <template #prefix>
                  <safe-icon icon="fas search" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="lists" style="width: 100%" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="40" />
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="profile_name" label="分组名称" min-width="150" />
            <el-table-column prop="visiable_str" label="可见性" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.visiable === 1 ? 'success' : 'info'">
                  {{ scope.row.visiable_str }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <div style="cursor: pointer; padding: 5px 0">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @click.stop
                    @change="() => handleStatusToggle(scope.row)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="100" align="center" />
            <el-table-column label="操作" width="240" align="right" fixed="right">
              <template #default="scope">
                <el-button size="small" type="info" @click="handleManageFields(scope.row)">管理字段</el-button>
                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分组名称" prop="profile_name">
          <el-input v-model="form.profile_name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" placeholder="请输入排序权重" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="可见性" prop="visiable">
          <el-switch v-model="form.visiable" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <FieldDrawer v-model:visible="drawerVisible" :group="currentGroup" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import SafeIcon from '@/components/SafeIcon.vue';
import FieldDrawer from './components/FieldDrawer.vue';

interface FieldGroupItem {
  id: number;
  profile_name: string;
  visiable: number;
  status: number;
  sort: number;
  create_time?: number;
  create_time_str?: string;
  update_time?: number;
  update_time_str?: string;
  setting?: any[];
}

const loading = ref(false);
const lists = ref<FieldGroupItem[]>([]);
const searchForm = ref({
  keyword: ''
});
const selectedIds = ref<number[]>([]);

const dialogVisible = ref(false);
const dialogTitle = ref('添加分组');
const formRef = ref();
const form = ref({
  id: 0,
  profile_name: '',
  sort: 0,
  status: 1,
  visiable: 1
});

const rules = {
  profile_name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
};

const drawerVisible = ref(false);
const currentGroup = ref<FieldGroupItem | null>(null);

const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/field/group',
      method: 'GET',
      data: {
        ...searchForm.value
      }
    });
    if (res.code === 200) {
      lists.value = res.data || [];
    } else {
      ElMessage.error(res.msg || '获取分组列表失败');
    }
  } catch (error) {
    ElMessage.error('获取分组列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  getList();
};

const resetForm = () => {
  searchForm.value = {
    keyword: ''
  };
  getList();
};

const handleAdd = () => {
  dialogTitle.value = '添加分组';
  form.value = {
    id: 0,
    profile_name: '',
    sort: 0,
    status: 1,
    visiable: 1
  };
  dialogVisible.value = true;
};

const handleEdit = (row: FieldGroupItem) => {
  dialogTitle.value = '编辑分组';
  form.value = {
    id: row.id,
    profile_name: row.profile_name,
    sort: row.sort,
    status: row.status,
    visiable: row.visiable
  };
  dialogVisible.value = true;
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个分组吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/field/group/status',
          method: 'POST',
          data: {
            ids: id,
            status: -1
          }
        });
        if (res.code === 200) {
          ElMessage.success('分组删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '分组删除失败');
        }
      } catch (error) {
        ElMessage.error('分组删除失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleStatusToggle = async (row: FieldGroupItem) => {
  const originalStatus = row.status === 1 ? 0 : 1;

  try {
    const res = await request({
      url: 'admin/field/group/status',
      method: 'POST',
      data: {
        ids: [row.id],
        status: row.status
      }
    });
    if (res.code !== 200) {
      ElMessage.error(res.msg || '状态更新失败');
      row.status = originalStatus;
    } else {
      ElMessage.success(res.msg || '状态切换成功');
    }
  } catch (error) {
    ElMessage.error('状态更新失败');
    row.status = originalStatus;
    console.error(error);
  }
};

const handleSelectionChange = (selection: FieldGroupItem[]) => {
  selectedIds.value = selection.map(item => item.id);
};

const batchEnable = () => {
  ElMessageBox.confirm(`确定要启用选中的 ${selectedIds.value.length} 条记录吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/field/group/status',
          method: 'POST',
          data: {
            ids: selectedIds.value,
            status: 1
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量启用成功');
          selectedIds.value = [];
          getList();
        } else {
          ElMessage.error(res.msg || '批量启用失败');
        }
      } catch (error) {
        ElMessage.error('批量启用失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const batchDisable = () => {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedIds.value.length} 条记录吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/field/group/status',
          method: 'POST',
          data: {
            ids: selectedIds.value,
            status: 0
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量禁用成功');
          selectedIds.value = [];
          getList();
        } else {
          ElMessage.error(res.msg || '批量禁用失败');
        }
      } catch (error) {
        ElMessage.error('批量禁用失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const batchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/field/group/status',
          method: 'POST',
          data: {
            ids: selectedIds.value,
            status: -1
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量删除成功');
          selectedIds.value = [];
          getList();
        } else {
          ElMessage.error(res.msg || '批量删除失败');
        }
      } catch (error) {
        ElMessage.error('批量删除失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const res = await request({
      url: 'admin/field/group/edit',
      method: 'POST',
      data: form.value
    });

    if (res.code === 200) {
      ElMessage.success(form.value.id ? '编辑分组成功' : '添加分组成功');
      dialogVisible.value = false;
      getList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const handleManageFields = (row: FieldGroupItem) => {
  currentGroup.value = row;
  drawerVisible.value = true;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 6px;

    .field-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-active {
      display: flex;
      gap: 12px;
    }

    .search-form {
      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;
      }
    }
  }

  .page-content {
    padding: 10px;
    background-color: var(--el-color-white);

    .table-container {
      margin-bottom: 20px;
    }
  }
}

html.dark {
  .page-header {
    background-color: #262626;
  }

  .page-content {
    background-color: #262626;
  }
}
</style>
