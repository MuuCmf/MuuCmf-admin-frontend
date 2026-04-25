<template>
  <div class="config-select">
    <el-select :model-value="selectValue" :placeholder="placeholder" @change="handleUpdate">
      <el-option v-for="option in options" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
    <div v-if="props.remark" class="select-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue?: string | number;
  options: Option[];
  placeholder?: string;
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const selectValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

const handleUpdate = (value: string | number) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style lang="scss" scoped>
.config-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  :deep(.el-select) {
    width: 100%;
  }
}

.select-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
