<template>
  <div class="page-container">
    <div class="page-header">
      <div class="queue-status-bar">
        <div class="status-info">
          <el-tag :type="queueStatus.is_running ? 'success' : 'info'" size="large">
            <el-icon v-if="queueStatus.is_running"><CircleCheckFilled /></el-icon>
            <el-icon v-else><CircleCloseFilled /></el-icon>
            {{ queueStatus.is_running ? '队列服务运行中' : '队列服务已停止' }}
          </el-tag>
          <span class="status-detail">队列长度: {{ queueStatus.queue_length || 0 }}</span>
          <span class="status-detail">上次心跳: {{ queueStatus.last_heartbeat || '无' }}</span>
          <span class="status-detail">心跳间隔: {{ queueStatus.heartbeat_ago || 0 }}秒</span>
        </div>
        <div class="status-actions">
          <el-button type="primary" @click="handleRefreshStatus">刷新状态</el-button>
          <el-button type="success" @click="handleHeartbeat">发送心跳</el-button>
        </div>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="lists" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="队列名称" min-width="150" />
            <el-table-column prop="type" label="队列类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  active-value="1"
                  inactive-value="0"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="message_count" label="消息数量" width="120" />
            <el-table-column prop="processing_count" label="处理中" width="100" />
            <el-table-column prop="failed_count" label="失败数" width="100" />
            <el-table-column prop="worker_count" label="工作进程" width="100" />
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
                <el-button v-if="scope.row.status === 0" size="small" @click="handleStart(scope.row)">启动</el-button>
                <el-button v-else size="small" @click="handleStop(scope.row)">停止</el-button>
                <el-button size="small" type="warning" @click="handleClear(scope.row.id)">清空</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
          v-model:page-size="rows"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑队列对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="队列名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入队列名称" />
        </el-form-item>
        <el-form-item label="队列类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择队列类型">
            <el-option label="默认队列" value="default" />
            <el-option label="邮件队列" value="email" />
            <el-option label="短信队列" value="sms" />
            <el-option label="推送队列" value="push" />
            <el-option label="自定义队列" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作进程数" prop="worker_count">
          <el-input-number v-model="form.worker_count" :min="1" :max="10" placeholder="请输入工作进程数" />
        </el-form-item>
        <el-form-item label="队列状态" prop="status">
          <el-switch v-model="form.status" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 队列详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="队列详情" width="800px">
      <div v-if="viewQueueInfo.id" class="queue-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="队列ID">{{ viewQueueInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="队列名称">{{ viewQueueInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="队列类型">{{ viewQueueInfo.type }}</el-descriptions-item>
          <el-descriptions-item label="队列状态">{{
            viewQueueInfo.status === 1 ? '运行中' : '暂停'
          }}</el-descriptions-item>
          <el-descriptions-item label="消息数量">{{ viewQueueInfo.message_count }}</el-descriptions-item>
          <el-descriptions-item label="处理中数量">{{ viewQueueInfo.processing_count }}</el-descriptions-item>
          <el-descriptions-item label="失败数量">{{ viewQueueInfo.failed_count }}</el-descriptions-item>
          <el-descriptions-item label="工作进程数">{{ viewQueueInfo.worker_count }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewQueueInfo.created_at }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ viewQueueInfo.updated_at }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ viewQueueInfo.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="viewQueueInfo.message_count > 0" class="message-list">
          <h4>最近消息</h4>
          <el-table :data="recentMessages" style="width: 100%" border>
            <el-table-column prop="id" label="消息ID" width="120" />
            <el-table-column prop="type" label="消息类型" width="100" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column prop="content" label="消息内容" min-width="300">
              <template #default="scope">
                <el-tooltip :content="scope.row.content" placement="top">
                  <span class="text-ellipsis">{{ scope.row.content }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import {
  getQueueList,
  getQueueStatus,
  heartbeat,
  getQueueMessages,
  startQueue,
  stopQueue,
  clearQueue,
  deleteQueue,
  updateQueue,
  createQueue
} from '@/api/admin/queue';

interface QueueItem {
  id: number;
  name: string;
  type: string;
  status: number;
  message_count: number;
  processing_count: number;
  failed_count: number;
  worker_count: number;
  remark?: string;
  created_at: string;
  updated_at: string;
}

interface MessageItem {
  id: number;
  type: string;
  status: string;
  content: string;
  created_at: string;
}

const page = ref(1);
const rows = ref(20);
const total = ref(0);
const loading = ref(false);
const lists = ref<QueueItem[]>([]);
const searchForm = ref({
  name: '',
  status: '',
  type: ''
});

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('添加队列');
const formRef = ref();
const form = ref({
  id: 0,
  name: '',
  type: 'default',
  status: 1,
  worker_count: 1,
  remark: ''
});

// 查看对话框
const viewDialogVisible = ref(false);
const viewQueueInfo = ref<QueueItem>({
  id: 0,
  name: '',
  type: '',
  status: 0,
  message_count: 0,
  processing_count: 0,
  failed_count: 0,
  worker_count: 0,
  created_at: '',
  updated_at: ''
});
const recentMessages = ref<MessageItem[]>([]);

interface QueueStatus {
  queue_length: number;
  is_running: boolean;
  last_heartbeat: string;
  heartbeat_ago: number;
  time: string;
}

const queueStatus = ref<QueueStatus>({
  queue_length: 0,
  is_running: false,
  last_heartbeat: '',
  heartbeat_ago: 0,
  time: ''
});

// 获取队列状态
const fetchQueueStatus = async () => {
  try {
    const res = await getQueueStatus();
    if (res.code === 200) {
      queueStatus.value = res.data;
    }
  } catch (error) {
    console.error('获取队列状态失败:', error);
  }
};

// 刷新状态
const handleRefreshStatus = () => {
  fetchQueueStatus();
};

// 发送心跳
const handleHeartbeat = async () => {
  try {
    const res = await heartbeat();
    if (res.code === 200) {
      ElMessage.success('心跳更新成功');
      fetchQueueStatus();
    } else {
      ElMessage.error(res.msg || '心跳更新失败');
    }
  } catch (error) {
    ElMessage.error('心跳更新失败');
    console.error(error);
  }
};

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入队列名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择队列类型', trigger: 'change' }],
  worker_count: [{ required: true, message: '请输入工作进程数', trigger: 'blur' }]
};

// 获取队列列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getQueueList({
      page: page.value,
      rows: rows.value,
      name: searchForm.value.name,
      status: searchForm.value.status,
      type: searchForm.value.type
    });
    if (res.code === 200) {
      lists.value = res.data.data;
      total.value = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取队列列表失败');
    }
  } catch (error) {
    ElMessage.error('获取队列列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
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

// 查看队列
const handleView = async (row: QueueItem) => {
  viewQueueInfo.value = row;
  try {
    const res = await getQueueMessages({
      queue_id: row.id,
      limit: 5
    });
    if (res.code === 200) {
      recentMessages.value = res.data.data;
    }
  } catch (error) {
    console.error('获取队列消息失败:', error);
  }
  viewDialogVisible.value = true;
};

// 启动队列
const handleStart = async (row: QueueItem) => {
  try {
    const res = await startQueue(row.id);
    if (res.code === 200) {
      ElMessage.success('队列启动成功');
      row.status = 1;
    } else {
      ElMessage.error(res.msg || '队列启动失败');
    }
  } catch (error) {
    ElMessage.error('队列启动失败');
    console.error(error);
  }
};

// 停止队列
const handleStop = async (row: QueueItem) => {
  try {
    const res = await stopQueue(row.id);
    if (res.code === 200) {
      ElMessage.success('队列停止成功');
      row.status = 0;
    } else {
      ElMessage.error(res.msg || '队列停止失败');
    }
  } catch (error) {
    ElMessage.error('队列停止失败');
    console.error(error);
  }
};

// 清空队列
const handleClear = (id: number) => {
  ElMessageBox.confirm('确定要清空这个队列的所有消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await clearQueue(id);
        if (res.code === 200) {
          ElMessage.success('队列清空成功');
          getList();
        } else {
          ElMessage.error(res.msg || '队列清空失败');
        }
      } catch (error) {
        ElMessage.error('队列清空失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 删除队列
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个队列吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteQueue(id);
        if (res.code === 200) {
          ElMessage.success('队列删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '队列删除失败');
        }
      } catch (error) {
        ElMessage.error('队列删除失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 状态变化
const handleStatusChange = async (row: QueueItem) => {
  try {
    const res = row.status === 1 ? await startQueue(row.id) : await stopQueue(row.id);
    if (res.code !== 200) {
      ElMessage.error(res.msg || '状态更新失败');
      row.status = row.status === 1 ? 0 : 1;
    }
  } catch (error) {
    ElMessage.error('状态更新失败');
    row.status = row.status === 1 ? 0 : 1;
    console.error(error);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const res = form.value.id ? await updateQueue(form.value) : await createQueue(form.value);

    if (res.code === 200) {
      ElMessage.success(form.value.id ? '队列更新成功' : '队列添加成功');
      dialogVisible.value = false;
      getList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

onMounted(() => {
  getList();
  fetchQueueStatus();
});
</script>

<style scoped lang="scss">
.queue-list-wrapper {
  height: 100%;
}

.queue-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;

  .status-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .el-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        display: inline-flex;
        align-items: center;
        vertical-align: top;
        margin-top: -3px;
      }
    }

    .status-detail {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }

  .status-actions {
    display: flex;
    gap: 10px;
  }
}

.page-content {
  padding: 10px;
  background-color: var(--el-color-white);
}

.queue-detail {
  margin-bottom: 20px;
}

.message-list {
  margin-top: 30px;
}

.message-list h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
