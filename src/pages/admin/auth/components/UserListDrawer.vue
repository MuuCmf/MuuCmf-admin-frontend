<template>
  <el-drawer
    :model-value="visible"
    :direction="direction || 'rtl'"
    :size="size || '600'"
    :title="title"
    @update:model-value="val => emit('update:visible', val)"
    @close="handleClose"
  >
    <div class="user-list-drawer">
      <div class="user-list-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户昵称或UID"
          clearable
          style="width: 250px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" style="margin-left: 12px" @click="handleSearch"> 搜索 </el-button>
      </div>
      <div class="user-list-content">
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>用户数据加载中...</span>
        </div>
        <div v-else class="user-table-container">
          <el-table :data="userList" style="width: 100%">
            <el-table-column label="用户头像" width="80" align="center">
              <template #default="scope">
                <img :src="scope.row.avatar64 || defaultAvatar" :alt="scope.row.nickname" class="user-avatar" />
              </template>
            </el-table-column>
            <el-table-column prop="nickname" label="昵称" min-width="150" align="left">
              <template #default="scope">
                <span class="user-nickname">{{ scope.row.nickname }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="uid" label="UID" width="120" align="center">
              <template #default="scope">
                <span class="user-uid">{{ scope.row.uid }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleRemoveUser(scope.row)"> 移除 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="user-list-footer">
        <el-pagination
          v-model:current-page="page"
          layout="prev, pager, next"
          :total="total"
          :page-size="20"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading, Search } from '@element-plus/icons-vue';
import { getGroupUsers, removeUserFromGroup } from '@/api/admin/auth';

// 组件属性
const props = defineProps<{
  visible: boolean;
  direction?: 'rtl' | 'ltr' | 'ttb' | 'btt';
  size?: string;
  title?: string;
  groupId?: number;
}>();

// 组件事件
const emit = defineEmits<{
  close: [];
  'update:visible': [visible: boolean];
}>();

// 响应式数据
const userList = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const searchKeyword = ref('');
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// 获取用户列表
const getUserList = async () => {
  loading.value = true;
  try {
    const res = await getGroupUsers({
      page: page.value,
      group_id: props.groupId as number,
      keyword: searchKeyword.value
    });

    if (res.code === 200) {
      userList.value = res.data.data || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handlePageChange = (current: number) => {
  page.value = current;
  getUserList();
};

// 搜索处理
const handleSearch = () => {
  page.value = 1;
  getUserList();
};

// 移除用户处理
const handleRemoveUser = async (user: any) => {
  try {
    await ElMessageBox.confirm(`确定要将用户 "${user.nickname}" 从当前权限组中移除吗？`, '确认移除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await removeUserFromGroup({
      uid: user.uid,
      group_id: props.groupId as number
    });

    if (res.code === 200) {
      ElMessage.success('用户移除成功');
      getUserList();
    } else {
      ElMessage.error(res.msg || '移除用户失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('移除用户失败:', error);
      ElMessage.error('移除用户失败');
    }
  }
};

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

// 监听groupId变化，切换时清除搜索关键字
watch(
  () => props.groupId,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      searchKeyword.value = '';
      page.value = 1;
      if (props.visible) {
        getUserList();
      }
    }
  }
);
</script>

<style lang="scss" scoped>
.user-list-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-list-header {
  display: flex;
  align-items: center;
  padding: 0 0 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.user-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  // 加载状态容器
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #606266;
    font-size: 14px;

    .is-loading {
      margin-right: 8px;
      font-size: 20px;
      animation: rotate 1s linear infinite;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // 用户表格容器
  .user-table-container {
    padding: 0 8px;
  }

  // 用户头像样式
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  // 用户昵称样式
  .user-nickname {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  // 用户UID样式
  .user-uid {
    font-size: 14px;
    color: #606266;
  }

  // 优化滚动条样式
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.user-list-footer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e4e7ed;
}

// 暗色模式
.dark {
  .user-list-drawer {
    background-color: #262626;
  }

  .user-list-header {
    border-bottom: 1px solid #363636;
  }

  .user-list-content {
    // 暗色模式加载状态
    .loading-container {
      color: #b8b8b8;
    }

    // 用户昵称样式（暗色模式）
    .user-nickname {
      color: #e5e5e5;
    }

    // 用户UID样式（暗色模式）
    .user-uid {
      color: #b8b8b8;
    }

    // 暗色模式滚动条
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #262626;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: #4a5161;
      border-radius: 4px;

      &:hover {
        background: #5a6171;
      }
    }
  }

  .user-list-footer {
    border-top: 1px solid #363636;
  }
}
</style>
