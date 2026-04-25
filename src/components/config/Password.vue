<template>
  <div class="config-password">
    <el-input
      :model-value="passwordValue"
      type="password"
      :placeholder="placeholder"
      show-password
      @update:model-value="handleUpdate"
    />
    <div v-if="props.remark" class="password-remark">{{ props.remark }}</div>
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

const passwordValue = computed({
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
.config-password {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  :deep(.el-input) {
    width: 100%;
  }
}

.password-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
