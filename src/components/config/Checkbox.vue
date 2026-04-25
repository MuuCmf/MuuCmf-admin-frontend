<template>
  <div class="config-checkbox">
    <el-checkbox-group :model-value="checkboxValue" @change="handleUpdate">
      <el-checkbox v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </el-checkbox>
    </el-checkbox-group>
    <div v-if="props.remark" class="checkbox-remark">{{ remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue?: string | number | (string | number)[];
  options: Option[];
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: (string | number)[]): void;
  (e: 'change', value: (string | number)[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const checkboxValue = computed({
  get: () => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue;
    }
    if (typeof props.modelValue === 'string' && props.modelValue) {
      return props.modelValue
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
    if (typeof props.modelValue === 'number') {
      return [props.modelValue];
    }
    return [];
  },
  set: (value: (string | number)[]) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

const handleUpdate = (value: any[]) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style lang="scss" scoped>
.config-checkbox {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
  display: block;
}
</style>
