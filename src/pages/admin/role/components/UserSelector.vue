<template>
  <div class="user-selector">
    <el-button type="primary" @click="handleOpenSelector">
      <safe-icon icon="fas user" />
      选择用户
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="选择用户"
      width="800px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div class="selector-toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户昵称或用户名"
          clearable
          style="width: 300px"
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

      <div v-loading="loading" class="user-list">
        <div
          v-for="user in userList"
          :key="user.uid"
          class="user-item"
          :class="{ selected: selectedUserId === user.uid }"
          @click="handleSelectUser(user)"
        >
          <img :src="user.avatar128 || defaultAvatar" :alt="user.nickname" class="user-avatar" />
          <div class="user-info">
            <div class="user-name">{{ user.nickname }}</div>
            <div class="user-username">@{{ user.username }}</div>
          </div>
          <div class="user-check">
            <el-icon v-if="selectedUserId === user.uid" color="#409eff" :size="20">
              <Check />
            </el-icon>
          </div>
        </div>

        <div v-if="!loading && userList.length === 0" class="empty-state">
          <el-empty description="暂无用户数据" />
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="rows"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!selectedUser" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { request } from '@/utils/modules/request';

interface Props {
  modelValue?: any;
}

interface Emits {
  (e: 'update:modelValue', value: any): void;
  (e: 'change', user: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

const dialogVisible = ref(false);
const loading = ref(false);
const searchKeyword = ref('');
const userList = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const rows = ref(20);
const selectedUser = ref<any>(null);
const selectedUserId = ref<number | null>(null);

const getUserList = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'admin/member/index',
      method: 'GET',
      data: {
        page: page.value,
        rows: rows.value,
        keyword: searchKeyword.value
      }
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

const handleSearch = () => {
  page.value = 1;
  getUserList();
};

const handleReset = () => {
  searchKeyword.value = '';
  page.value = 1;
  getUserList();
};

const handleSizeChange = (size: number) => {
  rows.value = size;
  page.value = 1;
  getUserList();
};

const handlePageChange = (currentPage: number) => {
  page.value = currentPage;
  getUserList();
};

const handleOpenSelector = () => {
  dialogVisible.value = true;
  selectedUser.value = props.modelValue || null;
  selectedUserId.value = props.modelValue?.uid || null;
  getUserList();
};

const handleSelectUser = (user: any) => {
  if (user && user.uid) {
    selectedUser.value = user;
    selectedUserId.value = user.uid;
  }
};

const handleConfirm = () => {
  if (selectedUser.value) {
    emit('update:modelValue', selectedUser.value);
    emit('change', selectedUser.value);
    dialogVisible.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  selectedUser.value = null;
  selectedUserId.value = null;
};

onMounted(() => {
  if (props.modelValue) {
    selectedUser.value = props.modelValue;
    selectedUserId.value = props.modelValue.id;
  }
});
</script>

<style lang="scss" scoped>
.user-selector {
  display: inline-block;
}

.selector-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.user-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;

  .user-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.selected {
      background-color: #ecf5ff;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 12px;
    }

    .user-info {
      flex: 1;

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .user-username {
        font-size: 12px;
        color: #909399;
      }
    }

    .user-check {
      flex-shrink: 0;
    }
  }

  .empty-state {
    padding: 40px 20px;
    text-align: center;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.dark) {
  .user-list {
    border-color: #363637;

    .user-item {
      &:hover {
        background-color: #2a2a2a;
      }

      &.selected {
        background-color: #1a1a1a;
      }

      .user-info {
        .user-name {
          color: #e5eaf3;
        }

        .user-username {
          color: #9ca3af;
        }
      }
    }
  }
}
</style>
