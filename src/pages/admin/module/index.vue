<template>
  <div class="page-container">
    <div v-loading="loading" class="page-content">
      <div ref="scrollContainerRef" class="with-container">
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="module-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all">
            <div class="app-list">
              <ModuleCard
                v-for="item in filteredList"
                :key="item.id"
                :data="item"
                @edit="handleEdit"
                @permission="handlePermission"
                @install="handleInstall"
                @uninstall="handleUninstall"
                @upgrade="handleUpgrade"
                @enter-app="handleEnterApp"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="已安装" name="installed">
            <div class="app-list">
              <ModuleCard
                v-for="item in filteredList"
                :key="item.id"
                :data="item"
                @edit="handleEdit"
                @permission="handlePermission"
                @install="handleInstall"
                @uninstall="handleUninstall"
                @upgrade="handleUpgrade"
                @enter-app="handleEnterApp"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="未安装" name="uninstalled">
            <div class="app-list">
              <ModuleCard
                v-for="item in filteredList"
                :key="item.id"
                :data="item"
                @edit="handleEdit"
                @permission="handlePermission"
                @install="handleInstall"
                @uninstall="handleUninstall"
                @upgrade="handleUpgrade"
                @enter-app="handleEnterApp"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="page-footer">
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pagination"
        :page-sizes="[10, 15, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 编辑抽屉 -->
    <ModuleEditDrawer v-model:visible="editDrawerVisible" :data="editDrawerData" @success="handleEditSuccess" />

    <!-- 安装对话框 -->
    <ModuleInstallDialog
      v-model:visible="installDialogVisible"
      :data="installDialogData"
      @success="handleInstallSuccess"
      @cloud-install="handleCloudInstall"
    />

    <!-- 卸载对话框 -->
    <ModuleUninstallDialog
      v-model:visible="uninstallDialogVisible"
      :data="uninstallDialogData"
      @success="handleUninstallSuccess"
    />

    <!-- 菜单/接口管理组件 -->
    <ModuleMenuDialog
      :app-name="currentApp?.name || ''"
      :visible="permissionDialogVisible"
      @close="handlePermissionDialogClose"
      @success="handlePermissionSuccess"
    />

    <!-- 升级进度组件 -->
    <UpgradeProgress
      v-model="upgradeProgressVisible"
      :current-version="currentUpgradeApp?.version || ''"
      :target-version="currentUpgradeApp?.new_version || currentUpgradeApp?.version || ''"
      :app-name="currentUpgradeApp?.name || ''"
      :scene="upgradeScene"
      :install-data="upgradeInstallData"
      @success="handleUpgradeSuccess"
      @error="handleUpgradeError"
    />

    <!-- 升级确认对话框 -->
    <ModuleUpgradeDialog v-model:visible="upgradeDialogVisible" :data="upgradeDialogData" @confirm="confirmUpgrade" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/modules/request';
import ModuleCard from './components/ModuleCard.vue';
import ModuleEditDrawer from './components/ModuleEditDrawer.vue';
import ModuleInstallDialog from './components/ModuleInstallDialog.vue';
import ModuleUninstallDialog from './components/ModuleUninstallDialog.vue';
import ModuleMenuDialog from './components/ModuleMenuDialog.vue';
import ModuleUpgradeDialog from './components/ModuleUpgradeDialog.vue';
import UpgradeProgress from '@/components/UpgradeProgress.vue';
import { appDataInterface } from '@/pages/admin/module/type';
import { useScrollReset } from '@/composables/useScrollReset';

// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

// 加载状态
const loading = ref(false);

// 分页相关
const page = ref(1);
const pageSize = ref(15);
const total = ref(0);
// 应用列表
const list = ref<any[]>([]);
// 当前标签页
const activeTab = ref('all');

// 编辑抽屉
const editDrawerVisible = ref(false);
const editDrawerData = ref({});

// 安装对话框
const installDialogVisible = ref(false);
const installDialogData = ref<appDataInterface>();

// 卸载对话框
const uninstallDialogVisible = ref(false);
const uninstallDialogData = ref<appDataInterface>();

// 菜单/接口管理对话框
const permissionDialogVisible = ref(false);
const currentApp = ref<any>(null);

// 升级进度对话框
const upgradeProgressVisible = ref(false);
const currentUpgradeApp = ref<appDataInterface>();
const upgradeScene = ref<'setup' | 'upgrade'>('upgrade');
const upgradeInstallData = ref<any>();

// 升级确认对话框
const upgradeDialogVisible = ref(false);
const upgradeDialogData = ref<appDataInterface>();

// 过滤后的应用列表
const filteredList = computed(() => {
  switch (activeTab.value) {
    case 'installed':
      return list.value.filter(item => item.is_setup === 1);
    case 'uninstalled':
      return list.value.filter(item => item.is_setup === 0);
    default:
      return list.value;
  }
});

// 获取应用列表
const getList = async () => {
  loading.value = true;
  const res = await request({
    url: 'admin/module/index',
    data: {
      page: page.value,
      rows: pageSize.value,
      type: activeTab.value
    },
    method: 'GET'
  });
  if (page.value == 1) {
    list.value = [];
  }

  list.value = res.data.data || [];
  total.value = res.data.total || 0;
  loading.value = false;
  resetScrollTop();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  getList();
};

// 处理页码变化
const handleCurrentChange = (current: number) => {
  page.value = current;
  getList();
};

// 处理标签页切换
const handleTabChange = (tab: any) => {
  activeTab.value = tab;
  page.value = 1;
  getList();
};

// 编辑模块
const handleEdit = (item: any) => {
  editDrawerData.value = { ...item };
  editDrawerVisible.value = true;
};

// 编辑成功回调
const handleEditSuccess = () => {
  list.value = [];
  page.value = 1;
  getList();
};

// 权限菜单/接口
const handlePermission = (item: any) => {
  currentApp.value = item;
  permissionDialogVisible.value = true;
};

// 关闭菜单/接口管理对话框
const handlePermissionDialogClose = () => {
  permissionDialogVisible.value = false;
  currentApp.value = null;
};

// 菜单/接口管理成功回调
const handlePermissionSuccess = () => {
  ElMessage.success('操作成功');
};

// 安装模块
const handleInstall = (item: any) => {
  installDialogData.value = { ...item };
  installDialogVisible.value = true;
};

// 安装成功回调
const handleInstallSuccess = () => {
  list.value = [];
  page.value = 1;
  getList();
};

// 云端安装
const handleCloudInstall = (data: any) => {
  currentUpgradeApp.value = data.appData;
  upgradeScene.value = 'setup';
  upgradeInstallData.value = {
    id: data.id,
    alias: data.alias
  };
  upgradeProgressVisible.value = true;
};

// 卸载模块
const handleUninstall = (item: any) => {
  uninstallDialogData.value = { ...item };
  uninstallDialogVisible.value = true;
};

// 卸载成功回调
const handleUninstallSuccess = () => {
  list.value = [];
  page.value = 1;
  getList();
};

// 升级模块
const handleUpgrade = (item: any) => {
  upgradeDialogData.value = { ...item };
  upgradeDialogVisible.value = true;
};

// 确认升级
const confirmUpgrade = async () => {
  const item = upgradeDialogData.value;
  if (!item) return;

  try {
    upgradeDialogVisible.value = false;

    if (item.source === 'cloud') {
      currentUpgradeApp.value = { ...item };
      upgradeScene.value = 'upgrade';
      upgradeProgressVisible.value = true;
      return;
    }

    loading.value = true;
    const res = await request({
      url: 'admin/module/upgrade',
      method: 'POST',
      data: { id: item.id }
    });
    if (res.code === 200) {
      ElMessage.success('升级成功');
      list.value = [];
      page.value = 1;
      await getList();
    } else {
      ElMessage.error(res.msg || '升级失败');
    }
  } catch (error: any) {
    console.error('升级失败:', error);
    ElMessage.error('升级失败');
  } finally {
    loading.value = false;
  }
};

// 进入应用
const handleEnterApp = (item: any) => {
  if (!item || !item.alias || item.alias.trim() === '') {
    console.warn('应用名称为空，无法跳转', { item });
    return;
  }

  let url = '';
  // 判断应用路径
  if (item.entry_spa && item.entry_spa == true) {
    url = window.location.origin + '/static/' + item.name + '/admin/';
    window.location.href = url;
  } else {
    url = window.location.origin + '/' + item.entry;
  }

  window.location.href = url;
};

// 升级成功回调
const handleUpgradeSuccess = () => {
  upgradeProgressVisible.value = false;
  const message = upgradeScene.value === 'setup' ? '安装成功' : '升级成功';
  ElMessage.success(message);
  upgradeInstallData.value = undefined;
  list.value = [];
  page.value = 1;
  getList();
};

// 升级失败回调
const handleUpgradeError = (error: string) => {
  upgradeProgressVisible.value = false;
  const message = upgradeScene.value === 'setup' ? '安装失败' : '升级失败';
  ElMessage.error(error || message);
};

// 初始化获取应用列表
onMounted(async () => {
  try {
    await getList();
  } catch (error) {
    console.error(error);
  }
});
</script>

<style lang="scss" scoped>
.page-content {
  background-color: transparent;
  .module-container {
    height: 100%;
  }
}

/* 升级日志样式 */
.upgrade-dialog {
  .el-dialog__header {
    padding: 20px 24px;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
  }

  .el-dialog__body {
    padding: 20px 24px;
  }
}

:deep(.el-tabs) {
  .el-tabs__header {
    position: sticky;
    top: 0;
    z-index: 100;
    margin: 0;
    background-color: #fff;
    padding: 0 20px;
    border-radius: 8px;
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

  .el-tabs__content {
    padding-top: 10px;
  }
}

/* 应用卡片列表 */
.app-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* 文本颜色 */
.text-success {
  color: #67c23a !important;
}

/* 响应式布局 */
@media (max-width: 768px) {
}
</style>

<style lang="scss">
html.dark .module-tabs .el-tabs__header {
  background-color: #262626 !important;
  border-bottom: 1px solid #363636 !important;
}

html.dark .module-tabs .el-tabs__item {
  color: #a8a7a7;

  &:hover {
    color: #e5e5e5;
  }

  &.is-active {
    color: var(--el-color-primary);
  }
}

html.dark .module-tabs .el-tabs__active-bar {
  background-color: var(--el-color-primary);
}
</style>
