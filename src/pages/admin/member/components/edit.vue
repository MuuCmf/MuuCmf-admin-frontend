<template>
  <div class="member-edit">
    <div class="edit-header">
      <h3>编辑用户</h3>
      <el-button type="primary" link @click="handleClose">
        <safe-icon icon="fas times" />
      </el-button>
    </div>

    <div v-loading="loading" class="edit-content">
      <el-form ref="formRef" :rules="formRules" :model="formData" label-width="100px" label-position="right">
        <div class="form-section">
          <div class="section-title">基本信息</div>

          <div class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
            >
              <img v-if="formData.avatar64" :src="formData.avatar64" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="avatar-tip">点击上传头像</div>
          </div>

          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="!!formData.uid" />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item label="手机" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入手机号" />
          </el-form-item>

          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="formData.sex">
              <el-radio :value="0">保密</el-radio>
              <el-radio :value="1">男</el-radio>
              <el-radio :value="2">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="用户组" prop="auth_group">
            <el-select v-model="formData.auth_group" multiple placeholder="请选择用户组" style="width: 100%">
              <el-option v-for="group in groupList" :key="group.id" :label="group.title" :value="Number(group.id)" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">账号状态</div>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">安全设置</div>

          <el-form-item label="新密码" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="留空则不修改密码" show-password />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">其他信息</div>

          <el-form-item label="个性签名" prop="signature">
            <el-input v-model="formData.signature" type="textarea" :rows="3" placeholder="请输入个性签名" />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <div class="edit-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>

    <el-dialog
      v-model="cropDialogVisible"
      title="裁剪头像"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCropDialogClose"
    >
      <div class="crop-container">
        <img ref="cropImageRef" :src="cropImageUrl" alt="待裁剪图片" />
      </div>
      <template #footer>
        <div class="crop-footer">
          <el-button @click="handleCropDialogClose">取消</el-button>
          <el-button type="primary" @click="handleCropConfirm">确认裁剪</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { saveMember, uploadAvatar } from '@/api/admin/member';
import { getGroupList as getAuthGroupList } from '@/api/admin/auth';

interface FormDataInterface {
  /** 用户ID */
  uid: number;
  /** 用户昵称 */
  nickname: string;
  /** 密码 */
  password?: string;
  /** 确认密码 */
  confirmPassword?: string;
  /** 性别 */
  sex?: number;
  /** 头像 */
  avatar?: string;
  /** 头像64 */
  avatar64?: string;
  /** 头像128 */
  avatar128?: string;
  /** 头像256 */
  avatar256?: string;
  /** 头像512 */
  avatar512?: string;
  /** 签名 */
  signature?: string;
  /** 用户名 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  mobile?: string;
  /** 认证状态 */
  authentication?: number;
  /** 认证组 */
  auth_group?: number[];
  /** 积分 */
  score?: object[];
  /** 状态 */
  status?: number;
}

interface Props {
  user: FormDataInterface;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const submitLoading = ref(false);

const cropDialogVisible = ref(false);
const cropImageUrl = ref('');
const cropImageRef = ref<HTMLImageElement>();
let cropper: Cropper | null = null;
let pendingFile: File | null = null;

const groupList = ref<any[]>([]);

// 获取用户组列表
const getGroupList = async () => {
  try {
    const res = await getAuthGroupList({
      page: 1,
      rows: 100,
      keyword: ''
    });

    if (res.code === 200) {
      groupList.value = res.data.data || [];
    }
  } catch (error) {
    console.error('获取用户组列表失败:', error);
  }
};

// 组件挂载时获取用户组列表
getGroupList();

const formData = reactive<FormDataInterface>({
  uid: 0,
  username: '',
  nickname: '',
  email: '',
  mobile: '',
  avatar: '',
  avatar64: '',
  avatar128: '',
  authentication: 0,
  status: 1,
  signature: '',
  password: '',
  confirmPassword: '',
  sex: 0,
  auth_group: []
});

// 确认密码验证规则
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (formData.password && !value) {
    callback(new Error('请再次输入密码'));
  } else if (value && value !== formData.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
};

// 头像上传前校验
const beforeAvatarUpload = (file: File) => {
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

  pendingFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    cropImageUrl.value = e.target?.result as string;
    cropDialogVisible.value = true;
    nextTick(() => {
      initCropper();
    });
  };
  reader.readAsDataURL(file);

  return false;
};

// 初始化裁剪工具
const initCropper = () => {
  if (!cropImageRef.value) return;

  if (cropper) {
    cropper.destroy();
  }

  cropper = new Cropper(cropImageRef.value, {
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.8,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false
  });
};

// 确认裁剪
const handleCropConfirm = async () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    width: 500,
    height: 500,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });

  canvas.toBlob(
    blob => {
      if (!blob) {
        ElMessage.error('裁剪失败');
        return;
      }

      const croppedFile = new File([blob], pendingFile?.name || 'avatar.jpg', {
        type: 'image/jpeg'
      });

      handleAvatarUpload({ file: croppedFile });
      handleCropDialogClose();
    },
    'image/jpeg',
    0.95
  );
};

// 关闭裁剪弹窗
const handleCropDialogClose = () => {
  cropDialogVisible.value = false;
  cropImageUrl.value = '';
  pendingFile = null;
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
};

const handleAvatarUpload = async (options: any) => {
  const { file, onError } = options;
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('uid', String(formData.uid));

  try {
    const res = await uploadAvatar(uploadFormData);

    if (res.code === 200) {
      // 更新头像URL
      formData.avatar = res.data.attachment;
      formData.avatar64 = res.data.url;

      ElMessage.success('头像上传成功');
    } else {
      ElMessage.error(res.msg || '头像上传失败');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败');
    onError?.(error);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const submitData: any = {
        uid: formData.uid,
        username: formData.username,
        nickname: formData.nickname,
        email: formData.email,
        mobile: formData.mobile,
        avatar: formData.avatar,
        status: formData.status,
        signature: formData.signature,
        sex: formData.sex,
        auth_group: Array.isArray(formData.auth_group) ? formData.auth_group : []
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      if (formData.avatar) {
        submitData.avatar = formData.avatar;
      }

      const res = await saveMember(submitData);

      if (res.code === 200) {
        ElMessage.success('保存成功');
        emit('success');
        handleClose();
      } else {
        ElMessage.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 关闭抽屉
const handleClose = () => {
  emit('close');
};

watch(
  () => props.user,
  newUser => {
    if (newUser) {
      // 重置表单数据
      const defaultFormData: FormDataInterface = {
        uid: 0,
        username: '',
        nickname: '',
        email: '',
        mobile: '',
        avatar: '',
        avatar64: '',
        avatar128: '',
        authentication: 0,
        status: 1,
        signature: '',
        password: '',
        confirmPassword: '',
        sex: 0,
        auth_group: []
      };

      // 如果有uid，说明是编辑现有用户，使用传入的数据
      if (newUser.uid) {
        // 先复制默认数据和用户数据
        Object.assign(formData, defaultFormData, newUser);

        // 处理用户组数据：如果是对象数组，转换为ID数组
        if (Array.isArray(newUser.auth_group)) {
          // 检查第一个元素是否是对象，如果是则提取ID
          if (newUser.auth_group.length > 0 && typeof newUser.auth_group[0] === 'object') {
            formData.auth_group = newUser.auth_group.map((group: any) => Number(group.id)) as number[];
          }
        }
      } else {
        // 否则是新增用户，使用默认数据
        Object.assign(formData, defaultFormData);
      }

      // 清空密码字段
      formData.password = '';
      formData.confirmPassword = '';
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.member-edit {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.edit-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.edit-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.crop-container {
  width: 100%;
  height: 400px;
  background-color: #f5f5f5;
  overflow: hidden;

  img {
    max-width: 100%;
    display: block;
  }
}

.crop-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
