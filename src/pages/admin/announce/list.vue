<template>
  <div class="page-container">
    <div class="page-header">
      <div class="announce-toolbar">
        <div class="header-active">
          <el-button type="primary" @click="handleAdd">添加公告</el-button>
          <el-button type="success" :disabled="selectedIds.length === 0" @click="batchEnable">批量启用</el-button>
          <el-button type="warning" :disabled="selectedIds.length === 0" @click="batchDisable">批量禁用</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchDelete">批量删除</el-button>
        </div>
        <div class="search-form">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入标题"
                clearable
                style="width: 300px; margin-right: 12px"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <safe-icon icon="fa fa-search" />
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
          <el-table :data="list" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="scope">
                <div style="display: flex; align-items: center; gap: 8px">
                  <span>{{ scope.row.title }}</span>
                  <el-tag :type="scope.row.type === 1 ? 'success' : 'info'" size="small">
                    {{ scope.row.type_str }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <div style="cursor: pointer; padding: 5px 0">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @click.stop
                    @change="() => handleStatusChange(scope.row)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="create_time_str" label="创建时间" width="180" />
            <el-table-column prop="update_time_str" label="更新时间" width="180" />
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
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[15, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <!-- 添加/编辑公告抽屉 -->
    <el-drawer v-model="editDrawer" title="公告编辑" :with-header="false" size="800px">
      <announce-edit :announce="selectedAnnounce" @close="editDrawer = false" @success="handleEditSuccess" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import AnnounceEdit from './components/edit.vue';

interface AnnounceInfo {
  id?: number;
  title: string;
  content: string;
  status: number;
  sort: number;
  teminal: string;
  type: number;
  type_str: string;
  cover?: string;
  cover_200?: string;
  create_time?: string;
  create_time_str?: string;
}

const list = ref<AnnounceInfo[]>([]);
const loading = ref(false);
const page = ref<number>(1);
const pageSize = ref<number>(15);
const total = ref<number>(0);
const searchForm = ref({
  keyword: '',
  status: ''
});
const selectedIds = ref<number[]>([]);

const editDrawer = ref(false);
const selectedAnnounce = ref<AnnounceInfo>({} as AnnounceInfo);

// 获取公告列表
const getList = async () => {
  loading.value = true;
  try {
    let data: Record<string, any> = {
      page: page.value,
      rows: pageSize.value,
      keyword: searchForm.value.keyword
    };

    if (searchForm.value.status !== '') {
      data.status = searchForm.value.status;
    }

    const res = await request({
      url: 'admin/announce/list',
      data: data,
      method: 'GET'
    });

    if (res.code === 200) {
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
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
    keyword: '',
    status: ''
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
  selectedAnnounce.value = {} as AnnounceInfo;
  editDrawer.value = true;
};

const handleEdit = (item: AnnounceInfo) => {
  selectedAnnounce.value = { ...item };
  editDrawer.value = true;
};

const handleEditSuccess = () => {
  getList();
};

// 切换状态
const handleStatusChange = async (item: AnnounceInfo) => {
  // 保存原始状态（用于失败时恢复）
  const originalStatus = item.status === 1 ? 0 : 1;

  try {
    const res = await request({
      url: 'admin/announce/status',
      method: 'POST',
      data: {
        ids: [item.id],
        status: item.status
      }
    });

    if (res.code === 200) {
      //ElMessage.success(item.status === 1 ? '已启用' : '已禁用');
    } else {
      ElMessage.error(res.msg || '状态修改失败');
      // 恢复原状态
      item.status = originalStatus;
    }
  } catch (error) {
    console.error('状态修改失败:', error);
    ElMessage.error('状态修改失败');
    // 恢复原状态
    item.status = originalStatus;
  }
};

// 处理表格选择变化
const handleSelectionChange = (selection: AnnounceInfo[]) => {
  selectedIds.value = selection.map(item => item.id!).filter(id => id !== undefined);
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
        const res = await request({
          url: 'admin/announce/status',
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
        const res = await request({
          url: 'admin/announce/status',
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
        const res = await request({
          url: 'admin/announce/status',
          method: 'POST',
          data: {
            ids: selectedIds.value,
            status: -1
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
    .catch(() => {
      // 取消操作
    });
};

const handleDelete = (item: AnnounceInfo) => {
  ElMessageBox.confirm(`确定要删除公告 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/announce/status',
          method: 'POST',
          data: {
            ids: item.id,
            status: -1
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
.announce-toolbar {
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
  padding: 10px;
  background-color: var(--el-color-white);
}

.table-container {
  border-radius: 6px;
  overflow: hidden;
}
</style>
