<template>
  <div class="page-container">
    <div class="page-header">
      <div class="log-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleExport"> 导出CSV </el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            批量删除
          </el-button>
          <el-button type="danger" @click="handleClear"> 清空日志 </el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchForm.uid"
            placeholder="搜索用户ID"
            clearable
            style="width: 150px; margin-right: 12px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-date-picker
            v-model="searchForm.sTime"
            type="datetime"
            placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 200px; margin-right: 12px"
          />
          <el-date-picker
            v-model="searchForm.eTime"
            type="datetime"
            placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 200px; margin-right: 12px"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="user_info.nickname" label="用户" width="100" align="center" />
            <el-table-column prop="action.title" label="行为" width="100" align="center" />
            <el-table-column prop="action_ip" label="IP地址" width="150" align="center" />
            <el-table-column prop="remark" label="日志内容" min-width="250" align="left" />
            <el-table-column prop="create_time_str" label="执行时间" width="180" align="center" />
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleDetail(scope.row)"> 详情 </el-button>
                <el-button type="danger" size="small" @click="handleSingleDelete(scope.row)"> 删除 </el-button>
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

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detailData.uid }}</el-descriptions-item>
        <el-descriptions-item label="行为ID">{{ detailData.action_id }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.action_ip }}</el-descriptions-item>
        <el-descriptions-item label="日志内容">{{ detailData.remark }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ formatDateTime(detailData.create_time) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getActionLogList, deleteActionLog, clearActionLog } from '@/api/admin/action';
import type { ActionLogItem } from '@/api/admin/action';

// 响应式数据
const loading = ref(false);
const tableData = ref<ActionLogItem[]>([]);
const selectedRows = ref<ActionLogItem[]>([]);
const multipleSelection = ref<ActionLogItem[]>([]);

// 搜索表单
const searchForm = reactive({
  uid: '',
  sTime: '',
  eTime: '',
  select: 0
});

// 分页数据
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

// 详情对话框
const detailDialogVisible = ref(false);
const detailData = reactive<ActionLogItem>({
  id: 0,
  uid: 0,
  action_id: 0,
  user_info: { nickname: '' },
  action: { title: '' },
  action_ip: '',
  remark: '',
  create_time: '',
  create_time_str: ''
});

// 获取行为日志列表
const getList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      rows: pagination.size,
      uid: searchForm.uid,
      sTime: searchForm.sTime,
      eTime: searchForm.eTime,
      select: searchForm.select
    };

    const res = await getActionLogList(params);

    if (res.code === 200) {
      tableData.value = res.data.data || [];
      pagination.total = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '获取日志列表失败');
    }
  } catch (error: any) {
    console.error('获取日志列表失败:', error);
    ElMessage.error('获取日志列表失败');
  } finally {
    loading.value = false;
  }
};

// 格式化时间
const formatDateTime = (time: string | number | Date) => {
  if (!time) return '';
  return new Date(time).toLocaleString();
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  getList();
};

// 重置
const handleReset = () => {
  searchForm.uid = '';
  searchForm.sTime = '';
  searchForm.eTime = '';
  searchForm.select = 0;
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

// 查看详情
const handleDetail = (row: ActionLogItem) => {
  Object.assign(detailData, row);
  detailDialogVisible.value = true;
};

// 导出CSV
const handleExport = () => {
  window.open(`${import.meta.env.VITE_API_BASE_URL}/admin/action/csv`);
};

// 处理多选变化
const handleSelectionChange = (val: ActionLogItem[]) => {
  multipleSelection.value = val;
  selectedRows.value = val;
};

// 通用删除方法
const deleteLog = async (ids: number[]) => {
  try {
    const res = await deleteActionLog({
      ids: ids.join(',')
    });

    if (res.code === 200) {
      ElMessage.success('删除成功');
      getList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error: any) {
    console.error('删除日志失败:', error);
    ElMessage.error('删除日志失败');
  }
};

// 单条删除
const handleSingleDelete = async (row: ActionLogItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除这条日志吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteLog([row.id]);
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的日志');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条日志吗？`, '确认批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const ids = selectedRows.value.map(row => row.id);
    await deleteLog(ids);
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 清空日志
const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有行为日志吗？此操作不可恢复！', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await clearActionLog();

    if (res.code === 200) {
      ElMessage.success('日志清空成功');
      getList();
    } else {
      ElMessage.error(res.msg || '日志清空失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error);
      ElMessage.error('清空日志失败');
    }
  }
};

// 组件挂载时获取数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    .log-toolbar {
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
