<template>
  <div class="page-container">
    <div class="page-header">
      <div class="member-toolbar">
        <!-- 左侧操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="handleAddUser">
            <safe-icon icon="fas plus" />
            新增用户
          </el-button>
          <el-button type="warning" :disabled="selectedRows.length === 0" @click="handleBatchEnable"
            >批量启用</el-button
          >
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDisable"
            >批量禁用</el-button
          >
          <el-button type="info" :disabled="selectedRows.length === 0" @click="handleBatchResetPassword"
            >重置密码</el-button
          >
          <el-dropdown trigger="click">
            <el-button>
              <el-icon>
                <Menu />
              </el-icon>
              列显示
            </el-button>
            <template #dropdown>
              <el-checkbox-group v-model="visibleColumns">
                <el-checkbox value="email">邮箱</el-checkbox>
                <el-checkbox value="phone">手机</el-checkbox>
                <el-checkbox value="last_login_ip">最后登录IP</el-checkbox>
                <el-checkbox value="create_time_str">注册时间</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-dropdown>
        </div>

        <!-- 右侧搜索表单 -->
        <div class="search-filter">
          <el-form :inline="true" class="search-form">
            <el-form-item>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索用户名/邮箱/手机"
                clearable
                style="width: 300px"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <safe-icon icon="fas search" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div ref="scrollContainerRef" class="with-container">
        <el-table :data="list" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" />
          <el-table-column label="用户信息" min-width="200">
            <template #default="scope">
              <div class="user-info" style="cursor: pointer" @click="handleShowDetail(scope.row)">
                <el-avatar :size="40" :src="scope.row.avatar64" :alt="scope.row.nickname">
                  {{ (scope.row.nickname || scope.row.username || '').charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-nickname">{{ scope.row.nickname }}</div>
                  <div class="user-username">{{ scope.row.username }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="visibleColumns.includes('email')" label="邮箱" width="180">
            <template #default="scope">
              <span>{{ scope.row.email || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="visibleColumns.includes('phone')" label="手机" width="120">
            <template #default="scope">
              <span>{{ scope.row.phone || scope.row.mobile || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="认证" width="80">
            <template #default="scope">
              <el-tag :type="getAuthTagType(scope.row.authentication || 0)" size="small">
                {{ scope.row.authentication_text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="68">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="visibleColumns.includes('last_login_ip')" label="最后登录IP" width="140">
            <template #default="scope">
              <span>{{ scope.row.last_login_ip || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="visibleColumns.includes('create_time_str')" label="注册时间" width="160">
            <template #default="scope">
              <span>{{ scope.row.create_time_str || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right" align="right">
            <template #default="scope">
              <el-button type="success" size="small" @click="handleSendBatch(scope.row)">发送消息</el-button>
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="handleStatusChange(scope.row)"
              >
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="page-footer">
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="rows"
          :total="total"
          :page-sizes="[20, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <!-- 编辑用户抽屉 -->
    <el-drawer v-model="editDrawer" title="编辑用户" :with-header="false" size="500px">
      <member-edit :user="selectedUser" @close="editDrawer = false" @success="handleEditSuccess" />
    </el-drawer>

    <!-- 用户详情抽屉 -->
    <el-drawer v-model="detailDrawer" title="用户详情" :with-header="false" size="500px">
      <member-detail :uid="selectedUserUid" @close="detailDrawer = false" />
    </el-drawer>

    <MessageSend
      :visible="sendDialogVisible"
      :user-id="userInfo.uid"
      :user-info="userInfo"
      @update:visible="sendDialogVisible = $event"
      @success="handleSendSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import MemberEdit from './components/edit.vue';
import MemberDetail from './components/detail.vue';
import MessageSend from '@/components/MessageSend.vue';
import { useScrollReset } from '@/composables/useScrollReset';
import { getMemberList, updateMemberStatus, resetMemberPassword } from '@/api/admin/member';

interface UserInfo {
  uid: number;
  username: string;
  nickname: string;
  avatar64: string;
  status: number;
  email: string;
  phone: string;
  auth: number;
  reg_time: string;
  last_login_time: string;
  last_login_ip: string;
  login_count: number;
  group_id: number;
}

const list = ref<UserInfo[]>([]);
const loading = ref(false);
const page = ref<number>(1);
const rows = ref<number>(20);
const total = ref<number>(0);
const searchKeyword = ref<string>('');
// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

// 批量操作相关
const selectedRows = ref<UserInfo[]>([]);
const visibleColumns = ref<string[]>(['email', 'phone', 'last_login_ip', 'create_time_str']);

// 编辑用户抽屉
const editDrawer = ref(false);
const selectedUser = ref<UserInfo>({} as UserInfo);

// 用户详情抽屉
const detailDrawer = ref(false);
const selectedUserUid = ref<number>(0);

// 认证状态标签类型
const getAuthTagType = (val: number) => {
  switch (val) {
    case 2:
      return 'success';
    case 1:
      return 'warning';
    case -1:
      return 'danger';
    default:
      return 'info';
  }
};

// 获取用户列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getMemberList({
      page: page.value,
      rows: rows.value,
      keyword: searchKeyword.value
    });

    if (res.code === 200) {
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
      resetScrollTop();
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  getList();
};

const handleReset = () => {
  searchKeyword.value = '';
  page.value = 1;
  getList();
};

const handleAddUser = () => {
  selectedUser.value = {} as UserInfo;
  editDrawer.value = true;
};

const handleSizeChange = () => {
  page.value = 1;
  getList();
};

const handlePageChange = () => {
  getList();
};

const handleEdit = (item: UserInfo) => {
  selectedUser.value = item;
  editDrawer.value = true;
};

const handleShowDetail = (item: UserInfo) => {
  selectedUserUid.value = item.uid;
  detailDrawer.value = true;
};

const handleEditSuccess = () => {
  getList();
};

const handleDelete = (item: UserInfo) => {
  ElMessageBox.confirm(`确定要删除用户 "${item.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateMemberStatus({
          uid: item.uid,
          status: -1
        });

        if (res.code === 200) {
          ElMessage.success('删除成功');
          if (list.value.length === 1 && page.value > 1) {
            page.value--;
          }
          getList();
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

const sendDialogVisible = ref(false);
const userInfo = ref<UserInfo>({} as UserInfo);
const handleSendBatch = (item: UserInfo) => {
  console.log('发消息:', item);
  userInfo.value = item;
  sendDialogVisible.value = true;
};

const handleSendSuccess = (data: any) => {
  console.log('消息发送成功', data);
};

// 选择变化处理
const handleSelectionChange = (val: UserInfo[]) => {
  selectedRows.value = val;
};

// 单个用户状态切换
const handleStatusChange = async (item: UserInfo) => {
  const newStatus = item.status === 1 ? 0 : 1;
  const originalStatus = item.status;
  item.status = newStatus;

  try {
    const res = await updateMemberStatus({
      uid: item.uid,
      status: newStatus
    });

    if (res.code === 200) {
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`);
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

// 批量启用
const handleBatchEnable = async () => {
  const uids = selectedRows.value.map(item => item.uid);

  try {
    const res = await updateMemberStatus({
      uid: uids,
      status: 1
    });

    if (res.code === 200) {
      ElMessage.success('批量启用成功');
      selectedRows.value = [];
      getList();
    } else {
      ElMessage.error(res.msg || '批量启用失败');
    }
  } catch (error) {
    console.error('批量启用失败:', error);
    ElMessage.error('批量启用失败');
  }
};

// 批量禁用
const handleBatchDisable = async () => {
  const uids = selectedRows.value.map(item => item.uid);

  try {
    const res = await updateMemberStatus({
      uid: uids,
      status: 0
    });

    if (res.code === 200) {
      ElMessage.success('批量禁用成功');
      selectedRows.value = [];
      getList();
    } else {
      ElMessage.error(res.msg || '批量禁用失败');
    }
  } catch (error) {
    console.error('批量禁用失败:', error);
    ElMessage.error('批量禁用失败');
  }
};

// 批量重置密码
const handleBatchResetPassword = async () => {
  ElMessageBox.confirm('确定要批量重置所选用户的密码吗？重置后密码将变为默认值 123456', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const uids = selectedRows.value.map(item => item.uid);

      try {
        const res = await resetMemberPassword({
          uid: uids
        });

        if (res.code === 200) {
          ElMessage.success('批量重置密码成功');
          selectedRows.value = [];
        } else {
          ElMessage.error(res.msg || '批量重置密码失败');
        }
      } catch (error) {
        console.error('批量重置密码失败:', error);
        ElMessage.error('批量重置密码失败');
      }
    })
    .catch(() => {});
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.page-header {
  .member-toolbar {
    background-color: var(--el-color-white);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 6px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .action-buttons {
      display: flex;
      align-items: center;

      .el-button + .el-button {
        margin-left: 12px;
      }

      .el-dropdown {
        margin-left: 12px;
      }
    }

    .search-form {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;
      }
    }
  }
}

.page-content {
  background-color: var(--el-color-white);
  border-radius: 6px;
  padding: 10px;

  .with-container {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .el-avatar {
        flex-shrink: 0;
      }

      .user-details {
        display: flex;
        flex-direction: column;
      }

      .user-nickname {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .user-username {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

html.dark {
  .page-header {
    .member-toolbar {
      background-color: #262626 !important;
    }
  }
}
</style>
