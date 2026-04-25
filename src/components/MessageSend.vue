<template>
  <div class="message-send-wrapper">
    <el-dialog v-model="dialogVisible" :title="title" width="700px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="发送类型" prop="send_type">
          <el-checkbox-group v-model="form.send_type">
            <el-checkbox value="msg">站内信</el-checkbox>
            <el-checkbox value="email">邮件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="!userId" label="用户组" prop="user_group">
          <el-select v-model="form.user_group" placeholder="请选择用户组" style="width: 100%">
            <el-option label="请选择用户组" :value="0" />
            <el-option v-for="group in userGroups" :key="group.id" :label="group.title" :value="group.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-else label="接收用户">
          <div v-if="userInfo" class="user-info">
            <el-avatar :size="40" :src="userInfo.avatar64 || ''" :alt="userInfo.nickname || userInfo.username">
              {{ (userInfo.nickname || userInfo.username || '').charAt(0) }}
            </el-avatar>
            <span class="user-name">{{ userInfo.nickname || userInfo.username }}</span>
          </div>
        </el-form-item>

        <el-form-item label="消息类型" prop="type_id">
          <el-select v-model="form.type_id" placeholder="请选择消息类型" style="width: 100%">
            <el-option label="请选择消息类型" :value="0" />
            <el-option v-for="type in messageTypes" :key="type.id" :label="type.title" :value="type.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="消息标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入消息标题" />
        </el-form-item>

        <el-form-item label="消息描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入消息描述" />
        </el-form-item>

        <el-form-item label="消息详情" prop="content">
          <Editor v-model="form.content" :rows="6" placeholder="请输入消息详情内容" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" :loading="sending" @click="handleSubmit">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage } from 'element-plus';
import Editor from '@/components/config/Editor.vue';

interface Props {
  visible: boolean;
  userId?: number;
  userInfo?: any;
}

interface UserGroup {
  id: number;
  title: string;
}

interface MessageType {
  id: number;
  title: string;
  description: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = ref(false);
const formRef = ref();
const sending = ref(false);
const userGroups = ref<UserGroup[]>([]);
const messageTypes = ref<MessageType[]>([]);

const form = ref({
  to_uid: 0,
  user_group: 0,
  type_id: 0,
  title: '',
  description: '',
  content: '',
  send_type: ['msg']
});

const rules = {
  send_type: [{ required: true, message: '请选择发送类型', trigger: 'change' }],
  user_group: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!props.userId && !value) {
          callback(new Error('请选择用户组'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  type_id: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请选择消息类型'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],

  title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入消息描述', trigger: 'blur' }],
  content: [{ required: true, message: '请输入消息详情', trigger: 'blur' }]
};

const title = ref('发送消息');

watch(
  () => props.visible,
  newVal => {
    dialogVisible.value = newVal;
    if (newVal) {
      title.value = props.userId ? '发送消息' : '群发消息';
      resetForm();
      loadUserGroups();
      loadMessageTypes();
    }
  }
);

watch(dialogVisible, newVal => {
  emit('update:visible', newVal);
});

// 加载用户组列表
const loadUserGroups = async () => {
  try {
    const res = await request({
      url: 'admin/auth/group',
      method: 'GET',
      data: {
        load: 'all'
      }
    });
    if (res.code === 200) {
      userGroups.value = res.data;
    }
  } catch (error) {
    console.error('获取用户组失败:', error);
  }
};

// 加载消息类型列表
const loadMessageTypes = async () => {
  try {
    const res = await request({
      url: 'admin/message/type',
      method: 'GET'
    });
    if (res.code === 200) {
      messageTypes.value = res.data;
    }
  } catch (error) {
    console.error('获取消息类型失败:', error);
  }
};

const resetForm = () => {
  form.value = {
    to_uid: props.userId || 0,
    user_group: 0,
    type_id: 0,
    title: '',
    description: '',
    content: '',
    send_type: ['msg']
  };
};

const handleCancel = () => {
  dialogVisible.value = false;
};

// 提交发送消息
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    sending.value = true;
    const res = await request({
      url: 'admin/message/send',
      method: 'POST',
      data: form.value
    });

    if (res.code === 200) {
      ElMessage.success('消息发送成功');
      dialogVisible.value = false;
      emit('success', res.data);
    } else {
      ElMessage.error(res.msg || '消息发送失败');
    }
  } catch (error) {
    console.error('发送消息失败:', error);
  } finally {
    sending.value = false;
  }
};
</script>

<style scoped lang="scss">
.message-send-wrapper {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}
</style>
