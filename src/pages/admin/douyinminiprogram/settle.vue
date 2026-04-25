<template>
  <div class="page-container">
    <div class="page-header">
      <div class="settle-toolbar">
        <div class="header-active">
          <el-button type="primary" @click="handleGoToOrders">未结算订单</el-button>
        </div>
        <div class="search-form">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item>
              <el-input
                v-model="searchForm.order_no"
                placeholder="请输入订单号"
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
          <el-table :data="lists" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="order_no" label="订单号" min-width="180" />
            <el-table-column prop="settle_no" label="结算单号" min-width="180" />
            <el-table-column prop="douyin_settle_no" label="抖音结算号" min-width="180" />
            <el-table-column prop="price" label="结算金额" width="120">
              <template #default="scope">
                <span class="price-text">¥{{ scope.row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status_str" label="结算状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ scope.row.status_str }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="update_time_str" label="结算时间" width="160" />
            <el-table-column prop="create_time_str" label="创建时间" width="160" />
            <el-table-column label="操作" width="200" align="right" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
                <el-button
                  v-if="scope.row.status === 0"
                  size="small"
                  type="success"
                  @click="handleConfirm(scope.row.id)"
                  >确认</el-button
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="结算详情" width="600px">
      <el-descriptions v-if="currentDetail" :column="2" border>
        <el-descriptions-item label="结算ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentDetail.order_no }}</el-descriptions-item>
        <el-descriptions-item label="结算单号">{{ currentDetail.settle_no }}</el-descriptions-item>
        <el-descriptions-item label="抖音结算号">{{ currentDetail.douyin_settle_no }}</el-descriptions-item>
        <el-descriptions-item label="结算金额">¥{{ currentDetail.price }}</el-descriptions-item>
        <el-descriptions-item label="结算状态">
          <el-tag :type="getStatusType(currentDetail.status)" size="small">
            {{ currentDetail.status_str }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.create_time_str }}</el-descriptions-item>
        <el-descriptions-item label="结算时间">{{ currentDetail.update_time_str }}</el-descriptions-item>
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
import { useRouter } from 'vue-router';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import SafeIcon from '@/components/SafeIcon.vue';

const router = useRouter();

interface SettleItem {
  id: number;
  order_no: string;
  settle_no: string;
  douyin_settle_no: string;
  price: string;
  status: number;
  status_str: string;
  shopid: number;
  create_time?: number;
  create_time_str?: string;
  create_time_friendly_str?: string;
  update_time?: number;
  update_time_str?: string;
  update_time_friendly_str?: string;
}

const page = ref(1);
const rows = ref(20);
const total = ref(0);
const loading = ref(false);
const lists = ref<SettleItem[]>([]);
const searchForm = ref({
  order_no: ''
});
const detailVisible = ref(false);
const currentDetail = ref<SettleItem | null>(null);

const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/douyin/settle',
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
      ElMessage.error(res.msg || '获取结算列表失败');
    }
  } catch (error) {
    ElMessage.error('获取结算列表失败');
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

const getStatusType = (status: number) => {
  switch (status) {
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

const handleViewDetail = async (row: SettleItem) => {
  currentDetail.value = row;
  detailVisible.value = true;
};

const handleConfirm = (id: number) => {
  ElMessageBox.confirm('确定要确认这条结算记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/douyin/settle/action',
          method: 'POST',
          data: {
            id: id
          }
        });
        if (res.code === 200) {
          ElMessage.success('确认成功');
          getList();
        } else {
          ElMessage.error(res.msg || '确认失败');
        }
      } catch (error) {
        ElMessage.error('确认失败');
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

const handleGoToOrders = () => {
  router.push('/admin/douyinminiprogram/orders');
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.settle-toolbar {
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

.page-content {
  padding: 10px;
}

.table-container {
  border-radius: 6px;
  overflow: hidden;

  .price-text {
    color: #f56c6c;
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
