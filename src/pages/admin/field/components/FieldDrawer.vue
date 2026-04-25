<template>
  <el-drawer
    v-model="drawerVisible"
    :title="`${currentGroup?.profile_name || ''} - 字段管理`"
    size="60%"
    @close="handleClose"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <el-button type="primary" @click="handleAddField">添加字段</el-button>
      </div>
      <div class="drawer-table">
        <el-table v-loading="fieldLoading" :data="fieldList" style="width: 100%" stripe>
          <el-table-column prop="field_name" label="字段名称" min-width="120" />
          <el-table-column prop="field_alias" label="字段描述" min-width="120" />
          <el-table-column prop="form_type" label="表单类型" width="100" align="center">
            <template #default="scope">
              {{ scope.row.form_type_str || getFormTypeLabel(scope.row.form_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="required" label="必填" width="80" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.required === 1 ? 'success' : 'info'">
                {{ scope.row.required === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <div style="cursor: pointer; padding: 5px 0">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @click.stop
                  @change="() => handleFieldStatusToggle(scope.row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleEditField(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteField(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="fieldDialogVisible" :title="fieldDialogTitle" width="600px">
      <el-form ref="fieldFormRef" :model="fieldForm" :rules="fieldRules" label-width="100px">
        <el-form-item label="字段名称" prop="field_name">
          <el-input v-model="fieldForm.field_name" placeholder="请输入字段名称" />
        </el-form-item>
        <el-form-item label="字段描述" prop="field_alias">
          <el-input v-model="fieldForm.field_alias" placeholder="请输入字段描述" />
        </el-form-item>
        <el-form-item label="表单类型" prop="form_type">
          <el-select v-model="fieldForm.form_type" placeholder="请选择表单类型" style="width: 100%">
            <el-option label="文本框" value="input" />
            <el-option label="单选项" value="radio" />
            <el-option label="多选项" value="checkbox" />
            <el-option label="下拉框" value="select" />
            <el-option label="日期" value="time" />
            <el-option label="文本域" value="textarea" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="form_default_value">
          <el-input
            v-model="fieldForm.form_default_value"
            type="textarea"
            :rows="3"
            placeholder="请输入默认值（多个值用'|'分割开，例：男|女）"
          />
        </el-form-item>
        <el-form-item label="验证规则" prop="validation">
          <el-input
            v-model="fieldForm.validation"
            placeholder="请输入验证规则（多个值用'|'分割开，例：require|max:25）"
          />
        </el-form-item>
        <el-form-item label="输入提示" prop="input_tips">
          <el-input v-model="fieldForm.input_tips" placeholder="请输入输入提示（提示用户如何输入该字段信息）" />
        </el-form-item>
        <el-form-item label="必填" prop="required">
          <el-switch v-model="fieldForm.required" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="可见性" prop="visiable">
          <el-switch v-model="fieldForm.visiable" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="fieldForm.sort" :min="0" :max="999" placeholder="请输入排序权重" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="fieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFieldSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage, ElMessageBox } from 'element-plus';

interface FieldGroupItem {
  id: number;
  profile_name: string;
  visiable: number;
  status: number;
  sort: number;
  create_time?: number;
  create_time_str?: string;
  update_time?: number;
  update_time_str?: string;
  setting?: any[];
}

interface FieldItem {
  id: number;
  group_id: number;
  field_name: string;
  field_alias: string;
  form_type: string;
  form_default_value: string;
  validation: string;
  input_tips: string;
  required: number;
  visiable: number;
  status: number;
  sort: number;
}

interface Props {
  visible: boolean;
  group: FieldGroupItem | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = ref(false);
const currentGroup = ref<FieldGroupItem | null>(null);
const fieldLoading = ref(false);
const fieldList = ref<FieldItem[]>([]);

const fieldDialogVisible = ref(false);
const fieldDialogTitle = ref('添加字段');
const fieldFormRef = ref();
const fieldForm = ref({
  id: 0,
  group_id: 0,
  field_name: '',
  field_alias: '',
  form_type: 'input',
  form_default_value: '',
  validation: '',
  input_tips: '',
  required: 0,
  visiable: 1,
  sort: 0
});

const fieldRules = {
  field_name: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  field_alias: [{ required: true, message: '请输入字段描述', trigger: 'blur' }],
  form_type: [{ required: true, message: '请选择表单类型', trigger: 'change' }]
};

const getFormTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    input: '文本框',
    radio: '单选项',
    checkbox: '多选项',
    select: '下拉框',
    time: '日期',
    textarea: '文本域'
  };
  return typeMap[type] || type;
};

watch(
  () => props.visible,
  val => {
    drawerVisible.value = val;
    if (val) {
      currentGroup.value = props.group;
      getFieldList();
    }
  }
);

watch(drawerVisible, val => {
  if (!val) {
    emit('update:visible', false);
  }
});

const handleClose = () => {
  emit('update:visible', false);
};

const getFieldList = async () => {
  if (!currentGroup.value) return;

  fieldLoading.value = true;
  try {
    const res = await request({
      url: 'admin/field/list',
      method: 'GET',
      data: {
        group_id: currentGroup.value.id
      }
    });
    if (res.code === 200) {
      fieldList.value = res.data || [];
    } else {
      ElMessage.error(res.msg || '获取字段列表失败');
    }
  } catch (error) {
    ElMessage.error('获取字段列表失败');
    console.error(error);
  } finally {
    fieldLoading.value = false;
  }
};

const handleAddField = () => {
  fieldDialogTitle.value = '添加字段';
  fieldForm.value = {
    id: 0,
    group_id: currentGroup.value?.id || 0,
    field_name: '',
    field_alias: '',
    form_type: 'input',
    form_default_value: '',
    validation: '',
    input_tips: '',
    required: 0,
    visiable: 1,
    sort: 0
  };
  fieldDialogVisible.value = true;
};

const handleEditField = (row: FieldItem) => {
  fieldDialogTitle.value = '编辑字段';
  fieldForm.value = {
    id: row.id,
    group_id: row.group_id,
    field_name: row.field_name,
    field_alias: row.field_alias,
    form_type: row.form_type,
    form_default_value: row.form_default_value,
    validation: row.validation,
    input_tips: row.input_tips,
    required: row.required,
    visiable: row.visiable,
    sort: row.sort
  };
  fieldDialogVisible.value = true;
};

const handleDeleteField = (id: number) => {
  ElMessageBox.confirm('确定要删除这个字段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await request({
          url: 'admin/field/status',
          method: 'POST',
          data: {
            ids: id,
            status: -1
          }
        });
        if (res.code === 200) {
          ElMessage.success('字段删除成功');
          getFieldList();
        } else {
          ElMessage.error(res.msg || '字段删除失败');
        }
      } catch (error) {
        ElMessage.error('字段删除失败');
        console.error(error);
      }
    })
    .catch(() => {});
};

const handleFieldStatusToggle = async (row: FieldItem) => {
  const originalStatus = row.status === 1 ? 0 : 1;

  try {
    const res = await request({
      url: 'admin/field/status',
      method: 'POST',
      data: {
        ids: [row.id],
        status: row.status
      }
    });
    if (res.code !== 200) {
      ElMessage.error(res.msg || '状态更新失败');
      row.status = originalStatus;
    } else {
      ElMessage.success(res.msg || '状态更新成功');
    }
  } catch (error) {
    ElMessage.error('状态更新失败');
    row.status = originalStatus;
    console.error(error);
  }
};

const handleFieldSubmit = async () => {
  if (!fieldFormRef.value) return;

  try {
    await fieldFormRef.value.validate();

    const res = await request({
      url: 'admin/field/edit',
      method: 'POST',
      data: fieldForm.value
    });

    if (res.code === 200) {
      ElMessage.success(fieldForm.value.id ? '编辑字段成功' : '添加字段成功');
      fieldDialogVisible.value = false;
      getFieldList();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>

<style scoped lang="scss">
.drawer-content {
  padding: 6px;

  .drawer-header {
    margin-bottom: 20px;
  }

  .drawer-table {
    .el-table {
      border-radius: 6px;
    }
  }
}
</style>
