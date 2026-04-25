<template>
  <div class="config-num">
    <el-input-number v-model="numValue" :min="min" :max="max" :step="step" />
    <div v-if="props.remark" class="num-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: number | string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 999999,
  step: 1,
  placeholder: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const numValue = computed({
  get: () => {
    if (props.modelValue === undefined || props.modelValue === null) {
      return 0;
    }
    if (typeof props.modelValue === 'string') {
      return Number(props.modelValue);
    }
    return props.modelValue;
  },
  set: (value: number) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});
</script>

<style lang="scss" scoped>
.config-num {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.num-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
