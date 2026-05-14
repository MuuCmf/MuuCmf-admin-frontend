<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="message-toolbar">
        <div class="active-btn">
          <el-button type="primary" @click="handleSendMessage">发送消息</el-button>
        </div>
        <!-- 搜索筛选区域 -->
        <div class="search-filter">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入发送者/接收者/消息标题"
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <safe-icon icon="fas search" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.type_id" placeholder="请选择消息类型" clearable style="width: 180px">
                <el-option v-for="type in messageTypes" :key="type.id" :label="type.title" :value="type.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.is_read" placeholder="请选择已读状态" clearable style="width: 120px">
                <el-option label="已读" value="1" />
                <el-option label="未读" value="0" />
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
      <div class="with-container">
        <!-- 消息列表表格 -->
        <el-table :data="list" stripe>
          <!-- 发送者信息 -->
          <el-table-column label="发送者" min-width="150">
            <template #default="scope">
              <div class="user-info">
                <el-avatar
                  :size="36"
                  :src="scope.row.form_user?.avatar || scope.row.form_user?.avatar64 || ''"
                  :alt="scope.row.form_user?.nickname"
                >
                  {{ (scope.row.form_user?.nickname || '').charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ scope.row.form_user?.nickname || '系统' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 接收者信息 -->
          <el-table-column label="接收者" min-width="150">
            <template #default="scope">
              <div class="user-info">
                <el-avatar :size="36" :src="scope.row.to_user?.avatar64 || ''" :alt="scope.row.to_user?.nickname">
                  {{ (scope.row.to_user?.nickname || scope.row.to_user?.username || '').charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ scope.row.to_user?.nickname || scope.row.to_user?.username || '-' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 消息类型 -->
          <el-table-column label="消息类型" width="120">
            <template #default="scope">
              <div class="message-type">
                <el-image
                  v-if="scope.row.type?.icon"
                  :src="scope.row.type.icon"
                  style="width: 24px; height: 24px; margin-right: 8px"
                  fit="cover"
                />
                <span>{{ scope.row.type?.title || '-' }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 消息标题 -->
          <el-table-column label="消息标题" min-width="200">
            <template #default="scope">
              <span class="message-title">{{ scope.row.content?.title || '-' }}</span>
            </template>
          </el-table-column>

          <!-- 已读状态 -->
          <el-table-column label="已读状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.is_read === 1 ? 'success' : 'info'">
                {{ scope.row.is_read_str || (scope.row.is_read === 1 ? '已读' : '未读') }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 发送时间 -->
          <el-table-column label="发送时间" width="180">
            <template #default="scope">
              <span>{{ scope.row.create_time_str || formatTime(scope.row.create_time) }}</span>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" width="200" fixed="right" align="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">查看详情</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
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

    <!-- 消息详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="消息详情" width="800px">
      <div v-if="currentMessage" class="message-detail">
        <div class="detail-header">
          <h3>{{ currentMessage.content?.title || '无标题' }}</h3>
          <div class="detail-meta">
            <span class="meta-item">
              发送时间：{{ currentMessage.create_time_str || formatTime(currentMessage.create_time) }}
            </span>
            <span class="meta-item"> 消息类型：{{ currentMessage.type?.title || '-' }} </span>
            <span class="meta-item">
              状态：
              <el-tag :type="currentMessage.status === 1 ? 'success' : 'danger'">
                {{ currentMessage.status_str || (currentMessage.status === 1 ? '启用' : '禁用') }}
              </el-tag>
            </span>
          </div>
        </div>

        <div class="detail-content">
          <div class="content-section">
            <h4>消息描述</h4>
            <p>{{ currentMessage.content?.description || '无描述' }}</p>
          </div>
          <div class="content-section">
            <h4>消息详情</h4>
            <div class="content-html" v-html="currentMessage.content?.content || '无详情'"></div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 消息发送组件 -->
    <MessageSend
      :visible="sendDialogVisible"
      @update:visible="sendDialogVisible = $event"
      @success="handleSendSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMessageList, getMessageTypes, updateMessageStatus } from '@/api/admin/message';
import MessageSend from '@/components/MessageSend.vue';

// 消息数据类型
interface MessageItem {
  id: number;
  shopid: number;
  uid: number;
  to_uid: number;
  type_id: number;
  content_id: number;
  is_read: number;
  status: number;
  create_time: number;
  update_time: number;
  create_time_str?: string;
  update_time_str?: string;
  is_read_str?: string;
  status_str?: string;
  form_user?: {
    nickname: string;
    avatar?: string;
    avatar64?: string;
    avatar128?: string;
    avatar256?: string;
    avatar512?: string;
  };
  to_user?: {
    nickname?: string;
    username?: string;
    avatar?: string;
    headimg?: string;
    uid: number;
    status: number;
    avatar64?: string;
    avatar128?: string;
    avatar256?: string;
    avatar512?: string;
  };
  type?: {
    title: string;
    icon?: string;
  };
  content?: {
    title: string;
    description: string;
    content: string;
  };
}

// 消息类型
interface MessageType {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

// 响应式数据
const loading = ref(false);
const list = ref<MessageItem[]>([]);
const total = ref(0);
const page = ref(1);
const rows = ref(20);
const messageTypes = ref<MessageType[]>([]);

// 搜索表单
const searchForm = ref({
  keyword: '',
  type_id: '',
  status: '',
  is_read: ''
});

// 对话框状态
const detailDialogVisible = ref(false);
const sendDialogVisible = ref(false);
const currentMessage = ref<MessageItem | null>(null);

// 格式化时间
const formatTime = (timestamp: number) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 获取消息列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getMessageList({
      page: page.value,
      rows: rows.value,
      keyword: searchForm.value.keyword,
      type_id: searchForm.value.type_id,
      status: searchForm.value.status,
      is_read: searchForm.value.is_read
    });

    if (res.code === 200) {
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取消息列表失败:', error);
    ElMessage.error('获取消息列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取消息类型
const fetchMessageTypes = async () => {
  try {
    const res = await getMessageTypes();
    if (res.code === 200) {
      messageTypes.value = res.data || [];
    }
  } catch (error) {
    console.error('获取消息类型失败:', error);
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
    type_id: '',
    status: '',
    is_read: ''
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
const handleViewDetail = (message: MessageItem) => {
  currentMessage.value = message;
  detailDialogVisible.value = true;
};

// 发送消息
const handleSendMessage = () => {
  sendDialogVisible.value = true;
};

// 发送成功
const handleSendSuccess = () => {
  getList();
};

// 删除消息
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateMessageStatus({
          ids: id,
          status: -1
        });
        if (res.code === 200) {
          ElMessage.success('消息删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '消息删除失败');
        }
      } catch (error) {
        ElMessage.error('消息删除失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 初始化
onMounted(() => {
  fetchMessageTypes();
  getList();
});
</script>

<style scoped lang="scss">
.message-toolbar {
  display: flex;
  justify-content: space-between;
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

  .user-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}

/* 消息类型样式 */
.message-type {
  display: flex;
  align-items: center;
}

/* 消息标题样式 */
.message-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

/* 消息详情样式 */
.message-detail {
  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color);

    h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }

  .detail-content {
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
        line-height: 1.5;
        color: var(--el-text-color-primary);
      }

      .content-html {
        line-height: 1.6;
        color: var(--el-text-color-primary);

        img {
          max-width: 100%;
          height: auto;
        }

        p {
          margin: 0 0 10px 0;
        }
      }
    }
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
