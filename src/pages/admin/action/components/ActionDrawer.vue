<template>
  <el-drawer
    :model-value="visible"
    :title="title"
    size="500px"
    direction="rtl"
    destroy-on-close
    @update:model-value="val => emit('update:visible', val)"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="标识" prop="name">
        <el-input v-model="formData.name" placeholder="请输入规则标识" />
      </el-form-item>
      <el-form-item label="名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="规则描述" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入规则描述" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="积分规则">
        <el-button type="primary" style="margin-bottom: 12px" @click="addScoreRule"> 添加积分规则 </el-button>
        <div v-if="formData.rule && formData.rule.length > 0" class="score-rule-list">
          <div v-for="(item, index) in formData.rule" :key="index" class="score-rule-item">
            <el-form-item label="表名" style="margin-bottom: 12px">
              <el-input v-model="item.table" placeholder="请输入表名" />
            </el-form-item>
            <el-form-item label="积分类型" style="margin-bottom: 12px">
              <el-select v-model="item.field" placeholder="请选择积分类型" style="width: 100%">
                <el-option v-for="type in scoreTypeList" :key="type.id" :label="type.title" :value="type.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="积分操作" style="margin-bottom: 12px">
              <el-input v-model="item.rule" placeholder="请输入积分操作" />
            </el-form-item>
            <el-form-item label="周期（小时）" style="margin-bottom: 12px">
              <el-input v-model="item.cycle" placeholder="请输入周期" />
            </el-form-item>
            <el-form-item label="最大限制次数" style="margin-bottom: 12px">
              <el-input v-model="item.max" placeholder="请输入最大限制次数" />
            </el-form-item>
            <el-button type="danger" size="small" style="margin-top: 8px" @click="removeScoreRule(index)">
              删除规则
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="日志模板" prop="log">
        <el-input v-model="formData.log" placeholder="请输入日志模板" type="textarea" :rows="3" />
        <div class="form-item-help">
          日志模板按此规则来生成，支持[变量|函数]。目前变量有：user,time,model,record,data
        </div>
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
import { ElMessage } from 'element-plus';
import { editAction, getScoreTypeList as fetchScoreTypeList } from '@/api';
import type { RuleItem, ActionItem } from '@/api';

// Props
const props = defineProps<{
  visible: boolean;
  title: string;
  data?: ActionItem;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

// 响应式数据
const formRef = ref();
const submitLoading = ref(false);
const scoreTypeList = ref<any[]>([]);
const formData = reactive<ActionItem>({
  name: '',
  title: '',
  log: '',
  status: 1,
  rule: [] as RuleItem[],
  remark: ''
});

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入规则标识', trigger: 'blur' },
    { min: 1, max: 50, message: '标识长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 1, max: 100, message: '名称长度在 1 到 100 个字符', trigger: 'blur' }
  ]
});

// 重置表单
const resetForm = () => {
  delete formData.id;
  formData.name = '';
  formData.title = '';
  formData.log = '';
  formData.module = '';
  formData.rule = [] as RuleItem[];
  formData.remark = '';
  formData.status = 1;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 获取积分类型列表
const getScoreTypeList = async () => {
  try {
    const res = await fetchScoreTypeList();
    if (res.code === 200) {
      scoreTypeList.value = res.data || [];
    }
  } catch (error) {
    console.error('获取积分类型列表失败:', error);
  }
};

// 添加积分规则
const addScoreRule = () => {
  if (!formData.rule) {
    formData.rule = [];
  }
  formData.rule.push({
    table: '',
    field: null,
    rule: 0,
    cycle: 0,
    max: 0
  });
};

// 删除积分规则
const removeScoreRule = (index: number) => {
  if (formData.rule && formData.rule.length > index) {
    formData.rule.splice(index, 1);
  }
};

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false);
  resetForm();
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData };
    // 如果 rule 为空数组，设置为空字符串
    if (!submitData.rule || submitData.rule.length === 0) {
      submitData.rule = [];
    }

    const res = await editAction(submitData);

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

// 组件挂载时获取积分类型列表
onMounted(() => {
  getScoreTypeList();
});

// 监听数据变化，更新表单
watch(
  () => props.data,
  newData => {
    if (newData) {
      Object.assign(formData, newData);
      // 确保 rule 始终是数组类型
      if (!formData.rule || typeof formData.rule !== 'object' || !Array.isArray(formData.rule)) {
        formData.rule = [] as RuleItem[];
      } else {
        // 确保 rule 数组中的 field 字段类型与 scoreTypeList 中的 id 类型一致
        if (formData.rule && formData.rule.length > 0) {
          formData.rule.forEach((item: RuleItem) => {
            // 将 field 转换为数字类型，与 type.id 保持一致
            item.field = Number(item.field);
            item.rule = Number(item.rule);
            item.cycle = Number(item.cycle);
            item.max = Number(item.max);

            // 如果 field 为 0 且不在积分类型列表中，设置为 null 以显示 placeholder
            if (item.field === 0) {
              const exists = scoreTypeList.value.some(type => type.id === 0);
              if (!exists) {
                item.field = null;
              }
            }
          });
        }
      }
    } else {
      resetForm();
    }
  }
);
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

.score-rule-list {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.score-rule-item {
  padding: 12px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.score-rule-item:last-child {
  margin-bottom: 0;
}

html.dark {
  .score-rule-list {
    background-color: #262626;
  }

  .score-rule-item {
    background-color: #333333;
    border-color: #363636;
  }
}
</style>
