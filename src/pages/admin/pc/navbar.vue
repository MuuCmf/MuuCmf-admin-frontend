<template>
  <div class="page-container">
    <div class="page-header">
      <div class="navbar-toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加导航</el-button>
        <el-button type="success" :icon="Check" :loading="submitLoading" @click="handleSubmit">保存配置</el-button>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="navbar-config-wrapper">
          <div class="navbar-list">
            <el-empty v-if="navbarList.length === 0 && !loading" description="暂无导航数据" />

            <div v-for="(item, index) in navbarList" :key="item.id" class="navbar-item">
              <div class="item-header">
                <span class="item-title">{{ item.title || '导航 ' + (index + 1) }}</span>
                <div class="item-actions">
                  <el-button type="primary" text :icon="ArrowUp" :disabled="index === 0" @click="handleMoveUp(index)"
                    >上移</el-button
                  >
                  <el-button
                    type="primary"
                    text
                    :icon="ArrowDown"
                    :disabled="index === navbarList.length - 1"
                    @click="handleMoveDown(index)"
                    >下移</el-button
                  >
                  <el-button type="danger" text :icon="Delete" @click="handleDelete(index)">删除</el-button>
                </div>
              </div>

              <div class="item-content">
                <el-form :model="item" label-width="100px">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="导航标题">
                        <el-input v-model="item.title" placeholder="请输入导航标题" maxlength="50" show-word-limit />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="导航类型">
                        <el-select v-model="item.type" placeholder="请选择导航类型">
                          <el-option label="自定义链接" value="_custom" />
                          <el-option label="应用" value="app" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row v-if="item.type === '_custom'" :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="链接地址">
                        <el-input v-model="item.url" placeholder="请输入链接地址" maxlength="200" show-word-limit />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="打开方式">
                        <el-select v-model="item.target" placeholder="请选择打开方式">
                          <el-option label="当前窗口" :value="0" />
                          <el-option label="新窗口" :value="1" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row v-if="item.type === 'app'" :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="应用模块">
                        <el-select v-model="item.app" placeholder="请选择应用模块">
                          <el-option
                            v-for="module in moduleList"
                            :key="module.name || module.alias"
                            :label="module.alias"
                            :value="module.name"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="打开方式">
                        <el-select v-model="item.target" placeholder="请选择打开方式">
                          <el-option label="当前窗口" :value="0" />
                          <el-option label="新窗口" :value="1" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Check, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAllModules } from '@/api/admin/module';
import { getNavbarList, saveNavbarConfig, type NavbarItem } from '@/api/admin/pc';

const loading = ref(false);
const submitLoading = ref(false);
const navbarList = ref<NavbarItem[]>([]);
const moduleList = ref<any[]>([]);

/**
 * 获取支持PC端的应用模块列表
 */
const fetchModuleList = async () => {
  try {
    const res = await getAllModules({ support: 'pc' });

    if (res.code === 200) {
      moduleList.value = res.data;
    }
  } catch (error) {
    console.error('获取模块列表失败:', error);
  }
};

const fetchNavbarList = async () => {
  loading.value = true;
  try {
    const res = await getNavbarList();

    if (res.code === 200) {
      navbarList.value = res.data || [];
    }
  } catch (error) {
    console.error('获取导航配置失败:', error);
    ElMessage.error('获取导航配置失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  navbarList.value.push({
    id: '',
    block: 'navbar',
    type: '_custom',
    app: 'index',
    title: '',
    url: '',
    sort: navbarList.value.length,
    target: 0,
    status: 1
  });
};

const handleDelete = (index: number) => {
  ElMessageBox.confirm('确定要删除该导航吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      navbarList.value.splice(index, 1);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

const handleMoveUp = (index: number) => {
  if (index > 0) {
    const temp = navbarList.value[index];
    navbarList.value[index] = navbarList.value[index - 1];
    navbarList.value[index - 1] = temp;
  }
};

const handleMoveDown = (index: number) => {
  if (index < navbarList.value.length - 1) {
    const temp = navbarList.value[index];
    navbarList.value[index] = navbarList.value[index + 1];
    navbarList.value[index + 1] = temp;
  }
};

const handleSubmit = async () => {
  if (navbarList.value.length === 0) {
    ElMessage.error('导航至少存在一个');
    return;
  }

  const hasEmptyTitle = navbarList.value.some(item => !item.title);
  if (hasEmptyTitle) {
    ElMessage.error('请填写所有导航标题');
    return;
  }

  submitLoading.value = true;
  try {
    const nav = {
      type: navbarList.value.map(item => item.type),
      app: navbarList.value.map(item => item.app),
      title: navbarList.value.map(item => item.title),
      url: navbarList.value.map(item => item.url),
      target: navbarList.value.map(item => item.target)
    };

    const res = await saveNavbarConfig(nav);

    if (res.code === 200) {
      ElMessage.success('保存成功');
      await fetchNavbarList();
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  fetchModuleList();
  fetchNavbarList();
});
</script>

<style scoped lang="scss">
.page-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.navbar-toolbar {
  display: flex;
  gap: 10px;
  background-color: var(--el-color-white);
  padding: 16px 20px;
}

.navbar-config-wrapper {
  .navbar-list {
    .navbar-item {
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 20px;
      background: #fafafa;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid #e4e7ed;
        background: #f5f7fa;
        border-radius: 8px 8px 0 0;

        .item-title {
          font-weight: 500;
          color: #303133;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }
      }

      .item-content {
        padding: 20px;
      }
    }
  }
}

html.dark {
  .page-header {
    background-color: #262626;
  }

  .page-content {
    background-color: #262626;
  }

  .navbar-toolbar {
    background-color: #262626;
  }

  .navbar-config-wrapper {
    .navbar-list {
      .navbar-item {
        background: #262626;
        border-color: #363636;

        .item-header {
          background: #333333;
          border-bottom-color: #363636;

          .item-title {
            color: #e5e5e5;
          }
        }
      }
    }
  }
}
</style>
