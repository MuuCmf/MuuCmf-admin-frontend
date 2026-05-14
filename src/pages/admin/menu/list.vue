<template>
  <div class="page-container">
    <div class="page-header">
      <div class="menu-toolbar">
        <el-button type="primary" @click="handleAdd()">新增根菜单</el-button>
      </div>
    </div>
    <div class="page-content">
      <div class="with-container">
        <div class="menu-container">
          <div class="menu-header">
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
              <div class="menu-content">
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
                      <div class="menu-content">
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
                              <div class="menu-content">
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
    </div>
    <!-- 编辑菜单抽屉 -->
    <el-drawer v-model="editDrawer" title="编辑菜单" :with-header="false" size="600px">
      <menu-edit
        :menu="selectedMenu"
        :menu-list="menuList"
        :type="type"
        :module="module"
        @close="editDrawer = false"
        @success="handleEditSuccess"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useMenuStore } from '@/stores/modules/menu';
import { useRouterStore } from '@/stores';
import router, { resetRouter } from '@/router';
import { cache } from '@/utils/modules/cache';
import { getMenuList as fetchMenuList, deleteMenu } from '@/api/admin/menu';
import MenuEdit from './components/edit.vue';

// 响应式数据
const loading = ref(false);
const menuList = ref<MenuItem[]>([]);
// 菜单类型 0: 系统 1: 应用
const type = ref<number>(0);
const module = ref<string>('admin');

// 菜单 store
const menuStore = useMenuStore();
// 路由 store
const routerStore = useRouterStore();

// 编辑菜单抽屉
const editDrawer = ref(false);
const selectedMenu = ref({} as MenuItem);

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
    selectedMenu.value = {} as MenuItem;
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

  // 更新动态路由菜单
  try {
    // 1. 清除菜单缓存
    cache('all_menu_data', '');

    // 2. 重置动态路由
    resetRouter();

    // 3. 等待菜单数据加载完成（强制从服务器获取）
    await menuStore.getAllMenuData();
    const allMenusData = menuStore.allMenusData;

    // 4. 重新生成动态路由
    const dynamicRoutes = await routerStore.generateRoutes(allMenusData);

    // 5. 添加动态路由
    dynamicRoutes.forEach((route: any) => {
      router.addRoute(route);
    });

    // 6. 标记已经加载过动态路由
    routerStore.setHasLoadedDynamicRoutes(true);

    // 7. 触发侧边栏更新
    menuStore.asideNeedsUpdate++;

    ElMessage.success('路由更新成功');
  } catch (error) {
    console.error('路由更新失败:', error);
    ElMessage.error('路由更新失败');
  }
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
        const res = await deleteMenu(item.id);

        if (res.code === 200) {
          ElMessage.success('删除成功');
          getMenuList();

          // 更新动态路由菜单
          try {
            // 1. 清除菜单缓存
            cache('all_menu_data', null);

            // 2. 重置动态路由
            resetRouter();

            // 3. 等待菜单数据加载完成（强制从服务器获取）
            await menuStore.getAllMenuData(true);
            const allMenusData = menuStore.allMenusData;

            // 4. 重新生成动态路由
            const dynamicRoutes = await routerStore.generateRoutes(allMenusData);

            // 5. 添加动态路由
            dynamicRoutes.forEach((route: any) => {
              router.addRoute(route);
            });

            // 6. 标记已经加载过动态路由
            routerStore.setHasLoadedDynamicRoutes(true);

            // 7. 触发侧边栏更新
            menuStore.asideNeedsUpdate++;
          } catch (error) {
            console.error('路由更新失败:', error);
          }
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
  loading.value = true;
  fetchMenuList()
    .then(res => {
      loading.value = false;
      menuList.value = res.data;
    })
    .catch(err => {
      console.error('获取菜单列表失败:', err);
    });
};

// 初始化获取菜单列表
onMounted(() => {
  getMenuList();
});
</script>

<style lang="scss" scoped>
.menu-container {
  width: 100%;
  background-color: var(--el-color-white);
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.menu-toolbar {
  background-color: var(--el-color-white);
  padding: 16px 20px;
}

.menu-header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-top: 1px solid #e4e7ed;
  font-weight: 600;
  font-size: 14px;
  color: #666;

  &-icon {
    flex: 0 0 24px;
  }

  &-title {
    flex: 0 0 240px;
  }

  &-url {
    flex: 0 0 300px;
  }

  &-sort {
    flex: 0 0 50px;
  }

  &-type {
    flex: 0 0 80px;
  }

  &-hide {
    flex: 0 0 60px;
  }

  &-group {
    flex: 0 0 100px;
  }

  &-actions {
    display: flex;
    flex: 0 0 150px;
    margin-left: auto;
    justify-content: flex-end;
  }
}

.menu-item {
  width: 100%;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.menu-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
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
  flex: 0 0 200px;
}

.level-2-title {
  font-weight: 500;
  font-size: 14px;
  flex: 0 0 180px;
}

.level-3-title {
  font-weight: 400;
  font-size: 14px;
  color: #606266;
  flex: 0 0 160px;
}

.menu-url {
  flex: 0 0 280px;
  color: #909399;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  white-space: normal;
  line-height: 1.5;
}

.menu-sort,
.menu-type,
.menu-group {
  flex: 0 0 30px;
  color: #606266;
  font-size: 13px;
}

.menu-type {
  flex: 0 0 60px;
}

.menu-hide {
  flex: 0 0 40px;
  font-size: 13px;

  span {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.menu-group {
  flex: 0 0 80px;
}

.menu-actions {
  flex: 0 0 150px;
  display: flex;
  margin-left: auto;
  justify-content: flex-end;
}

.menu-children {
  padding-left: 0;
}

.level-2,
.level-3 {
  padding-left: 10px;
}

.level-1 .menu-content {
  padding-left: 20px;
}

.level-2 .menu-content {
  padding-left: 30px;
}

.level-3 .menu-content {
  padding-left: 40px;
}

html.dark {
  .menu-container {
    background-color: #262626;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  }

  .menu-toolbar {
    background-color: #262626;
  }

  .menu-header {
    background-color: #333333;
    border-bottom-color: #363636;
    border-top-color: #363636;
    color: #e5e5e5;
  }

  .menu-item {
    border-bottom-color: #363636;

    &:hover {
      background-color: #333333;
    }
  }

  .menu-title {
    color: #e5e5e5;
  }

  .level-3-title {
    color: #b8b8b8;
  }

  .menu-url {
    color: #9ca3af;
  }

  .menu-sort,
  .menu-type,
  .menu-hide,
  .menu-group {
    color: #b8b8b8;
  }

  .el-tag {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #363636;
    color: #e5e5e5;

    &--info {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: #363636;
      color: #e5e5e5;
    }
  }

  .el-button {
    &--primary {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: #fff;
    }

    &--warning {
      background-color: #e6a23c;
      border-color: #e6a23c;
      color: #fff;
    }

    &--danger {
      background-color: #f56c6c;
      border-color: #f56c6c;
      color: #fff;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
