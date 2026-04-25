<template>
  <div class="page-container">
    <div class="page-header">
      <div class="config-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加配置</el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索配置名称/标识"
            clearable
            style="width: 300px; margin-right: 12px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <safe-icon icon="fas search" />
            </template>
          </el-input>
          <el-select
            v-model="searchGroup"
            placeholder="配置分组"
            clearable
            style="width: 150px; margin-right: 12px"
            @change="handleSearch"
          >
            <el-option v-for="(label, key) in group" :key="key" :label="label" :value="key" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div ref="scrollContainerRef" class="with-container">
        <div class="config-list-container">
          <el-table :data="list" stripe style="width: 100%">
            <el-table-column prop="title" label="配置名称" min-width="150" />
            <el-table-column label="配置标识" width="150">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.name }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="配置类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ row.type_name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="group_name" label="配置分组" width="120" />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[15, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <!-- 添加/编辑配置抽屉 -->
    <el-drawer v-model="editDrawer" title="配置编辑" :with-header="false" size="600px">
      <config-edit :config="selectedConfig" :group="group" @close="editDrawer = false" @success="handleEditSuccess" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getConfigGroupList, getConfigList, deleteConfig } from '@/api/admin/config';
import ConfigEdit from './components/edit.vue';
import { useScrollReset } from '@/composables/useScrollReset';

// @ts-expect-error - scrollContainerRef 在模板中使用
const { scrollContainerRef, resetScrollTop } = useScrollReset();

// 配置列表
const group = ref<ConfigGroup>({});
const list = ref<ConfigItem[]>([]);
const loading = ref(false);
const page = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const searchKeyword = ref<string>('');
const searchGroup = ref<string>('');

const editDrawer = ref(false);
const selectedConfig = ref<ConfigItem>({} as ConfigItem);

// 获取配置类型标签类型
const getTypeTagType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    num: 'primary',
    string: 'success',
    password: 'warning',
    textarea: 'info',
    entity: 'info',
    select: 'success',
    radio: 'success',
    checkbox: 'success',
    editor: 'info',
    pic: 'warning',
    file: 'warning'
  };

  return typeMap[type] || 'info';
};

// 获取配置分组数据
const getGroup = async () => {
  try {
    const res = await getConfigGroupList();
    if (res.code === 200) {
      group.value = res.data;
    }
  } catch (error) {
    console.error('获取配置分组数据失败:', error);
    ElMessage.error('获取配置分组数据失败');
  }
};

// 获取配置列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getConfigList({
      page: page.value,
      rows: pageSize.value,
      keyword: searchKeyword.value,
      group: searchGroup.value
    });

    if (res.code === 200) {
      list.value = res.data.data || [];
      total.value = res.data.total || 0;
      resetScrollTop();
    }
  } catch (error) {
    console.error('获取配置列表失败:', error);
    ElMessage.error('获取配置列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索配置
const handleSearch = () => {
  page.value = 1;
  if (searchGroup.value === undefined) {
    searchGroup.value = '';
  }
  getList();
};

// 重置搜索
const handleReset = () => {
  searchKeyword.value = '';
  searchGroup.value = '';
  page.value = 1;
  getList();
};

// 分页大小改变
const handleSizeChange = () => {
  page.value = 1;
  getList();
};

// 分页改变
const handlePageChange = () => {
  getList();
};

// 添加配置
const handleAdd = () => {
  selectedConfig.value = {} as ConfigItem;
  editDrawer.value = true;
};

// 编辑配置
const handleEdit = (item: ConfigItem) => {
  selectedConfig.value = { ...item };
  editDrawer.value = true;
};

// 编辑配置成功
const handleEditSuccess = () => {
  getList();
};

// 删除配置
const handleDelete = (item: ConfigItem) => {
  ElMessageBox.confirm(`确定要删除配置 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteConfig({
          id: item.id
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

onMounted(() => {
  getGroup();
  getList();
});
</script>

<style lang="scss" scoped>
.config-toolbar {
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
  padding: 10px;
  background-color: var(--el-color-white);
}

.config-list-container {
  width: 100%;
  overflow: hidden;
}
</style>
