import { ref, nextTick } from 'vue';

export function useScrollReset() {
  const scrollContainerRef = ref<HTMLElement | null>(null);

  const resetScrollTop = () => {
    nextTick(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.scrollTop = 0;
      }
    });
  };

  return {
    scrollContainerRef,
    resetScrollTop
  };
}
