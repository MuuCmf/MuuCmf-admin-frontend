<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>应用发生错误</h2>
      <p>{{ error.message }}</p>
      <el-button type="primary" @click="reload">重新加载</el-button>
    </div>
  </div>
  <router-view v-else-if="isReady" />
  <div v-else class="loading-container">
    <el-icon class="is-loading">
      <loading />
    </el-icon>
    <p>应用加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { useConfigStore } from '@/stores';

const configStore = useConfigStore();
const isReady = ref<boolean>(false);
const error = ref<Error | null>(null);

onErrorCaptured((err: Error, _instance, info) => {
  console.error('Vue Error:', err, info);
  ElMessage.error(`应用错误: ${err.message}`);
  error.value = err;
  return false;
});

const reload = () => {
  window.location.reload();
};

onMounted(async () => {
  console.log('App mounted successfully');
  // 初始化应用
  await configStore.getConfig();
  isReady.value = true;
});
</script>

<style lang="scss" scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;

  .error-content {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    h2 {
      color: #f56c6c;
      margin-bottom: 20px;
    }

    p {
      color: #606266;
      margin-bottom: 20px;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;

  .el-icon {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 20px;
  }

  p {
    color: #606266;
    font-size: 16px;
  }
}
</style>
