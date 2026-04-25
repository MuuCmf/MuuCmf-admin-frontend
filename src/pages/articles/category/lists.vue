<template>
  <div class="page-container">
    <div class="page-header">
      <div class="category-toolbar">
        <el-button type="primary" class="primary-btn" @click="handleAdd()">
          <safe-icon icon="fas plus" />
          新增根分类
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="category-container">
          <div class="category-list">
            <template v-for="item in categoryList" :key="item.id">
              <div class="category-item level-1">
                <div class="category-card">
                  <div class="card-main">
                    <div class="category-cover">
                      <img
                        :src="item.cover_200 || defaultCover"
                        :alt="item.title"
                        class="cover-image"
                        @error="handleCoverError"
                      />
                    </div>
                    <div class="category-info">
                      <div class="category-title level-1-title">{{ item.title }}</div>
                      <div class="category-meta">
                        <span class="meta-item">
                          <safe-icon icon="fas hashtag" />
                          ID: {{ item.id }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="card-tags">
                    <el-tag :type="item.status === 1 ? 'success' : 'danger'" size="small" effect="plain">
                      {{ item.status_str }}
                    </el-tag>
                    <el-tag :type="item.can_post === 1 ? 'primary' : 'info'" size="small" effect="plain">
                      可投稿: {{ item.can_post === 1 ? '是' : '否' }}
                    </el-tag>
                    <el-tag :type="item.need_audit === 1 ? 'warning' : 'info'" size="small" effect="plain">
                      需审核: {{ item.need_audit === 1 ? '是' : '否' }}
                    </el-tag>
                  </div>
                  <div class="card-divider"></div>
                  <div class="card-actions">
                    <el-button type="warning" size="small" @click="handleAdd(item)">
                      <safe-icon icon="fas plus" />
                      添加子分类
                    </el-button>
                    <el-button type="primary" size="small" @click="handleEdit(item)">
                      <safe-icon icon="fas edit" />
                      编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(item)">
                      <safe-icon icon="fas trash" />
                      删除
                    </el-button>
                  </div>
                </div>
                <template v-if="item._child && item._child.length > 0">
                  <div class="category-children level-2">
                    <template v-for="child in item._child" :key="child.id">
                      <div class="category-item level-2">
                        <div class="category-card">
                          <div class="card-main">
                            <div class="category-cover">
                              <img
                                :src="child.cover_200 || defaultCover"
                                :alt="child.title"
                                class="cover-image"
                                @error="handleCoverError"
                              />
                            </div>
                            <div class="category-info">
                              <div class="category-title level-2-title">{{ child.title }}</div>
                              <div class="category-meta">
                                <span class="meta-item">
                                  <safe-icon icon="fas hashtag" />
                                  ID: {{ child.id }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="card-tags">
                            <el-tag :type="child.status === 1 ? 'success' : 'danger'" size="small" effect="plain">
                              {{ child.status_str }}
                            </el-tag>
                            <el-tag :type="child.can_post === 1 ? 'primary' : 'info'" size="small" effect="plain">
                              可投稿: {{ child.can_post === 1 ? '是' : '否' }}
                            </el-tag>
                            <el-tag :type="child.need_audit === 1 ? 'warning' : 'info'" size="small" effect="plain">
                              需审核: {{ child.need_audit === 1 ? '是' : '否' }}
                            </el-tag>
                          </div>
                          <div class="card-divider"></div>
                          <div class="card-actions">
                            <el-button type="primary" size="small" @click="handleEdit(child)">
                              <safe-icon icon="fas edit" />
                              编辑
                            </el-button>
                            <el-button type="danger" size="small" @click="handleDelete(child)">
                              <safe-icon icon="fas trash" />
                              删除
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <div v-if="!loading && categoryList.length === 0" class="empty-state">
            <el-empty description="暂无分类数据" />
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑分类抽屉组件 -->
    <CategoryDrawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
      :category-list="categoryList"
      :initial-data="drawerInitialData"
      @success="handleDrawerSuccess"
      @close="handleDrawerClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { request } from '@/utils/modules/request';
import CategoryDrawer from './components/CategoryDrawer.vue';

// 默认封面
const defaultCover = 'https://dev.t8.muucmf.cc/static/common/images/nopic.png';

// 加载状态
const loading = ref(false);

// 分类列表数据
const categoryList = ref<any[]>([]);

// 新增/编辑抽屉
const drawerVisible = ref(false);
const drawerTitle = ref('新增分类');
const drawerInitialData = ref<any>(null);

// 封面图片加载错误处理
const handleCoverError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = defaultCover;
};

// 获取分类列表
const getCategoryList = async () => {
  loading.value = true;
  try {
    const response = await request({
      url: 'articles/admin/category/lists',
      method: 'GET',
      data: {}
    });
    if (response.code === 200) {
      categoryList.value = response.data || [];
    } else {
      ElMessage.error(response.msg || '获取分类列表失败');
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

// 新增分类
const handleAdd = (parent?: any) => {
  if (parent) {
    drawerTitle.value = '新增子分类';
    drawerInitialData.value = {
      id: 0,
      title: '',
      cover: '',
      cover_100: '',
      cover_200: '',
      cover_400: '',
      pid: parent.id,
      can_post: parent.can_post,
      need_audit: parent.need_audit,
      sort: 0,
      status: 1
    };
  } else {
    drawerTitle.value = '新增根分类';
    drawerInitialData.value = {
      id: 0,
      title: '',
      cover: '',
      cover_100: '',
      cover_200: '',
      cover_400: '',
      pid: 0,
      can_post: 1,
      need_audit: 1,
      sort: 0,
      status: 1
    };
  }
  drawerVisible.value = true;
};

// 编辑分类
const handleEdit = (item: any) => {
  drawerTitle.value = '编辑分类';
  drawerInitialData.value = {
    id: item.id,
    title: item.title,
    cover: item.cover || '',
    cover_100: item.cover_100 || '',
    cover_200: item.cover_200 || '',
    cover_400: item.cover_400 || '',
    pid: item.pid || 0,
    can_post: item.can_post,
    need_audit: item.need_audit,
    sort: item.sort || 0,
    status: item.status
  };
  drawerVisible.value = true;
};

// 删除分类
const handleDelete = (item: any) => {
  ElMessageBox.confirm(`确定要删除分类 "${item.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'articles/admin/category/status',
          method: 'POST',
          data: {
            ids: item.id,
            status: -1
          }
        });
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getCategoryList();
        } else {
          ElMessage.error(res.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 抽屉操作成功回调
const handleDrawerSuccess = () => {
  getCategoryList();
};

// 关闭抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false;
  drawerInitialData.value = null;
};

onMounted(() => {
  getCategoryList();
});
</script>

<style lang="scss" scoped>
.page-header {
  background-color: var(--el-color-white);

  .category-toolbar {
    padding: 16px 24px;
  }
}

.category-container {
  background-color: var(--el-color-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.category-list {
  padding: 16px;
}

.category-item {
  width: 100%;
  margin-bottom: 12px;
  position: relative;
  transition: all 0.3s ease;

  &:last-child {
    margin-bottom: 0;
  }
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #409eff;

    &::before {
      opacity: 1;
    }
  }
}

.card-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.category-cover {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: scale(1.05);

    .cover-image {
      transform: scale(1.1);
    }
  }
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-title {
  color: #212529;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: #409eff;
  }
}

.level-1-title {
  font-size: 16px;
}

.level-2-title {
  font-size: 15px;
}

.level-3-title {
  font-size: 14px;
  color: #6c757d;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #6c757d;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.card-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 320px;
  justify-content: flex-end;
}

.card-divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent 0%, #e9ecef 50%, transparent 100%);
  margin: 0 16px;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  :deep(.el-button) {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.category-children {
  position: relative;
  margin-top: 8px;
}

.level-2 {
  padding-left: 32px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #e9ecef 0%, transparent 100%);
    border-radius: 1px;
  }

  .category-item::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 50%;
    width: 16px;
    height: 2px;
    background: #e9ecef;
  }

  .category-item:last-child::after {
    content: '';
    position: absolute;
    left: 16px;
    top: 50%;
    bottom: 0;
    width: 2px;
    background: #fff;
  }
}

.level-3 {
  padding-left: 32px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 16px;

  :deep(.el-empty) {
    --el-empty-description-margin-top: 16px;
  }
}

html.dark {
  .category-container {
    background: transparent;
  }

  .category-header {
    background: linear-gradient(135deg, #2d2d2d 0%, #252525 100%);
    border-color: #363637;
    color: #9ca3af;
  }

  .category-card {
    background: #252525;
    border-color: #363637;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &::before {
      background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
    }

    &:hover {
      background: #2d2d2d;
      border-color: #409eff;
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
    }
  }

  .category-title {
    color: #e5eaf3;

    &:hover {
      color: #409eff;
    }
  }

  .level-3-title {
    color: #9ca3af;
  }

  .category-meta {
    color: #9ca3af;
  }

  .category-cover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .level-2::before {
    background: linear-gradient(180deg, #363637 0%, transparent 100%);
  }

  .level-2 .category-item::before {
    background: #363637;
  }

  .level-2 .category-item:last-child::after {
    background: #1e1e1e;
  }

  .cover-preview {
    border-color: #363637;
  }

  .empty-state {
    background: #1e1e1e;
    border: 1px solid #363637;
  }

  .card-divider {
    background: linear-gradient(180deg, transparent 0%, #363637 50%, transparent 100%);
  }
}

@media (max-width: 1400px) {
  .card-tags {
    flex: 0 0 280px;
  }
}

@media (max-width: 1200px) {
  .category-header-title {
    flex: 0 0 180px;
  }

  .card-tags {
    flex: 0 0 240px;
  }
}
</style>
