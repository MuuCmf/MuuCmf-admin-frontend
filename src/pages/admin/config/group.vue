<template>
  <div class="page-container">
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div ref="configContainer" class="config-container">
          <el-tabs v-model="groupIndex" class="config-tabs" @tab-change="handleTabChange">
            <el-tab-pane v-for="(label, key) in group" :key="key" :label="label" :name="Number(key)">
              <div class="config-content">
                <el-form ref="formRef" :model="formData" label-width="150px" label-position="right">
                  <el-form-item v-for="item in currentList" :key="item.id" :label="item.title" :prop="item.name">
                    <Num
                      v-if="item.type === 'num'"
                      v-model="formData[item.name]"
                      :min="0"
                      :max="999999"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <String
                      v-else-if="item.type === 'string'"
                      v-model="formData[item.name]"
                      :placeholder="item.remark"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Password
                      v-else-if="item.type === 'password'"
                      v-model="formData[item.name]"
                      :placeholder="item.remark"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Textarea
                      v-else-if="item.type === 'textarea'"
                      v-model="formData[item.name]"
                      :rows="4"
                      :placeholder="item.remark"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Entity
                      v-else-if="item.type === 'entity'"
                      v-model="formData[item.name]"
                      :rows="4"
                      :placeholder="item.remark"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Select
                      v-else-if="item.type === 'select'"
                      v-model="formData[item.name]"
                      :options="parseOptions(item.extra)"
                      :placeholder="item.remark"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Radio
                      v-else-if="item.type === 'radio'"
                      v-model="formData[item.name]"
                      :options="parseOptions(item.extra)"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Checkbox
                      v-else-if="item.type === 'checkbox'"
                      v-model="formData[item.name]"
                      :options="parseOptions(item.extra)"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Editor
                      v-else-if="item.type === 'editor'"
                      v-model="formData[item.name]"
                      :rows="6"
                      :placeholder="item.remark"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />

                    <Pic
                      v-else-if="item.type === 'pic'"
                      v-model="formData[item.name]"
                      :thumb="item.thumb?.['origin']"
                      :url="item.url"
                      :remark="item.remark"
                      tip="支持 JPG、PNG格式"
                      @change="handleConfigChange"
                    />

                    <File
                      v-else-if="item.type === 'file'"
                      v-model="formData[item.name]"
                      :url="item.url || ''"
                      :remark="item.remark"
                      @change="handleConfigChange"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div class="config-actions">
        <el-button type="primary" size="large" :loading="submitLoading" @click="handleSubmit">
          <safe-icon icon="fas save" />
          保存配置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getConfigGroupData, saveConfigGroupData } from '@/api/admin/config';
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

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const groupIndex = ref(1);
const group = ref<ConfigGroup>({});
const currentList = ref<ConfigItem[]>([]);

// 表单引用
const formRef = ref();
const formData = reactive<Record<string, any>>({});

// 解析配置项的extra字段
const parseOptions = (extra: string) => {
  if (!extra) return [];

  try {
    const options = JSON.parse(extra);
    return Array.isArray(options) ? options : [];
  } catch {
    try {
      if (extra.includes('\r\n')) {
        const lines = extra.split('\r\n');
        return lines
          .map(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
              return {
                value: parts[0].trim(),
                label: parts.slice(1).join(':').trim()
              };
            }
            return null;
          })
          .filter(Boolean);
      } else if (extra.includes(',')) {
        const items = extra.split(',');
        return items
          .map(item => {
            const parts = item.split(':');
            if (parts.length >= 2) {
              return {
                value: parts[0].trim(),
                label: parts.slice(1).join(':').trim()
              };
            }
            return null;
          })
          .filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }
};

const handleConfigChange = () => {};

// 获取配置分组数据列表
const getConfigGroupList = async () => {
  loading.value = true;
  try {
    const res = await getConfigGroupData({
      group: groupIndex.value
    });

    if (res.code === 200) {
      group.value = res.data.group;
      currentList.value = res.data.list;

      currentList.value.forEach(item => {
        let value = item.value;
        formData[item.name] = value;
      });
    }
  } catch (error) {
    console.error('获取配置组失败:', error);
    ElMessage.error('获取配置组失败');
  } finally {
    loading.value = false;
  }
};

// 切换配置组
const handleTabChange = (index: any) => {
  groupIndex.value = index;
  getConfigGroupList();
};

// 提交配置
const handleSubmit = async () => {
  if (!formRef.value) return;

  submitLoading.value = true;
  try {
    const configData: Record<string, any> = {};
    currentList.value.forEach(item => {
      let value = formData[item.name];
      if (item.type === 'checkbox' && Array.isArray(value)) {
        value = value.join(',');
      }

      configData[item.name] = value;
    });

    const res = await saveConfigGroupData({
      config: configData
    });

    if (res.code === 200) {
      ElMessage.success('保存成功');
      getConfigGroupList();
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  getConfigGroupList();
});
</script>

<style lang="scss" scoped>
.config-page-wrapper {
  width: 100%;
  height: auto;
}

.page-content {
  width: 100%;
  height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
  position: relative;
}

.config-container {
  width: 100%;
  transition: all 0.3s ease;
}

:deep(.el-tabs) {
  .el-tabs__header {
    position: sticky;
    top: 0;
    z-index: 100;
    margin: 0;
    background-color: #fff;
    padding: 0 20px;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__item {
    height: 50px;
    line-height: 50px;
    padding: 0 20px;
    font-size: 14px;
    color: #606266;

    &:hover {
      color: #409eff;
    }

    &.is-active {
      color: #409eff;
      font-weight: 600;
    }
  }
}

.config-content {
  padding: 30px;
  min-height: 400px;
}

:deep(.el-form-item) {
  margin-bottom: 28px;
}

.config-actions {
  display: flex;
  justify-content: center;
  padding: 16px 20px;
}
</style>

<style lang="scss">
html.dark .config-tabs .el-tabs__header {
  background-color: #262626 !important;
  border-bottom: 1px solid #363636 !important;
}

html.dark .config-tabs .el-tabs__item {
  color: #a8a7a7;

  &:hover {
    color: #e5e5e5;
  }

  &.is-active {
    color: var(--el-color-primary);
  }
}

html.dark .config-tabs .el-tabs__active-bar {
  background-color: var(--el-color-primary);
}
</style>
