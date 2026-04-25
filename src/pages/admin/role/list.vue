<template>
  <div class="page-container">
    <div class="page-header">
      <div class="group-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">
            <safe-icon icon="fas plus" />
            新增角色用户
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            clearable
            style="width: 150px; margin-right: 12px"
            @change="handleSearch"
          >
            <el-option label="全部" value="all" />
            <el-option label="已启用" :value="1" />
            <el-option label="已禁用" :value="0" />
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索角色用户"
            clearable
            style="width: 300px; margin-right: 12px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <safe-icon icon="fas search" />
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="role-user-list">
          <div class="card-grid">
            <div v-for="item in userList" :key="item.id" class="user-card">
              <div class="card-header">
                <div class="avatar-wrapper">
                  <img
                    :src="item.user_info?.avatar128 || defaultAvatar"
                    :alt="item.name"
                    class="avatar"
                    @error="handleAvatarError"
                  />
                  <div class="status-badge" :class="item.status === 1 ? 'active' : 'inactive'">
                    {{ item.status_str }}
                  </div>
                </div>
                <div class="user-info">
                  <h3 class="name">{{ item.name }}</h3>
                  <p class="username">@{{ item.user_info?.username || '未绑定用户' }}</p>
                </div>
              </div>
              <div class="card-body">
                <div class="info-item">
                  <span class="label">职称：</span>
                  <span class="value">{{ item.professional }}</span>
                </div>
                <div class="info-item">
                  <span class="label">角色组：</span>
                  <span class="value tag">{{ item.group }}</span>
                </div>
                <div class="info-item">
                  <span class="label">邮箱：</span>
                  <span class="value">{{ item.user_info?.email || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">手机：</span>
                  <span class="value">{{ item.user_info?.mobile || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">注册渠道：</span>
                  <span class="value">{{ item.user_info?.reg_channel_str }}</span>
                </div>
                <div class="info-item description">
                  <span class="label">简介：</span>
                  <p class="value text-ellipsis-2">{{ item.description }}</p>
                </div>
              </div>
              <div class="card-footer">
                <div class="actions">
                  <el-button type="primary" size="small" @click="handleEdit(item)">编辑</el-button>
                  <el-button
                    :type="item.status === 1 ? 'warning' : 'success'"
                    size="small"
                    @click="handleStatusChange(item)"
                  >
                    {{ item.status === 1 ? '禁用' : '启用' }}
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!loading && userList.length === 0" class="empty-state">
          <el-empty description="暂无用户数据" />
        </div>
      </div>
    </div>

    <div v-if="userList.length > 0" class="page-footer">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="rows"
        class="pagination"
        :total="total"
        :page-sizes="[20, 30, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑角色用户抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="600px"
      :before-close="handleDrawerClose"
    >
      <role-edit v-model="drawerVisible" :data="currentUser" @success="handleEditSuccess" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { handleAvatarError } from '@/utils/modules/public';
import RoleEdit from './components/Edit.vue';
import { getRoleList, deleteRole, setRoleStatus } from '@/api/admin/role';

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// 加载状态
const loading = ref(false);
const searchKeyword = ref('');
const statusFilter = ref('all');
const total = ref(0);
const page = ref(1);
const rows = ref(20);

// 用户列表数据
const userList = ref<any[]>([]);

// 新增/编辑抽屉
const drawerVisible = ref(false);
const drawerTitle = ref('新增角色用户');
const currentUser = ref<any>(null);

// 获取用户列表
const getUserList = async () => {
  loading.value = true;
  try {
    const response = await getRoleList({
      page: page.value,
      rows: rows.value,
      keyword: searchKeyword.value,
      status: statusFilter.value
    });

    if (response.code === 200) {
      userList.value = response.data.data || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(response.msg || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  getUserList();
};

// 重置
const handleReset = () => {
  searchKeyword.value = '';
  statusFilter.value = 'all';
  page.value = 1;
  getUserList();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  rows.value = size;
  page.value = 1;
  getUserList();
};

// 页码变化
const handlePageChange = (currentPage: number) => {
  page.value = currentPage;
  getUserList();
};

// 新增角色用户
const handleAdd = () => {
  currentUser.value = null;
  drawerTitle.value = '新增角色用户';
  drawerVisible.value = true;
};

// 编辑角色用户
const handleEdit = (item: any) => {
  currentUser.value = item;
  drawerTitle.value = '编辑角色用户';
  drawerVisible.value = true;
};

// 切换角色状态
const handleStatusChange = async (item: any) => {
  const newStatus = item.status === 1 ? 0 : 1;
  const originalStatus = item.status;
  item.status = newStatus;

  try {
    const res = await setRoleStatus({
      ids: item.id,
      status: newStatus
    });

    if (res.code === 200) {
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`);
      getUserList();
    } else {
      ElMessage.error(res.msg || `${newStatus === 1 ? '启用' : '禁用'}失败`);
      item.status = originalStatus;
    }
  } catch (error) {
    console.error(`${newStatus === 1 ? '启用' : '禁用'}失败:`, error);
    ElMessage.error(`${newStatus === 1 ? '启用' : '禁用'}失败`);
    item.status = originalStatus;
  }
};

// 删除角色用户
const handleDelete = (item: any) => {
  ElMessageBox.confirm(`确定要删除角色用户 "${item.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteRole({
          ids: item.id
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getUserList();
        } else {
          ElMessage.error(res.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 编辑成功回调
const handleEditSuccess = () => {
  getUserList();
};

// 关闭抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false;
  currentUser.value = null;
};

onMounted(() => {
  getUserList();
});
</script>

<style lang="scss" scoped>
// 页面布局样式
.page-header {
  .group-toolbar {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.page-content {
  background-color: transparent;

  .role-user-list {
    padding: 0;

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 10px;

      // 响应式布局
      @media (max-width: 1400px) {
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 10px;
      }

      @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }

      @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .user-card {
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
    }

    .card-header {
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      position: relative;

      .avatar-wrapper {
        position: relative;
        display: inline-block;
        margin-bottom: 10px;

        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          object-fit: cover;
        }

        .status-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          background: #fff;
          color: #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &.active {
            background: #67c23a;
            color: #fff;
          }

          &.inactive {
            background: #f56c6c;
            color: #fff;
          }
        }
      }

      .user-info {
        .name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          height: 24px;
        }

        .username {
          font-size: 13px;
          opacity: 0.9;
          margin: 0;
        }
      }
    }

    .card-body {
      padding: 12px 16px;

      .info-item {
        margin-bottom: 8px;
        font-size: 13px;
        display: flex;
        align-items: flex-start;

        &:last-child {
          margin-bottom: 0;
        }

        &.description {
          flex-direction: column;

          .value {
            height: 38px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 19px;
          }
        }

        .label {
          color: #909399;
          flex-shrink: 0;
          width: 70px;
          font-size: 12px;
        }

        .value {
          color: #303133;
          word-break: break-word;

          &.tag {
            display: inline-block;
            padding: 2px 8px;
            background: #ecf5ff;
            color: #409eff;
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 1px solid #e4e7ed;
      display: flex;
      justify-content: center;
      align-items: center;

      .actions {
        display: flex;
        gap: 4px;
      }
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
    }
  }
}

// 暗黑模式适配
html.dark {
  .role-user-list {
    .user-card {
      background: #1a1a1a;
      border-color: #363637;
    }

    .card-header {
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    }

    .card-body {
      .info-item {
        .label {
          color: #9ca3af;
        }

        .value {
          color: #e5eaf3;
        }
      }
    }

    .card-footer {
      border-top-color: #363637;
    }
  }

  .page-footer {
    background-color: #262626;
  }
}
</style>
