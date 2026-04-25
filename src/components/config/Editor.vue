<template>
  <div class="config-editor">
    <div class="editor-toolbar">
      <el-button size="small" title="加粗" @click="execCommand('bold')">
        <safe-icon icon="fas bold" />
      </el-button>
      <el-button size="small" title="斜体" @click="execCommand('italic')">
        <safe-icon icon="fas italic" />
      </el-button>
      <el-button size="small" title="下划线" @click="execCommand('underline')">
        <safe-icon icon="fas underline" />
      </el-button>
      <el-button size="small" title="删除线" @click="execCommand('strikeThrough')">
        <safe-icon icon="fas strikethrough" />
      </el-button>
      <el-divider direction="vertical" />
      <el-button size="small" title="左对齐" @click="execCommand('justifyLeft')">
        <safe-icon icon="fas align-left" />
      </el-button>
      <el-button size="small" title="居中" @click="execCommand('justifyCenter')">
        <safe-icon icon="fas align-center" />
      </el-button>
      <el-button size="small" title="右对齐" @click="execCommand('justifyRight')">
        <safe-icon icon="fas align-right" />
      </el-button>
      <el-divider direction="vertical" />
      <el-button size="small" title="无序列表" @click="execCommand('insertUnorderedList')">
        <safe-icon icon="fas list-ul" />
      </el-button>
      <el-button size="small" title="有序列表" @click="execCommand('insertOrderedList')">
        <safe-icon icon="fas list-ol" />
      </el-button>
      <el-divider direction="vertical" />
      <el-button size="small" title="插入链接" @click="insertLink">
        <safe-icon icon="fas link" />
      </el-button>
      <el-button size="small" title="清除格式" @click="execCommand('removeFormat')">
        <safe-icon icon="fas eraser" />
      </el-button>
    </div>
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :style="{ minHeight: rows * 24 + 'px' }"
      @input="handleInput"
      @blur="handleBlur"
    ></div>
    <div v-if="props.remark" class="editor-remark">{{ props.remark }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
  modelValue?: string;
  rows?: number;
  placeholder?: string;
  remark?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 6,
  placeholder: '',
  remark: ''
});

const emit = defineEmits<Emits>();

const editorRef = ref<HTMLElement>();

const execCommand = (command: string, value: string | undefined = undefined) => {
  document.execCommand(command, false, value);
  editorRef.value?.focus();
};

const insertLink = () => {
  const url = prompt('请输入链接地址:');
  if (url) {
    execCommand('createLink', url);
  }
};

const handleInput = () => {
  if (editorRef.value) {
    const html = editorRef.value.innerHTML;
    emit('update:modelValue', html);
    emit('change', html);
  }
};

const handleBlur = () => {
  if (editorRef.value) {
    const html = editorRef.value.innerHTML;
    emit('update:modelValue', html);
    emit('change', html);
  }
};

watch(
  () => props.modelValue,
  newValue => {
    if (editorRef.value && editorRef.value.innerHTML !== newValue) {
      editorRef.value.innerHTML = newValue;
    }
  }
);

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue;
  }
});
</script>

<style lang="scss" scoped>
.config-editor {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  &:hover {
    border-color: #c0c4cc;
  }

  &:focus-within {
    border-color: #409eff;
  }
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;

  :deep(.el-button) {
    padding: 5px 10px;
    border: none;
    background: transparent;

    &:hover {
      background-color: #e6f7ff;
      color: #409eff;
    }
  }

  :deep(.el-divider--vertical) {
    height: 20px;
    margin: 0 4px;
  }
}

.editor-content {
  padding: 12px;
  min-height: 144px;
  outline: none;
  overflow-y: auto;
  line-height: 1.6;

  &:empty:before {
    content: attr(data-placeholder);
    color: #a8abb2;
  }

  &:focus {
    outline: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  a {
    color: #409eff;
    text-decoration: underline;

    &:hover {
      color: #66b1ff;
    }
  }

  ul,
  ol {
    padding-left: 20px;
  }

  blockquote {
    border-left: 4px solid #409eff;
    padding-left: 12px;
    margin: 8px 0;
    color: #606266;
    background-color: #f5f7fa;
    padding: 8px 12px;
  }
}

.editor-remark {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 8px;
}
</style>
