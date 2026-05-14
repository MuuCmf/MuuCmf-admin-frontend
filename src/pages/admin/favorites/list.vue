<template>
  <div class="page-container">
    <div class="page-header">
      <div class="favorites-toolbar">
        <div class="header-active">
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
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="用户信息" min-width="180">
              <template #default="scope">
                <div class="user-info-cell">
                  <el-avatar
                    :size="40"
                    :src="scope.row.user_info?.avatar64 || ''"
                    :alt="scope.row.user_info?.nickname || '-'"
                  >
                    {{ (scope.row.user_info?.nickname || '匿').charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="user-nickname">{{ scope.row.user_info?.nickname || '-' }}</div>
                    <div class="user-username">{{ scope.row.user_info?.username || '-' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="模块" width="100">
              <template #default="scope">
                {{ scope.row.app_info?.alias || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="内容信息" min-width="280">
              <template #default="scope">
                <div class="content-info-cell">
                  <el-image
                    v-if="scope.row.products?.cover_200 || scope.row.metadata?.cover_200"
                    :src="scope.row.products?.cover_200 || scope.row.metadata?.cover_200"
                    fit="cover"
                    class="content-cover"
                  />
                  <div class="content-info">
                    <div class="content-title">
                      {{ scope.row.products?.title || scope.row.metadata?.title || '-' }}
                    </div>
                    <div class="content-desc">
                      {{ scope.row.products?.desc || scope.row.metadata?.desc || '-' }}
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="create_time_friendly_str" label="收藏时间" width="140" />
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SafeIcon from '@/components/SafeIcon.vue';
import { useScrollReset } from '@/composables/useScrollReset';
import { getFavoritesList, updateFavoritesStatus, type FavoritesItem } from '@/api/admin/favorites';

// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

const page = ref(1);
const rows = ref(20);
const total = ref(0);
const loading = ref(false);
const lists = ref<FavoritesItem[]>([]);
const searchForm = ref({
  keyword: ''
});
const selectedIds = ref<number[]>([]);

const getList = async () => {
  loading.value = true;
  try {
    const res = await getFavoritesList({
      page: page.value,
      rows: rows.value,
      keyword: searchForm.value.keyword
    });
    if (res.code === 200) {
      lists.value = res.data.data || [];
      total.value = res.data.total;
      resetScrollTop();
    } else {
      ElMessage.error(res.msg || '获取收藏记录列表失败');
    }
  } catch (error) {
    ElMessage.error('获取收藏记录列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  getList();
};

const resetForm = () => {
  searchForm.value = {
    keyword: ''
  };
  page.value = 1;
  getList();
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这条收藏记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateFavoritesStatus({
          ids: [id],
          status: -1
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '删除失败');
        }
      } catch (error) {
        ElMessage.error('删除失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleSelectionChange = (selection: FavoritesItem[]) => {
  selectedIds.value = selection.map(item => item.id);
};

const batchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateFavoritesStatus({
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
    .catch(() => {});
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
.favorites-toolbar {
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
}

.table-container {
  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .user-nickname {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-username {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .content-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .content-cover {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .content-info {
      flex: 1;
      min-width: 0;

      .content-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .content-desc {
        font-size: 12px;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .content-cover {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
  }
}
</style>
