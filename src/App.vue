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
    <!-- 骨架屏模拟后台管理控制台样式 -->
    <div class="skeleton-console">
      <!-- 侧边栏骨架屏 -->
      <div class="skeleton-aside">
        <div class="skeleton-aside-logo">
          <el-skeleton-item variant="circle" style="width: 40px; height: 40px" />
        </div>
        <div class="skeleton-aside-menu">
          <el-skeleton-item variant="rect" style="width: 100%; height: 36px; margin-bottom: 8px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 36px; margin-bottom: 8px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 36px; margin-bottom: 8px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 36px; margin-bottom: 8px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 36px; margin-bottom: 8px" />
        </div>
      </div>
      <!-- 主内容区 -->
      <div class="skeleton-main">
        <!-- 顶部统计卡片 -->
        <div class="skeleton-stats">
          <el-skeleton-item variant="rect" class="skeleton-stat-card" style="height: 100px" />
          <el-skeleton-item variant="rect" class="skeleton-stat-card" style="height: 100px" />
          <el-skeleton-item variant="rect" class="skeleton-stat-card" style="height: 100px" />
          <el-skeleton-item variant="rect" class="skeleton-stat-card" style="height: 100px" />
        </div>
        <!-- 图表区域 -->
        <div class="skeleton-chart">
          <div class="skeleton-chart-header">
            <el-skeleton-item variant="text" style="width: 150px; height: 20px" />
          </div>
          <div class="skeleton-chart-content">
            <el-skeleton-item variant="rect" style="width: 100%; height: 280px" />
          </div>
        </div>
        <!-- 底部信息区域 -->
        <div class="skeleton-info">
          <div class="skeleton-info-header">
            <el-skeleton-item variant="text" style="width: 100px; height: 20px" />
          </div>
          <div class="skeleton-info-content">
            <el-skeleton-item variant="text" style="width: 30%; height: 16px" />
            <el-skeleton-item variant="text" style="width: 25%; height: 16px" />
            <el-skeleton-item variant="text" style="width: 35%; height: 16px" />
            <el-skeleton-item variant="text" style="width: 28%; height: 16px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted } from 'vue';
import { ElMessage, ElSkeleton } from 'element-plus';
import { useConfigStore } from '@/stores';

const configStore = useConfigStore();
const isReady = ref<boolean>(false);
const error = ref<Error | null>(null);

onErrorCaptured((err: Error, _instance, info: string) => {
  console.error('Vue Error:', err, info);
  ElMessage.error(`应用错误: ${err.message}`);
  error.value = err;
  return false;
});

const reload = (): void => {
  window.location.reload();
};

onMounted(async () => {
  console.log('App mounted successfully');
  await configStore.getConfig();
  isReady.value = true;
});
</script>

<style lang="scss" scoped>
/* 加载容器 */
.loading-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

/* 骨架屏控制台容器 - 左侧边栏 + 右侧内容 */
.skeleton-console {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏骨架屏 */
.skeleton-aside {
  width: 200px;
  min-height: 100vh;
  background: #ffffff;
  padding: 20px 12px;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;

  .skeleton-aside-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }

  .skeleton-aside-menu {
    display: flex;
    flex-direction: column;
  }
}

/* 主内容区 */
.skeleton-main {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

/* 顶部统计卡片区域 - 四列布局 */
.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;

  .skeleton-stat-card {
    background: #ffffff;
    border-radius: 8px;
  }
}

/* 图表区域骨架屏 */
.skeleton-chart {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .skeleton-chart-header {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
  }

  .skeleton-chart-content {
    background: #fafafa;
    border-radius: 4px;
  }
}

/* 底部信息区域骨架屏 */
.skeleton-info {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;

  .skeleton-info-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
  }

  .skeleton-info-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
