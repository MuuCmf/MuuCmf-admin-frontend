<template>
  <div class="page-container">
    <div class="page-header">
      <div class="score-log-toolbar">
        <div class="toolbar-left">
          <el-button type="danger" @click="handleClearLog"> 清空日志 </el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户昵称或UID"
            clearable
            style="width: 300px; margin-right: 12px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div ref="scrollContainerRef" class="with-container">
        <el-table :data="list" style="width: 100%" stripe>
          <el-table-column prop="user_info.nickname" label="用户" min-width="150">
            <template #default="scope">
              <div style="display: flex; align-items: center; gap: 8px">
                <img
                  :src="scope.row.user_info.avatar64 || defaultAvatar"
                  :alt="scope.row.user_info.nickname"
                  class="user-avatar"
                />
                <span>{{ scope.row.user_info.nickname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="积分类型" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.type === 1 ? 'primary' : 'success'">{{ scope.row.score_type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="adjust_type" label="调整类型" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.adjust_type === '增加' ? 'success' : 'danger'">
                {{ scope.row.adjust_type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="积分变动" width="120" align="center">
            <template #default="scope">
              <span
                :class="{
                  'score-increase': scope.row.adjust_type === '增加',
                  'score-decrease': scope.row.adjust_type === '减少'
                }"
              >
                {{ scope.row.value }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="final_value" label="积分最终值" width="120" align="center">
            <template #default="scope">
              <span class="final-score">{{ scope.row.final_value }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="变动描述" min-width="200" align="left" />
          <el-table-column prop="create_time_str" label="创建时间" width="180" align="center" />
        </el-table>
      </div>
    </div>

    <div v-if="total > 0" class="page-footer">
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[20, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useScrollReset } from '@/composables/useScrollReset';

// 积分日志接口返回的数据结构
interface ScoreLogItem {
  id: number;
  user_id: number;
  user_info: {
    uid: number;
    nickname: string;
    avatar?: string;
  };
  type: number; // 1: 积分, 2: 经验值
  adjust_type: number; // 1: 增加, 2: 减少
  value: number;
  final_value: number;
  description: string;
  create_time: string;
}

// 响应式数据
const list = ref<ScoreLogItem[]>([]);
const loading = ref(false);
const page = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const searchForm = ref({
  keyword: ''
});
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
const { scrollContainerRef, resetScrollTop } = useScrollReset();

// 获取积分日志列表
const getList = async () => {
  loading.value = true;
  try {
    const data: Record<string, any> = {
      page: page.value,
      rows: pageSize.value,
      keyword: searchForm.value.keyword
    };

    const res = await request({
      url: 'admin/score/log',
      data: data,
      method: 'GET'
    });

    if (res.code === 200) {
      console.log(res.data);
      // 处理返回数据
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
      resetScrollTop();
    }
  } catch (error) {
    console.error('获取积分日志列表失败:', error);
    ElMessage.error('获取积分日志列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  getList();
};

// 重置
const handleReset = () => {
  searchForm.value.keyword = '';
  page.value = 1;
  getList();
};

// 分页
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  getList();
};

const handlePageChange = (current: number) => {
  page.value = current;
  getList();
};

// 清空日志
const handleClearLog = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有积分日志吗？此操作不可恢复！', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });

    const res = await request({
      url: 'admin/score/clear',
      method: 'POST'
    });

    if (res.code === 200) {
      ElMessage.success('日志清空成功');
      getList(); // 刷新日志列表
    } else {
      ElMessage.error(res.msg || '日志清空失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error);
      ElMessage.error('日志清空失败');
    }
  }
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.score-log-toolbar {
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
  background-color: var(--el-color-white);
  border-radius: 6px;
  padding: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-uid {
  color: #909399;
  font-size: 12px;
}

.score-increase {
  color: #67c23a;
  font-weight: 500;
}

.score-decrease {
  color: #f56c6c;
  font-weight: 500;
}

.final-score {
  color: #409eff;
  font-weight: 500;
}

// 暗色模式适配
:deep(.dark) {
  .page-header,
  .page-content,
  .page-footer {
    background-color: #262626;
  }

  .user-uid {
    color: #909399;
  }
}
</style>
