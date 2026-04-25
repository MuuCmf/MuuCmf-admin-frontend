<template>
  <div class="page-container">
    <div class="page-header">
      <div class="crontab-toolbar">
        <div class="action-buttons">
          <el-button type="primary" @click="handleAdd">添加任务</el-button>
        </div>
        <el-form class="search-box" :inline="true" :model="searchForm">
          <el-form-item>
            <el-input v-model="searchForm.title" placeholder="请输入任务名称" style="margin-right: 12px">
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
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="lists" style="width: 100%" stripe>
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="title" label="任务名称" min-width="150" />
            <el-table-column prop="description" label="任务描述" min-width="200" />
            <el-table-column prop="execute" label="执行命令" min-width="200" />
            <el-table-column prop="cycle_str" label="执行周期" width="120" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <div style="cursor: pointer; padding: 5px 0">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @click.stop
                    @change="() => handleToggleStatus(scope.row)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="update_time_str" label="更新时间" width="180" align="center" />
            <el-table-column label="操作" width="160" align="right" fixed="right">
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
        @current-change="handleCurrentChange"
      />
    </div>

    <CrontabDrawer v-model:visible="drawerVisible" :edit-data="editData" @success="handleDrawerSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SafeIcon from '@/components/SafeIcon.vue';
import CrontabDrawer from './CrontabDrawer.vue';
import { getCrontabList, updateCrontabStatus, type CrontabItem } from '@/api';

const page = ref(1);
const rows = ref(20);
const total = ref(0);
const loading = ref(false);
const lists = ref<CrontabItem[]>([]);
const searchForm = ref({
  title: '',
  status: ''
});

const drawerVisible = ref(false);
const editData = ref<CrontabItem | null>(null);

// 获取任务列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getCrontabList({
      page: page.value,
      rows: rows.value,
      title: searchForm.value.title,
      status: searchForm.value.status
    });
    if (res.code === 200) {
      lists.value = res.data.data;
      total.value = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取任务列表失败');
    }
  } catch (error) {
    ElMessage.error('获取任务列表失败');
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
    title: '',
    status: ''
  };
  page.value = 1;
  getList();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  rows.value = size;
  getList();
};

// 当前页码变化
const handleCurrentChange = (current: number) => {
  page.value = current;
  getList();
};

// 添加任务
const handleAdd = () => {
  editData.value = null;
  drawerVisible.value = true;
};

// 编辑任务
const handleEdit = (row: CrontabItem) => {
  editData.value = row;
  drawerVisible.value = true;
};

// 抽屉操作成功
const handleDrawerSuccess = () => {
  getList();
};

// 删除任务
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateCrontabStatus({
          ids: id,
          status: -1
        });

        if (res.code === 200) {
          ElMessage.success('任务删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '任务删除失败');
        }
      } catch (error) {
        ElMessage.error('任务删除失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 状态切换
const handleToggleStatus = async (row: CrontabItem) => {
  // 保存原始状态（用于失败时恢复）
  const originalStatus = row.status === 1 ? 0 : 1;

  try {
    const res = await updateCrontabStatus({
      ids: [row.id],
      status: row.status
    });

    if (res.code === 200) {
      ElMessage.success(row.status === 1 ? '已启用' : '已禁用');
    } else {
      ElMessage.error(res.msg || '状态修改失败');
      // 恢复原状态
      row.status = originalStatus;
    }
  } catch (error) {
    console.error('状态修改失败:', error);
    ElMessage.error('状态修改失败');
    // 恢复原状态
    row.status = originalStatus;
  }
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

    .crontab-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .action-buttons {
        display: flex;
        gap: 12px;
      }

      .search-box {
        display: flex;
        align-items: center;

        .el-form-item {
          margin-bottom: 0;
          margin-right: 0;
        }
      }
    }
  }

  .page-content {
    border-radius: 6px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .table-container {
      margin-bottom: 20px;
    }
  }
}
</style>
