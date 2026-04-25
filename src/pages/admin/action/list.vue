<template>
  <div class="page-container">
    <div class="page-header">
      <div class="action-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd"> 添加规则 </el-button>
          <el-button type="success" :disabled="selectedRows.length === 0" @click="batchEnable"> 批量启用 </el-button>
          <el-button type="warning" :disabled="selectedRows.length === 0" @click="batchDisable"> 批量禁用 </el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete"> 批量删除 </el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索规则名称"
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
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="tableData" style="width: 100%" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" label="标识" width="150" align="left" />
            <el-table-column prop="title" label="名称" width="150" align="left" />
            <el-table-column prop="remark" label="描述" min-width="150" align="left" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
                <el-button type="danger" size="small" @click="handleDelete(scope.row)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        class="pagination"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑规则抽屉组件 -->
    <ActionDrawer v-model:visible="editDrawerVisible" :title="editDrawerTitle" :data="selectedRow" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import ActionDrawer from './components/ActionDrawer.vue';
import type { ActionItem } from './types';

// 响应式数据
const loading = ref(false);
const tableData = ref<ActionItem[]>([]);
const selectedRows = ref<ActionItem[]>([]);

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: ''
});

// 分页数据
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

// 编辑抽屉
const editDrawerVisible = ref(false);
const editDrawerTitle = ref('');
const selectedRow = ref<ActionItem | undefined>();

// 获取规则列表
const getList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      rows: pagination.size,
      keyword: searchForm.keyword,
      status: searchForm.status
    };

    const res = await request({
      url: 'admin/action/list',
      method: 'GET',
      data: params
    });

    if (res.code === 200) {
      tableData.value = res.data.data || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '获取规则列表失败');
    }
  } catch (error: any) {
    console.error('获取规则列表失败:', error);
    ElMessage.error('获取规则列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  getList();
};

// 重置
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  getList();
};

// 当前页变化
const handleCurrentChange = (current: number) => {
  pagination.current = current;
  getList();
};

// 添加规则
const handleAdd = () => {
  selectedRow.value = undefined;
  editDrawerTitle.value = '添加规则';
  editDrawerVisible.value = true;
};

// 编辑规则
const handleEdit = (row: ActionItem) => {
  selectedRow.value = {
    id: row.id,
    name: row.name,
    title: row.title,
    log: row.log,
    rule: row.rule,
    module: row.module,
    remark: row.remark,
    status: row.status
  };
  editDrawerTitle.value = '编辑规则';
  editDrawerVisible.value = true;
};

// 删除规则
const handleDelete = async (row: ActionItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除规则 "${row.title}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await request({
      url: 'admin/action/status',
      method: 'POST',
      data: {
        ids: row.id,
        status: -1
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
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 切换状态
const handleStatusChange = async (row: ActionItem) => {
  try {
    const res = await request({
      url: 'admin/action/status',
      method: 'POST',
      data: {
        ids: row.id,
        status: row.status
      }
    });

    if (res.code !== 200) {
      // 状态切换失败，恢复原状态
      row.status = row.status === 1 ? 0 : 1;
      ElMessage.error(res.msg || '状态切换失败');
    } else {
      ElMessage.success('状态切换成功');
    }
  } catch (error: any) {
    // 状态切换失败，恢复原状态
    row.status = row.status === 1 ? 0 : 1;
    console.error('状态切换失败:', error);
    ElMessage.error('状态切换失败');
  }
};

// 批量启用
const batchEnable = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要启用的规则');
    return;
  }

  try {
    const ids = selectedRows.value.map(row => row.id);
    const res = await request({
      url: 'admin/action/status',
      method: 'POST',
      data: {
        ids: ids.join(','),
        status: 1
      }
    });

    if (res.code === 200) {
      ElMessage.success('批量启用成功');
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '批量启用失败');
    }
  } catch (error: any) {
    console.error('批量启用失败:', error);
    ElMessage.error('批量启用失败');
  }
};

// 批量禁用
const batchDisable = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要禁用的规则');
    return;
  }

  try {
    const ids = selectedRows.value.map(row => row.id);
    const res = await request({
      url: 'admin/action/status',
      method: 'POST',
      data: {
        ids: ids.join(','),
        status: 0
      }
    });

    if (res.code === 200) {
      ElMessage.success('批量禁用成功');
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '批量禁用失败');
    }
  } catch (error: any) {
    console.error('批量禁用失败:', error);
    ElMessage.error('批量禁用失败');
  }
};

// 批量删除
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的规则');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条规则吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const ids = selectedRows.value.map(row => row.id);
    const res = await request({
      url: 'admin/action/status',
      method: 'POST',
      data: {
        ids: ids.join(','),
        status: -1
      }
    });

    if (res.code === 200) {
      ElMessage.success('批量删除成功');
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '批量删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 处理选择变化
const handleSelectionChange = (selection: ActionItem[]) => {
  selectedRows.value = selection;
};

// 组件挂载时获取数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    .action-toolbar {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .toolbar-left {
    display: flex;
    align-items: center;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
  }

  .page-content {
    border-radius: 6px;
    padding: 10px;

    .table-container {
      margin-bottom: 20px;
    }
  }
}
</style>
