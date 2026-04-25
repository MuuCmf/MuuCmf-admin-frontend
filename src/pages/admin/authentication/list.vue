<template>
  <div class="page-container">
    <div class="page-header">
      <div class="search-container">
        <el-form :inline="true" :model="searchForm">
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              style="margin-right: 12px"
              placeholder="请输入用户名/昵称/手机号/邮箱"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <el-tabs v-model="activeTab" class="auth-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="已实名" name="2"></el-tab-pane>
          <el-tab-pane name="1">
            <template #label>
              未审核<span v-if="unVerify > 0" class="tab-count">{{ unVerify }}</span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="-1">
            <template #label>
              审核未通过<span v-if="failVerify > 0" class="tab-count">{{ failVerify }}</span>
            </template>
          </el-tab-pane>
        </el-tabs>
        <div class="table-container">
          <el-table :data="tableData" stripe>
            <el-table-column label="用户信息" min-width="200" align="left">
              <template #default="scope">
                <div class="user-info">
                  <el-avatar :src="scope.row.avatar64" :size="50" />
                  <div class="user-detail">
                    <div class="username">{{ scope.row.username }}</div>
                    <div class="nickname">{{ scope.row.nickname }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="mobile" label="手机号" width="130" align="center" />
            <el-table-column prop="email" label="邮箱" min-width="180" align="left" />
            <el-table-column prop="card_type_str" label="证件类型" width="100" align="center" />
            <el-table-column prop="status_str" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status_str }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time_str" label="提交时间" width="160" align="center" />
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleVerify(scope.row)"> 审核 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        class="pagination"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="viewDialogVisible" title="认证详情" width="800px" destroy-on-close>
      <div v-if="currentRow" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentRow.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ currentRow.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRow.mobile }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentRow.email }}</el-descriptions-item>
          <el-descriptions-item label="证件类型">{{ currentRow.card_type_str }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRow.status)">{{ currentRow.status_str }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="证件正面" :span="2">
            <el-image
              v-if="currentRow.front_original"
              :src="currentRow.front_original"
              :preview-src-list="[currentRow.front_original]"
              fit="cover"
              style="width: 200px; height: 140px"
            />
          </el-descriptions-item>
          <el-descriptions-item label="证件背面" :span="2">
            <el-image
              v-if="currentRow.back_original"
              :src="currentRow.back_original"
              :preview-src-list="[currentRow.back_original]"
              fit="cover"
              style="width: 200px; height: 140px"
            />
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRow.status === -1" label="拒绝原因" :span="2">
            {{ currentRow.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentRow.create_time_str }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentRow.update_time_str }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template v-if="currentRow" #footer>
        <el-form
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyFormRules"
          label-width="100px"
          style="display: flex; align-items: center"
        >
          <el-form-item label="审核结果" prop="status" style="margin-bottom: 0">
            <el-radio-group v-model="verifyForm.status">
              <el-radio :value="2">通过</el-radio>
              <el-radio :value="-1">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="verifyForm.status === -1" label="拒绝原因" prop="reason" style="margin-bottom: 0">
            <el-input
              v-model="verifyForm.reason"
              type="textarea"
              :rows="2"
              placeholder="请输入拒绝原因"
              style="width: 300px"
            />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="verifyLoading" @click="handleVerifySubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage } from 'element-plus';

interface AuthenticationItem {
  id: number;
  uid: number;
  username: string;
  nickname: string;
  email: string;
  mobile: string;
  avatar: string;
  avatar64: string;
  avatar128: string;
  avatar256: string;
  avatar512: string;
  card_type: number;
  card_type_str: string;
  front: string;
  front_original: string;
  back: string;
  back_original: string;
  status: number;
  status_str: string;
  reason: string;
  create_time: number;
  create_time_str: string;
  update_time: number;
  update_time_str: string;
}

const loading = ref(false);
const tableData = ref<AuthenticationItem[]>([]);
// 未审核的认证数量
const unVerify = ref<number>(0);
// 审核未通过的认证数量
const failVerify = ref<number>(0);
const viewDialogVisible = ref(false);

const searchForm = reactive({
  keyword: '',
  status: 'all'
});

const activeTab = ref('all');

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

const currentRow = ref<AuthenticationItem | null>(null);
const verifyFormRef = ref();
const verifyLoading = ref(false);
const verifyForm = reactive({
  uid: 0,
  id: 0,
  status: 2,
  reason: ''
});

const verifyFormRules = reactive({
  reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
});

const getStatusType = (status: number) => {
  switch (status) {
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

const getList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      rows: pagination.size,
      keyword: searchForm.keyword,
      status: searchForm.status
    };

    const res = await request({
      url: 'admin/Authentication/list',
      method: 'GET',
      data: params
    });

    if (res.code === 200) {
      tableData.value = res.data.data || [];
      pagination.total = res.data.total || 0;

      unVerify.value = res.data.unverify || 0;
      failVerify.value = res.data.false_verify || 0;
    } else {
      ElMessage.error(res.msg || '获取认证列表失败');
    }
  } catch (error: any) {
    console.error('获取认证列表失败:', error);
    ElMessage.error('获取认证列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  getList();
};

const handleTabChange = (tabName: string | number) => {
  searchForm.status = String(tabName);
  pagination.current = 1;
  getList();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = 'all';
  activeTab.value = 'all';
  handleSearch();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  getList();
};

const handleCurrentChange = (current: number) => {
  pagination.current = current;
  getList();
};

const handleVerify = (row: AuthenticationItem) => {
  currentRow.value = row;
  verifyForm.uid = row.uid;
  verifyForm.id = row.uid;
  verifyForm.status = 2;
  verifyForm.reason = '';
  viewDialogVisible.value = true;
};

const handleVerifySubmit = async () => {
  if (!verifyFormRef.value) return;

  try {
    if (verifyForm.status === -1) {
      await verifyFormRef.value.validate();
    }

    verifyLoading.value = true;

    const res = await request({
      url: 'admin/Authentication/verify',
      method: 'POST',
      data: verifyForm
    });

    if (res.code === 200) {
      ElMessage.success('审核成功');
      viewDialogVisible.value = false;
      getList();
    } else {
      ElMessage.error(res.msg || '审核失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核失败:', error);
      ElMessage.error('审核失败');
    }
  } finally {
    verifyLoading.value = false;
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.page-container {
  .page-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;

    .search-container {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;
      }
    }
  }

  .page-content {
    border-radius: 6px;
    padding: 10px;

    .auth-tabs {
      margin-bottom: 1px;

      .tab-count {
        display: inline-block;
        margin-left: 4px;
        padding: 0 6px;
        font-size: 12px;
        border-radius: 10px;
        background-color: var(--el-color-danger);
        color: var(--el-color-white);
      }
    }

    .table-container {
      margin-bottom: 20px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .username {
            font-weight: 500;
            font-size: 14px;
            color: var(--el-text-color-primary);
          }

          .nickname {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .detail-content {
    padding: 20px 0;
  }
}
</style>
