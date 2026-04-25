<template>
  <el-drawer
    :model-value="visible"
    :direction="direction || 'rtl'"
    :size="size || '60%'"
    :title="`分配权限 - ${groupInfo?.name || '权限组'}`"
    @update:model-value="val => emit('update:visible', val)"
    @close="handleClose"
  >
    <div class="permission-drawer">
      <div class="permission-content">
        <div v-if="permissionLoading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>权限数据加载中...</span>
        </div>
        <div v-else class="custom-tree">
          <el-checkbox-group v-model="checkedKeys" @change="handleCheckboxGroupChange">
            <!-- 递归渲染树节点 -->
            <div v-for="node in permissionTree" :key="node[treeProps.id]" class="tree-node">
              <div class="tree-node-content">
                <el-icon
                  v-if="hasChildren(node)"
                  class="expand-icon"
                  @click.stop="toggleNodeExpand(node[treeProps.id].toString())"
                >
                  <ArrowDown v-if="isNodeExpanded(node[treeProps.id].toString())" />
                  <ArrowRight v-else />
                </el-icon>
                <el-checkbox
                  :value="node[treeProps.id]"
                  class="node-checkbox"
                  @change="handleCheckboxChange(node[treeProps.id], node)"
                />
                <span class="node-label">{{ node[treeProps.label] }}</span>
              </div>
              <!-- 递归渲染子节点 -->
              <div v-if="hasChildren(node) && isNodeExpanded(node[treeProps.id].toString())" class="tree-children">
                <div v-for="child in node[treeProps.children]" :key="child[treeProps.id]" class="tree-node">
                  <div class="tree-node-content">
                    <el-icon
                      v-if="hasChildren(child)"
                      class="expand-icon"
                      @click.stop="toggleNodeExpand(child[treeProps.id].toString())"
                    >
                      <ArrowDown v-if="isNodeExpanded(child[treeProps.id].toString())" />
                      <ArrowRight v-else />
                    </el-icon>
                    <el-checkbox
                      :value="child[treeProps.id]"
                      class="node-checkbox"
                      @change="handleCheckboxChange(child[treeProps.id], child)"
                    />
                    <span class="node-label">{{ child[treeProps.label] }}</span>
                  </div>
                  <!-- 递归渲染子节点 -->
                  <div
                    v-if="hasChildren(child) && isNodeExpanded(child[treeProps.id].toString())"
                    class="tree-children"
                  >
                    <div
                      v-for="grandchild in child[treeProps.children]"
                      :key="grandchild[treeProps.id]"
                      class="tree-node"
                    >
                      <div class="tree-node-content">
                        <el-icon
                          v-if="hasChildren(grandchild)"
                          class="expand-icon"
                          @click.stop="toggleNodeExpand(grandchild[treeProps.id].toString())"
                        >
                          <ArrowDown v-if="isNodeExpanded(grandchild[treeProps.id].toString())" />
                          <ArrowRight v-else />
                        </el-icon>
                        <el-checkbox
                          :value="grandchild[treeProps.id]"
                          class="node-checkbox"
                          @change="handleCheckboxChange(grandchild[treeProps.id], grandchild)"
                        />
                        <span class="node-label">{{ grandchild[treeProps.label] }}</span>
                      </div>
                      <!-- 继续递归渲染更深层次的节点 -->
                      <div
                        v-if="hasChildren(grandchild) && isNodeExpanded(grandchild[treeProps.id].toString())"
                        class="tree-children"
                      >
                        <!-- 此处可以根据需要继续添加更深层次的递归 -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      <div class="permission-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存权限</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage, CheckboxValueType } from 'element-plus';
import { Loading, ArrowDown, ArrowRight } from '@element-plus/icons-vue';
import { getPermissionTree, savePermissions } from '@/api/admin/auth';

// 检查节点是否有子节点
const hasChildren = (node: any) => {
  return (
    node && typeof node === 'object' && Array.isArray(node[treeProps.children]) && node[treeProps.children].length > 0
  );
};

// 组件属性
const props = defineProps<{
  visible: boolean;
  direction?: 'rtl' | 'ltr' | 'ttb' | 'btt';
  size?: string;
  groupId?: number;
  groupInfo?: any;
}>();

// 组件事件
const emit = defineEmits<{
  close: [];
  success: [permissions: number[]];
  'update:visible': [visible: boolean];
}>();

// 响应式数据
const permissionTree = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);
const loading = ref(false);
const permissionLoading = ref(false); // 权限树加载状态

// 展开状态管理
const expandedNodes = ref<Set<string>>(new Set());

// 树属性配置
const treeProps = {
  children: '_child',
  label: 'title',
  id: 'rule_id'
};

// 判断节点是否展开
const isNodeExpanded = (nodeId: string): boolean => {
  return expandedNodes.value.has(nodeId);
};

// 切换节点展开状态
const toggleNodeExpand = (nodeId: string): void => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
};

// 复选框选择处理
const handleCheckboxChange = (nodeId: number, node: any) => {
  // 检查当前节点是否被选中
  const isChecked = checkedKeys.value.includes(nodeId);

  if (isChecked) {
    // 如果节点被选中，递归选择所有子节点
    if (hasChildren(node)) {
      selectAllChildren(node);
    }
  } else {
    // 如果节点被取消选中，递归取消选择所有子节点
    if (hasChildren(node)) {
      unselectAllChildren(node);
    }
  }
};

// 复选框组变化处理
const handleCheckboxGroupChange = (_values: CheckboxValueType[]) => {};

// 递归选择所有子节点
const selectAllChildren = (node: any) => {
  if (!node || typeof node !== 'object') return;
  const children = node[treeProps.children];
  if (Array.isArray(children)) {
    children.forEach(child => {
      const childId = child[treeProps.id];
      if (!checkedKeys.value.includes(childId)) {
        checkedKeys.value.push(childId);
      }
      if (hasChildren(child)) {
        selectAllChildren(child);
      }
    });
  }
};

// 递归取消选择所有子节点
const unselectAllChildren = (node: any) => {
  if (!node || typeof node !== 'object') return;
  const children = node[treeProps.children];
  if (Array.isArray(children)) {
    children.forEach(child => {
      const childId = child[treeProps.id];
      const index = checkedKeys.value.indexOf(childId);
      if (index !== -1) {
        checkedKeys.value.splice(index, 1);
      }
      if (hasChildren(child)) {
        unselectAllChildren(child);
      }
    });
  }
};

// 监听groupId变化，重新加载权限数据
watch(
  () => props.groupId,
  newVal => {
    if (newVal && props.visible) {
      loadPermissions(newVal);
      // 默认展开所有节点
      expandedNodes.value.clear();
      // 可以根据需要设置默认展开的节点
    }
  }
);

// 加载权限树
const loadPermissions = async (groupId: number) => {
  permissionLoading.value = true;
  try {
    const permissionRes = await getPermissionTree({
      group_id: groupId
    });

    if (permissionRes.code === 200) {
      permissionTree.value = permissionRes.data.node_tree || [];
      const groupRules = permissionRes.data.group_rules;
      if (typeof groupRules === 'string') {
        checkedKeys.value = groupRules
          .split(',')
          .filter((id: string) => id.trim())
          .map((id: string) => Number(id.trim()));
      } else {
        checkedKeys.value = (groupRules || []).map((id: any) => Number(id));
      }
      const expandChildNodes = (nodes: any[]) => {
        nodes.forEach(node => {
          if (hasChildren(node)) {
            expandChildNodes(node[treeProps.children]);
          }
        });
      };
      expandChildNodes(permissionTree.value);
    }
  } catch (error) {
    console.error('加载权限失败:', error);
    ElMessage.error('加载权限失败');
  } finally {
    permissionLoading.value = false;
  }
};

// 提交权限分配
const handleSubmit = async () => {
  if (!props.groupId) return;

  loading.value = true;
  try {
    const res = await savePermissions({
      id: props.groupId,
      rules: checkedKeys.value
    });

    if (res.code === 200) {
      ElMessage.success('权限分配成功');
      emit('success', checkedKeys.value);
      emit('close');
    }
  } catch (error) {
    console.error('权限分配失败:', error);
    ElMessage.error('权限分配失败');
  } finally {
    loading.value = false;
  }
};

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};
</script>

<style lang="scss" scoped>
.permission-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.permission-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.permission-content {
  flex: 1;
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  // 加载状态容器
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #606266;
    font-size: 14px;

    .is-loading {
      margin-right: 8px;
      font-size: 20px;
      animation: rotate 1s linear infinite;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // 自定义树样式
  .custom-tree {
    padding: 8px 0;
  }

  // 树节点样式
  .tree-node {
    margin: 2px 0;
  }

  // 节点内容布局
  .tree-node-content {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f0f9ff;
    }
  }

  // 展开/折叠图标
  .expand-icon {
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    color: #409eff;
    margin-right: 4px;
    font-size: 14px;
    font-weight: bold;
  }

  // 复选框样式
  .node-checkbox {
    margin-right: 8px;
  }

  // 节点标签样式 - 根据层级区分
  .node-label {
    font-size: 14px;
    font-weight: 400;
  }

  // 一级节点样式
  .tree-node > .tree-node-content > .node-label {
    font-size: 18px;
    font-weight: 700;
    color: #303133;
  }

  // 二级节点样式
  .tree-node > .tree-children > .tree-node .node-label {
    font-size: 15px;
    font-weight: 500;
    color: #606266;
  }

  // 子节点缩进
  .tree-children {
    padding-left: 24px;
    transition: all 0.3s ease;
    .tree-node {
      padding-left: 24px;
    }
  }

  // 状态指示器样式
  .node-status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 8px;
    font-weight: 500;
  }

  // 优化滚动条样式
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.permission-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e4e7ed;

  .el-button {
    margin-left: 8px;
  }
}

// 暗色模式
.dark {
  .permission-drawer {
    background-color: #262626;
  }

  .permission-header {
    border-bottom: 1px solid #363636;

    h4 {
      color: #e5e5e5;
    }
  }

  .permission-content {
    // 暗色模式加载状态
    .loading-container {
      color: #b8b8b8;
    }

    // 暗色模式自定义树样式
    .custom-tree {
      padding: 8px 0;
    }

    // 树节点样式（暗色模式）
    .tree-node {
      margin: 2px 0;
    }

    // 节点内容布局（暗色模式）
    .tree-node-content {
      display: flex;
      align-items: center;
      height: 36px;
      padding: 0 8px;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background-color: #333333;
      }
    }

    // 展开/折叠图标（暗色模式）
    .expand-icon {
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      cursor: pointer;
      color: #66b1ff;
      margin-right: 4px;
      font-weight: bold;
    }

    // 节点标签样式 - 根据层级区分（暗色模式）
    .node-label {
      font-size: 14px;
      font-weight: 400;
      color: #e5e5e5;
    }

    // 一级节点样式（暗色模式）
    .custom-tree > .tree-node > .tree-node-content > .node-label {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
    }

    // 二级节点样式（暗色模式）
    .tree-node > .tree-children > .tree-node .node-label {
      font-size: 15px;
      font-weight: 500;
      color: #66b1ff;
    }

    // 叶子节点样式（暗色模式）
    .tree-node .node-label {
      color: #b8b8b8;
    }

    // 子节点缩进（暗色模式）
    .tree-children {
      padding-left: 24px;
      transition: all 0.3s ease;
    }

    // 状态指示器样式（暗色模式）
    .node-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: 8px;
      font-weight: 500;
    }

    // 不同状态的颜色（暗色模式）
    .status-1 {
      background-color: #1b332b;
      color: #67c23a;
    }

    .status-0 {
      background-color: #3d362f;
      color: #e6a23c;
    }

    .status--1 {
      background-color: #402f2f;
      color: #f56c6c;
    }

    // 暗色模式滚动条
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #262626;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: #4a5161;
      border-radius: 4px;

      &:hover {
        background: #5a6171;
      }
    }

    // 已移除旧的el-tree样式，使用自定义树组件
  }

  .permission-footer {
    border-top: 1px solid #363636;
  }
}
</style>
