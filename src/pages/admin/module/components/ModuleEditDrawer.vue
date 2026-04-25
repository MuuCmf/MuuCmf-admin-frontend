<template>
  <el-drawer
    :model-value="visible"
    title="编辑应用"
    direction="rtl"
    size="500px"
    :before-close="handleClose"
    @update:model-value="handleUpdateVisible"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
      <el-form-item label="应用名称" prop="alias">
        <el-input v-model="formData.alias" placeholder="请输入应用名称" clearable />
      </el-form-item>
      <el-form-item label="简短描述" prop="summary">
        <el-input v-model="formData.summary" type="textarea" :rows="4" placeholder="请输入简短描述" clearable />
      </el-form-item>
      <el-form-item label="应用图标" prop="icon">
        <Pic v-model="formData.icon" :thumb="formData.icon" />
        <div class="form-tip">建议尺寸：800*800px</div>
      </el-form-item>
      <el-form-item label="开发者" prop="developer">
        <el-input v-model="formData.developer" placeholder="请输入开发者" clearable />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import Pic from '@/components/config/Pic.vue';

interface Props {
  visible: boolean;
  data?: any;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
});

const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const formData = ref({
  id: 0,
  alias: '',
  summary: '',
  icon: '',
  developer: '',
  sort: 0
});

const formRules = {
  alias: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
};

watch(
  () => props.data,
  newData => {
    if (newData && Object.keys(newData).length > 0) {
      formData.value = {
        id: newData.id || 0,
        alias: newData.alias || '',
        summary: newData.summary || '',
        icon: newData.icon || '',
        developer: newData.developer || '',
        sort: newData.sort || 0
      };
    }
  },
  { immediate: true }
);

const handleUpdateVisible = (value: boolean) => {
  emit('update:visible', value);
};

const handleClose = () => {
  emit('update:visible', false);
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    loading.value = true;
    try {
      const res = await request({
        url: 'admin/module/edit',
        method: 'POST',
        data: formData.value
      });
      if (res.code === 200) {
        ElMessage.success('编辑成功');
        emit('update:visible', false);
        formRef.value?.clearValidate();
        emit('success');
      } else {
        ElMessage.error(res.msg || '编辑失败');
      }
    } catch (error) {
      console.error('编辑失败:', error);
      ElMessage.error('编辑失败');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
