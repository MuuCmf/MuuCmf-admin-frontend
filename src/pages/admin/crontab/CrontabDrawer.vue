<template>
  <el-drawer v-model="drawerVisible" :title="dialogTitle" size="50%">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="任务名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
      </el-form-item>
      <el-form-item label="执行命令" prop="execute">
        <el-input v-model="form.execute" type="textarea" :rows="3" placeholder="请输入执行命令" />
      </el-form-item>
      <el-form-item label="执行周期" prop="cycle">
        <el-select v-model="form.cycle" placeholder="请选择执行周期" style="width: 100%">
          <el-option label="每N分钟" value="minute-n" />
          <el-option label="每小时" value="hour" />
          <el-option label="每天" value="day" />
          <el-option label="每星期" value="week" />
          <el-option label="每月" value="month" />
          <el-option label="每N小时" value="hour-n" />
          <el-option label="每N天" value="day-n" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showMinute" label="执行间隔" prop="minute">
        <el-input v-model="form.minute" placeholder="请输入执行间隔（分钟）" type="number" />
      </el-form-item>
      <el-form-item v-if="showHour" label="执行小时" prop="hour">
        <el-input v-model="form.hour" placeholder="请输入执行时间（小时）" type="number" />
      </el-form-item>
      <el-form-item v-if="showDay" :label="form.cycle === 'week' ? '执行星期' : '执行日期'" prop="day">
        <el-input v-if="form.cycle === 'week'" v-model="form.day" placeholder="请输入星期（1-7）" type="number" />
        <el-input v-else v-model="form.day" placeholder="请输入执行日期" type="number" />
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage } from 'element-plus';

interface CrontabItem {
  id: number;
  title: string;
  description: string;
  execute: string;
  cycle: string;
  day: string;
  hour: string;
  minute: string;
  status: number;
  update_time: number;
}

interface Props {
  visible: boolean;
  editData: CrontabItem | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = ref(false);
const dialogTitle = ref('添加任务');
const formRef = ref();
const form = ref({
  id: 0,
  title: '',
  description: '',
  execute: '',
  cycle: 'day',
  day: '',
  hour: '',
  minute: '',
  status: 1
});

const showMinute = computed(() => {
  return ['minute-n', 'hour', 'day', 'hour-n', 'month', 'day-n'].includes(form.value.cycle);
});

const showHour = computed(() => {
  return ['day', 'hour-n', 'month', 'day-n'].includes(form.value.cycle);
});

const showDay = computed(() => {
  return ['month', 'day-n', 'week'].includes(form.value.cycle);
});

const isInitialized = ref(false);

const rules = computed(() => {
  const baseRules: Record<string, any[]> = {
    title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    execute: [{ required: true, message: '请输入执行命令', trigger: 'blur' }],
    cycle: [{ required: true, message: '请选择执行周期', trigger: 'change' }]
  };

  if (showMinute.value) {
    baseRules['minute'] = [{ required: true, message: '请输入执行间隔（分钟）', trigger: 'blur' }];
  }

  if (showHour.value) {
    baseRules['hour'] = [{ required: true, message: '请输入执行小时', trigger: 'blur' }];
  }

  if (showDay.value) {
    baseRules['day'] = [
      {
        required: true,
        message: form.value.cycle === 'week' ? '请输入星期（1-7）' : '请输入执行日期',
        trigger: 'blur'
      }
    ];
  }

  return baseRules;
});

watch(
  () => props.visible,
  val => {
    drawerVisible.value = val;
    if (val) {
      isInitialized.value = false;
      if (props.editData) {
        dialogTitle.value = '编辑任务';
        form.value = {
          id: props.editData.id,
          title: props.editData.title,
          description: props.editData.description,
          execute: props.editData.execute,
          cycle: props.editData.cycle,
          day: props.editData.day,
          hour: props.editData.hour,
          minute: props.editData.minute,
          status: props.editData.status
        };
      } else {
        dialogTitle.value = '添加任务';
        form.value = {
          id: 0,
          title: '',
          description: '',
          execute: '',
          cycle: 'day',
          day: '',
          hour: '',
          minute: '',
          status: 1
        };
      }
      nextTick(() => {
        isInitialized.value = true;
      });
    }
  }
);

watch(
  () => form.value.cycle,
  (newCycle, oldCycle) => {
    if (isInitialized.value && oldCycle && newCycle !== oldCycle) {
      form.value.day = '';
      form.value.hour = '';
      form.value.minute = '';
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

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const res = await request({
      url: 'admin/crontab/edit',
      method: 'POST',
      data: form.value
    });

    if (res.code === 200) {
      ElMessage.success(form.value.id ? '任务更新成功' : '任务添加成功');
      drawerVisible.value = false;
      emit('success');
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>

<style scoped lang="scss">
:deep(.el-drawer__body) {
  padding: 20px;
}

:deep(.el-form) {
  .el-form-item {
    margin-bottom: 20px;

    .el-form-item__label {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .el-input,
    .el-textarea,
    .el-select {
      width: 100%;
    }

    .el-input-number {
      width: 100%;
    }
  }
}

:deep(.el-form-item__content) {
  .el-input__wrapper {
    width: 100%;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 20px;

  .el-button {
    min-width: 100px;
  }
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-switch) {
  height: 22px;
}

:deep(.dark) {
  .el-form-item__label {
    color: var(--el-text-color-primary);
  }
}
</style>
