<template>
  <div class="page-container">
    <div class="page-header">
      <div class="table-header">
        <div class="button-group">
          <el-button type="primary" @click="handleAdd">添加类型</el-button>
          <el-button type="success" @click="handleSendBatch">群发消息</el-button>
        </div>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <el-table :data="lists" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="类型名称" min-width="150" />
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="icon" label="图标" width="100">
            <template #default="scope">
              <el-image
                v-if="scope.row.icon_80"
                :src="scope.row.icon_80"
                style="width: 50px; height: 50px"
                fit="cover"
                :preview-src-list="[scope.row.icon_80]"
              />
              <span v-else>无图标</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-switch
                :model-value="Number(scope.row.status) === 1"
                active-color="#409EFF"
                inactive-color="#C0C4CC"
                @click.stop
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 添加/编辑消息类型对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="类型名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-upload
            class="icon-uploader"
            :show-file-list="false"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            :disabled="uploading"
          >
            <div v-if="form.icon_80 && !isDeleted" class="icon-preview">
              <img :src="form.icon_80" class="icon-image" />
              <div v-if="uploading" class="uploading-mask">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
              <div class="delete-icon" @mousedown.stop.prevent @click.stop.prevent="handleIconDelete">
                <el-icon><Close /></el-icon>
              </div>
            </div>
            <div v-else-if="uploading" class="uploading-placeholder">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
            <div v-else class="icon-uploader-icon">
              <safe-icon icon="fas cloud-upload-alt" />
              <div class="upload-text">点击上传</div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
import { Loading, Close } from '@element-plus/icons-vue';
import { getMessageTypes, editMessageType, updateMessageTypeStatus, uploadAttachment } from '@/api/admin/message';
import MessageSend from '@/components/MessageSend.vue';

interface MessageTypeItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  icon_80?: string;
  status: number;
  create_time?: number;
  update_time?: number;
  create_time_str?: string;
  update_time_str?: string;
}

const lists = ref<MessageTypeItem[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('添加消息类型');
const formRef = ref();
const sendDialogVisible = ref(false);
const uploading = ref(false);
const isDeleted = ref(false);
const form = ref<MessageTypeItem>({
  id: 0,
  title: '',
  description: '',
  icon: '',
  icon_80: '',
  status: 1
});

const rules = {
  title: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  icon: [{ required: true, message: '请上传图标', trigger: 'change' }]
};

// 获取消息类型列表
const fetchMessageTypeList = async () => {
  loading.value = true;
  try {
    const res = await getMessageTypes();
    if (res.code === 200) {
      lists.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取消息类型列表失败');
    }
  } catch (error) {
    ElMessage.error('获取消息类型列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 添加消息类型
const handleAdd = () => {
  dialogTitle.value = '添加消息类型';
  form.value = {
    id: 0,
    title: '',
    description: '',
    icon: '',
    icon_80: '',
    status: 1
  };
  isDeleted.value = false;
  dialogVisible.value = true;
};

// 编辑消息类型
const handleEdit = (row: MessageTypeItem) => {
  dialogTitle.value = '编辑消息类型';
  form.value = {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    icon_80: row.icon_80,
    status: Number(row.status)
  };
  isDeleted.value = false;
  dialogVisible.value = true;
};

// 删除消息类型
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个消息类型吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateMessageTypeStatus({
          ids: id,
          status: -1
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          fetchMessageTypeList();
        } else {
          ElMessage.error(res.msg || '删除失败');
        }
      } catch (error) {
        ElMessage.error('删除失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 状态变化
const handleStatusChange = async (row: MessageTypeItem) => {
  const newStatus = Number(row.status) === 1 ? 0 : 1;
  const originalStatus = row.status;
  row.status = newStatus;

  try {
    const res = await updateMessageTypeStatus({
      ids: row.id,
      status: newStatus
    });
    if (res.code !== 200) {
      ElMessage.error(res.msg || '状态更新失败');
      row.status = originalStatus;
    }
  } catch (error) {
    ElMessage.error('状态更新失败');
    row.status = originalStatus;
    console.error(error);
  }
};

// 上传前验证
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 上传
const handleUpload = async (options: any) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);

  uploading.value = true;

  try {
    const res = await uploadAttachment(formData);

    if (res.code === 200) {
      form.value.icon = res.data.attachment;
      form.value.icon_80 = res.data.url;
      isDeleted.value = false; // 重置删除标志
      ElMessage.success('图片上传成功');
    } else {
      ElMessage.error(res.msg || '图片上传失败');
    }
  } catch (error) {
    ElMessage.error('图片上传失败');
    console.error(error);
  } finally {
    uploading.value = false;
  }
};

// 删除图标
const handleIconDelete = () => {
  if (uploading.value) {
    return;
  }
  form.value.icon = '';
  form.value.icon_80 = '';
  isDeleted.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const res = await editMessageType(form.value);

    if (res.code === 200) {
      ElMessage.success(form.value.id ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      fetchMessageTypeList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const handleSendBatch = () => {
  sendDialogVisible.value = true;
};

const handleSendSuccess = (data: any) => {
  console.log('消息发送成功', data);
};

onMounted(() => {
  fetchMessageTypeList();
});
</script>

<style scoped lang="scss">
.message-type-wrapper {
  height: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.page-content {
  background-color: var(--el-color-white);
  border-radius: 6px;
  padding: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.icon-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    width: 80px;
    height: 80px;

    &:hover {
      border-color: #409eff;
    }
  }

  .icon-preview {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .icon-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    background-color: #f5f7fa;
  }

  .icon-uploader-icon {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #8c939d;
  }

  .upload-text {
    font-size: 13px;
    color: #8c939d;
    line-height: 26px;
  }

  .uploading-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #f5f7fa;
    border-radius: 6px;

    .el-icon {
      font-size: 32px;
      color: #409eff;
      animation: rotate 1.5s linear infinite;
    }
  }

  .uploading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;

    .el-icon {
      font-size: 32px;
      color: #fff;
    }
  }

  .delete-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #fff;
    z-index: 10;
    pointer-events: auto;

    &:hover {
      background-color: rgba(245, 108, 108, 0.8);
    }
  }

  .upload-icon {
    font-size: 32px;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
