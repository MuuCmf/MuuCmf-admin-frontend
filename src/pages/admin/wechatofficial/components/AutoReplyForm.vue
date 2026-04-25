<template>
  <el-drawer v-model="visible" :title="title" size="600px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="触发方式" prop="type">
        <el-select v-model="formData.type" placeholder="请选择触发方式" style="width: 100%">
          <el-option v-for="item in TRIGGER_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="formData.type === 2" label="关键词" prop="keyword">
        <el-input v-model="formData.keyword" placeholder="请输入关键词，多个关键词用逗号分隔" clearable />
        <div class="form-tip">多个关键词用逗号分隔，如：你好,您好</div>
      </el-form-item>

      <el-form-item label="回复类型" prop="msg_type">
        <el-select
          v-model="formData.msg_type"
          placeholder="请选择回复类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option v-for="item in MSG_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 文本类型 -->
      <el-form-item v-if="formData.msg_type === 'text'" label="回复内容" prop="text">
        <el-input
          v-model="formData.text"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <!-- 图片类型 -->
      <el-form-item v-if="formData.msg_type === 'image'" label="图片" prop="media_id">
        <el-row :gutter="12" style="width: 100%">
          <el-col :span="mediaUrl ? 12 : 24">
            <el-button type="primary" @click="openMaterialSelector('image')"> 选择图片素材 </el-button>
            <el-button v-if="mediaUrl" type="danger" size="small" text style="margin-left: 12px" @click="clearMaterial">
              清除
            </el-button>
          </el-col>
          <el-col v-if="mediaUrl" :span="12">
            <div class="preview-image-inline">
              <el-image :src="mediaUrl" :preview-src-list="[mediaUrl]" fit="cover" class="preview-img-inline" />
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 语音类型 -->
      <el-form-item v-if="formData.msg_type === 'voice'" label="语音" prop="media_id">
        <el-row :gutter="12" style="width: 100%">
          <el-col :span="mediaName ? 12 : 24">
            <el-button type="primary" @click="openMaterialSelector('voice')"> 选择语音素材 </el-button>
            <el-button
              v-if="mediaName"
              type="danger"
              size="small"
              text
              style="margin-left: 12px"
              @click="clearMaterial"
            >
              清除
            </el-button>
          </el-col>
          <el-col v-if="mediaName" :span="12">
            <div class="preview-info-inline">
              <el-icon :size="28" color="#409eff">
                <Microphone />
              </el-icon>
              <div class="info-text">
                <div class="material-name">{{ mediaName }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 视频类型 -->
      <el-form-item v-if="formData.msg_type === 'video'" label="视频" prop="media_id">
        <el-row :gutter="12" style="width: 100%">
          <el-col :span="mediaName ? 12 : 24">
            <el-button type="primary" @click="openMaterialSelector('video')"> 选择视频素材 </el-button>
            <el-button
              v-if="mediaName"
              type="danger"
              size="small"
              text
              style="margin-left: 12px"
              @click="clearMaterial"
            >
              清除
            </el-button>
          </el-col>
          <el-col v-if="mediaName" :span="12">
            <div class="preview-info-inline">
              <el-icon :size="28" color="#409eff">
                <VideoCamera />
              </el-icon>
              <div class="info-text">
                <div class="material-name">{{ mediaName }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 图文类型 -->
      <el-form-item v-if="formData.msg_type === 'news'" label="图文消息" prop="media_id">
        <div style="width: 100%">
          <el-button type="primary" @click="openMaterialSelector('news')"> 选择图文素材 </el-button>
          <el-button v-if="newsTitle" type="danger" size="small" text style="margin-left: 12px" @click="clearMaterial">
            清除
          </el-button>
        </div>
        <div v-if="newsTitle" class="preview-news">
          <div class="news-preview-card">
            <div class="news-preview-cover">
              <el-image v-if="newsThumbUrl" :src="newsThumbUrl" fit="cover" class="news-preview-cover-img">
                <template #error>
                  <div class="news-preview-cover-placeholder">
                    <el-icon :size="32"><Picture /></el-icon>
                    <span>暂无封面</span>
                  </div>
                </template>
              </el-image>
              <div v-else class="news-preview-cover-placeholder">
                <el-icon :size="32"><Picture /></el-icon>
                <span>暂无封面</span>
              </div>
            </div>
            <div class="news-preview-content">
              <div class="news-preview-title" :title="newsTitle">
                {{ newsTitle }}
              </div>
              <div v-if="newsDigest" class="news-preview-desc" :title="newsDigest">
                {{ cleanDigest(newsDigest) }}
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          placeholder="请输入排序值"
          controls-position="right"
          style="width: 200px"
        />
        <div class="form-tip">数值越小越靠前</div>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </el-button>
      </div>
    </template>
  </el-drawer>

  <el-dialog v-model="materialDialogVisible" :title="MATERIAL_TYPE_LABELS[materialType]" width="800px">
    <div class="material-selector">
      <div v-loading="materialLoading" class="material-list">
        <el-empty v-if="!materialLoading && materialList.length === 0" description="暂无素材" />

        <!-- 图片网格 -->
        <div v-if="materialType === 'image'" class="image-grid">
          <div
            v-for="item in materialList"
            :key="item.media_id"
            class="material-item"
            :class="{ selected: selectedMaterial?.media_id === item.media_id }"
            @click="selectMaterial(item)"
          >
            <el-image :src="item.url" fit="cover" class="material-image" lazy />
            <div class="material-name">{{ item.name }}</div>
          </div>
        </div>

        <!-- 音频列表 -->
        <div v-else-if="materialType === 'voice'" class="audio-list">
          <div
            v-for="item in materialList"
            :key="item.media_id"
            class="material-item"
            :class="{ selected: selectedMaterial?.media_id === item.media_id }"
            @click="selectMaterial(item)"
          >
            <el-icon :size="32" color="#409eff">
              <Microphone />
            </el-icon>
            <div class="material-info">
              <div class="material-name">{{ item.name }}</div>
              <div class="material-meta">{{ item.update_time }}</div>
            </div>
          </div>
        </div>

        <!-- 视频列表 -->
        <div v-else-if="materialType === 'video'" class="video-list">
          <div
            v-for="item in materialList"
            :key="item.media_id"
            class="material-item"
            :class="{ selected: selectedMaterial?.media_id === item.media_id }"
            @click="selectMaterial(item)"
          >
            <el-icon :size="32" color="#409eff">
              <VideoCamera />
            </el-icon>
            <div class="material-info">
              <div class="material-name">{{ item.name }}</div>
              <div class="material-meta">{{ item.update_time }}</div>
            </div>
          </div>
        </div>

        <!-- 图文列表 -->
        <div v-else-if="materialType === 'news'" class="news-list">
          <div
            v-for="item in materialList"
            :key="item.media_id"
            class="material-item news-card"
            :class="{
              selected: selectedMaterial?.media_id === item.media_id,
              'is-single': !item.news_items || item.news_items.length === 1
            }"
            @click="selectMaterial(item)"
          >
            <div class="news-card-main">
              <div class="news-cover">
                <el-image
                  v-if="getNewsThumbUrl(item)"
                  :src="getNewsThumbUrl(item)"
                  :preview-src-list="[getNewsThumbUrl(item)]"
                  fit="cover"
                  class="news-cover-img"
                  lazy
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon :size="24"><Document /></el-icon>
                    </div>
                  </template>
                  <template #placeholder>
                    <div class="image-loading">
                      <el-icon :size="24" class="is-loading"><Loading /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="news-cover-placeholder">
                  <el-icon :size="40"><Picture /></el-icon>
                  <span>暂无封面</span>
                </div>
              </div>
              <div class="news-main-info">
                <div class="news-title" :title="item.title">{{ item.title || item.name }}</div>
                <div v-if="item.digest" class="news-summary" :title="item.digest">
                  {{ cleanDigest(item.digest) }}
                </div>
                <div class="news-meta">
                  <span v-if="item.news_items?.[0]?.author" class="news-author">
                    <el-icon :size="12"><User /></el-icon>
                    {{ item.news_items[0].author }}
                  </span>
                  <span v-if="item.news_items && item.news_items.length > 1" class="news-count">
                    <el-icon :size="12"><Document /></el-icon>
                    {{ item.news_items.length }}条图文
                  </span>
                  <span class="news-time">
                    <el-icon :size="12"><Clock /></el-icon>
                    {{ formatTime(item.update_time) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 子图文列表 -->
            <div v-if="item.news_items && item.news_items.length > 1" class="news-sub-list">
              <div v-for="(subItem, index) in item.news_items.slice(1)" :key="index" class="news-sub-item">
                <div class="news-sub-thumb">
                  <el-image
                    v-if="subItem.thumb_url"
                    :src="subItem.thumb_url"
                    fit="cover"
                    class="news-sub-thumb-img"
                    lazy
                  >
                    <template #error>
                      <div class="news-sub-thumb-error">
                        <el-icon :size="16"><Document /></el-icon>
                      </div>
                    </template>
                    <template #placeholder>
                      <div class="news-sub-thumb-loading">
                        <el-icon :size="16" class="is-loading"><Loading /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-else class="news-sub-thumb-placeholder">
                    <el-icon :size="16"><Picture /></el-icon>
                  </div>
                </div>
                <div class="news-sub-info">
                  <div class="news-sub-title" :title="subItem.title">{{ subItem.title }}</div>
                  <div v-if="subItem.author" class="news-sub-author">
                    <el-icon :size="10"><User /></el-icon>
                    {{ subItem.author }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="materialCurrentPage"
            v-model:page-size="materialPageSize"
            :page-sizes="[10, 20]"
            :total="materialTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleMaterialSizeChange"
            @current-change="handleMaterialPageChange"
          />
        </div>
        <div class="dialog-actions">
          <el-button @click="materialDialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!selectedMaterial" @click="confirmMaterial"> 确定 </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Microphone, VideoCamera, Document, Picture, User, Clock, Loading } from '@element-plus/icons-vue';
import { request } from '@/utils/modules/request';

// 类型定义
interface AutoReplyData {
  id: number;
  type: number;
  keyword: string;
  msg_type: 'text' | 'image' | 'voice' | 'video' | 'news';
  text: string;
  media_id: string;
  material_json: any;
  sort: number;
  status: number;
}

interface NewsItem {
  title: string;
  digest: string;
  thumb_url: string;
  url?: string;
  author?: string;
  thumb_media_id?: string;
  content_source_url?: string;
  show_cover_pic?: number;
  need_open_comment?: number;
  only_fans_can_comment?: number;
  article_type?: string;
}

interface MaterialItem {
  media_id: string;
  name: string;
  url?: string;
  title?: string;
  digest?: string;
  thumb_url?: string;
  update_time?: string;
  news_items?: NewsItem[];
}

interface Props {
  modelValue?: boolean;
  title?: string;
  data?: Partial<AutoReplyData> & { material_json?: any };
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

// 常量定义
const MATERIAL_TYPE_LABELS: Record<string, string> = {
  image: '图片素材',
  voice: '语音素材',
  video: '视频素材',
  news: '图文素材'
};

const MSG_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '文本', value: 'text' },
  { label: '图片', value: 'image' },
  { label: '语音', value: 'voice' },
  { label: '视频', value: 'video' },
  { label: '图文', value: 'news' }
];

const TRIGGER_TYPE_OPTIONS: Array<{ label: string; value: number }> = [
  { label: '关注公众号', value: 1 },
  { label: '关键词回复', value: 2 }
];

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '新增自动回复',
  data: () => ({})
});

const emit = defineEmits<Emits>();

const visible = ref(props.modelValue);
const submitLoading = ref(false);
const materialLoading = ref(false);
const materialDialogVisible = ref(false);
const materialType = ref<'image' | 'voice' | 'video' | 'news'>('image');
const materialList = ref<MaterialItem[]>([]);
const selectedMaterial = ref<MaterialItem | null>(null);
const materialCurrentPage = ref(1);
const materialPageSize = ref(20);
const materialTotal = ref(0);

const formData = reactive<AutoReplyData>({
  id: 0,
  type: 1,
  keyword: '',
  msg_type: 'text',
  text: '',
  media_id: '',
  material_json: {},
  sort: 0,
  status: 1
});

// 计算属性：从 material_json 获取数据
const mediaUrl = computed(() => {
  if (!formData.material_json) return '';
  return formData.material_json.url || formData.material_json.cover_url || '';
});

const mediaName = computed(() => {
  if (!formData.material_json) return '';
  return formData.material_json.name || '';
});

const newsTitle = computed(() => {
  if (!formData.material_json) return '';
  if (formData.material_json.content?.news_item?.[0]) {
    return formData.material_json.content.news_item[0].title || '';
  }
  return formData.material_json.title || '';
});

const newsDigest = computed(() => {
  if (!formData.material_json) return '';
  if (formData.material_json.content?.news_item?.[0]) {
    return formData.material_json.content.news_item[0].digest || formData.material_json.description || '';
  }
  return formData.material_json.description || '';
});

const newsThumbUrl = computed(() => {
  if (!formData.material_json) return '';
  if (formData.material_json.content?.news_item?.[0]) {
    return formData.material_json.content.news_item[0].thumb_url || formData.material_json.cover_url || '';
  }
  return formData.material_json.cover_url || '';
});

// 动态表单验证规则
const formRules = computed(() => ({
  type: [{ required: true, message: '请选择触发方式', trigger: 'change' }],
  keyword: formData.type === 1 ? [{ required: true, message: '请输入关键词', trigger: 'blur' }] : [],
  msg_type: [{ required: true, message: '请选择回复类型', trigger: 'change' }],
  text: formData.msg_type === 'text' ? [{ required: true, message: '请输入回复内容', trigger: 'blur' }] : [],
  media_id: formData.msg_type !== 'text' ? [{ required: true, message: '请选择媒体文件', trigger: 'change' }] : [],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
}));

const formRef = ref();

const resetForm = () => {
  Object.assign(formData, {
    id: 0,
    type: 1,
    keyword: '',
    msg_type: 'text',
    text: '',
    media_id: '',
    material_json: {},
    sort: 0,
    status: 1
  });
};

// 根据类型映射素材数据
const mapMaterialByType = (item: any, type: string): MaterialItem => {
  const base = {
    media_id: item.media_id,
    update_time: item.update_time || item.material_json?.update_time || ''
  };

  if (type === 'news') {
    // 直接从 item.content.news_item 获取数据
    const newsItems = item.content?.news_item || [];
    const firstItem = newsItems[0] || {};

    return {
      ...base,
      name: firstItem.title || item.name || item.media_id,
      title: firstItem.title || '',
      digest: firstItem.digest || '',
      thumb_url: firstItem.thumb_url || '',
      url: firstItem.url || '',
      news_items: newsItems.map((newsItem: any) => ({
        title: newsItem.title || '',
        digest: newsItem.digest || '',
        thumb_url: newsItem.thumb_url || '',
        url: newsItem.url || '',
        author: newsItem.author || '',
        thumb_media_id: newsItem.thumb_media_id || '',
        content_source_url: newsItem.content_source_url || '',
        show_cover_pic: newsItem.show_cover_pic || 0,
        need_open_comment: newsItem.need_open_comment || 0,
        only_fans_can_comment: newsItem.only_fans_can_comment || 0,
        article_type: newsItem.article_type || 'news'
      }))
    };
  }

  return {
    ...base,
    name: item.material_json?.name || item.name || item.media_id,
    url: item.material_json?.[type === 'video' ? 'cover_url' : 'url'] || item.url || ''
  };
};

watch(
  () => props.modelValue,
  val => {
    visible.value = val;
  }
);

watch(visible, val => {
  emit('update:modelValue', val);
});

watch(
  () => props.data,
  val => {
    if (val?.id) {
      Object.assign(formData, val);

      // 如果 material_json 是字符串，先解析为对象
      if (val.material_json && typeof val.material_json === 'string') {
        formData.material_json = JSON.parse(val.material_json);
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleClose = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleTypeChange = () => {
  // 清空媒体相关字段
  formData.text = '';
  formData.media_id = '';
  formData.material_json = {};
};

// 工具函数：清理摘要文本
const cleanDigest = (digest: string): string => {
  if (!digest) return '';
  return digest
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .replace(/&nbsp;/g, ' ') // 替换&nbsp;
    .replace(/&[a-zA-Z]+;/g, '') // 移除其他 HTML 实体
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim(); // 移除首尾空格
};

// 工具函数：格式化时间戳
const formatTime = (timestamp?: string | number): string => {
  if (!timestamp) return '';

  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

// 工具函数：获取图文封面图 URL
const getNewsThumbUrl = (item: MaterialItem): string => {
  // 优先从 news_items 中获取
  if (item.news_items && item.news_items.length > 0) {
    return item.news_items[0].thumb_url || '';
  }
  // 其次从 item.thumb_url 获取
  return item.thumb_url || '';
};

const openMaterialSelector = (type: 'image' | 'voice' | 'video' | 'news') => {
  materialType.value = type;
  materialDialogVisible.value = true;
  selectedMaterial.value = null;
  materialCurrentPage.value = 1;
  loadMaterials();
};

const loadMaterials = async () => {
  materialLoading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat/material/list',
      method: 'GET',
      data: {
        type: materialType.value,
        page: materialCurrentPage.value,
        page_size: materialPageSize.value
      }
    });

    if (res.code === 200) {
      const items = res.data?.item || [];
      materialList.value = items.map((item: any) => mapMaterialByType(item, materialType.value));
      materialTotal.value = res.data?.total_count || 0;
    }
  } catch (error) {
    console.error('获取素材失败:', error);
    ElMessage.error('获取素材失败');
  } finally {
    materialLoading.value = false;
  }
};

const selectMaterial = (item: MaterialItem) => {
  selectedMaterial.value = item;
};

const handleMaterialPageChange = (page: number) => {
  materialCurrentPage.value = page;
  loadMaterials();
};

const handleMaterialSizeChange = (size: number) => {
  materialPageSize.value = size;
  materialCurrentPage.value = 1;
  loadMaterials();
};

const confirmMaterial = () => {
  if (!selectedMaterial.value) return;

  const item = selectedMaterial.value;
  formData.media_id = item.media_id;

  // 构建 material_json 数据（直接使用对象，不需要 JSON.stringify）
  if (materialType.value === 'news' && item.news_items && item.news_items.length > 0) {
    // 图文素材
    formData.material_json = {
      content: {
        news_item: item.news_items.map((newsItem: any) => ({
          title: newsItem.title,
          author: newsItem.author,
          digest: newsItem.digest,
          content: '',
          content_source_url: newsItem.content_source_url,
          thumb_media_id: newsItem.thumb_media_id,
          thumb_url: newsItem.thumb_url,
          url: newsItem.url,
          need_open_comment: newsItem.need_open_comment,
          only_fans_can_comment: newsItem.only_fans_can_comment,
          show_cover_pic: newsItem.show_cover_pic,
          article_type: newsItem.article_type
        }))
      }
    };
  } else if (materialType.value === 'image') {
    // 图片素材
    formData.material_json = {
      name: item.name,
      url: item.url,
      media_id: item.media_id,
      update_time: item.update_time
    };
  } else if (materialType.value === 'voice') {
    // 语音素材
    formData.material_json = {
      name: item.name,
      media_id: item.media_id,
      update_time: item.update_time
    };
  } else if (materialType.value === 'video') {
    // 视频素材
    formData.material_json = {
      name: item.name,
      cover_url: item.url,
      media_id: item.media_id,
      update_time: item.update_time
    };
  }

  materialDialogVisible.value = false;
  selectedMaterial.value = null;

  // 手动触发表单验证更新，解决选择素材后仍然提示需要选择媒体文件的问题
  if (formRef.value && formData.msg_type !== 'text') {
    formRef.value.validateField('media_id');
  }
};

const clearMaterial = () => {
  formData.text = '';
  formData.media_id = '';
  formData.material_json = {};
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const url = 'admin/wechat/autoreply/edit';

      const res = await request({
        url,
        method: 'POST',
        data: formData
      });

      if (res.code === 200) {
        ElMessage.success(formData.id ? '编辑成功' : '新增成功');
        visible.value = false;
        emit('success');
      } else {
        ElMessage.error(res.msg || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
  display: block;
  width: 100%;
  clear: both;
  margin-left: 0;
  float: none;
}

:deep(.el-form-item__content) {
  .form-tip {
    margin-left: 0 !important;
    display: block !important;
    width: 100% !important;
  }
}

.drawer-footer,
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.material-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.preview-image-inline,
.preview-info-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.preview-img-inline {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.preview-image,
.preview-news {
  margin-top: 12px;
  width: 100%;
}

:deep(.el-form-item__content) {
  flex-wrap: wrap;
}

.preview-img {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.preview-info {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.info-text {
  font-size: 14px;
  color: #303133;
  flex: 1;
}

.news-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.news-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.news-preview-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.news-preview-cover {
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-preview-cover-img {
  width: 100%;
  height: 100%;
}

.news-preview-cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
}

.news-preview-content {
  padding: 16px;
}

.news-preview-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-preview-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.news-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.news-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.material-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.material-list {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;

    &:hover {
      background: #c0c4cc;
    }
  }

  // 图文列表不需要内边距
  &.news-list-container {
    padding: 0;
    border: none;
    background: transparent;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.material-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;

  &:hover {
    border-color: #c6e2ff;
    background: #ecf5ff;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: #409eff;
    background: #ecf5ff;
  }

  // 图文卡片不使用通用样式
  &.news-card {
    border: 1px solid #e4e7ed;
  }
}

.material-image {
  width: 100%;
  height: 100px;
  display: block;
}

.material-name {
  padding: 8px;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-list,
.video-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audio-list .material-item,
.video-list .material-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
}

.material-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.material-info .material-name {
  padding: 0;
}

.material-meta {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  padding: 16px;
}

.news-list .news-card {
  display: block;
  padding: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    border-radius: 6px;
    pointer-events: none;
    transition: border-color 0.3s ease;
  }

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &.selected::before {
    border-color: #07c160;
  }

  // 单图文卡片样式
  &.is-single {
    .news-card-main {
      border-bottom: none;
      flex-direction: column;
      padding-bottom: 0;
    }

    .news-cover {
      width: 100%;
      height: 160px;
      margin-bottom: 12px;
      border-radius: 4px 4px 0 0;
    }

    .news-main-info {
      padding-left: 0;
      padding-top: 12px;
      width: 100%;
    }

    .news-card-main .news-title {
      font-size: 16px;
      font-weight: 600;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      margin-bottom: 8px;
    }

    .news-summary {
      margin-bottom: 12px;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      font-size: 14px;
      color: #606266;
    }
  }
}

.news-card-main {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.news-cover {
  width: 120px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f7fa;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
}

.news-cover-img {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.08);
    filter: brightness(1.05);
  }
}

.news-cover-placeholder,
.image-error,
.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #c0c4cc;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #e8ecf1 0%, #e0e4e9 100%);
  }

  span {
    font-size: 12px;
  }
}

.image-error {
  .el-icon {
    animation: shake 0.5s ease-in-out;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.news-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 16px;
  min-width: 0;
}

.news-card-main .news-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.6;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.news-summary {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px;
  min-height: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  text-align: justify;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.news-author {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 3px;

  .el-icon {
    color: #909399;
  }
}

.news-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 500;

  .el-icon {
    color: #07c160;
  }
}

.news-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #c0c4cc;

  .el-icon {
    color: #c0c4cc;
  }
}

.news-sub-list {
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.news-sub-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  background: #fff;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: transparent;
    transition: background 0.2s ease;
  }

  &:hover {
    background: #f5f7fa;

    &::before {
      background: #07c160;
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.news-sub-thumb {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 12px;
  background: #f9fafb;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.02);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
}

.news-sub-thumb-img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.news-sub-thumb-placeholder,
.news-sub-thumb-error,
.news-sub-thumb-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.news-sub-thumb-loading {
  .el-icon {
    color: #c0c4cc;
  }
}

.news-sub-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-right: 8px;
}

.news-sub-title {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-word;
  font-weight: 400;
}

.news-sub-author {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #909399;

  .el-icon {
    color: #c0c4cc;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .news-list {
    grid-template-columns: 1fr;
  }

  .news-card {
    &.is-single {
      .news-cover {
        height: 140px;
      }
    }
  }

  .dialog-footer {
    flex-direction: column;

    .pagination-wrapper {
      width: 100%;
      margin-bottom: 12px;
    }

    .dialog-actions {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
  }
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pagination-wrapper {
  flex: 1;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
</style>
