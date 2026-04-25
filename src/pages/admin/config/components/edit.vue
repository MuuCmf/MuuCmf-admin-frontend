<template>
  <div class="config-edit-wrapper">
    <div class="edit-header">
      <h3>{{ config.id ? '编辑配置' : '添加配置' }}</h3>
      <el-button :icon="Close" circle @click="handleClose" />
    </div>
    <div class="edit-content">
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="配置名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入配置名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="配置标识" prop="name">
          <el-input v-model="formData.name" placeholder="请输入配置标识（英文）" maxlength="50" show-word-limit />
          <div class="form-tip">用于代码中调用，建议使用大写字母和下划线</div>
        </el-form-item>

        <el-form-item label="配置类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择配置类型" @change="handleTypeChange">
            <el-option v-for="option in typeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="配置分组" prop="group">
          <el-select v-model="formData.group" placeholder="请选择配置分组">
            <el-option v-for="(label, key) in props.group" :key="key" :label="key + ':' + label" :value="key" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showExtra" label="配置选项" prop="extra">
          <el-input
            v-model="formData.extra"
            type="textarea"
            :rows="4"
            placeholder="请输入配置选项，格式：值:标签，每行一个"
          />
          <div class="form-tip">用于下拉选择、单选、多选类型</div>
        </el-form-item>

        <el-form-item label="配置值" prop="value">
          <el-input
            v-model="formData.value"
            :type="showTextarea ? 'textarea' : 'text'"
            :rows="showTextarea ? 4 : 1"
            placeholder="请输入配置值"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" placeholder="请输入排序值" />
          <div class="form-tip">数值越大排序越靠前</div>
        </el-form-item>

        <el-form-item label="配置说明" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入配置说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { saveConfig } from '@/api/admin/config';
import { typeOptions } from '@/utils/modules/config';

interface Props {
  config: ConfigItem;
  group: Record<string, string>;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const submitLoading = ref(false);

const formData = reactive({
  id: 0,
  title: '',
  name: '',
  type: 'string',
  group: '',
  extra: '',
  value: '',
  remark: '',
  sort: 0
});

const showExtra = computed(() => {
  return ['select', 'radio', 'checkbox'].includes(formData.type);
});

const showTextarea = computed(() => {
  return ['textarea', 'entity', 'editor'].includes(formData.type);
});

const resetForm = () => {
  formData.id = 0;
  formData.title = '';
  formData.name = '';
  formData.type = 'string';
  formData.group = '';
  formData.extra = '';
  formData.value = '';
  formData.remark = '';
  formData.sort = 0;
  formRef.value?.clearValidate();
};

watch(
  () => props.config,
  val => {
    if (val && val.id) {
      formData.id = val.id || 0;
      formData.title = val.title || '';
      formData.name = val.name || '';
      formData.type = val.type || 'string';
      formData.group = val.group ?? '';
      formData.extra = val.extra || '';
      formData.value = val.value || '';
      formData.remark = val.remark || '';
      formData.sort = val.sort ?? 0;
    } else {
      resetForm();
    }
  },
  { immediate: true, deep: true }
);

const handleTypeChange = () => {
  formData.extra = '';
  formData.value = '';
};

const handleClose = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const data = { ...formData };

      if (props.config.id) {
        data.id = props.config.id;
      }

      const res = await saveConfig(data);

      if (res.code === 200) {
        ElMessage.success(props.config.id ? '编辑成功' : '添加成功');
        emit('success');
        emit('close');
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.config-edit-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
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
  padding: 24px;
  overflow-y: auto;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.edit-footer {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
