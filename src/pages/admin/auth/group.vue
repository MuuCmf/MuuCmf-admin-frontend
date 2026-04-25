<template>
  <div class="page-container">
    <div class="page-header">
      <div class="group-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAddGroup">
            <safe-icon icon="fas plus" />
            新增权限组
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索权限组名称"
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
        <el-table :data="groupList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="60" align="left" />
          <el-table-column prop="title" label="权限组名称" width="150" align="left">
            <template #default="scope">
              <span style="font-weight: 500">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" align="left">
            <template #default="scope">
              {{ scope.row.description || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch
                :model-value="scope.row.status === 1"
                :active-value="true"
                :inactive-value="false"
                @change="val => handleToggleStatus(scope.row, val ? 1 : 0)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="user_count" label="用户数量" width="100" align="center">
            <template #default="scope">
              {{ scope.row.user_count || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="280" align="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEditGroup(scope.row)"> 编辑 </el-button>
              <el-button type="success" size="small" @click="handleAssignPermission(scope.row)"> 分配权限 </el-button>
              <el-button type="info" size="small" @click="handleViewUsers(scope.row)"> 查看用户 </el-button>
              <el-button type="danger" size="small" @click="handleDeleteGroup(scope.row)"> 删除 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div v-if="groupList.length > 0" class="page-footer">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="pagination"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑权限组弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" label-width="100px" label-position="right">
        <el-form-item label="权限组名称" prop="title" required>
          <el-input v-model="formData.title" placeholder="请输入权限组名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入权限组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限分配抽屉 -->
    <PermissionDrawer
      v-model:visible="drawerVisible"
      :group-id="currentAssignGroup?.id"
      :group-info="currentAssignGroup"
      direction="rtl"
      size="600"
      @close="handleDrawerClose"
      @success="handlePermissionSuccess"
    />

    <!-- 用户列表抽屉 -->
    <UserListDrawer
      v-model:visible="userListDrawerVisible"
      :title="`查看用户 - ${currentViewGroup?.title || '权限组'}`"
      :group-id="currentViewGroup?.id"
      direction="rtl"
      size="600"
      @close="handleUserListDrawerClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PermissionDrawer from './components/PermissionDrawer.vue';
import UserListDrawer from './components/UserListDrawer.vue';
import { getGroupList as getGroupListApi, updateGroupStatus, saveGroup } from '@/api/admin/auth';

// 权限组列表数据
interface GroupInfo {
  id: number;
  title: string;
  description: string;
  user_count: number;
  status: number;
}

const groupList = ref<GroupInfo[]>([]);
const loading = ref(false);
const page = ref<number>(1);
const pageSize = ref<number>(15);
const total = ref<number>(0);
const searchKeyword = ref<string>('');

// 新增/编辑弹窗
const dialogVisible = ref(false);
const dialogTitle = ref('新增权限组');
const formRef = ref();
const submitLoading = ref(false);
const currentGroup = ref<GroupInfo | null>(null);

const formData = reactive({
  id: 0,
  title: '',
  description: ''
});

// 权限分配抽屉
const drawerVisible = ref(false);
const currentAssignGroup = ref<GroupInfo | null>(null);

// 用户列表抽屉
const userListDrawerVisible = ref(false);
const currentViewGroup = ref<GroupInfo | null>(null);

// 获取权限组列表
const getGroupList = async () => {
  loading.value = true;
  try {
    const res = await getGroupListApi({
      page: page.value,
      rows: pageSize.value,
      keyword: searchKeyword.value
    });

    if (res.code === 200) {
      groupList.value = res.data.data || [];
      total.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取权限组列表失败:', error);
    ElMessage.error('获取权限组列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  getGroupList();
};

// 重置
const handleReset = () => {
  searchKeyword.value = '';
  page.value = 1;
  getGroupList();
};

// 分页
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  getGroupList();
};

const handlePageChange = (current: number) => {
  page.value = current;
  getGroupList();
};

// 新增权限组
const handleAddGroup = () => {
  currentGroup.value = null;
  formData.id = 0;
  formData.title = '';
  formData.description = '';
  dialogTitle.value = '新增权限组';
  dialogVisible.value = true;
};

// 编辑权限组
const handleEditGroup = (item: GroupInfo) => {
  currentGroup.value = item;
  formData.id = item.id;
  formData.title = item.title;
  formData.description = item.description;
  dialogTitle.value = '编辑权限组';
  dialogVisible.value = true;
};

// 切换状态
const handleToggleStatus = async (item: GroupInfo, newStatus: number) => {
  const actionText = newStatus === 1 ? '启用' : '禁用';
  ElMessageBox.confirm(`确定要${actionText}角色组 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateGroupStatus({
          id: item.id,
          status: newStatus
        });

        if (res.code === 200) {
          ElMessage.success(`${actionText}成功`);
          getGroupList();
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error) {
        console.error(`${actionText}失败:`, error);
        ElMessage.error(`${actionText}失败`);
        item.status = item.status === 1 ? 0 : 1;
      }
    })
    .catch(() => {});
};

// 删除权限组
const handleDeleteGroup = (item: GroupInfo) => {
  ElMessageBox.confirm(`确定要删除权限组 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await updateGroupStatus({
          id: item.id,
          status: -1
        });

        if (res.code === 200) {
          ElMessage.success('删除成功');
          getGroupList();
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 查看用户
const handleViewUsers = (item: GroupInfo) => {
  currentViewGroup.value = item;
  userListDrawerVisible.value = true;
};

// 关闭用户列表抽屉
const handleUserListDrawerClose = () => {
  userListDrawerVisible.value = false;
  currentViewGroup.value = null;
};

// 分配权限
const handleAssignPermission = (item: GroupInfo) => {
  currentAssignGroup.value = item;
  drawerVisible.value = true;
};

// 处理权限分配成功
const handlePermissionSuccess = () => {
  // 权限分配成功后，可以刷新列表或执行其他操作
  page.value = 1;
  getGroupList();
};

// 关闭权限分配抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false;
  currentAssignGroup.value = null;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const res = await saveGroup(formData);

      if (res.code === 200) {
        ElMessage.success(formData.id ? '编辑成功' : '新增成功');
        handleDialogClose();
        getGroupList();
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false;
};

// 初始化
onMounted(() => {
  getGroupList();
});
</script>

<style lang="scss" scoped>
.group-toolbar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  border-radius: 6px;
  padding: 10px;
}

// 暗色模式
.dark {
  .group-toolbar {
    background-color: #262626;
  }
}
</style>
