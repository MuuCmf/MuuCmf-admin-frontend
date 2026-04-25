<template>
  <div class="config-radio">
    <el-radio-group :model-value="radioValue" @change="handleUpdate">
      <el-radio v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </el-radio>
    </el-radio-group>
    <div v-if="props.remark" class="radio-remark">{{ props.remark }}</div>
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
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const radioValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

const handleUpdate = (value: any) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style lang="scss" scoped>
.config-radio {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.radio-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
