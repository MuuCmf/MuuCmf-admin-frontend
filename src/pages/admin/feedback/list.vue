<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="feedback-toolbar">
        <!-- 搜索筛选区域 -->
        <div class="search-filter">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item>
              <el-input v-model="searchForm.keyword" placeholder="请输入搜索关键字" clearable style="width: 300px">
                <template #prefix>
                  <safe-icon icon="fas search" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.type" placeholder="请选择反馈类型" clearable style="width: 150px">
                <el-option label="功能建议" value="suggestion" />
                <el-option label="问题反馈" value="bug" />
                <el-option label="其它" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.status" placeholder="请选择处理状态" clearable style="width: 120px">
                <el-option label="待处理" :value="0" />
                <el-option label="处理中" :value="1" />
                <el-option label="已完成" :value="2" />
              </el-select>
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
        <!-- 反馈列表表格 -->
        <div class="table-container">
          <el-table :data="list" stripe>
            <!-- 用户信息 -->
            <el-table-column label="用户信息" min-width="180">
              <template #default="scope">
                <div class="user-info">
                  <el-avatar
                    :size="36"
                    :src="scope.row.user_info?.avatar || scope.row.user_info?.avatar64 || ''"
                    :alt="scope.row.user_info?.nickname"
                  >
                    {{ (scope.row.user_info?.nickname || '匿').charAt(0) }}
                  </el-avatar>
                  <div class="user-detail">
                    <span class="user-name">{{ scope.row.user_info?.nickname || '匿名用户' }}</span>
                    <span class="user-contact">{{ scope.row.user_info?.username || '-' }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 反馈类型 -->
            <el-table-column label="反馈类型" width="100">
              <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.type)">
                  {{ getTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 反馈内容 -->
            <el-table-column label="反馈内容" min-width="250">
              <template #default="scope">
                <div class="feedback-content">
                  <span class="content-text">{{ scope.row.content || '-' }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 附件 -->
            <el-table-column label="附件" width="100">
              <template #default="scope">
                <el-image
                  v-if="scope.row.images && scope.row.images.length > 0"
                  style="width: 40px; height: 40px; border-radius: 4px"
                  :src="scope.row.images[0]"
                  fit="cover"
                  :preview-src-list="scope.row.images"
                  preview-teleported
                />
                <span v-else>-</span>
              </template>
            </el-table-column>

            <!-- 处理状态 -->
            <el-table-column label="处理状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 提交时间 -->
            <el-table-column label="提交时间" width="180">
              <template #default="scope">
                <span>{{ scope.row.create_time_str }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="240" fixed="right" align="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">查看详情</el-button>
                <el-dropdown @command="(cmd: string) => handleStatusChange(cmd, scope.row)">
                  <el-button size="small" style="margin-left: 5px">
                    状态<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="0">待处理</el-dropdown-item>
                      <el-dropdown-item command="1">处理中</el-dropdown-item>
                      <el-dropdown-item command="2">已完成</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button size="small" type="danger" style="margin-left: 5px" @click="handleDelete(scope.row.id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="page-footer">
      <el-pagination
        v-if="total > 0"
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

    <!-- 反馈详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="反馈详情" width="800px">
      <div v-if="currentFeedback" class="feedback-detail">
        <div class="detail-header">
          <div class="detail-meta">
            <span class="meta-item"> 用户：{{ currentFeedback.user_info?.nickname || '匿名用户' }} </span>
            <span class="meta-item">
              反馈类型：
              <el-tag :type="getTypeTagType(currentFeedback.type)" size="small">
                {{ getTypeLabel(currentFeedback.type) }}
              </el-tag>
            </span>
            <span class="meta-item">
              状态：
              <el-tag :type="getStatusTagType(currentFeedback.status)" size="small">
                {{ getStatusLabel(currentFeedback.status) }}
              </el-tag>
            </span>
            <span class="meta-item"> 提交时间：{{ currentFeedback.create_time_str }} </span>
          </div>
        </div>

        <div class="detail-content">
          <div class="content-section">
            <h4>反馈内容</h4>
            <p>{{ currentFeedback.content || '无内容' }}</p>
          </div>
          <div v-if="currentFeedback.images && currentFeedback.images.length > 0" class="content-section">
            <h4>附件图片</h4>
            <div class="image-list">
              <el-image
                v-for="(img, index) in currentFeedback.images"
                :key="index"
                style="width: 120px; height: 120px; border-radius: 4px; margin-right: 10px; margin-bottom: 10px"
                :src="img"
                fit="cover"
                :preview-src-list="currentFeedback.images"
                :initial-index="index"
                preview-teleported
              />
            </div>
          </div>
          <div v-if="currentFeedback.reply" class="content-section">
            <h4>回复内容</h4>
            <p>{{ currentFeedback.reply }}</p>
          </div>
        </div>

        <div class="detail-footer">
          <el-form :model="replyForm" label-width="80px">
            <el-form-item label="回复内容">
              <el-input
                v-model="replyForm.reply"
                type="textarea"
                :rows="4"
                placeholder="请输入回复内容"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="replyLoading" @click="handleReply">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { useScrollReset } from '@/composables/useScrollReset';

// 反馈数据类型
interface FeedbackItem {
  id: number;
  uid: number;
  type: string;
  content: string;
  contact: string;
  images: string[];
  status: number;
  reply: string;
  create_time: number;
  update_time: number;
  create_time_str?: string;
  update_time_str?: string;
  user_info?: {
    nickname: string;
    username: string;
    avatar?: string;
    avatar64?: string;
  };
}

// 滚动重置
const { scrollContainerRef, resetScrollTop } = useScrollReset();

// 响应式数据
const loading = ref(false);
const replyLoading = ref(false);
const list = ref<FeedbackItem[]>([]);
const total = ref(0);
const page = ref(1);
const rows = ref(20);

// 搜索表单
const searchForm = ref({
  keyword: '',
  type: '',
  status: ''
});

// 对话框状态
const detailDialogVisible = ref(false);
const currentFeedback = ref<FeedbackItem | null>(null);
const replyForm = ref({
  reply: ''
});

// 获取反馈类型标签
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    suggestion: '功能建议',
    bug: '问题反馈',
    other: '其他'
  };
  return typeMap[type] || type;
};

// 获取反馈类型标签颜色
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    suggestion: 'success',
    bug: 'danger',
    other: 'info'
  };
  return typeMap[type] || 'info';
};

// 获取状态标签
const getStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待处理',
    1: '处理中',
    2: '已完成'
  };
  return statusMap[status] || '未知';
};

// 获取状态标签颜色
const getStatusTagType = (status: number) => {
  const statusMap: Record<number, any> = {
    0: 'warning',
    1: 'primary',
    2: 'success'
  };
  return statusMap[status] || 'info';
};

// 获取反馈列表
const getList = async () => {
  loading.value = true;
  try {
    let data = {
      page: page.value,
      rows: rows.value,
      keyword: '',
      type: '',
      status: 'all'
    };

    if (searchForm.value.keyword) {
      data.keyword = searchForm.value.keyword;
    }
    if (searchForm.value.type) {
      data.type = searchForm.value.type;
    }
    if (searchForm.value.status !== 'all') {
      data.status = searchForm.value.status;
    }

    const res = await request({
      url: 'admin/feedback/list',
      data: data,
      method: 'GET'
    });

    if (res.code === 200) {
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
      resetScrollTop();
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    ElMessage.error('获取反馈列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  getList();
};

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    type: '',
    status: 'all'
  };
  page.value = 1;
  getList();
};

// 分页处理
const handleSizeChange = (size: number) => {
  rows.value = size;
  page.value = 1;
  getList();
};

const handleCurrentChange = (current: number) => {
  page.value = current;
  getList();
};

// 查看详情
const handleViewDetail = (feedback: FeedbackItem) => {
  currentFeedback.value = feedback;
  replyForm.value.reply = feedback.reply || '';
  detailDialogVisible.value = true;
};

// 状态变更
const handleStatusChange = (status: string, feedback: FeedbackItem) => {
  ElMessageBox.confirm(`确定要将状态更改为"${getStatusLabel(parseInt(status))}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/feedback/status',
          method: 'POST',
          data: {
            ids: feedback.id,
            status: parseInt(status)
          }
        });
        if (res.code === 200) {
          ElMessage.success('状态更新成功');
          getList();
        } else {
          ElMessage.error(res.msg || '状态更新失败');
        }
      } catch (error) {
        ElMessage.error('状态更新失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

// 回复
const handleReply = async () => {
  if (!currentFeedback.value) return;
  if (!replyForm.value.reply.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }

  replyLoading.value = true;
  try {
    const res = await request({
      url: 'admin/feedback/reply',
      method: 'POST',
      data: {
        id: currentFeedback.value.id,
        reply: replyForm.value.reply
      }
    });
    if (res.code === 200) {
      ElMessage.success('回复成功');
      detailDialogVisible.value = false;
      getList();
    } else {
      ElMessage.error(res.msg || '回复失败');
    }
  } catch (error) {
    ElMessage.error('回复失败');
    console.error(error);
  } finally {
    replyLoading.value = false;
  }
};

// 删除反馈
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定要删除这条反馈吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/feedback/status',
          method: 'POST',
          data: {
            ids: id,
            status: -1
          }
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

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.feedback-toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px 20px;

  .search-form {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-form-item {
      margin-bottom: 0;
      margin-right: 0;
    }
  }
}

.page-content {
  background-color: var(--el-color-white);
  border-radius: 6px;
  padding: 10px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;

  .user-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .user-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      font-weight: 500;
    }

    .user-contact {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

/* 反馈内容样式 */
.feedback-content {
  .content-text {
    font-size: 14px;
    color: var(--el-text-color-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 反馈详情样式 */
.feedback-detail {
  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color);

    .detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }

  .detail-content {
    margin-bottom: 20px;

    .content-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: var(--el-text-color-primary);
        white-space: pre-wrap;
      }

      .image-list {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }

  .detail-footer {
    padding-top: 15px;
    border-top: 1px solid var(--el-border-color);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form {
    flex-wrap: wrap;
    gap: 10px;
  }
}

html.dark {
  .page-header {
    background-color: #262626;
  }

  .page-content {
    background-color: #262626;
  }
}
</style>
