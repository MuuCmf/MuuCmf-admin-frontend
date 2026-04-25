<template>
  <el-drawer
    :model-value="visible"
    title="文章评论"
    direction="rtl"
    size="600px"
    @update:model-value="handleVisibleUpdate"
  >
    <div v-loading="loading" class="comments-container">
      <div v-if="commentList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无评论" />
      </div>
      <div v-else class="comments-list">
        <div v-for="comment in commentList" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-user">
              <el-avatar :size="32" :src="comment.user_avatar" />
              <span class="user-name">{{ comment.user_name || '匿名用户' }}</span>
            </div>
            <div class="comment-time">{{ comment.create_time_str || comment.create_time }}</div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-footer">
            <el-tag v-if="comment.status === 1" type="success" size="small">启用</el-tag>
            <el-tag v-if="comment.status === 0" type="success" size="small">禁用</el-tag>
            <el-tag v-if="comment.status === -1" type="warning" size="small">待审核</el-tag>
            <el-tag v-if="comment.status === -2" type="danger" size="small">审核未通过</el-tag>
            <el-button v-if="comment.status === -1" type="primary" size="small" link @click="handleApprove(comment)">
              通过
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(comment)"> 删除 </el-button>
          </div>
        </div>
      </div>
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { request } from '@/utils/modules/request';

// Props
const props = defineProps<{
  visible: boolean;
  articleId: number;
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// 加载状态
const loading = ref(false);

// 评论列表数据
const commentList = ref<any[]>([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取评论列表
const getCommentList = async () => {
  if (!props.articleId) return;

  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/comment/lists',
      method: 'GET',
      data: {
        article_id: props.articleId,
        page: currentPage.value,
        limit: pageSize.value
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

// 审核通过
const handleApprove = async (comment: any) => {
  ElMessageBox.confirm(`确定要通过这条评论吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'articles/admin/comment/status',
          method: 'POST',
          data: {
            ids: comment.id,
            status: 1
          }
        });
        if (res.code === 200) {
          ElMessage.success('审核通过');
          getCommentList();
        } else {
          ElMessage.error(res.msg || '操作失败');
        }
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('操作失败');
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 删除评论
const handleDelete = async (comment: any) => {
  ElMessageBox.confirm(`确定要删除这条评论吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'articles/admin/comment/status',
          method: 'POST',
          data: {
            ids: comment.id,
            status: -3
          }
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getCommentList();
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

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getCommentList();
};

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getCommentList();
};

// 处理抽屉可见性更新
const handleVisibleUpdate = (value: boolean) => {
  emit('update:visible', value);
};

// 监听 articleId 变化
watch(
  () => props.articleId,
  newId => {
    if (newId && props.visible) {
      currentPage.value = 1;
      getCommentList();
    }
  },
  { immediate: true }
);

// 监听 visible 变化
watch(
  () => props.visible,
  newVisible => {
    if (newVisible && props.articleId) {
      currentPage.value = 1;
      getCommentList();
    }
  }
);
</script>

<style lang="scss" scoped>
.comments-container {
  padding: 16px 24px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    background-color: #f0f2f5;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  word-break: break-all;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.dark) {
  .comment-item {
    background-color: #2d2d2d;

    &:hover {
      background-color: #3d3d3d;
    }
  }

  .user-name {
    color: #e5e7eb;
  }

  .comment-time {
    color: #9ca3af;
  }

  .comment-content {
    color: #d1d5db;
  }
}
</style>
