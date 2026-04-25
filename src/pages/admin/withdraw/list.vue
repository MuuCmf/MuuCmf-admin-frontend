<template>
  <div class="withdraw-list-wrapper">
    <div class="page-container">
      <div class="page-header">
        <div class="withdraw-toolbar">
          <div class="header-active">
            <el-button type="success" :disabled="selectedIds.length === 0" @click="handleBatchProcess"
              >批量处理</el-button
            >
            <el-button type="warning" :disabled="selectedIds.length === 0" @click="handleBatchCancel"
              >批量取消</el-button
            >
          </div>
          <div class="search-form">
            <el-form :inline="true" :model="searchForm" class="demo-form-inline">
              <el-form-item>
                <el-input
                  v-model="searchForm.order_no"
                  placeholder="请输入提现单号"
                  style="width: 300px; margin-right: 12px"
                >
                  <template #prefix>
                    <safe-icon icon="fas search" />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div v-loading="loading" class="page-content">
        <div class="with-container">
          <div class="table-container">
            <el-table :data="lists" style="width: 100%" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="40" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="order_no" label="提现单号" min-width="180" />
              <el-table-column label="用户信息" min-width="180">
                <template #default="scope">
                  <div class="user-info-cell">
                    <img :src="scope.row.user_info?.avatar64 || defaultAvatar" class="user-avatar" />
                    <div class="user-details">
                      <div class="user-nickname">{{ scope.row.user_info?.nickname || '-' }}</div>
                      <div class="user-uid">ID: {{ scope.row.uid }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="提现金额" width="120">
                <template #default="scope">
                  <span class="price-text">¥{{ scope.row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="channel_str" label="提现渠道" width="100" />
              <el-table-column prop="paid_str" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.paid)" size="small">
                    {{ scope.row.paid_str }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="create_time_str" label="申请时间" width="160" />
              <el-table-column prop="paid_time_str" label="处理时间" width="160" />
              <el-table-column label="操作" width="200" align="right" fixed="right">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
                  <el-button
                    v-if="scope.row.paid === 0"
                    size="small"
                    type="success"
                    @click="handleProcess(scope.row.id)"
                    >处理</el-button
                  >
                  <el-button v-if="scope.row.paid === 0" size="small" type="warning" @click="handleCancel(scope.row.id)"
                    >取消</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="rows"
          class="pagination"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="提现详情" width="600px">
      <el-descriptions v-if="currentDetail" :column="2" border>
        <el-descriptions-item label="提现单号">{{ currentDetail.order_no }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentDetail.uid }}</el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ currentDetail.user_info?.nickname }}</el-descriptions-item>
        <el-descriptions-item label="提现金额">¥{{ currentDetail.price }}</el-descriptions-item>
        <el-descriptions-item label="提现渠道">{{ currentDetail.channel }}</el-descriptions-item>
        <el-descriptions-item label="支付渠道">{{ currentDetail.pay_channel }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentDetail.paid)" size="small">
            {{ currentDetail.paid_str }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentDetail.create_time_str }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentDetail.paid_time_str || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import SafeIcon from '@/components/SafeIcon.vue';

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

interface WithdrawItem {
  id: number;
  uid: number;
  order_no: string;
  price: number;
  channel: string;
  pay_channel: string;
  paid: number;
  paid_str: string;
  status_str: string;
  create_time?: number;
  create_time_str?: string;
  paid_time?: number;
  paid_time_str?: string;
  user_info?: {
    uid: number;
    nickname: string;
    avatar: string;
    avatar64?: string;
  };
}

const page = ref(1);
const rows = ref(20);
const total = ref(0);
const loading = ref(false);
const lists = ref<WithdrawItem[]>([]);
const searchForm = ref({
  order_no: ''
});
const selectedIds = ref<number[]>([]);
const detailVisible = ref(false);
const currentDetail = ref<WithdrawItem | null>(null);

const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/withdraw/list',
      method: 'GET',
      data: {
        page: page.value,
        rows: rows.value,
        ...searchForm.value
      }
    });
    if (res.code === 200) {
      lists.value = res.data.data || [];
      total.value = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取提现列表失败');
    }
  } catch (error) {
    ElMessage.error('获取提现列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  getList();
};

const resetForm = () => {
  searchForm.value = {
    order_no: ''
  };
  page.value = 1;
  getList();
};

const getStatusType = (paid: number) => {
  switch (paid) {
    case 0:
      return 'warning';
    case 1:
      return 'success';
    case -1:
      return 'danger';
    default:
      return 'info';
  }
};

const handleViewDetail = async (row: WithdrawItem) => {
  try {
    const res = await request({
      url: 'admin/withdraw/detail',
      method: 'GET',
      data: {
        id: row.id
      }
    });
    if (res.code === 200) {
      currentDetail.value = res.data;
      detailVisible.value = true;
    } else {
      ElMessage.error(res.msg || '获取详情失败');
    }
  } catch (error) {
    ElMessage.error('获取详情失败');
    console.error(error);
  }
};

const handleProcess = (id: number) => {
  ElMessageBox.confirm('确定要手动处理这条提现记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/withdraw/action',
          method: 'POST',
          data: {
            id: id
          }
        });
        if (res.code === 200) {
          ElMessage.success('处理成功');
          getList();
        } else {
          ElMessage.error(res.msg || '处理失败');
        }
      } catch (error) {
        ElMessage.error('处理失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleCancel = (id: number) => {
  ElMessageBox.confirm('确定要取消这条提现申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/withdraw/cancel',
          method: 'POST',
          data: {
            id: id
          }
        });
        if (res.code === 200) {
          ElMessage.success('取消成功');
          getList();
        } else {
          ElMessage.error(res.msg || '取消失败');
        }
      } catch (error) {
        ElMessage.error('取消失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleSelectionChange = (selection: WithdrawItem[]) => {
  selectedIds.value = selection.map(item => item.id);
};

const handleBatchProcess = () => {
  ElMessageBox.confirm(`确定要处理选中的 ${selectedIds.value.length} 条记录吗？`, '批量处理', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const promises = selectedIds.value.map(id => {
        return request({
          url: 'admin/withdraw/action',
          method: 'POST',
          data: { id }
        });
      });

      try {
        await Promise.all(promises);
        ElMessage.success('批量处理成功');
        selectedIds.value = [];
        getList();
      } catch (error) {
        ElMessage.error('批量处理失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleBatchCancel = () => {
  ElMessageBox.confirm(`确定要取消选中的 ${selectedIds.value.length} 条记录吗？`, '批量取消', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const promises = selectedIds.value.map(id => {
        return request({
          url: 'admin/withdraw/cancel',
          method: 'POST',
          data: { id }
        });
      });

      try {
        await Promise.all(promises);
        ElMessage.success('批量取消成功');
        selectedIds.value = [];
        getList();
      } catch (error) {
        ElMessage.error('批量取消失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleSizeChange = () => {
  page.value = 1;
  getList();
};

const handlePageChange = () => {
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.page-content {
  padding: 10px;
}

.withdraw-list-wrapper {
  height: 100%;
}

.withdraw-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.header-active {
  display: flex;
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
    margin-right: 0;
  }
}

.table-container {
  border-radius: 6px;
  overflow: hidden;

  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .user-nickname {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-uid {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .price-text {
    color: #f56c6c;
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
