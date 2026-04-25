<template>
  <div class="icon-selector-wrapper">
    <div class="icon-selector-input-group">
      <el-input v-if="showInput" :model-value="inputValue" placeholder="请选择图标" readonly @click="handleOpen" />
      <div v-if="showPreview" class="icon-preview" @click="handleOpen">
        <safe-icon v-if="inputValue" :icon="inputValue" />
        <safe-icon v-else icon="fas icons" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="选择图标" width="900px" :append-to-body="true">
      <div class="icon-selector-dialog">
        <div class="category-tabs">
          <el-tabs v-model="activeCategory" type="card" @tab-change="handleCategoryChange">
            <el-tab-pane v-for="category in categories" :key="category.key" :label="category.name" :name="category.key">
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索图标名称" clearable>
            <template #prefix>
              <safe-icon icon="fas search" />
            </template>
          </el-input>
        </div>

        <div class="icon-list">
          <div
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-item"
            :class="{ active: inputValue === icon }"
            @click="handleSelect(icon)"
          >
            <safe-icon :icon="icon" />
            <span class="icon-name">{{ icon }}</span>
          </div>

          <div v-if="filteredIcons.length === 0" class="empty-state">
            <safe-icon icon="fas search" />
            <p>未找到匹配的图标</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue?: string;
  showInput?: boolean;
  showPreview?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  showInput: true,
  showPreview: true
});
const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const searchKeyword = ref('');

const inputValue = ref(props.modelValue || '');

// 监听父组件传入的值变化
watch(
  () => props.modelValue,
  newVal => {
    inputValue.value = newVal || '';
  },
  { immediate: true, deep: true }
);

// 图标分类
const categories = [
  { key: 'all', name: '全部图标' },
  { key: 'nav', name: '导航布局' },
  { key: 'user', name: '用户权限' },
  { key: 'tools', name: '设置工具' },
  { key: 'file', name: '文件文档' },
  { key: 'edit', name: '编辑操作' },
  { key: 'arrow', name: '箭头方向' },
  { key: 'button', name: '按钮操作' },
  { key: 'chart', name: '数据图表' },
  { key: 'media', name: '媒体播放' },
  { key: 'shape', name: '形状标志' },
  { key: 'comm', name: '通信' },
  { key: 'status', name: '状态提示' },
  { key: 'search', name: '搜索过滤' },
  { key: 'time', name: '时间日期' },
  { key: 'map', name: '地图位置' },
  { key: 'shop', name: '电子商务' },
  { key: 'code', name: '开发代码' },
  { key: 'security', name: '安全' },
  { key: 'brand', name: '品牌图标' },
  { key: 'other', name: '其他' }
];

// 图标数据（按分类）
const iconData: Record<string, string[]> = {
  // 导航布局
  nav: [
    'home',
    'bars',
    'bars-staggered',
    'grip-lines',
    'ellipsis-h',
    'ellipsis-v',
    'th',
    'th-large',
    'list',
    'list-ul',
    'list-ol',
    'table',
    'columns',
    'th-list',
    'grip',
    'grip-horizontal',
    'grip-vertical',
    'expand',
    'compress',
    'expand-arrows-alt',
    'compress-arrows-alt'
  ],
  // 用户权限
  user: [
    'user',
    'users',
    'user-circle',
    'user-plus',
    'user-minus',
    'user-tie',
    'user-shield',
    'user-lock',
    'user-check',
    'user-times',
    'user-cog',
    'lock',
    'unlock',
    'key',
    'shield-alt',
    'id-card',
    'id-badge'
  ],
  // 设置工具
  tools: [
    'cog',
    'cogs',
    'gear',
    'tools',
    'wrench',
    'hammer',
    'screwdriver',
    'sliders-h',
    'toggle-on',
    'toggle-off',
    'adjust',
    'tint',
    'fill-drip',
    'palette',
    'paint-brush',
    'eraser'
  ],
  // 文件文档
  file: [
    'file',
    'file-alt',
    'file-text',
    'file-code',
    'file-archive',
    'file-image',
    'file-pdf',
    'file-word',
    'file-excel',
    'file-powerpoint',
    'file-video',
    'file-audio',
    'file-zipper',
    'folder',
    'folder-open',
    'copy',
    'paste',
    'cut',
    'archive',
    'box'
  ],
  // 编辑操作
  edit: [
    'edit',
    'pencil-alt',
    'pen',
    'pen-fancy',
    'pen-nib',
    'highlighter',
    'trash',
    'trash-alt',
    'eraser',
    'undo',
    'redo',
    'save'
  ],
  // 箭头方向
  arrow: [
    'arrow-left',
    'arrow-right',
    'arrow-up',
    'arrow-down',
    'arrow-circle-left',
    'arrow-circle-right',
    'arrow-circle-up',
    'arrow-circle-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'chevron-down',
    'angle-left',
    'angle-right',
    'angle-up',
    'angle-down',
    'angle-double-left',
    'angle-double-right',
    'angle-double-up',
    'angle-double-down',
    'caret-left',
    'caret-right',
    'caret-up',
    'caret-down',
    'caret-square-left',
    'caret-square-right',
    'caret-square-up',
    'caret-square-down',
    'long-arrow-alt-left',
    'long-arrow-alt-right',
    'long-arrow-alt-up',
    'long-arrow-alt-down',
    'exchange-alt',
    'random',
    'sync',
    'sync-alt',
    'undo',
    'redo'
  ],
  // 按钮操作
  button: [
    'plus',
    'plus-circle',
    'plus-square',
    'minus',
    'minus-circle',
    'minus-square',
    'times',
    'times-circle',
    'times-square',
    'check',
    'check-circle',
    'check-square',
    'power-off',
    'sign-in-alt',
    'sign-out-alt',
    'user-plus',
    'user-minus'
  ],
  // 数据图表
  chart: [
    'chart-bar',
    'chart-line',
    'chart-pie',
    'chart-area',
    'database',
    'server',
    'cloud',
    'cloud-upload',
    'cloud-download',
    'wifi',
    'ethernet',
    'rss',
    'sitemap',
    'project-diagram'
  ],
  // 媒体播放
  media: [
    'play',
    'pause',
    'stop',
    'forward',
    'backward',
    'fast-forward',
    'fast-backward',
    'step-forward',
    'step-backward',
    'eject',
    'play-circle',
    'pause-circle',
    'volume-up',
    'volume-down',
    'volume-mute',
    'volume-off',
    'music',
    'headphones',
    'microphone',
    'microphone-alt',
    'microphone-slash',
    'video',
    'video-slash',
    'film',
    'camera',
    'camera-retro',
    'image',
    'images'
  ],
  // 形状标志
  shape: [
    'circle',
    'square',
    'circle-half-stroke',
    'th-large',
    'cubes',
    'cube',
    'qrcode',
    'barcode',
    'certificate',
    'award',
    'trophy',
    'medal',
    'ribbon',
    'star',
    'star-half',
    'star-half-alt',
    'bookmark',
    'flag',
    'flag-checkered',
    'thumbtack',
    'tag',
    'tags',
    'paperclip',
    'link',
    'unlink'
  ],
  // 通信
  comm: [
    'phone',
    'phone-alt',
    'phone-volume',
    'mobile-alt',
    'tablet-alt',
    'envelope',
    'envelope-open',
    'envelope-square',
    'comment',
    'comments',
    'comment-dots',
    'comment-alt',
    'bell',
    'bell-slash',
    'comment-slash',
    'at',
    'fax',
    'print'
  ],
  // 状态提示
  status: [
    'info-circle',
    'exclamation-circle',
    'exclamation-triangle',
    'smile',
    'smile-beam',
    'grin',
    'grin-beam',
    'grin-stars',
    'grin-tears',
    'laugh',
    'laugh-beam',
    'laugh-squint',
    'grin-tongue',
    'frown',
    'frown-open',
    'meh',
    'surprise',
    'angry',
    'dizzy',
    'thumbs-up',
    'thumbs-down',
    'heart',
    'heart-crack'
  ],
  // 搜索过滤
  search: [
    'search',
    'search-minus',
    'search-plus',
    'filter',
    'sort',
    'sort-amount-up',
    'sort-amount-down',
    'sort-numeric-up',
    'sort-numeric-down',
    'sort-alpha-down',
    'sort-alpha-up',
    'sort-alpha-down-alt',
    'sort-alpha-up-alt',
    'eye',
    'eye-slash',
    'expand',
    'compress'
  ],
  // 时间日期
  time: [
    'clock',
    'hourglass',
    'hourglass-start',
    'hourglass-end',
    'hourglass-half',
    'calendar',
    'calendar-days',
    'calendar-check',
    'calendar-times',
    'calendar-plus',
    'calendar-minus'
  ],
  // 地图位置
  map: [
    'map-marker-alt',
    'location-arrow',
    'compass',
    'globe',
    'globe-americas',
    'globe-asia',
    'globe-europe',
    'map',
    'map-location',
    'map-location-dot',
    'map-signs',
    'street-view'
  ],
  // 电子商务
  shop: [
    'shopping-cart',
    'shopping-bag',
    'shopping-basket',
    'credit-card',
    'wallet',
    'money-bill',
    'money-bill-wave',
    'cash-register',
    'receipt',
    'store'
  ],
  // 文本和格式
  format: [
    'font',
    'text-height',
    'text-width',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'align-left',
    'align-center',
    'align-right',
    'align-justify',
    'list-ul',
    'list-ol',
    'indent',
    'outdent',
    'quote-left',
    'quote-right'
  ],
  // 开发和代码
  code: [
    'code',
    'code-branch',
    'terminal',
    'laptop-code',
    'bug',
    'rocket',
    'atom',
    'flask',
    'microchip',
    'memory',
    'hdd',
    'keyboard'
  ],
  // 安全
  security: [
    'shield-alt',
    'lock',
    'unlock',
    'key',
    'user-secret',
    'user-shield',
    'fingerprint',
    'id-card',
    'id-badge',
    'passport'
  ],
  // 品牌图标
  brand: [
    'fab github',
    'fab twitter',
    'fab facebook',
    'fab facebook-f',
    'fab instagram',
    'fab weixin',
    'fab qq',
    'fab weibo',
    'fab youtube',
    'fab tiktok',
    'fab google',
    'fab apple',
    'fab android',
    'fab windows',
    'fab linux',
    'fab vuejs',
    'fab react',
    'fab angular',
    'fab node',
    'fab npm',
    'fab yarn',
    'fab docker',
    'fab aws',
    'fab git-alt',
    'fab gitlab',
    'fab chrome',
    'fab firefox',
    'fab safari',
    'fab edge',
    'fab opera'
  ],
  // 其他
  other: [
    'hand-pointer',
    'hand-paper',
    'hand-rock',
    'hand-scissors',
    'hand-spock',
    'mouse-pointer',
    'crosshairs',
    'asterisk',
    'certificate',
    'print',
    'rss',
    'share',
    'share-nodes',
    'share-square',
    'external-link-alt',
    'external-link-square-alt',
    'archive',
    'box-open',
    'box',
    'cube',
    'cubes',
    'gift',
    'martini-glass',
    'martini-glass-citrus',
    'car',
    'truck',
    'bus',
    'train',
    'plane',
    'ship',
    'subway',
    'gauge-high',
    'gauge'
  ]
};

// 当前激活的分类
const activeCategory = ref('all');

// 处理分类切换
const handleCategoryChange = (categoryKey: string | number) => {
  activeCategory.value = String(categoryKey);
};

// 获取当前分类的图标列表
const categoryIcons = computed(() => {
  if (activeCategory.value === 'all') {
    // 返回所有图标
    return Object.values(iconData).flat();
  }
  return iconData[activeCategory.value] || [];
});

// 过滤图标
const filteredIcons = computed(() => {
  const icons = categoryIcons.value;
  if (!searchKeyword.value) {
    return icons;
  }
  return icons.filter(icon => icon.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});

// 打开对话框
const handleOpen = () => {
  dialogVisible.value = true;
};

// 选择图标
const handleSelect = (icon: string) => {
  inputValue.value = icon;
  emit('update:modelValue', icon);
  dialogVisible.value = false;
};

// 暴露方法给父组件
defineExpose({
  open: handleOpen
});
</script>

<style lang="scss" scoped>
.icon-selector-wrapper {
  width: 100%;
}

.icon-selector-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  .el-input {
    flex: 1;
  }

  .icon-preview {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #606266;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    :deep(.svg-inline--fa) {
      font-size: 18px;
    }
  }
}

.icon-selector-dialog {
  .category-tabs {
    margin-bottom: 20px;

    :deep(.el-tabs__nav) {
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-tabs__item) {
      font-size: 13px;
      padding: 0 16px;
    }
  }

  .search-box {
    margin-bottom: 20px;
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f5f7fa;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 8px;
      background-color: #ffffff;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background-color: #ecf5ff;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }

      &.active {
        border-color: #409eff;
        background-color: #409eff;
        color: #ffffff;

        :deep(.svg-inline--fa) {
          color: #ffffff;
        }

        .icon-name {
          color: #ffffff;
        }
      }

      :deep(.svg-inline--fa) {
        font-size: 24px;
        color: #409eff;
        margin-bottom: 8px;
      }

      .icon-name {
        font-size: 12px;
        color: #606266;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      color: #909399;

      :deep(.svg-inline--fa) {
        font-size: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
        margin: 0;
      }
    }
  }
}
</style>
