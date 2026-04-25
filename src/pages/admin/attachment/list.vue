<template>
  <div class="page-container">
    <div class="page-header">
      <div class="search-box">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="searchForm.keyword" placeholder="请输入搜索关键字">
              <template #prefix>
                <safe-icon icon="fa fa-search" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.type" placeholder="请选择文件类型" clearable @clear="searchForm.type = ''">
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="文件" value="application" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="searchForm.driver"
              placeholder="请选择存储驱动"
              clearable
              @clear="searchForm.driver = ''"
            >
              <el-option label="本地" value="local" />
              <el-option label="阿里云OSS" value="oss" />
              <el-option label="腾讯云COS" value="cos" />
              <el-option label="腾讯VOD" value="tcvod" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-loading="loading" class="page-content">
      <div class="with-container">
        <div class="table-container">
          <el-table :data="lists" style="width: 100%">
            <el-table-column label="预览" width="80">
              <template #default="scope">
                <el-image
                  v-if="scope.row.type === 'image'"
                  :src="scope.row.thumb.thumb_100"
                  fit="cover"
                  style="width: 40px; height: 40px; border-radius: 4px"
                  lazy
                />
                <div v-else class="file-thumbnail">
                  {{ scope.row.ext }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="filename" label="文件名" min-width="150">
              <template #default="scope">
                <div class="filename-wrapper">
                  <span class="filename">{{ scope.row.filename }}</span>
                  <span class="file-ext">{{ scope.row.ext }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="driver_str" label="存储驱动" width="100" />
            <el-table-column prop="create_time_str" label="创建时间" width="160" />
            <el-table-column prop="user_info.nickname" label="用户" width="120" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="previewFile(scope.row)">详情</el-button>
                <el-button size="small" @click="downloadFile(scope.row)">下载</el-button>
                <el-button size="small" type="danger" @click="deleteFile(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="rows"
        class="pagination"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewFileInfo.filename" width="80%" class="preview-dialog">
      <div class="preview-content">
        <el-image
          v-if="previewFileInfo.type === 'image'"
          :src="previewFileInfo.url"
          fit="contain"
          style="width: 100%; height: 600px"
        />
        <video
          v-else-if="previewFileInfo.type === 'video'"
          :src="previewFileInfo.url"
          controls
          style="width: 100%; height: 600px"
        />
        <audio v-else-if="previewFileInfo.type === 'audio'" :src="previewFileInfo.url" controls style="width: 100%" />
        <div class="file-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件类型">{{ previewFileInfo.type }}</el-descriptions-item>
            <el-descriptions-item label="MIME类型">{{ previewFileInfo.mime }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(previewFileInfo.size) }}</el-descriptions-item>
            <el-descriptions-item label="存储驱动">{{ previewFileInfo.driver }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ previewFileInfo.create_time_str }}</el-descriptions-item>
            <el-descriptions-item label="上传用户">{{ previewFileInfo.user_info?.nickname }}</el-descriptions-item>
            <el-descriptions-item label="MD5" :span="2">{{ previewFileInfo.md5 }}</el-descriptions-item>
            <el-descriptions-item label="SHA1" :span="2">{{ previewFileInfo.sha1 }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';

interface AttachmentItem {
  id: number;
  filename: string;
  type: string;
  ext: string;
  mime: string;
  size: number;
  driver: string;
  driver_str: string;
  create_time: string;
  create_time_str: string;
  user_info: {
    id: number;
    nickname: string;
  };
  url: string;
  thumb?: {
    thumb_100?: string;
    thumb_200?: string;
    thumb_300?: string;
    thumb_400?: string;
    thumb_500?: string;
    thumb_600?: string;
    thumb_700?: string;
    thumb_800?: string;
    thumb_original?: string;
  };
  md5: string;
  sha1: string;
}

const page = ref(1);
const rows = ref(20);
const total = ref(1);
const loading = ref(false);
const lists = ref<AttachmentItem[]>([]); // 使用模拟数据
const searchForm = ref({
  keyword: '',
  type: '',
  driver: ''
});
const previewDialogVisible = ref(false);
const previewFileInfo = ref<AttachmentItem>({} as AttachmentItem);

// 获取列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: 'admin/attachment/list',
      method: 'GET',
      data: {
        page: page.value,
        rows: rows.value,
        ...searchForm.value
      }
    });
    if (res.code === 200) {
      lists.value = res.data.data;
      total.value = res.data.total;
    } else {
      ElMessage.error(res.msg || '获取附件列表失败');
    }

    // 使用模拟数据
    //lists.value = [mockData];
    //total.value = 1;
  } catch (error) {
    ElMessage.error('获取附件列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  getList();
};

// 重置表单
const resetForm = () => {
  searchForm.value = {
    keyword: '',
    type: '',
    driver: ''
  };
  page.value = 1;
  getList();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  rows.value = size;
  getList();
};

// 当前页码变化
const handleCurrentChange = (current: number) => {
  page.value = current;
  getList();
};

// 预览文件
const previewFile = (fileInfo: AttachmentItem) => {
  previewFileInfo.value = fileInfo;
  previewDialogVisible.value = true;
};

// 下载文件
const downloadFile = (fileInfo: AttachmentItem) => {
  // 实际项目中实现文件下载逻辑
  ElMessage.success('文件下载开始');
  console.log('下载文件:', fileInfo);
};

// 删除文件
const deleteFile = (id: number) => {
  ElMessageBox.confirm('确定要删除这个附件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/attachment/del',
          method: 'POST',
          data: {
            id: id
          }
        });
        if (res.code === 200) {
          ElMessage.success('文件删除成功');
          getList();
        } else {
          ElMessage.error(res.msg || '文件删除失败');
        }
      } catch (error) {
        ElMessage.error('文件删除失败');
        console.error(error);
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  padding: 16px 20px;
  display: flex;
  align-items: center;

  .el-form-item {
    margin-bottom: 0;
    margin-right: 12px;

    :deep(.el-select) {
      width: 200px;
    }

    :deep(.el-input) {
      width: 250px;
    }
  }
}

.page-content {
  padding: 10px;

  .table-container {
    border-radius: 6px;
    overflow: hidden;
    font-size: 13px;
  }

  .filename-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filename {
    font-weight: 500;
  }

  .file-ext {
    color: #909399;
    font-size: 12px;
    background-color: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .file-thumbnail {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }
  }

  .preview-content {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-info {
    width: 100%;
  }

  :deep(.el-upload--text) {
    width: 100%;
  }
}
</style>

<style lang="scss">
.preview-dialog {
  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>
