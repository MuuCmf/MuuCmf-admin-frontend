<template>
  <div class="page-container">
    <div class="page-header">
      <div class="article-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" class="primary-btn" @click="handleAdd">
            <safe-icon icon="fas plus" />
            新增文章
          </el-button>
          <el-button type="success" :disabled="selectedRows.length === 0" @click="handleBatchEnable">
            <safe-icon icon="fas check" />
            批量启用
          </el-button>
          <el-button type="warning" :disabled="selectedRows.length === 0" @click="handleBatchDisable">
            <safe-icon icon="fas ban" />
            批量禁用
          </el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            <safe-icon icon="fas trash" />
            批量删除
          </el-button>
        </div>
        <div class="search-wrapper">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入文章标题搜索"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <safe-icon icon="fas search" />
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="article-container">
          <el-table :data="articleList" style="width: 100%" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="文章信息" min-width="300">
              <template #default="{ row }">
                <div class="article-info">
                  <el-image v-if="row.cover_200" :src="row.cover_200" fit="cover" class="article-cover" />
                  <div class="article-content">
                    <div class="article-title">{{ row.title }}</div>
                    <div class="article-description">{{ row.description || '-' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="分类" width="120">
              <template #default="{ row }">
                {{ row.category?.title || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status_str }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="create_time_str" label="创建时间" width="160" />
            <el-table-column prop="update_time_str" label="更新时间" width="160" />
            <el-table-column label="操作" width="320" fixed="right" align="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">
                  <safe-icon icon="fas edit" />
                  编辑
                </el-button>
                <el-button
                  :type="row.status === 1 ? 'warning' : 'success'"
                  size="small"
                  @click="handleToggleStatus(row)"
                >
                  <safe-icon :icon="row.status === 1 ? 'fas ban' : 'fas check'" />
                  {{ row.status === 1 ? '禁用' : '启用' }}
                </el-button>
                <el-button type="info" size="small" @click="handleViewComments(row)">
                  <safe-icon icon="fas comments" />
                  评论
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <safe-icon icon="fas trash" />
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!loading && articleList.length === 0" class="empty-state">
            <el-empty description="暂无文章数据" />
          </div>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        class="pagination"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 新增/编辑文章抽屉组件 -->
    <ArticleEditDrawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
      :category-list="categoryList"
      :initial-data="drawerInitialData"
      @success="handleDrawerSuccess"
      @close="handleDrawerClose"
    />
    <!-- 文章评论抽屉组件 -->
    <ArticleComments v-model:visible="commentsVisible" :article-id="currentArticleId" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { request } from '@/utils/modules/request';
import ArticleEditDrawer from './components/ArticleEditDrawer.vue';
import ArticleComments from './components/ArticleComments.vue';

// 加载状态
const loading = ref(false);

// 文章列表数据
const articleList = ref<any[]>([]);

// 分类列表数据
const categoryList = ref<any[]>([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索相关
const searchKeyword = ref('');

// 新增/编辑抽屉
const drawerVisible = ref(false);
const drawerTitle = ref('新增文章');
const drawerInitialData = ref<any>(null);

// 评论抽屉
const commentsVisible = ref(false);
const currentArticleId = ref(0);

// 批量操作
const selectedRows = ref<any[]>([]);

// 获取文章列表
const getArticleList = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/articles/lists',
      method: 'GET',
      data: {
        page: currentPage.value,
        rows: pageSize.value,
        keyword: searchKeyword.value
      }
    });
    if (response.code === 200) {
      articleList.value = response.data?.data || [];
      total.value = response.data?.total || 0;
    } else {
      ElMessage.error(response.msg || '获取文章列表失败');
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ElMessage.error('获取文章列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const getCategoryList = async () => {
  try {
    const response = await request({
      url: 'articles/api/category/tree',
      method: 'GET',
      data: {}
    });
    if (response.code === 200) {
      categoryList.value = response.data || [];
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 新增文章
const handleAdd = () => {
  drawerTitle.value = '新增文章';
  drawerInitialData.value = {
    id: 0,
    title: '',
    description: '',
    cover: '',
    cover_100: '',
    cover_200: '',
    cover_400: '',
    category_id: 0,
    content: '',
    status: 1,
    sort: 0,
    view: 0,
    f_view: 0,
    f_support: 0,
    f_favorites: 0,
    reason: ''
  };
  drawerVisible.value = true;
};

// 编辑文章
const handleEdit = (item: any) => {
  drawerTitle.value = '编辑文章';
  drawerInitialData.value = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    cover: item.cover || '',
    cover_100: item.cover_100 || '',
    cover_200: item.cover_200 || '',
    cover_400: item.cover_400 || '',
    category_id: item.category_id || 0,
    content: item.content || '',
    status: item.status,
    sort: item.sort || 0,
    view: item.view || 0,
    f_view: item.f_view || 0,
    f_support: item.f_support || 0,
    f_favorites: item.f_favorites || 0,
    reason: item.reason || ''
  };
  drawerVisible.value = true;
};

// 删除文章
const handleDelete = (item: any) => {
  ElMessageBox.confirm(`确定要删除文章 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'articles/admin/articles/status',
          method: 'POST',
          data: {
            ids: item.id,
            status: -3
          }
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getArticleList();
        } else {
          ElMessage.error(res.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 切换文章状态
const handleToggleStatus = (item: any) => {
  const newStatus = item.status === 1 ? 0 : 1;
  const statusText = newStatus === 1 ? '启用' : '禁用';

  ElMessageBox.confirm(`确定要${statusText}文章 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'articles/admin/articles/status',
          method: 'POST',
          data: {
            ids: item.id,
            status: newStatus
          }
        });
        if (res.code === 200) {
          ElMessage.success(`${statusText}成功`);
          getArticleList();
        } else {
          ElMessage.error(res.msg || `${statusText}失败`);
        }
      } catch (error) {
        console.error(`${statusText}失败:`, error);
        ElMessage.error(`${statusText}失败`);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 抽屉操作成功回调
const handleDrawerSuccess = () => {
  getArticleList();
};

// 关闭抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false;
  drawerInitialData.value = null;
};

// 查看评论
const handleViewComments = (item: any) => {
  currentArticleId.value = item.id;
  commentsVisible.value = true;
};

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getArticleList();
};

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getArticleList();
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getArticleList();
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success';
    case 0:
      return 'danger';
    case -1:
      return 'info';
    case -2:
      return 'warning';
    default:
      return 'info';
  }
};

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
};

// 批量启用
const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的文章');
    return;
  }

  ElMessageBox.confirm(`确定要批量启用选中的 ${selectedRows.value.length} 篇文章吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(item => item.id).join(',');
        const res = await request({
          url: 'articles/admin/articles/status',
          method: 'POST',
          data: {
            ids,
            status: 1
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量启用成功');
          getArticleList();
        } else {
          ElMessage.error(res.msg || '批量启用失败');
        }
      } catch (error) {
        console.error('批量启用失败:', error);
        ElMessage.error('批量启用失败');
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 批量禁用
const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的文章');
    return;
  }

  ElMessageBox.confirm(`确定要批量禁用选中的 ${selectedRows.value.length} 篇文章吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(item => item.id).join(',');
        const res = await request({
          url: 'articles/admin/articles/status',
          method: 'POST',
          data: {
            ids,
            status: 0
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量禁用成功');
          getArticleList();
        } else {
          ElMessage.error(res.msg || '批量禁用失败');
        }
      } catch (error) {
        console.error('批量禁用失败:', error);
        ElMessage.error('批量禁用失败');
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的文章');
    return;
  }

  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 篇文章吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(item => item.id).join(',');
        const res = await request({
          url: 'articles/admin/articles/status',
          method: 'POST',
          data: {
            ids,
            status: -3
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量删除成功');
          getArticleList();
        } else {
          ElMessage.error(res.msg || '批量删除失败');
        }
      } catch (error) {
        console.error('批量删除失败:', error);
        ElMessage.error('批量删除失败');
      }
    })
    .catch(() => {
      // 取消操作
    });
};

onMounted(() => {
  getArticleList();
  getCategoryList();
});
</script>

<style lang="scss" scoped>
.page-header {
  background-color: var(--el-color-white);

  .article-toolbar {
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-wrapper {
      display: flex;
      gap: 12px;
      align-items: center;

      .search-input {
        width: 300px;
      }
    }
  }
}

.page-content {
  background-color: var(--el-color-white);
  border-radius: 6px;
  padding: 10px;

  .article-container {
    overflow: hidden;

    .article-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .article-cover {
        width: 80px;
        height: 60px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .article-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow: hidden;

        .article-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: bold;
          color: #000;
        }

        .article-description {
          font-size: 12px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .empty-state {
    padding: 80px 20px;
    text-align: center;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 16px;

    :deep(.el-empty) {
      --el-empty-description-margin-top: 16px;
    }
  }
}

.no-cover {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
}

html.dark {
  .page-content {
    .article-container {
      .article-info {
        .article-cover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .article-content {
          .article-title {
            color: #e5e7eb;

            &:hover {
              color: #409eff;
            }
          }

          .article-description {
            color: #9ca3af;
          }
        }
      }
    }

    .empty-state {
      background: #1e1e1e;
      border: 1px solid #363637;
    }
  }

  .no-cover {
    background-color: #2d2d2d;
    color: #9ca3af;
  }

  .no-cover-small {
    background-color: #2d2d2d;
    color: #9ca3af;
  }
}
</style>
