<template>
  <div class="page-container">
    <div class="page-header">
      <div class="comment-toolbar">
        <div class="toolbar-left">
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
            placeholder="搜索评论内容或用户"
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
        <div class="comment-container">
          <el-table :data="commentList" style="width: 100%" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="评论内容" min-width="350">
              <template #default="{ row }">
                <div class="comment-content">
                  <div class="comment-text">{{ row.content }}</div>
                  <div class="comment-meta">
                    <span class="comment-user">{{
                      row.user_info?.nickname || row.user_info?.username || '未知用户'
                    }}</span>
                    <span class="comment-time">{{ row.create_time_str }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="所属文章" min-width="200">
              <template #default="{ row }">
                <div class="article-info">
                  <el-image
                    v-if="row.article?.cover_200"
                    :src="row.article?.cover_200"
                    fit="cover"
                    class="article-cover"
                  />
                  <div class="article-title">{{ row.article?.title || '-' }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status_str }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="点赞数" width="80" align="center">
              <template #default="{ row }">
                <span class="support-count">{{ row.support || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right" align="right">
              <template #default="{ row }">
                <el-button v-if="row.status === -1" type="primary" size="small" @click="handleAudit(row)">
                  <safe-icon icon="fas check-circle" />
                  审核
                </el-button>
                <el-button
                  v-if="row.status === 1 || row.status === 0"
                  :type="row.status === 1 ? 'warning' : 'success'"
                  size="small"
                  @click="handleToggleStatus(row)"
                >
                  <safe-icon :icon="row.status === 1 ? 'fas ban' : 'fas check'" />
                  {{ row.status === 1 ? '禁用' : '启用' }}
                </el-button>
                <el-button type="info" size="small" @click="handleViewDetail(row)">
                  <safe-icon icon="fas eye" />
                  详情
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <safe-icon icon="fas trash" />
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!loading && commentList.length === 0" class="empty-state">
            <el-empty description="暂无评论数据" />
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

    <el-dialog v-model="detailVisible" title="评论详情" width="600px" @close="handleCloseDetail">
      <div v-if="currentComment" class="comment-detail">
        <div class="detail-section">
          <div class="detail-label">评论内容：</div>
          <div class="detail-content">{{ currentComment.content }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">评论用户：</div>
          <div class="detail-content">
            {{ currentComment.user_info?.nickname || currentComment.user_info?.username || '未知用户' }}
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-label">所属文章：</div>
          <div class="detail-content">{{ currentComment.article?.title || '-' }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">评论状态：</div>
          <div class="detail-content">
            <el-tag :type="getStatusType(currentComment.status)" size="small">
              {{ currentComment.status_str }}
            </el-tag>
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-label">点赞数：</div>
          <div class="detail-content">{{ currentComment.support || 0 }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">创建时间：</div>
          <div class="detail-content">{{ currentComment.create_time_str }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditVisible" title="审核评论" width="500px" @close="handleCloseAudit">
      <div class="audit-form">
        <div class="form-item">
          <div class="form-label">审核结果：</div>
          <el-radio-group v-model="auditForm.status">
            <el-radio :value="1">审核通过</el-radio>
            <el-radio :value="-2">审核未通过</el-radio>
          </el-radio-group>
        </div>
        <div v-if="auditForm.status === -2" class="form-item">
          <div class="form-label">未通过原因：</div>
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入未通过的原因"
            maxlength="200"
            show-word-limit
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseAudit">取消</el-button>
        <el-button
          type="primary"
          :disabled="auditForm.status === -2 && !auditForm.reason.trim()"
          @click="handleConfirmAudit"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { request } from '@/utils/modules/request';

const loading = ref(false);
const commentList = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const detailVisible = ref(false);
const currentComment = ref<any>(null);
const auditVisible = ref(false);
const auditForm = ref({
  status: 1,
  reason: ''
});
const currentAuditComment = ref<any>(null);

// 批量操作
const selectedRows = ref<any[]>([]);

const getCommentList = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/comment/lists',
      method: 'GET',
      data: {
        page: currentPage.value,
        rows: pageSize.value,
        keyword: searchKeyword.value
      }
    });
    if (response.code === 200) {
      commentList.value = response.data?.data || [];
      total.value = response.data?.total || 0;
    } else {
      ElMessage.error(response.msg || '获取评论列表失败');
    }
  } catch (error) {
    console.error('获取评论列表失败:', error);
    ElMessage.error('获取评论列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  getCommentList();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  getCommentList();
};

const handleCurrentChange = () => {
  getCommentList();
};

const handleAudit = (row: any) => {
  currentAuditComment.value = row;
  auditForm.value = {
    status: 1,
    reason: ''
  };
  auditVisible.value = true;
};

const handleCloseAudit = () => {
  auditVisible.value = false;
  currentAuditComment.value = null;
  auditForm.value = {
    status: 1,
    reason: ''
  };
};

const handleConfirmAudit = async () => {
  if (!currentAuditComment.value) return;

  try {
    const data: any = {
      ids: currentAuditComment.value.id,
      status: auditForm.value.status
    };

    if (auditForm.value.status === -2) {
      data.reason = auditForm.value.reason;
    }

    const response = await request({
      url: 'articles/admin/comment/status',
      method: 'POST',
      data
    });

    if (response.code === 200) {
      ElMessage.success(auditForm.value.status === 1 ? '审核通过成功' : '审核未通过成功');
      auditVisible.value = false;
      getCommentList();
    } else {
      ElMessage.error(response.msg || '审核失败');
    }
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('审核失败');
  }
};

const handleViewDetail = (row: any) => {
  currentComment.value = row;
  detailVisible.value = true;
};

const handleCloseDetail = () => {
  detailVisible.value = false;
  currentComment.value = null;
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除这条评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await request({
      url: 'articles/admin/comment/status',
      method: 'POST',
      data: { ids: row.id, status: -3 }
    });

    if (response.code === 200) {
      ElMessage.success('删除成功');
      getCommentList();
    } else {
      ElMessage.error(response.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const actionText = newStatus === 1 ? '启用' : '禁用';

  try {
    await ElMessageBox.confirm(`确定要${actionText}这条评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: newStatus === 0 ? 'success' : 'warning'
    });

    const response = await request({
      url: 'articles/admin/comment/status',
      method: 'POST',
      data: { ids: row.id, status: newStatus }
    });

    if (response.code === 200) {
      ElMessage.success(`${actionText}成功`);
      getCommentList();
    } else {
      ElMessage.error(response.msg || `${actionText}失败`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${actionText}失败:`, error);
      ElMessage.error(`${actionText}失败`);
    }
  }
};

const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'warning';
    case 1:
      return 'success';
    case -1:
      return 'danger';
    case -2:
      return 'danger';
    case -3:
      return 'danger';
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
    ElMessage.warning('请先选择要操作的评论');
    return;
  }

  ElMessageBox.confirm(`确定要批量启用选中的 ${selectedRows.value.length} 条评论吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(item => item.id).join(',');
        const res = await request({
          url: 'articles/admin/comment/status',
          method: 'POST',
          data: {
            ids,
            status: 1
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量启用成功');
          getCommentList();
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
    ElMessage.warning('请先选择要操作的评论');
    return;
  }

  ElMessageBox.confirm(`确定要批量禁用选中的 ${selectedRows.value.length} 条评论吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(item => item.id).join(',');
        const res = await request({
          url: 'articles/admin/comment/status',
          method: 'POST',
          data: {
            ids,
            status: 0
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量禁用成功');
          getCommentList();
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
    ElMessage.warning('请先选择要操作的评论');
    return;
  }

  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 条评论吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(item => item.id).join(',');
        const res = await request({
          url: 'articles/admin/comment/status',
          method: 'POST',
          data: {
            ids,
            status: -3
          }
        });
        if (res.code === 200) {
          ElMessage.success('批量删除成功');
          getCommentList();
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
  getCommentList();
});
</script>

<style lang="scss" scoped>
.page-header {
  padding: 16px 24px;

  .comment-toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  .toolbar-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filter-wrapper {
    display: flex;
    align-items: center;
  }

  .filter-select {
    width: 150px;
  }

  .search-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input {
    width: 300px;
  }
}

.page-content {
  padding: 10px;
}

.comment-container {
  height: 100%;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-text {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.comment-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.comment-user {
  color: #409eff;
  font-weight: 500;
}

.comment-time {
  color: #909399;
}

.article-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.article-title {
  flex: 1;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.support-count {
  font-weight: 500;
  color: #606266;
}

.empty-state {
  padding: 60px 0;
}

.comment-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.detail-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
}

.audit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}
</style>
