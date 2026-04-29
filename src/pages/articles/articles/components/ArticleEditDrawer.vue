<template>
  <el-drawer
    :model-value="visible"
    :title="title"
    direction="rtl"
    size="900px"
    :before-close="handleDrawerClose"
    @update:model-value="handleVisibleUpdate"
  >
    <div class="drawer-content">
      <div class="drawer-scroll">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item label="文章描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入文章描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="文章分类" prop="category_id">
            <el-tree-select
              :key="categorySelectKey"
              v-model="formData.category_id"
              :data="categoryList"
              :props="{ label: 'title', children: '_child' }"
              value-key="id"
              placeholder="请选择文章分类"
              clearable
              check-strictly
              default-expand-all
              style="width: 100%"
            />
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
                  <img :src="formData.cover_200 || formData.cover" alt="封面预览" class="cover-image" />
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
          <el-form-item label="文章内容" prop="content">
            <div class="editor-container">
              <Toolbar
                :key="editorToolbarKey"
                class="editor-toolbar"
                :editor="editorRef"
                :default-config="toolbarConfig"
                mode="default"
              />
              <Editor
                ref="editorContainerRef"
                :key="editorContentKey"
                v-model="formData.content"
                class="editor-content"
                :default-config="editorConfig"
                mode="default"
                @on-created="handleCreated"
                @on-change="handleEditorChange"
              />
            </div>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" :max="9999" />
          </el-form-item>
          <el-form-item label="自定义浏览量" prop="f_view">
            <el-input-number v-model="formData.f_view" :min="0" :max="999999" />
          </el-form-item>
          <el-form-item label="自定义点赞量" prop="f_support">
            <el-input-number v-model="formData.f_support" :min="0" :max="999999" />
          </el-form-item>
          <el-form-item label="自定义收藏量" prop="f_favorites">
            <el-input-number v-model="formData.f_favorites" :min="0" :max="999999" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
              <el-radio :value="-1">未审核</el-radio>
              <el-radio :value="-2">审核未通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formData.status === -2" label="未通过原因" prop="reason">
            <el-input
              v-model="formData.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入审核未通过的原因"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="handleDrawerClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount, shallowRef } from 'vue';
import { ElMessage, FormItemRule } from 'element-plus';
import { Plus, Loading } from '@element-plus/icons-vue';
import { request } from '@/utils/modules/request';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';

// 引入样式
import '@wangeditor/editor/dist/css/style.css';

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
const editorToolbarKey = ref('');
const editorContentKey = ref('');

// 计算属性：为分类选择器生成稳定的key
const categorySelectKey = computed(() => {
  return `category-select-${formData.id || 'new'}`;
});

// 提交加载状态
const submitLoading = ref(false);
// 上传状态
const uploading = ref(false);

// 富文本编辑器
const editorRef = shallowRef<IDomEditor>();
const isEditorCreated = ref(false);
const toolbarConfig: Partial<IToolbarConfig> = {};
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入文章内容...',
  scroll: true,
  MENU_CONF: {
    uploadImage: {
      server: '/api/file/upload',
      fieldName: 'file',
      maxFileSize: 2 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      async customUpload(file: File, insertFn: any) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await request({
            url: 'api/file/upload',
            method: 'POST',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          if (res.code === 200) {
            insertFn(res.data.url, res.data.url, res.data.url);
          } else {
            ElMessage.error(res.msg || '上传失败');
          }
        } catch (error) {
          console.error('上传失败:', error);
          ElMessage.error('上传失败');
        }
      }
    }
  }
};

// 表单数据
const formData = reactive({
  id: 0,
  title: '',
  description: '',
  cover: '',
  cover_100: '',
  cover_200: '',
  cover_400: '',
  category_id: 0,
  content: '',
  status: 1,
  sort: 0,
  view: 0,
  f_view: 0,
  f_support: 0,
  f_favorites: 0,
  reason: ''
});

// 监听初始数据变化，更新表单
watch(
  () => props.initialData,
  newData => {
    if (newData) {
      formData.id = newData.id || 0;
      formData.title = newData.title || '';
      formData.description = newData.description || '';
      formData.cover = newData.cover || '';
      formData.cover_100 = newData.cover_100 || '';
      formData.cover_200 = newData.cover_200 || '';
      formData.cover_400 = newData.cover_400 || '';
      formData.category_id = newData.category_id || 0;
      formData.status = newData.status || 1;
      formData.sort = newData.sort || 0;
      formData.view = newData.view || 0;
      formData.f_view = newData.f_view || 0;
      formData.f_support = newData.f_support || 0;
      formData.f_favorites = newData.f_favorites || 0;
      formData.reason = newData.reason || '';
      // 通过 v-model 更新内容
      formData.content = newData.content || '';

      editorToolbarKey.value = 'editorToolbarKey' + formData.id;
      editorContentKey.value = 'editorContentKey' + formData.id;

      // 延时调整高度，确保 DOM 更新完成
      setTimeout(() => {
        adjustEditorHeight();
      }, 200);
    } else {
      // 重置表单
      Object.assign(formData, {
        id: 0,
        title: '',
        description: '',
        cover: '',
        cover_100: '',
        cover_200: '',
        cover_400: '',
        category_id: 0,
        status: 1,
        sort: 0,
        view: 0,
        f_view: 0,
        f_support: 0,
        f_favorites: 0,
        reason: ''
      });

      // 通过 v-model 清空内容
      formData.content = '';

      // 延时调整高度
      setTimeout(() => {
        adjustEditorHeight();
      }, 200);
    }
  },
  { immediate: true, deep: true }
);

// 表单验证规则
const formRules: Record<string, FormItemRule[]> = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category_id: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少需要10个字符', trigger: 'blur' }
  ],
  sort: [{ type: 'number', message: '排序必须为数字', trigger: 'blur' }],
  f_view: [{ type: 'number', message: '自定义浏览量必须为数字', trigger: 'blur' }],
  f_support: [{ type: 'number', message: '自定义点赞量必须为数字', trigger: 'blur' }],
  f_favorites: [{ type: 'number', message: '自定义收藏量必须为数字', trigger: 'blur' }],
  reason: [
    {
      required: true,
      message: '请输入审核未通过的原因',
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (formData.status === -2 && !value) {
          callback(new Error('请输入审核未通过的原因'));
        } else {
          callback();
        }
      }
    }
  ]
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
      formData.cover_400 = res.data.url || '';
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

// 处理抽屉可见性更新
const handleVisibleUpdate = (value: boolean) => {
  emit('update:visible', value);
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const url = 'articles/admin/articles/edit';
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

// 关闭抽屉
const handleDrawerClose = () => {
  emit('update:visible', false);
  emit('close');
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 编辑器创建完成
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
  isEditorCreated.value = true;

  // 延时调整高度，确保 DOM 完全渲染
  setTimeout(() => {
    adjustEditorHeight();
  }, 100);
};

// 编辑器内容变化
const handleEditorChange = (_editor: IDomEditor) => {
  adjustEditorHeight();
};

// 调整编辑器高度
const adjustEditorHeight = () => {
  if (!editorRef.value) return;

  const editor = editorRef.value;
  const editorElement = editor.getEditableContainer();

  if (editorElement) {
    const scrollHeight = editorElement.scrollHeight;
    const minHeight = 300;
    const maxHeight = 800;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    const htmlElement = editorElement as HTMLElement;
    htmlElement.style.minHeight = `${minHeight}px`;
    htmlElement.style.height = `${newHeight}px`;
  }
};

// 组件销毁前，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
  isEditorCreated.value = false;
});
</script>

<style lang="scss" scoped>
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
    width: 200px;
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

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  border-bottom: 1px solid #ccc;
}

.editor-content {
  min-height: 300px;
  max-height: 800px;
  overflow-y: auto;

  :deep(.w-e-text-container) {
    min-height: 300px;
    max-height: 800px;
    overflow-y: auto;
  }

  :deep(.w-e-scroll) {
    min-height: 300px !important;
    overflow-y: auto !important;
  }

  :deep(.w-e-textarea) {
    min-height: 300px !important;
  }
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.drawer-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
}
</style>
