<template>
  <div class="page-container">
    <div class="page-header">
      <div class="autoreply-toolbar">
        <div class="action-buttons">
          <el-button type="primary" @click="handleAdd">新增自动回复</el-button>
        </div>
        <div class="search-box">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable />
            </el-form-item>
            <el-form-item label="回复类型">
              <el-select v-model="searchForm.type" placeholder="请选择回复类型" clearable>
                <el-option label="全部" value="" />
                <el-option label="文本" value="text" />
                <el-option label="图片" value="image" />
                <el-option label="语音" value="voice" />
                <el-option label="视频" value="video" />
                <el-option label="图文" value="news" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <el-table :data="tableData" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="keyword" label="关键词" min-width="150" />
          <el-table-column prop="msg_type_str" label="回复类型" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.msg_type === 'text'" type="info">文本</el-tag>
              <el-tag v-else-if="row.msg_type === 'image'" type="success">图片</el-tag>
              <el-tag v-else-if="row.msg_type === 'voice'" type="warning">语音</el-tag>
              <el-tag v-else-if="row.msg_type === 'video'" type="danger">视频</el-tag>
              <el-tag v-else-if="row.msg_type === 'news'" type="primary">图文</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="type_str" label="触发方式" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.type === 0" type="info">{{ row.type_str }}</el-tag>
              <el-tag v-else-if="row.type === 1" type="success">{{ row.type_str }}</el-tag>
              <el-tag v-else-if="row.type === 2" type="danger">{{ row.type_str }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="update_time_str" label="更新时间" width="160" />
          <el-table-column label="操作" width="180" fixed="right" align="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="page-footer">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        class="pagination"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <AutoReplyForm v-model="dialogVisible" :title="dialogTitle" :data="formData" @success="handleFormSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { request } from '@/utils/modules/request';
import AutoReplyForm from './components/AutoReplyForm.vue';

interface AutoReply {
  id: number;
  keyword: string;
  type: number;
  text: string;
  material_json: any;
  sort: number;
  status: number;
  create_time_str: string;
  update_time_str: string;
}

const tableData = ref<AutoReply[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增自动回复');
const formData = ref<Partial<AutoReply>>({});

const searchForm = reactive({
  keyword: '',
  type: ''
});

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat/autoreply',
      method: 'GET',
      data: {
        ...searchForm,
        ...pagination
      }
    });
    console.log('接口返回数据:', res);
    if (res.code === 200) {
      tableData.value = res.data.data || [];
      pagination.total = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  getList();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.type = '';
  pagination.page = 1;
  getList();
};

const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  getList();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  getList();
};

const handleAdd = () => {
  dialogTitle.value = '新增自动回复';
  formData.value = {};
  dialogVisible.value = true;
};

const handleEdit = (row: AutoReply) => {
  dialogTitle.value = '编辑自动回复';
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleFormSuccess = () => {
  getList();
};

const handleStatusChange = async (row: AutoReply) => {
  try {
    const res = await request({
      url: `admin/wechat/autoreply/status`,
      method: 'POST',
      data: {
        ids: row.id,
        status: row.status
      }
    });
    if (res.code === 200) {
      ElMessage.success('状态更新成功');
    } else {
      row.status = row.status === 1 ? 0 : 1;
    }
  } catch (error) {
    console.error('状态更新失败:', error);
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.error('状态更新失败');
  }
};

const handleDelete = (row: AutoReply) => {
  ElMessageBox.confirm('确定要删除这条自动回复吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: `admin/wechat/autoreply/status/`,
          method: 'POST',
          data: {
            ids: row.id,
            status: -1
          }
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getList();
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
  background-color: var(--el-color-white);
}

.autoreply-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;

  .action-buttons {
    display: flex;
    align-items: center;
  }

  .search-box {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  .search-box .el-form {
    display: flex;
    align-items: center;
  }

  .search-box .el-form-item {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

.page-content {
  padding: 10px;
}
</style>
