<template>
  <!-- 菜单/接口管理对话框 -->
  <el-dialog
    :model-value="props.visible"
    title="应用权限菜单/接口管理"
    :width="'82%'"
    :fullscreen="false"
    :center="true"
    @update:model-value="handleDialogVisibleChange"
    @close="handleClose"
  >
    <div v-loading="loading" class="menu-component">
      <div class="menu-header">
        <div v-if="menuList.length == 0" class="menu-toolbar">
          <el-button type="primary" @click="handleAdd()">新增根菜单</el-button>
        </div>
      </div>
      <div class="menu-content">
        <div class="menu-container">
          <div class="menu-header-row">
            <div class="menu-header-icon"></div>
            <div class="menu-header-title">标题</div>
            <div class="menu-header-url">URL</div>
            <div class="menu-header-sort">排序</div>
            <div class="menu-header-type">应用</div>
            <div class="menu-header-hide">隐藏</div>
            <div class="menu-header-group">分组</div>
            <div class="menu-header-actions">操作</div>
          </div>
          <template v-for="item in menuList" :key="item.id">
            <div class="menu-item level-1">
              <div class="menu-content-row">
                <div class="menu-icon">
                  <safe-icon :icon="item.icon" />
                </div>
                <div class="menu-title level-1-title">{{ item.title }}</div>
                <div class="menu-url">{{ item.url }}</div>
                <div class="menu-sort">{{ item.sort }}</div>
                <div class="menu-type">
                  <el-tag size="small" type="info">{{ item.type_str }}</el-tag>
                </div>
                <div class="menu-hide">{{ item.hide_str }}</div>
                <div class="menu-group">{{ item.group }}</div>
                <div class="menu-actions">
                  <el-button type="warning" size="small" @click="handleAdd(item)">添加下级</el-button>
                  <el-button type="primary" size="small" @click="handleEdit(item)">编辑</el-button>
                  <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
              <template v-if="item._child && item._child.length > 0">
                <div class="menu-children level-2">
                  <template v-for="child in item._child" :key="child.id">
                    <div class="menu-item level-2">
                      <div class="menu-content-row">
                        <div class="menu-icon">
                          <safe-icon :icon="child.icon" />
                        </div>
                        <div class="menu-title level-2-title">{{ child.title }}</div>
                        <div class="menu-url">{{ child.url }}</div>
                        <div class="menu-sort">{{ child.sort }}</div>
                        <div class="menu-type">
                          <el-tag size="small" type="info">{{ child.type_str }}</el-tag>
                        </div>
                        <div class="menu-hide">{{ child.hide_str }}</div>
                        <div class="menu-group">{{ child.group }}</div>
                        <div class="menu-actions">
                          <el-button type="warning" size="small" @click="handleAdd(child)">添加下级</el-button>
                          <el-button type="primary" size="small" @click="handleEdit(child)">编辑</el-button>
                          <el-button type="danger" size="small" @click="handleDelete(child)">删除</el-button>
                        </div>
                      </div>
                      <template v-if="child._child && child._child.length > 0">
                        <div class="menu-children level-3">
                          <template v-for="grandchild in child._child" :key="grandchild.id">
                            <div class="menu-item level-3">
                              <div class="menu-content-row">
                                <div class="menu-icon">
                                  <safe-icon v-if="grandchild.icon" :icon="grandchild.icon" />
                                </div>
                                <div class="menu-title level-3-title">{{ grandchild.title }}</div>
                                <div class="menu-url">{{ grandchild.url }}</div>
                                <div class="menu-sort">{{ grandchild.sort }}</div>
                                <div class="menu-type">
                                  <el-tag size="small" type="info">{{ grandchild.type_str }}</el-tag>
                                </div>
                                <div class="menu-hide">{{ grandchild.hide_str }}</div>
                                <div class="menu-group">{{ grandchild.group }}</div>
                                <div class="menu-actions">
                                  <el-button type="primary" size="small" @click="handleEdit(grandchild)"
                                    >编辑</el-button
                                  >
                                  <el-button type="danger" size="small" @click="handleDelete(grandchild)"
                                    >删除</el-button
                                  >
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
      <!-- 编辑菜单抽屉 -->
      <ModuleMenuEditDrawer
        :menu="selectedMenu"
        :menu-list="menuList"
        :type="type"
        :module="module"
        :visible="editDrawer"
        @close="editDrawer = false"
        @success="handleEditSuccess"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import ModuleMenuEditDrawer from './ModuleMenuEditDrawer.vue';

// 组件属性
interface Props {
  appName: string;
  visible: boolean;
}

// 事件
interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const menuList = ref<MenuItem[]>([]);
// 菜单类型 0: 系统 1: 应用
const type = ref<number>(1);
const module = ref<string>('admin');

// 编辑菜单抽屉
const editDrawer = ref(false);
const selectedMenu = ref({} as MenuItem);

// 监听visible和appName变化，控制数据加载
watch(
  () => [props.visible, props.appName],
  ([newVisible, newAppName]) => {
    if (newVisible && newAppName) {
      getMenuList();
    }
  },
  { immediate: true }
);

// 关闭对话框
const handleClose = () => {
  emit('close');
};

// 处理对话框可见性变化
const handleDialogVisibleChange = (value: boolean) => {
  emit('update:visible', value);
  if (!value) {
    handleClose();
  }
};

// 添加菜单
const handleAdd = (parent?: MenuItem) => {
  if (parent) {
    // 添加子菜单：设置父菜单的 id 为 pid
    selectedMenu.value = {
      pid: String(parent.id),
      type: parent.type,
      module: parent.module
    } as MenuItem;
  } else {
    // 添加根菜单
    selectedMenu.value = {
      type: type.value,
      module: module.value
    } as MenuItem;
  }
  editDrawer.value = true;
};

// 编辑菜单
const handleEdit = (item: MenuItem) => {
  selectedMenu.value = item;
  editDrawer.value = true;
};

// 编辑成功后刷新数据
const handleEditSuccess = async () => {
  // 重新获取列表确保数据最新
  getMenuList();
};

// 删除菜单
const handleDelete = (item: MenuItem) => {
  ElMessageBox.confirm(`确定要删除菜单 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/module/menu/del',
          method: 'POST',
          data: {
            id: item.id
          }
        });

        if (res.code === 200) {
          ElMessage.success('删除成功');
          getMenuList();
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 获取菜单列表
const getMenuList = () => {
  if (!props.appName || !props.visible) return;

  loading.value = true;
  request({
    url: 'admin/module/menu',
    method: 'GET',
    data: {
      app: props.appName
    }
  })
    .then(res => {
      loading.value = false;
      menuList.value = res.data;
    })
    .catch(err => {
      console.error('获取菜单列表失败:', err);
      loading.value = false;
    });
};
</script>

<style lang="scss" scoped>
.menu-component {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 70vh; /* 限制组件最大高度为视口高度的70% */
}

.menu-header {
  padding: 16px 0;
  border-bottom: 1px solid #e4e7ed;
}

.menu-toolbar {
  display: flex;
  justify-content: flex-start;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  max-height: 60vh; /* 限制最大高度为视口高度的60% */
}

.menu-container {
  width: 100%;
  background-color: var(--el-color-white);
  overflow: hidden;
}

.menu-header-row {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  font-size: 14px;
  color: #666;
}

.menu-header-icon {
  flex: 0 0 24px;
}

.menu-header-title {
  flex: 0 0 200px;
}

.menu-header-url {
  flex: 0 0 250px;
}

.menu-header-sort {
  flex: 0 0 50px;
}

.menu-header-type {
  flex: 0 0 80px;
}

.menu-header-hide {
  flex: 0 0 60px;
}

.menu-header-group {
  flex: 0 0 100px;
}

.menu-header-actions {
  display: flex;
  flex: 0 0 150px;
  margin-left: auto;
  justify-content: flex-end;
}

.menu-item {
  width: 100%;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
}

.menu-content-row {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 20px;
}

.menu-icon {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  text-align: center;
  color: #409eff;
  font-size: 16px;
  line-height: 24px;
}

.menu-title {
  color: #303133;
}

.level-1-title {
  font-weight: 600;
  font-size: 15px;
  flex: 0 0 160px;
}

.level-2-title {
  font-weight: 500;
  font-size: 14px;
  flex: 0 0 140px;
}

.level-3-title {
  font-weight: 400;
  font-size: 14px;
  color: #606266;
  flex: 0 0 120px;
}

.menu-url {
  flex: 0 0 220px;
  color: #909399;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  white-space: normal;
  line-height: 1.5;
}

.menu-sort {
  flex: 0 0 30px;
  color: #606266;
  font-size: 13px;
}

.menu-type {
  flex: 0 0 60px;
  color: #606266;
  font-size: 13px;
}

.menu-hide {
  flex: 0 0 40px;
  font-size: 13px;
}

.menu-hide span {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.menu-group {
  flex: 0 0 80px;
  color: #606266;
  font-size: 13px;
}

.menu-actions {
  flex: 0 0 150px;
  display: flex;
  margin-left: auto;
  justify-content: flex-end;
  gap: 8px;
}

.menu-children {
  padding-left: 0;
}

.level-2 {
  padding-left: 10px;
}

.level-3 {
  padding-left: 10px;
}

.level-3 .menu-content-row {
  padding-left: 40px;
}

.level-2 .menu-content-row {
  padding-left: 30px;
}

.level-1 .menu-content-row {
  padding-left: 20px;
}

.menu-item:last-child {
  border-bottom: none;
}
</style>
