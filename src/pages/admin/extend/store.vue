<template>
  <div class="page-container">
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="store-config-container">
          <!-- 上部分：存储配置项 -->
          <div class="store-basic-config">
            <h3 class="config-section-title">存储基本配置</h3>
            <el-form ref="formRef" :model="formData" label-width="150px" label-position="right">
              <el-form-item v-for="item in storeConfigList" :key="item.id" :label="item.title">
                <component
                  :is="getConfigComponent(item.type)"
                  v-model="formData[item.name]"
                  :options="parseOptions(item.extra)"
                  :placeholder="item.remark"
                  :remark="item.remark"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 下半部分：云厂商配置标签页 -->
          <div class="cloud-config-tabs">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane label="阿里云OSS" name="aliyun">
                <div class="cloud-config-content">
                  <el-form :model="formData" label-width="150px" label-position="right">
                    <el-form-item v-for="item in aliyunOssConfigList" :key="item.id" :label="item.title">
                      <component
                        :is="getConfigComponent(item.type)"
                        v-model="formData[item.name]"
                        :options="parseOptions(item.extra)"
                        :placeholder="item.remark"
                        :remark="item.remark"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <el-tab-pane label="腾讯云COS" name="tencent">
                <div class="cloud-config-content">
                  <el-form :model="formData" label-width="150px" label-position="right">
                    <el-form-item v-for="item in tencentCosConfigList" :key="item.id" :label="item.title">
                      <component
                        :is="getConfigComponent(item.type)"
                        v-model="formData[item.name]"
                        :options="parseOptions(item.extra)"
                        :placeholder="item.remark"
                        :remark="item.remark"
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 保存按钮 -->
          <div class="store-config-actions">
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存配置</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import {
  Num,
  String,
  Textarea,
  Entity,
  Password,
  Select,
  Radio,
  Checkbox,
  Editor,
  Pic,
  File
} from '@/components/config';

// 存储相关配置分组
const groupParams = 'store,aliyun_oss,tencent_cos';

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const activeTab = ref<string>('aliyun');
const configList = ref<ConfigItem[]>([]);

// 筛选出存储基本配置项
const storeConfigList = computed(() => {
  return configList.value.filter(item => item.group === 'store');
});

// 筛选出阿里云OSS配置项
const aliyunOssConfigList = computed(() => {
  return configList.value.filter(item => item.group === 'aliyun_oss');
});

// 筛选出腾讯云COS配置项
const tencentCosConfigList = computed(() => {
  return configList.value.filter(item => item.group === 'tencent_cos');
});

// 解析选项数据
const parseOptions = (extra: string) => {
  if (!extra) return [];
  return extra
    .split(/[\r\n]+/)
    .map(line => {
      const [value, label] = line.split(':');
      return {
        value: value?.trim() || '',
        label: label?.trim() || value?.trim() || ''
      };
    })
    .filter(option => option.value);
};

// 根据配置类型获取对应组件
const getConfigComponent = (type: string) => {
  const componentMap: Record<string, any> = {
    num: Num,
    string: String,
    password: Password,
    textarea: Textarea,
    entity: Entity,
    select: Select,
    radio: Radio,
    checkbox: Checkbox,
    editor: Editor,
    pic: Pic,
    file: File
  };
  return componentMap[type] || String;
};

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive<Record<string, any>>({});

// 标签页切换
const handleTabChange = (tab: string | number) => {
  activeTab.value = tab as string;
};

// 提交配置
const handleSubmit = async () => {
  if (!formRef.value) return;

  submitLoading.value = true;
  try {
    const res = await request({
      url: 'admin/extend/store',
      method: 'POST',
      data: formData
    });

    if (res.code === 200) {
      ElMessage.success('保存成功');
      getStoreConfig();
    } else {
      ElMessage.error('保存失败：' + res.msg);
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    submitLoading.value = false;
  }
};

// 获取存储相关配置项 1为存储配置组ID 6阿里云OSS 7腾讯云COS
const getStoreConfig = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/extend/list',
      data: {
        load: 'all',
        group: groupParams
      },
      method: 'GET'
    });

    if (res.code === 200) {
      configList.value = res.data;
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    ElMessage.error('获取配置失败');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取配置
onMounted(async () => {
  // 获取存储配置项
  await getStoreConfig();
  // 初始化表单数据
  configList.value.forEach(item => {
    formData[item.name] = item.value;
  });
});
</script>

<style lang="scss" scoped>
.page-container {
  height: calc(100% - 20px);
}

.store-basic-config {
  padding: 30px;
  border-bottom: 1px solid #e4e7ed;
}

.config-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.cloud-config-tabs {
  padding: 30px;
}

.cloud-config-content {
  min-height: 300px;
}

.store-config-actions {
  padding: 30px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
}

:deep(.el-form-item) {
  margin-bottom: 28px;
}

:deep(.el-tabs) {
  .el-tabs__header {
    margin-bottom: 20px;

    .el-tabs__item {
      padding: 0 20px;
      font-size: 14px;
    }
  }
}

html.dark {
  .store-config-container {
    background-color: #262626;
  }

  .store-basic-config {
    border-bottom-color: #363636;
  }

  .config-section-title {
    color: #e5e5e5;
    border-bottom-color: #363636;
  }

  .store-config-actions {
    border-top-color: #363636;
  }
}
</style>
