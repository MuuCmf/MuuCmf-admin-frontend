<template>
  <div class="menu-edit">
    <div class="edit-header">
      <h3>{{ isEdit ? '编辑菜单' : '新增菜单' }}</h3>
      <el-button type="primary" link @click="handleClose">
        <safe-icon icon="fas times" />
      </el-button>
    </div>

    <div v-loading="loading" class="edit-content">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <div class="form-section">
          <div class="section-title">基本信息</div>

          <el-form-item label="上级菜单">
            <el-input v-model="parentMenuPath" readonly />
          </el-form-item>

          <el-form-item label="菜单标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入菜单标题" />
          </el-form-item>

          <el-form-item label="菜单URL" prop="url">
            <el-input v-model="formData.url" placeholder="请输入菜单URL" />
          </el-form-item>

          <el-form-item label="分组" prop="group">
            <el-input v-model="formData.group" placeholder="请输入分组" />
          </el-form-item>

          <el-form-item label="菜单图标" prop="icon">
            <IconSelector v-model="formData.icon" />
          </el-form-item>

          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" :max="9999" />
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">菜单属性</div>

          <el-form-item label="菜单类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择菜单类型" disabled>
              <el-option label="系统" :value="0">系统</el-option>
              <el-option label="应用" :value="1">应用</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="是否隐藏" prop="hide">
            <el-radio-group v-model="formData.hide">
              <el-radio :value="0">显示</el-radio>
              <el-radio :value="1">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="开发模式" prop="is_dev">
            <el-radio-group v-model="formData.is_dev">
              <el-radio :value="0">否</el-radio>
              <el-radio :value="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">提示信息</div>

          <el-form-item label="提示" prop="tip">
            <el-input v-model="formData.tip" type="textarea" :rows="3" placeholder="请输入提示信息" />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <div class="edit-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import IconSelector from '@/components/IconSelector.vue';
import { editMenu } from '@/api/admin/menu';

// 组件属性
interface Props {
  menu: MenuItem;
  menuList: MenuItem[];
  type: number;
  module: string;
}

// 事件
interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const submitLoading = ref(false);
const isMounted = ref(true);

const isEdit = computed(() => isMounted.value && props.menu && props.menu.id);

// 表单数据
const formData = reactive<MenuItem>({
  id: '',
  title: '',
  pid: '0',
  sort: 0,
  url: '',
  hide: 0,
  type: props.type || 0,
  tip: '',
  group: '',
  is_dev: 0,
  icon: props.menu.icon || '',
  module: props.module || ''
});

const safePid = computed({
  get: () => {
    const val = formData.pid;
    if (val === undefined || val === null || val === '') {
      return '0';
    }
    return String(val);
  },
  set: (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === '') {
      formData.pid = '0';
    } else {
      formData.pid = String(val);
    }
  }
});

const formRules = {
  title: [
    { required: true, message: '请输入菜单标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  url: [{ required: true, message: '请输入菜单URL', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
};

// 获取父菜单路径
const parentMenuPath = computed(() => {
  if (!formData.pid || formData.pid === '0' || formData.pid === undefined || formData.pid === null) {
    return '顶级菜单';
  }

  // 递归查找菜单路径
  const findMenuPath = (menus: MenuItem[], targetId: string, path: string[] = []): string[] | null => {
    for (const menu of menus) {
      if (String(menu.id) === String(targetId)) {
        return [...path, menu.title];
      }
      if (menu._child && menu._child.length > 0) {
        const result = findMenuPath(menu._child, targetId, [...path, menu.title]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  const path = findMenuPath(props.menuList, String(formData.pid));
  return path ? path.join('/') : '未找到上级菜单';
});

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value || !isMounted.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid || !isMounted.value) return;

    submitLoading.value = true;
    try {
      const submitData: any = {
        title: formData.title,
        pid: safePid.value,
        url: formData.url,
        icon: formData.icon,
        sort: formData.sort,
        type: formData.type,
        module: formData.module,
        group: formData.group,
        hide: formData.hide,
        is_dev: formData.is_dev,
        tip: formData.tip
      };

      if (isEdit.value) {
        submitData.id = formData.id;
      }

      const res = await editMenu(submitData);

      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '保存成功' : '新增成功');
        emit('success');
        handleClose();
      }
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      if (isMounted.value) {
        submitLoading.value = false;
      }
    }
  });
};

const handleClose = () => {
  if (!isMounted.value) return;
  emit('close');
};

watch(
  () => props.menu,
  newMenu => {
    if (!isMounted.value) return;

    if (newMenu && newMenu.id) {
      Object.assign(formData, newMenu);
      formData.pid = newMenu.pid || '0';
      formData.hide = newMenu.hide ?? 0;
      formData.is_dev = newMenu.is_dev ?? 0;
      formData.module = newMenu.module ?? '';
      formData.icon = newMenu.icon || '';
      formData.sort = newMenu.sort ?? 0;
      formData.type = newMenu.type ?? props.type ?? 0;
      formData.group = newMenu.group || '';
      formData.tip = newMenu.tip || '';
    } else {
      // 新增模式：保留传入的 pid、type、module
      formData.id = '';
      formData.title = '';
      formData.pid = newMenu?.pid || '0';
      formData.url = '';
      formData.icon = '';
      formData.sort = 0;
      formData.type = (newMenu?.type ?? props.type) || 0;
      formData.module = (newMenu?.module ?? props.module) || '';
      formData.group = '';
      formData.hide = 0;
      formData.is_dev = 0;
      formData.tip = '';
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  if (!formData.pid || formData.pid === undefined || formData.pid === null) {
    formData.pid = '0';
  }
  if (!formData.icon || formData.icon === undefined || formData.icon === null) {
    formData.icon = '';
  }
  if (formData.sort === undefined || formData.sort === null) {
    formData.sort = 0;
  }
  if (formData.type === undefined || formData.type === null) {
    formData.type = props.type || 0;
  }
  if (!formData.module || formData.module === undefined || formData.module === null) {
    formData.module = props.module || '';
  }
  if (!formData.group || formData.group === undefined || formData.group === null) {
    formData.group = '';
  }
  if (formData.hide === undefined || formData.hide === null) {
    formData.hide = 0;
  }
  if (formData.is_dev === undefined || formData.is_dev === null) {
    formData.is_dev = 0;
  }
  if (!formData.tip || formData.tip === undefined || formData.tip === null) {
    formData.tip = '';
  }
});

onUnmounted(() => {
  isMounted.value = false;
});
</script>

<style lang="scss" scoped>
.menu-edit {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.edit-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.edit-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
