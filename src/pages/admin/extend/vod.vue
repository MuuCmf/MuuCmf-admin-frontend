<template>
  <div class="page-container">
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="store-config-container">
          <!-- 上部分：配置项 -->
          <div class="store-basic-config">
            <h3 class="config-section-title">点播基本配置</h3>
            <el-form ref="formRef" :model="formData" label-width="150px" label-position="right">
              <el-form-item v-for="item in vodConfigList" :key="item.id" :label="item.title">
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
              <el-tab-pane label="腾讯云点播" name="tencent">
                <div class="cloud-config-content">
                  <el-form :model="formData" label-width="150px" label-position="right">
                    <el-form-item v-for="item in tencentVodConfigList" :key="item.id" :label="item.title">
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

// 点播相关配置分组
const groupParams = 'vod,tencent_vod';

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const activeTab = ref<string>('tencent');
const configList = ref<ConfigItem[]>([]);

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive<Record<string, any>>({});

// 筛选出基本配置项
const vodConfigList = computed(() => {
  return configList.value.filter(item => item.group === 'vod');
});

// 筛选出腾讯云VOD配置项
const tencentVodConfigList = computed(() => {
  return configList.value.filter(item => item.group === 'tencent_vod');
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
      url: 'admin/extend/vod',
      method: 'POST',
      data: formData
    });

    if (res.code === 200) {
      ElMessage.success('保存成功');
      getExtendConfig();
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

// 获取扩展配置列表
const getExtendConfig = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/extend/list',
      method: 'GET',
      data: {
        load: 'all',
        group: groupParams
      }
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

// 组件挂载时获取扩展配置列表
onMounted(async () => {
  // 获取扩展配置列表
  await getExtendConfig();

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
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.cloud-config-tabs {
  padding: 30px;

  .cloud-config-content {
    padding: 20px 0;
    min-height: 300px;
  }
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
