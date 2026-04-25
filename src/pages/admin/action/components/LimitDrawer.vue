<template>
  <el-drawer
    :model-value="visible"
    :title="title"
    size="600px"
    direction="rtl"
    destroy-on-close
    @update:model-value="val => emit('update:visible', val)"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="唯一标识" prop="name">
        <el-input v-model="formData.name" placeholder="请输入唯一标识" />
      </el-form-item>
      <el-form-item label="频率" prop="frequency">
        <el-input-number v-model="formData.frequency" :min="1" :max="9999" placeholder="请输入频率" />
      </el-form-item>
      <el-form-item label="时间" prop="time_number">
        <el-input-number
          v-model="formData.time_number"
          :min="1"
          :max="9999"
          placeholder="请输入时间"
          style="width: 200px; margin-right: 12px"
        />
        <el-select v-model="formData.time_unit" placeholder="请选择时间单位" style="width: 150px" :clearable="false">
          <el-option v-for="item in timeUnitList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="行为列表" prop="action_list">
        <el-select v-model="formData.action_list" multiple placeholder="请选择行为列表" style="width: 100%">
          <el-option v-for="item in actionList" :key="item.name" :label="item.title" :value="item.name" />
        </el-select>
        <div class="form-item-help">不选择则表示所有行为</div>
      </el-form-item>
      <el-form-item label="处罚方式" prop="punish">
        <el-checkbox-group v-model="formData.punish">
          <el-checkbox v-for="item in punishList" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="是否发送消息" prop="if_message">
        <el-switch v-model="formData.if_message" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item v-if="formData.if_message === 1" label="消息内容" prop="message_content">
        <el-input v-model="formData.message_content" placeholder="请输入消息内容" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 保存 </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { request } from '@/utils/modules/request';
import { ElMessage } from 'element-plus';

interface LimitData {
  id?: number;
  title: string;
  name: string;
  frequency: number;
  time_number: number;
  time_unit: string;
  action_list: string;
  punish: string;
  if_message: string | number;
  message_content: string;
  status: number;
  module?: string;
}

interface LimitFormData {
  id?: number;
  title: string;
  name: string;
  frequency: number;
  time_number: number;
  time_unit: string;
  action_list: string[];
  punish: string[];
  if_message: number;
  message_content: string;
  status: number;
  module?: string;
}

const props = defineProps<{
  visible: boolean;
  title: string;
  data?: LimitData;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const formRef = ref();
const submitLoading = ref(false);
const timeUnitList = ref([
  { value: 'second', label: '秒' },
  { value: 'minute', label: '分' },
  { value: 'hour', label: '小时' },
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' }
]);
const actionList = ref<any[]>([]);
const punishList = ref([
  { value: 'warning', label: '警告并禁止' },
  { value: 'logout_account', label: '强制退出登陆' },
  { value: 'ban_account', label: '封停账户' },
  { value: 'ban_ip', label: '封IP' }
]);

const formData = reactive<LimitFormData>({
  title: '',
  name: '',
  frequency: 1,
  time_number: 1,
  time_unit: 'hour',
  action_list: [],
  punish: [],
  if_message: 0,
  message_content: '',
  status: 1
});

const formRules = reactive({
  title: [
    { required: true, message: '请输入限制名称', trigger: 'blur' },
    { min: 1, max: 100, message: '名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入限制标识', trigger: 'blur' },
    { min: 1, max: 50, message: '标识长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  frequency: [{ required: true, message: '请输入频率', trigger: 'blur' }],
  time_number: [{ required: true, message: '请输入时间', trigger: 'blur' }],
  time_unit: [{ required: true, message: '请选择时间单位', trigger: 'change' }]
});

const resetForm = () => {
  delete formData.id;
  formData.title = '';
  formData.name = '';
  formData.frequency = 1;
  formData.time_number = 1;
  formData.time_unit = 'hour';
  formData.action_list = [];
  formData.punish = [];
  formData.if_message = 0;
  formData.message_content = '';
  formData.status = 1;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

/**
 * 获取行为列表
 */
const getActionList = async () => {
  try {
    const res = await request({
      url: 'admin/action/list',
      method: 'GET',
      data: { page: 1, rows: 1000 }
    });
    if (res.code === 200) {
      actionList.value = res.data.data || [];
    }
  } catch (error) {
    console.error('获取行为列表失败:', error);
  }
};

/**
 * 关闭抽屉
 */
const handleClose = () => {
  emit('update:visible', false);
  resetForm();
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = {
      ...formData,
      action_list:
        Array.isArray(formData.action_list) && formData.action_list.length > 0
          ? formData.action_list.map((item: string) => `${item}`).join(',')
          : '',
      punish: Array.isArray(formData.punish) && formData.punish.length > 0 ? formData.punish.join(',') : '',
      if_message: formData.if_message,
      message_content: formData.message_content,
      status: formData.status,
      module: formData.module || 'admin'
    };

    const res = await request({
      url: 'admin/action/limit/edit',
      method: 'POST',
      data: submitData
    });

    if (res.code === 200) {
      ElMessage.success(formData.id ? '更新成功' : '添加成功');
      emit('update:visible', false);
      emit('success');
      resetForm();
    } else {
      ElMessage.error(res.msg || (formData.id ? '更新失败' : '添加失败'));
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  } finally {
    submitLoading.value = false;
  }
};

watch(
  () => props.data,
  newData => {
    if (newData) {
      Object.assign(formData, newData);

      if (formData.action_list && typeof formData.action_list === 'string') {
        formData.action_list = (formData.action_list as string)
          .split(',')
          .map((item: string) => item.replace(/[[]]/g, ''));
      } else if (!formData.action_list || !Array.isArray(formData.action_list)) {
        formData.action_list = [];
      }

      if (formData.punish && typeof formData.punish === 'string') {
        formData.punish = (formData.punish as string).split(',');
      } else if (!formData.punish || !Array.isArray(formData.punish)) {
        formData.punish = [];
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

onMounted(() => {
  getActionList();
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-item-help {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
