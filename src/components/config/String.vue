<template>
  <div class="config-string">
    <el-input :model-value="stringValue" :placeholder="placeholder" @update:model-value="handleUpdate" />
    <div v-if="remark" class="string-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string;
  placeholder?: string;
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const stringValue = computed({
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
.config-string {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  :deep(.el-input) {
    width: 100%;
  }
}

.string-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
