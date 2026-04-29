<template>
  <div class="page-container">
    <div class="page-header">
      <div class="keywords-toolbar">
        <div class="header-active">
          <el-button type="primary" @click="handleEdit({ id: 0, keyword: '', sort: 0, status: 1, recommend: 0 })"
            >添加关键字</el-button
          >
          <el-button type="success" :disabled="selectedIds.length === 0" @click="batchEnable">批量启用</el-button>
          <el-button type="warning" :disabled="selectedIds.length === 0" @click="batchDisable">批量禁用</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchDelete">批量删除</el-button>
        </div>
        <div class="search-form">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入关键字"
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
      <div ref="scrollContainerRef" class="with-container">
        <div class="table-container">
          <el-table :data="lists" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="40" />
            <el-table-column prop="keyword" label="关键字" min-width="150">
              <template #default="scope">
                <span>{{ scope.row.keyword }}</span>
                <el-tag v-if="scope.row.recommend === 1" type="warning" size="small" style="margin-left: 8px"
                  >推荐</el-tag
                >
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="100">
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
            <el-table-column prop="create_time_str" label="创建时间" width="180" />
            <el-table-column prop="update_time_str" label="更新时间" width="180" />
            <el-table-column label="操作" width="180" align="right" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="rows"
        class="pagination"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑关键字对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="form.keyword" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" placeholder="请输入排序权重" />
        </el-form-item>
        <el-form-item label="是否推荐" prop="recommend">
          <el-switch v-model="form.recommend" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SafeIcon from '@/components/SafeIcon.vue';
import { useScrollReset } from '@/composables/useScrollReset';
import { getKeywordsList, updateKeywordsStatus, saveKeyword, type KeywordItem } from '@/api/admin/keywords';

// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

const page = ref(1);
const rows = ref(20);
const total = ref(0);
const loading = ref(false);
const lists = ref<KeywordItem[]>([]);
const searchForm = ref({
  keyword: '',
  status: ''
});
const selectedIds = ref<number[]>([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('添加关键字');
const formRef = ref();
const form = reactive({
  id: 0,
  keyword: '',
  sort: 0,
  status: 1,
  recommend: 0
});

// 表单验证规则
const rules = {
  keyword: [{ required: true, message: '请输入关键字', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序权重', trigger: 'blur' }]
};

// 获取关键字列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getKeywordsList({
      page: page.value,
      rows: rows.value,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status
    });
    if (res.code === 200) {
      lists.value = (res.data.data || []).map((item: KeywordItem) => ({
        ...item,
        status: Number(item.status),
        recommend: Number(item.recommend ?? 0)
      }));
      total.value = res.data.total;
      resetScrollTop();
    } else {
      ElMessage.error(res.msg || '获取关键字列表失败');
    }
  } catch (error) {
    ElMessage.error('获取关键字列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  getList();
};

// 重置表单
const resetForm = () => {
  searchForm.value = {
    keyword: '',
    status: ''
  };
  page.value = 1;
  getList();
};

// 编辑关键字
const handleEdit = (row: KeywordItem) => {
  console.log('编辑原始数据:', row);
  dialogTitle.value = '编辑关键字';

  form.id = row.id;
  form.keyword = row.keyword;
  form.sort = row.sort;
  form.status = Number(row.status);
  form.recommend = Number(row.recommend ?? 0);

  nextTick(() => {
    console.log('编辑表单数据:', form);
    console.log('表单status类型:', typeof form.status, '值:', form.status);
    console.log('表单recommend类型:', typeof form.recommend, '值:', form.recommend);
  });

  dialogVisible.value = true;
};

// 删除关键字
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个关键字吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateKeywordsStatus({
          ids: id,
          status: -1
        });
        if (res.code === 200) {
          ElMessage.success('关键字删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '关键字删除失败');
        }
      } catch (error) {
        ElMessage.error('关键字删除失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 状态切换（仅在用户主动点击时触发）
const handleStatusToggle = async (row: KeywordItem) => {
  // 保存原始状态（用于失败时恢复）
  const originalStatus = row.status === 1 ? 0 : 1;

  try {
    const res = await updateKeywordsStatus({
      ids: [row.id],
      status: row.status
    });
    if (res.code !== 200) {
      ElMessage.error(res.msg || '状态更新失败');
      // 恢复原状态
      row.status = originalStatus;
    }
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原状态
    row.status = originalStatus;
    console.error(error);
  }
};

// 处理表格选择变化
const handleSelectionChange = (selection: KeywordItem[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 批量启用
const batchEnable = () => {
  ElMessageBox.confirm(`确定要启用选中的 ${selectedIds.value.length} 条记录吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateKeywordsStatus({
          ids: selectedIds.value,
          status: 1
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
    .catch(() => {
      // 取消操作
    });
};

// 批量禁用
const batchDisable = () => {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedIds.value.length} 条记录吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateKeywordsStatus({
          ids: selectedIds.value,
          status: 0
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
    .catch(() => {
      // 取消操作
    });
};

// 批量删除
const batchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateKeywordsStatus({
          ids: selectedIds.value,
          status: -1
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
    .catch(() => {
      // 取消操作
    });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const res = await saveKeyword(form);

    if (res.code === 200) {
      ElMessage.success(form.id ? '关键字更新成功' : '关键字添加成功');
      dialogVisible.value = false;
      getList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const handleSizeChange = () => {
  page.value = 1;
  getList();
};

const handlePageChange = () => {
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.keywords-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.header-active {
  display: flex;
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
    margin-right: 0;
  }
}

.page-content {
  padding: 10px;
  background-color: var(--el-color-white);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-container {
  border-radius: 6px;
  overflow: hidden;
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
