<template>
  <div class="role-user-edit">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="绑定用户" prop="uid">
        <div class="user-selector-wrapper">
          <div v-if="selectedUser" class="selected-user">
            <img :src="selectedUser.avatar128 || defaultAvatar" :alt="selectedUser.nickname" class="user-avatar" />
            <div class="user-info">
              <div class="user-nickname">{{ selectedUser.nickname }}</div>
              <div class="user-username">@{{ selectedUser.username }}</div>
            </div>
            <el-button type="danger" size="small" @click="handleRemoveUser">移除</el-button>
          </div>
          <UserSelector v-else v-model="selectedUser" @change="handleUserChange" />
        </div>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="职称" prop="professional">
        <el-input v-model="formData.professional" placeholder="请输入职称" clearable />
      </el-form-item>
      <el-form-item label="封面图片" prop="cover">
        <Pic v-model="formData.cover" :thumb="formData.cover_original" />
      </el-form-item>
      <el-form-item label="角色组" prop="group_id">
        <el-select v-model="formData.group_id" placeholder="请选择角色组" clearable>
          <el-option v-for="group in groupList" :key="group.id" :label="group.title" :value="group.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="255" />
      </el-form-item>
      <el-form-item label="简短描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="6" placeholder="请输入简短描述" clearable />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
          <el-radio :value="-1">未审核</el-radio>
          <el-radio :value="-2">审核失败</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.status === -2" label="审核失败原因" prop="reason">
        <el-input v-model="formData.reason" type="textarea" :rows="4" placeholder="请输入审核失败原因" clearable />
      </el-form-item>
    </el-form>
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { editRole, getRoleGroupList } from '@/api/admin/role';
import UserSelector from './UserSelector.vue';
import Pic from '@/components/config/Pic.vue';

interface Props {
  modelValue: boolean;
  data?: any;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const groupList = ref<any[]>([]);
const groupLoading = ref(false);
const selectedUser = ref<any>(null);
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

const formData = reactive({
  id: 0,
  uid: 0,
  name: '',
  group_id: 0,
  professional: '',
  description: '',
  sort: 255,
  status: 1,
  reason: '',
  cover: '',
  cover_original: ''
});

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

// 重置表单
const resetForm = () => {
  formData.id = 0;
  formData.uid = 0;
  formData.name = '';
  formData.group_id = 0;
  formData.professional = '';
  formData.description = '';
  formData.sort = 255;
  formData.status = 1;
  formData.reason = '';
  formData.cover = '';
  formData.cover_original = '';
  selectedUser.value = null;
  formRef.value?.clearValidate();
};

// 监听数据变化
watch(
  () => props.data,
  newData => {
    if (newData && Object.keys(newData).length > 0) {
      formData.id = newData.id || 0;
      formData.uid = newData.uid || 0;
      formData.name = newData.name || '';
      formData.group_id = newData.group_id || 0;
      formData.professional = newData.professional || '';
      formData.description = newData.description || '';
      formData.sort = newData.sort || 255;
      formData.status = newData.status || 1;
      formData.reason = newData.reason || '';
      formData.cover = newData.cover || '';
      formData.cover_original = newData.cover_original || '';

      if (newData.user_info) {
        selectedUser.value = {
          uid: newData.uid,
          nickname: newData.user_info.nickname,
          username: newData.user_info.username,
          avatar128: newData.user_info.avatar128
        };
      } else {
        selectedUser.value = null;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true, deep: true }
);

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    loading.value = true;
    try {
      const res = await editRole(formData);
      if (res.code === 200) {
        ElMessage.success(formData.id ? '编辑成功' : '新增成功');
        emit('success');
        emit('update:modelValue', false);
        resetForm();
      } else {
        ElMessage.error(res.msg || (formData.id ? '编辑失败' : '新增失败'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      loading.value = false;
    }
  });
};

// 取消
const handleCancel = () => {
  emit('update:modelValue', false);
  resetForm();
};

// 处理用户选择变化
const handleUserChange = (user: any) => {
  if (user) {
    formData.uid = user.uid;
  }
};

// 移除用户绑定
const handleRemoveUser = () => {
  selectedUser.value = null;
  formData.uid = 0;
};

// 获取角色分组列表
const getGroupList = async () => {
  groupLoading.value = true;
  try {
    const res = await getRoleGroupList({});
    if (res.code === 200) {
      groupList.value = res.data.data || [];
    }
  } catch (error) {
    console.error('获取角色分组列表失败:', error);
    ElMessage.error('获取角色分组列表失败');
  } finally {
    groupLoading.value = false;
  }
};

// 组件挂载时获取角色分组列表
onMounted(() => {
  getGroupList();
});

// 暴露方法给父组件
defineExpose({
  resetForm
});
</script>

<style lang="scss" scoped>
.role-user-edit {
  padding: 20px;

  .el-form {
    margin-bottom: 20px;
  }

  .user-selector-wrapper {
    width: 100%;

    .selected-user {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      border: 1px solid #e4e7ed;

      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 12px;
      }

      .user-info {
        flex: 1;

        .user-nickname {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .user-username {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }

  :deep(.el-textarea__inner) {
    resize: vertical;
  }
}

// 暗黑模式适配
html.dark {
  .role-user-edit {
    .user-selector-wrapper {
      .selected-user {
        background: #2a2a2a;
        border-color: #363637;

        .user-info {
          .user-nickname {
            color: #e5eaf3;
          }

          .user-username {
            color: #9ca3af;
          }
        }
      }
    }

    .form-footer {
      border-top-color: #363637;
    }
  }
}
</style>
