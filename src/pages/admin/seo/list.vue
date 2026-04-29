<template>
  <div class="page-container">
    <div class="page-header">
      <div class="seo-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加规则</el-button>
          <el-button type="success" :icon="Check" :disabled="selectedIds.length === 0" @click="handleBatchEnable"
            >批量启用</el-button
          >
          <el-button type="warning" :icon="Close" :disabled="selectedIds.length === 0" @click="handleBatchDisable"
            >批量禁用</el-button
          >
          <el-button type="danger" :icon="Delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete"
            >批量删除</el-button
          >
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索关键字"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <safe-icon icon="fas search" />
            </template>
          </el-input>
          <el-select
            :key="selectKey"
            v-model="searchForm.app"
            placeholder="全部应用"
            clearable
            class="app-select"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="module in moduleList"
              :key="module.name"
              :label="module.alias || module.name"
              :value="module.name"
            />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div ref="scrollContainerRef" class="with-container">
        <div class="table-container">
          <el-table :data="list" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="规则标题" min-width="150" />
            <el-table-column prop="app" label="应用模块" width="120">
              <template #default="scope">
                {{ getAppName(scope.row.app) }}
              </template>
            </el-table-column>
            <el-table-column prop="controller" label="控制器" width="120" />
            <el-table-column prop="action" label="操作方法" width="120" />
            <el-table-column prop="seo_title" label="SEO标题" min-width="150" show-overflow-tooltip />
            <el-table-column prop="seo_keywords" label="SEO关键词" min-width="150" show-overflow-tooltip />
            <el-table-column prop="seo_description" label="SEO描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" align="right" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.rows"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-drawer v-model="dialogVisible" :title="dialogTitle" size="40%" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="规则标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入规则标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="应用模块" prop="app">
          <el-select v-model="formData.app" placeholder="请选择应用模块">
            <el-option v-for="module in moduleList" :key="module.name" :label="module.alias" :value="module.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="控制器" prop="controller">
          <el-input v-model="formData.controller" placeholder="请输入控制器名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="操作方法" prop="action">
          <el-input v-model="formData.action" placeholder="请输入操作方法" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="SEO标题" prop="seo_title">
          <el-input v-model="formData.seo_title" placeholder="请输入SEO标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="SEO关键词" prop="seo_keywords">
          <el-input
            v-model="formData.seo_keywords"
            type="textarea"
            :rows="3"
            placeholder="请输入SEO关键词，多个关键词用逗号分隔"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="SEO描述" prop="seo_description">
          <el-input
            v-model="formData.seo_description"
            type="textarea"
            :rows="3"
            placeholder="请输入SEO描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Check, Close, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useScrollReset } from '@/composables/useScrollReset';
import { getAllModules } from '@/api/admin/module';
import { getSeoList, updateSeoStatus, saveSeoRule, type SeoRule } from '@/api/admin/seo';

// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('添加规则');
const list = ref<SeoRule[]>([]);
const total = ref(0);
const selectedIds = ref<number[]>([]);
const moduleList = ref<any[]>([]);
const modulesLoaded = ref(false);

const searchForm = reactive({
  page: 1,
  rows: 20,
  app: '',
  keyword: ''
});

// 添加一个强制刷新的 ref
const selectKey = ref(0);

const formData = reactive({
  id: 0,
  title: '',
  app: '',
  controller: '',
  action: '',
  seo_title: '',
  seo_keywords: '',
  seo_description: '',
  status: 1
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入规则标题', trigger: 'blur' }],
  controller: [{ required: true, message: '请输入控制器名称', trigger: 'blur' }],
  action: [{ required: true, message: '请输入操作方法', trigger: 'blur' }]
};

const fetchModuleList = async () => {
  try {
    const res = await getAllModules({ support: 'pc' });

    if (res.code === 200) {
      moduleList.value = res.data || [];
      modulesLoaded.value = true;
      // 强制刷新 select 组件
      selectKey.value++;
    }
  } catch (error) {
    console.error('获取模块列表失败:', error);
    moduleList.value = [];
    modulesLoaded.value = true;
  }
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await getSeoList(searchForm);

    if (res.code === 200) {
      // 处理数据，确保 app 字段存在
      const processedData = (res.data.data || []).map((item: any) => ({
        ...item,
        app: item.app || '' // 确保 app 字段不为 undefined
      }));

      list.value = processedData;
      total.value = res.data.total || 0;
      // 重置滚动位置
      resetScrollTop();
    }
  } catch (error) {
    console.error('获取SEO规则列表失败:', error);
    ElMessage.error('获取SEO规则列表失败');
  } finally {
    loading.value = false;
  }
};

const getAppName = (app: string) => {
  // 处理 undefined 或空值的情况
  if (!app) {
    return '未设置';
  }

  const module = moduleList.value.find(m => m.name === app);
  return module ? module.alias : app;
};

const handleSelectionChange = (selection: SeoRule[]) => {
  selectedIds.value = selection.map(item => item.id);
};

const handleSearch = () => {
  searchForm.page = 1;
  getList();
};

const handleReset = () => {
  searchForm.page = 1;
  searchForm.keyword = '';
  searchForm.app = '';
  getList();
};

const handleSizeChange = (size: number) => {
  searchForm.rows = size;
  searchForm.page = 1;
  getList();
};

const handlePageChange = (page: number) => {
  searchForm.page = page;
  getList();
};

const handleAdd = () => {
  dialogTitle.value = '添加规则';
  Object.assign(formData, {
    id: 0,
    title: '',
    app: '',
    controller: '',
    action: '',
    seo_title: '',
    seo_keywords: '',
    seo_description: '',
    status: 1
  });
  dialogVisible.value = true;
};

const handleEdit = (row: SeoRule) => {
  dialogTitle.value = '编辑规则';
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    app: row.app,
    controller: row.controller,
    action: row.action,
    seo_title: row.seo_title,
    seo_keywords: row.seo_keywords,
    seo_description: row.seo_description,
    status: row.status
  });
  dialogVisible.value = true;
};

const handleDelete = (row: SeoRule) => {
  ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateSeoStatus({
          ids: row.id,
          status: -1
        });

        if (res.code === 200) {
          ElMessage.success('删除成功');
          getList();
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

const handleBatchEnable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要操作的规则');
    return;
  }

  ElMessageBox.confirm(`确定要启用选中的 ${selectedIds.value.length} 条规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateSeoStatus({
          ids: selectedIds.value.join(','),
          status: 1
        });

        if (res.code === 200) {
          ElMessage.success('批量启用成功');
          selectedIds.value = [];
          getList();
        }
      } catch (error) {
        console.error('批量启用失败:', error);
        ElMessage.error('批量启用失败');
      }
    })
    .catch(() => {});
};

const handleBatchDisable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要操作的规则');
    return;
  }

  ElMessageBox.confirm(`确定要禁用选中的 ${selectedIds.value.length} 条规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateSeoStatus({
          ids: selectedIds.value.join(','),
          status: 0
        });

        if (res.code === 200) {
          ElMessage.success('批量禁用成功');
          selectedIds.value = [];
          getList();
        }
      } catch (error) {
        console.error('批量禁用失败:', error);
        ElMessage.error('批量禁用失败');
      }
    })
    .catch(() => {});
};

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要操作的规则');
    return;
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateSeoStatus({
          ids: selectedIds.value.join(','),
          status: -1
        });

        if (res.code === 200) {
          ElMessage.success('批量删除成功');
          selectedIds.value = [];
          getList();
        }
      } catch (error) {
        console.error('批量删除失败:', error);
        ElMessage.error('批量删除失败');
      }
    })
    .catch(() => {});
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const res = await saveSeoRule(formData);

      if (res.code === 200) {
        ElMessage.success(formData.id ? '编辑成功' : '添加成功');
        dialogVisible.value = false;
        getList();
      } else {
        ElMessage.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleDialogClose = () => {
  formRef.value?.resetFields();
};

onMounted(async () => {
  await fetchModuleList();
  getList();
});
</script>

<style scoped lang="scss">
.seo-toolbar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 1200px) {
    justify-content: flex-start;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 1200px) {
    justify-content: flex-start;
  }

  .search-input {
    width: 300px;
    margin-right: 12px;

    @media (max-width: 768px) {
      width: 100%;
      margin-right: 0;
    }
  }

  .app-select {
    width: 150px;
    margin-right: 12px;

    @media (max-width: 768px) {
      width: 100%;
      margin-right: 0;
    }
  }
}

.page-content {
  padding: 10px;
  background-color: var(--el-color-white);
}
</style>
