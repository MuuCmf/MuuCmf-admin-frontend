<template>
  <div class="config-entity">
    <el-input
      :model-value="entityValue"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
      @update:model-value="handleUpdate"
    />
    <div v-if="props.remark" class="entity-remark">{{ props.remark }}</div>
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

const entityValue = computed({
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
.config-entity {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  :deep(.el-textarea) {
    width: 100%;
  }
}

.entity-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
