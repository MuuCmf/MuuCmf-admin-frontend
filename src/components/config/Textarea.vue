<template>
  <div class="config-textarea">
    <el-input
      :model-value="textareaValue"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
      @update:model-value="handleUpdate"
    />
    <div v-if="props.remark" class="textarea-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string;
  rows?: number;
  placeholder?: string;
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  placeholder: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

const handleUpdate = (value: string) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style lang="scss" scoped>
.config-textarea {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  :deep(.el-textarea) {
    width: 100%;
  }
}

.textarea-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
