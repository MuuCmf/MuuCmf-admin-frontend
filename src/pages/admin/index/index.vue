<template>
  <div class="page-container">
    <div class="page-content">
      <div class="with-container">
        <div class="index-container">
          <div class="data-box">
            <el-row :gutter="10">
              <el-col :span="6">
                <div class="small-box bg-green">
                  <div class="inner">
                    <h3>{{ consoleData.count?.today_action_log || 0 }}</h3>
                    <p>今日用户行为</p>
                  </div>
                  <div class="small-icon-box">
                    <safe-icon icon="fas copy" />
                  </div>
                  <div class="small-box-footer">更多 <safe-icon icon="fas arrow-right" /></div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="small-box bg-blue">
                  <div class="inner">
                    <h3>{{ consoleData.count?.today_user || 0 }}</h3>
                    <p>今日新增</p>
                  </div>
                  <div class="small-icon-box">
                    <safe-icon icon="fas user" />
                  </div>
                  <div class="small-box-footer">更多 <safe-icon icon="fas arrow-right" /></div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="small-box bg-yellow">
                  <div class="inner">
                    <h3>{{ consoleData.count?.total_user || 0 }}</h3>
                    <p>总用户</p>
                  </div>
                  <div class="small-icon-box">
                    <safe-icon icon="fas users" />
                  </div>
                  <div class="small-box-footer">更多 <safe-icon icon="fas arrow-right" /></div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="small-box bg-red">
                  <div class="inner">
                    <h3>{{ consoleData.count?.login_users || 0 }}</h3>
                    <p>今日登录</p>
                  </div>
                  <div class="small-icon-box">
                    <safe-icon icon="fas sign-in-alt" />
                  </div>
                  <div class="small-box-footer">更多 <safe-icon icon="fas arrow-right" /></div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="chart-box">
            <div class="chart-header">
              <h3>最近10天用户增长趋势</h3>
            </div>
            <div class="chart-content">
              <div ref="chartRef" class="chart-container"></div>
            </div>
          </div>

          <div class="console-box">
            <el-row :gutter="10">
              <el-col :span="24">
                <div class="console-main">
                  <div class="console-header">
                    <h3>系统信息</h3>
                  </div>
                  <div class="console-content">
                    <div class="system-info">
                      <div class="info-content">
                        <div class="info-item">
                          <span class="info-label">框架版本：</span>
                          <span class="info-value">{{ consoleData.system_info?.version || '-' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">操作系统：</span>
                          <span class="info-value">{{ consoleData.system_info?.os || '-' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">服务器软件：</span>
                          <span class="info-value">{{ consoleData.system_info?.server_software || '-' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">MySQL版本：</span>
                          <span class="info-value">{{ consoleData.system_info?.mysql_version || '-' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Redis版本：</span>
                          <span class="info-value">{{ consoleData.system_info?.redis_version || '-' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">上传限制：</span>
                          <span class="info-value">{{ consoleData.system_info?.upload_max_filesize || '-' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import { request } from '@/utils/modules/request';
import * as echarts from 'echarts';

const router = useRouter();

interface CountData {
  today_action_log?: number;
  today_user?: number;
  total_user?: number;
  login_users?: number;
}

interface RegMemberData {
  count_day?: string;
  data?: {
    days?: string[];
    data?: number[];
  };
}

interface SystemInfoData {
  os?: string;
  server_software?: string;
  mysql_version?: string;
  redis_version?: string;
  upload_max_filesize?: string;
  version?: string;
}

interface ConsoleData {
  count?: CountData;
  reg_member?: RegMemberData;
  system_info?: SystemInfoData;
}

const loading = ref<boolean>(true);
const consoleData = ref<ConsoleData>({});
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let updateNotificationInstance: any = null;

/**
 * 获取控制台数据
 */
const getConsoleData = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: 'admin/index/index',
      method: 'get'
    });
    if (res.code === 200) {
      consoleData.value = res.data;
      await nextTick();
      initChart();
      loading.value = false;
    } else {
      ElMessage.error(res.msg || '获取数据失败');
    }
  } catch {
    ElMessage.error('获取数据失败，请稍后重试');
  }
};

/**
 * 检查更新
 */
const checkUpdate = async () => {
  try {
    const res = await request({
      url: 'admin/update/index',
      method: 'GET'
    });
    if (res.code === 200 && res.data.upgrade) {
      if (updateNotificationInstance) {
        updateNotificationInstance.close();
      }
      updateNotificationInstance = ElNotification({
        title: '发现新版本',
        message: `新版本 ${res.data.cloud_version.version} 可用，点击立即更新`,
        type: 'warning',
        position: 'bottom-right',
        duration: 0,
        customClass: 'update-notification',
        onClick: () => {
          router.push('/admin/update/index');
        }
      });
    }
  } catch (error) {
    console.error('检查更新失败:', error);
  }
};

/**
 * 初始化图表数据
 */
const initChart = () => {
  if (!chartRef.value || !consoleData.value.reg_member) {
    return;
  }

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const data = consoleData.value.reg_member.data?.data || [];
  const days = consoleData.value.reg_member.data?.days || [];
  const isAllZero = data.length > 0 && data.every((item: number) => item === 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      },
      formatter: (params: any) => {
        const param = params[0];
        return `<div style="padding: 8px;">
					<div style="font-weight: 600; margin-bottom: 4px;">${param.name}</div>
					<div style="display: flex; align-items: center;">
						<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #409eff; margin-right: 8px;"></span>
						<span>注册人数: <strong>${param.value}</strong> 人</span>
					</div>
				</div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: {
        interval: 0,
        rotate: 30,
        color: '#606266',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        formatter: '{value}人',
        color: '#909399',
        fontSize: 12
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f5f7fa',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '注册人数',
        type: 'bar',
        data: data,
        barWidth: '45%',
        itemStyle: {
          color: '#409eff',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#66b1ff'
          }
        },
        label: {
          show: !isAllZero,
          position: 'top',
          formatter: '{c}',
          color: '#409eff',
          fontSize: 12,
          fontWeight: '500'
        },
        animationDelay: (idx: number) => idx * 100
      }
    ],
    animationEasing: 'cubicOut' as any,
    animationDelayUpdate: (idx: number) => idx * 5
  };

  chartInstance.setOption(option);

  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
};

onMounted(() => {
  getConsoleData();
  checkUpdate();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', () => {
    chartInstance?.resize();
  });
  if (updateNotificationInstance) {
    updateNotificationInstance.close();
    updateNotificationInstance = null;
  }
});
</script>

<style lang="scss">
.update-notification {
  cursor: pointer !important;
}

html.dark .update-notification {
  background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%) !important;
}
</style>

<style lang="scss" scoped>
.page-container {
  margin-bottom: 10px;
  height: calc(100% - 20px);

  .page-content {
    background-color: transparent;
    .with-container {
      overflow-x: hidden;
    }
  }
}

.data-box {
  margin-bottom: 10px;

  .small-box {
    position: relative;
    height: 120px;
    border-radius: 6px;
    padding: 20px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .inner {
      h3 {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        color: #fff;
      }

      p {
        font-size: 14px;
        margin: 0;
        color: #fff;
        opacity: 0.9;
      }
    }

    .small-icon-box {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 48px;
      color: #fff;
      opacity: 0.3;
    }

    .small-box-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px 20px;
      background-color: rgba(0, 0, 0, 0.1);
      color: #fff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.2);

        i {
          transform: translateX(3px);
        }
      }

      i {
        font-size: 10px;
        margin-left: 5px;
        transition: transform 0.3s ease;
      }
    }
  }

  .bg-green {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  .bg-blue {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  }

  .bg-yellow {
    background: linear-gradient(135deg, #ff9900 0%, #f7b603 100%);
  }

  .bg-red {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  }
}

.console-box {
  padding: 0;

  .console-main {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .console-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .console-content {
    padding: 20px;

    .system-info {
      .info-content {
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            font-size: 14px;
            color: #909399;
          }

          .info-value {
            font-size: 14px;
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.chart-box {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;

  .chart-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .chart-content {
    padding: 20px;

    .chart-container {
      width: 100%;
      height: 400px;
    }
  }
}

@media (max-width: 768px) {
  .data-box {
    .el-col {
      margin-bottom: 20px;
    }
  }
}

html.dark {
  .chart-box {
    background-color: #262626;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

    .chart-header {
      border-bottom: 1px solid #363636;

      h3 {
        color: #e5e5e5;
      }
    }
  }

  .console-box {
    .console-main {
      background-color: #262626;

      .console-header {
        border-bottom: 1px solid #303133;

        h3 {
          color: #fff;
        }
      }

      .console-content {
        .system-info {
          .info-content {
            .info-item {
              border-bottom: 1px solid #303133;

              .info-label {
                color: #909399;
              }

              .info-value {
                color: #fff;
              }
            }
          }
        }
      }
    }
  }
}

.update-notification {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%) !important;
  border: 2px solid #ffa940 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(255, 165, 64, 0.3) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;

  &:hover {
    background: linear-gradient(135deg, #ffe7ba 0%, #ffd591 100%) !important;
    box-shadow: 0 6px 20px rgba(255, 165, 64, 0.4) !important;
    transform: translateY(-2px) !important;
  }

  :deep(.el-notification__title) {
    color: #d46b08 !important;
    font-weight: 600 !important;
    font-size: 16px !important;
  }

  :deep(.el-notification__content) {
    color: #874d00 !important;
    font-size: 14px !important;
    margin-top: 8px !important;
  }

  :deep(.el-notification__icon) {
    color: #fa8c16 !important;
    font-size: 24px !important;
  }
}

html.dark .update-notification {
  background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%) !important;
  border: 2px solid #ffa940 !important;

  &:hover {
    background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%) !important;
  }

  :deep(.el-notification__title) {
    color: #ffa940 !important;
  }

  :deep(.el-notification__content) {
    color: #d4a76a !important;
  }
}
</style>
