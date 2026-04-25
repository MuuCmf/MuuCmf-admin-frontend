<template>
  <font-awesome-icon v-if="iconValid" :icon="iconArray" v-bind="$attrs" :aria-hidden="false" />
  <font-awesome-icon v-else :icon="['fas', defaultIcon]" v-bind="$attrs" :aria-hidden="false" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getIconArray } from '@/utils/modules/iconUtils';

interface Props {
  icon: string | undefined;
  defaultIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultIcon: 'question-circle'
});

const iconValid = computed(() => {
  if (!props.icon || typeof props.icon !== 'string') return false;
  return Boolean(props.icon.trim());
});

const iconArray = computed(() => {
  return getIconArray(props.icon);
});
</script>
