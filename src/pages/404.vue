<template>
  <el-result icon="error" title="404" sub-title="您访问的页面不见喽~">
    <template #extra>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </template>
  </el-result>
</template>

<script setup lang="ts">
const goHome = () => {
  window.location.href = window.location.origin + '/';
};
</script>

<style scoped lang="scss"></style>
