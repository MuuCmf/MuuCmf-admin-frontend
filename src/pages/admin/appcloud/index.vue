<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="icon-wrapper">
        <svg class="construction-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
          <path
            d="M32 18V32L42 38"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="32" cy="32" r="3" fill="currentColor" />
        </svg>
      </div>
      <h1 class="title">应用市场</h1>
      <p class="subtitle">功能开发中</p>
      <div class="divider"></div>
      <p class="description">
        正在紧锣密鼓地开发中<br />
        即将为您带来更多精彩功能
      </p>
      <div class="features-preview">
        <div class="feature-item">
          <span class="feature-dot"></span>
          <span>云端应用管理</span>
        </div>
        <div class="feature-item">
          <span class="feature-dot"></span>
          <span>一键安装升级</span>
        </div>
        <div class="feature-item">
          <span class="feature-dot"></span>
          <span>精品应用推荐</span>
        </div>
      </div>
      <div class="action-area">
        <el-button type="primary" size="large" @click="handleGoBack">
          <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
          返回控制台
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue';

const handleGoBack = () => {
  window.location.href = '/';
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 40px 20px;
}

.content-wrapper {
  text-align: center;
  width: 500px;
  padding: 60px 40px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.construction-icon {
  width: 80px;
  height: 80px;
  color: #03b8cf;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 18px;
  font-weight: 500;
  color: #03b8cf;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #03b8cf 0%, #06d6e0 100%);
  margin: 0 auto 24px auto;
  border-radius: 2px;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #64748b;
  margin: 0 0 32px 0;
}

.features-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #475569;
}

.feature-dot {
  width: 6px;
  height: 6px;
  background: #03b8cf;
  border-radius: 50%;
}

.action-area {
  display: flex;
  justify-content: center;
}

html.dark {
  .page-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .content-wrapper {
    background: #1e293b;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  .title {
    color: #f1f5f9;
  }

  .description {
    color: #94a3b8;
  }

  .features-preview {
    background: #0f172a;
  }

  .feature-item {
    color: #cbd5e1;
  }
}
</style>
