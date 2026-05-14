<template>
  <div class="page-container">
    <div class="page-header">
      <div class="limit-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd"> 添加限制 </el-button>
          <el-button type="success" :disabled="selectedRows.length === 0" @click="batchEnable"> 批量启用 </el-button>
          <el-button type="warning" :disabled="selectedRows.length === 0" @click="batchDisable"> 批量禁用 </el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete"> 批量删除 </el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchForm.action"
            placeholder="搜索行为名称"
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
          <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" label="唯一标识" width="150" align="left" />
            <el-table-column prop="title" label="名称" width="150" align="left" />
            <el-table-column prop="frequency" label="频率" width="100" align="center" />
            <el-table-column prop="time" label="时间" width="120" align="center" />
            <el-table-column prop="action_list_info" label="关联行为" min-width="150" align="left" />
            <el-table-column prop="punish_info" label="处罚方式" width="120" align="center" />
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
            <el-table-column label="操作" width="140" fixed="right" align="right">
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

    <!-- 编辑限制抽屉组件 -->
    <LimitDrawer v-model:visible="editDrawerVisible" :title="editDrawerTitle" :data="selectedRow" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import LimitDrawer from './components/LimitDrawer.vue';
import { getLimitList, updateLimitStatus, type LimitItem } from '@/api/admin/action';

const loading = ref(false);
const tableData = ref<LimitItem[]>([]);
const selectedRows = ref<LimitItem[]>([]);

const searchForm = reactive({
  action: ''
});

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

const editDrawerVisible = ref(false);
const editDrawerTitle = ref('');
const selectedRow = ref<LimitItem | undefined>();

const getList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      rows: pagination.size,
      action: searchForm.action
    };

    const res = await getLimitList(params);

    if (res.code === 200) {
      tableData.value = res.data.data || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '获取限制列表失败');
    }
  } catch (error: any) {
    console.error('获取限制列表失败:', error);
    ElMessage.error('获取限制列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  getList();
};

const handleReset = () => {
  searchForm.action = '';
  handleSearch();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  getList();
};

const handleCurrentChange = (current: number) => {
  pagination.current = current;
  getList();
};

const handleAdd = () => {
  selectedRow.value = undefined;
  editDrawerTitle.value = '添加限制';
  editDrawerVisible.value = true;
};

const handleEdit = (row: LimitItem) => {
  selectedRow.value = {
    id: row.id,
    title: row.title,
    name: row.name,
    frequency: row.frequency,
    time_number: row.time_number,
    time_unit: row.time_unit,
    action_list: row.action_list || '',
    punish: row.punish || '',
    if_message: row.if_message !== undefined ? Number(row.if_message) : 0,
    message_content: row.message_content || '',
    status: row.status,
    module: (row as any).module || 'admin'
  };
  editDrawerTitle.value = '编辑限制';
  editDrawerVisible.value = true;
};

const handleDelete = async (row: LimitItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除限制 "${row.title}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await updateLimitStatus({
      ids: row.id,
      status: -1
    });

    if (res.code === 200) {
      ElMessage.success('删除成功');
      getList();
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

const handleStatusChange = async (row: LimitItem) => {
  try {
    const res = await updateLimitStatus({
      ids: row.id,
      status: row.status
    });

    if (res.code !== 200) {
      row.status = row.status === 1 ? 0 : 1;
      ElMessage.error(res.msg || '状态切换失败');
    } else {
      ElMessage.success('状态切换成功');
    }
  } catch (error: any) {
    row.status = row.status === 1 ? 0 : 1;
    console.error('状态切换失败:', error);
    ElMessage.error('状态切换失败');
  }
};

const batchEnable = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要启用的限制');
    return;
  }

  try {
    const ids = selectedRows.value.map(row => row.id);
    const res = await updateLimitStatus({
      ids: ids.join(','),
      status: 1
    });

    if (res.code === 200) {
      ElMessage.success('批量启用成功');
      getList();
    } else {
      ElMessage.error(res.msg || '批量启用失败');
    }
  } catch (error: any) {
    console.error('批量启用失败:', error);
    ElMessage.error('批量启用失败');
  }
};

const batchDisable = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要禁用的限制');
    return;
  }

  try {
    const ids = selectedRows.value.map(row => row.id);
    const res = await updateLimitStatus({
      ids: ids.join(','),
      status: 0
    });

    if (res.code === 200) {
      ElMessage.success('批量禁用成功');
      getList();
    } else {
      ElMessage.error(res.msg || '批量禁用失败');
    }
  } catch (error: any) {
    console.error('批量禁用失败:', error);
    ElMessage.error('批量禁用失败');
  }
};

const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的限制');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条限制吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const ids = selectedRows.value.map(row => row.id);
    const res = await updateLimitStatus({
      ids: ids.join(','),
      status: -1
    });

    if (res.code === 200) {
      ElMessage.success('批量删除成功');
      getList();
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

const handleSelectionChange = (selection: LimitItem[]) => {
  selectedRows.value = selection;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    .limit-toolbar {
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
    padding: 10px;
  }
}
</style>
