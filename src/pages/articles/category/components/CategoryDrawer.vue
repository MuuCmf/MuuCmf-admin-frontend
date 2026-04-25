<template>
  <el-drawer
    :model-value="visible"
    :title="title"
    direction="rtl"
    size="500px"
    :before-close="handleDrawerClose"
    @update:model-value="handleVisibleUpdate"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="分类名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="封面图片" prop="cover">
        <div class="cover-uploader">
          <el-upload
            class="cover-upload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
            :disabled="uploading"
          >
            <div v-if="formData.cover" class="cover-preview">
              <img :src="formData.cover_200" alt="封面预览" class="cover-image" />
              <div v-if="uploading" class="uploading-mask">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
            <div v-else-if="uploading" class="uploading-placeholder">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <el-button
            v-if="formData.cover"
            class="cover-delete-btn"
            type="danger"
            size="small"
            @click="handleDeleteCover"
          >
            删除
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="上级分类" prop="pid">
        <el-select v-model="formData.pid" placeholder="请选择上级分类" clearable style="width: 100%">
          <el-option key="top-category" label="顶级分类" :value="0" />
          <el-option v-for="cat in parentCategories" :key="`cat-${cat.id}`" :label="cat.title" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="9999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="可投稿" prop="can_post">
        <el-radio-group v-model="formData.can_post">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="需审核" prop="need_audit">
        <el-radio-group v-model="formData.need_audit">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="drawer-footer">
        <el-button @click="handleDrawerClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, FormItemRule } from 'element-plus';
import { Plus, Loading } from '@element-plus/icons-vue';
import { request } from '@/utils/modules/request';

// Props
const props = defineProps<{
  visible: boolean;
  title: string;
  categoryList: any[];
  initialData?: any;
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
  close: [];
}>();

// 表单引用
const formRef = ref();

// 提交加载状态
const submitLoading = ref(false);
// 上传状态
const uploading = ref(false);

// 表单数据
const formData = reactive({
  id: 0,
  title: '',
  cover: '',
  cover_100: '',
  cover_200: '',
  cover_400: '',
  pid: 0,
  can_post: 1,
  need_audit: 1,
  sort: 0,
  status: 1
});

// 监听初始数据变化，更新表单
watch(
  () => props.initialData,
  newData => {
    if (newData) {
      formData.id = newData.id || 0;
      formData.title = newData.title || '';
      formData.cover = newData.cover;
      formData.cover_100 = newData.cover_100;
      formData.cover_200 = newData.cover_200;
      formData.cover_400 = newData.cover_400;
      formData.pid = newData.pid || 0;
      formData.can_post = newData.can_post;
      formData.need_audit = newData.need_audit;
      formData.sort = newData.sort || 0;
      formData.status = newData.status;
    } else {
      // 重置表单
      Object.assign(formData, {
        id: 0,
        title: '',
        cover: '',
        cover_100: '',
        cover_200: '',
        cover_400: '',
        pid: 0,
        can_post: 1,
        need_audit: 1,
        sort: 0,
        status: 1
      });
    }
  },
  { immediate: true, deep: true }
);

// 上级分类列表（排除当前编辑的分类）
const parentCategories = computed(() => {
  return props.categoryList.filter(item => item.id !== formData.id && item.pid === 0);
});

// 表单验证规则
const formRules: Record<string, FormItemRule[]> = {
  title: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  sort: [{ type: 'number', message: '排序必须为数字', trigger: 'blur' }]
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

// 处理图片上传
const handleUpload = async (options: any) => {
  const { file } = options;
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);

  uploading.value = true;

  try {
    const res = await request({
      url: 'api/file/upload',
      method: 'POST',
      data: uploadFormData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.code === 200) {
      formData.cover = res.data.attachment;
      formData.cover_200 = res.data.url || '';
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(res.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
};

// 删除封面图片
const handleDeleteCover = () => {
  formData.cover = '';
  formData.cover_100 = '';
  formData.cover_200 = '';
  formData.cover_400 = '';
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const url = 'articles/admin/category/edit';
      const res = await request({
        url: url,
        method: 'POST',
        data: formData
      });
      if (res.code === 200) {
        ElMessage.success(formData.id > 0 ? '编辑成功' : '新增成功');
        handleDrawerClose();
        emit('success');
      } else {
        ElMessage.error(res.msg || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 处理抽屉可见性更新
const handleVisibleUpdate = (value: boolean) => {
  emit('update:visible', value);
};

// 关闭抽屉
const handleDrawerClose = () => {
  emit('update:visible', false);
  emit('close');
  if (formRef.value) {
    formRef.value.resetFields();
  }
};
</script>

<style lang="scss" scoped>
.drawer-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.cover-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.cover-upload {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    width: 150px;
    height: 150px;

    &:hover {
      border-color: #409eff;
    }
  }
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background-color: #f5f7fa;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

  span {
    font-size: 14px;
    color: #409eff;
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

.cover-delete-btn {
  width: fit-content;
}
</style>
