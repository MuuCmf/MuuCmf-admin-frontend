<template>
  <div class="page-container">
    <div class="page-header">
      <div class="tominiprogram-toolbar">
        <div class="header-active">
          <el-button type="primary" @click="handleAdd">添加跳转小程序</el-button>
          <el-button type="success" :disabled="selectedIds.length === 0" @click="batchEnable">批量启用</el-button>
          <el-button type="warning" :disabled="selectedIds.length === 0" @click="batchDisable">批量禁用</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchDelete">批量删除</el-button>
        </div>
        <div class="search-form">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入小程序名称"
                clearable
                style="width: 300px; margin-right: 12px"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <safe-icon icon="fas search" />
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
      <div ref="scrollContainerRef" class="with-container">
        <div class="table-container">
          <el-table :data="list" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="小程序名称" min-width="200" />
            <el-table-column prop="appid" label="AppID" width="180" />
            <el-table-column prop="type_str" label="类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <div style="cursor: pointer; padding: 5px 0">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    :before-change="() => handleStatusChange(scope.row)"
                    @click.stop
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="create_time_str" label="创建时间" width="180" />
            <el-table-column label="操作" width="180" align="right" fixed="right">
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
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-drawer v-model="editDrawer" title="跳转小程序编辑" :with-header="false" size="600px">
      <tominiprogram-edit
        :tominiprogram="selectedTominiprogram"
        @close="editDrawer = false"
        @success="handleEditSuccess"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import TominiprogramEdit from './components/edit.vue';
import { useScrollReset } from '@/composables/useScrollReset';

interface TominiprogramInfo {
  id?: number;
  title: string;
  appid: string;
  type: string;
  qrcode: string;
  qrcode_url: string;
  sort: number;
  status: number;
  create_time?: string;
  create_time_str?: string;
}

// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

const list = ref<TominiprogramInfo[]>([]);
const loading = ref(false);
const page = ref<number>(1);
const pageSize = ref<number>(10);
const total = ref<number>(0);
const searchForm = ref({
  keyword: ''
});
const selectedIds = ref<number[]>([]);

const editDrawer = ref(false);
const selectedTominiprogram = ref<TominiprogramInfo>({} as TominiprogramInfo);

const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/tominiprogram/list',
      method: 'GET',
      data: {
        page: page.value,
        rows: pageSize.value,
        keyword: searchForm.value.keyword
      }
    });

    if (res.code === 200) {
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
      // 重置滚动位置
      resetScrollTop();
    }
  } catch (error) {
    console.error('获取跳转小程序列表失败:', error);
    ElMessage.error('获取跳转小程序列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  getList();
};

const handleReset = () => {
  searchForm.value = {
    keyword: ''
  };
  page.value = 1;
  getList();
};

const handleSizeChange = () => {
  page.value = 1;
  getList();
};

const handlePageChange = () => {
  getList();
};

const handleAdd = () => {
  selectedTominiprogram.value = {} as TominiprogramInfo;
  editDrawer.value = true;
};

const handleEdit = (item: TominiprogramInfo) => {
  selectedTominiprogram.value = { ...item };
  editDrawer.value = true;
};

const handleEditSuccess = () => {
  getList();
};

const handleStatusChange = async (item: TominiprogramInfo) => {
  const newStatus = item.status === 1 ? 0 : 1;

  try {
    const res = await request({
      url: 'admin/tominiprogram/status',
      method: 'POST',
      data: {
        ids: [item.id],
        status: newStatus
      }
    });

    if (res.code === 200) {
      ElMessage.success(newStatus === 1 ? '已启用' : '已禁用');
      return true;
    } else {
      ElMessage.error(res.msg || '状态修改失败');
      return false;
    }
  } catch (error) {
    console.error('状态修改失败:', error);
    ElMessage.error('状态修改失败');
    return false;
  }
};

const handleSelectionChange = (selection: TominiprogramInfo[]) => {
  selectedIds.value = selection.map(item => item.id!).filter(id => id !== undefined);
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
          url: 'admin/tominiprogram/status',
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
          url: 'admin/tominiprogram/status',
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
          url: 'admin/tominiprogram/delete',
          method: 'POST',
          data: {
            ids: selectedIds.value
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量删除成功');
          selectedIds.value = [];
          if (list.value.length === selectedIds.value.length && page.value > 1) {
            page.value--;
          }
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

const handleDelete = (item: TominiprogramInfo) => {
  ElMessageBox.confirm(`确定要删除跳转小程序 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/tominiprogram/delete',
          method: 'POST',
          data: {
            ids: item.id
          }
        });

        if (res.code === 200) {
          ElMessage.success('删除成功');
          if (list.value.length === 1 && page.value > 1) {
            page.value--;
          }
          getList();
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.tominiprogram-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.header-active {
  display: flex;
  gap: 10px;
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
    margin-right: 0;
  }
}

.page-content {
  padding: 20px;
  background-color: var(--el-color-white);
}

.table-container {
  border-radius: 6px;
  overflow: hidden;
}
</style>
