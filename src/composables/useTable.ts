import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

interface TableOptions {
  api: (params: any) => Promise<any>;
  params?: any;
  immediate?: boolean;
  autoScrollTop?: boolean;
}

export function useTable(options: TableOptions) {
  const { api, params = {}, immediate = true, autoScrollTop = false } = options;

  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const selectedRows = ref<any[]>([]);
  const withContainerRef = ref<HTMLElement | null>(null);

  const resetScrollTop = () => {
    if (withContainerRef.value) {
      withContainerRef.value.scrollTop = 0;
    }
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const response = await api({
        ...params,
        page: currentPage.value,
        rows: pageSize.value
      });

      tableData.value = response.data?.list || response.data || [];
      total.value = response.data?.count || response.data?.total || 0;

      if (autoScrollTop) {
        nextTick(() => {
          resetScrollTop();
        });
      }
    } catch {
      ElMessage.error('获取数据失败');
      tableData.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchData();
  };

  const handleCurrentChange = (page: number) => {
    currentPage.value = page;
    fetchData();
  };

  const refresh = () => {
    currentPage.value = 1;
    fetchData();
  };

  const reset = () => {
    currentPage.value = 1;
    pageSize.value = 10;
    selectedRows.value = [];
    fetchData();
  };

  const deleteRow = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
        type: 'warning'
      });

      await api({ id: row.id, action: 'delete' });
      ElMessage.success('删除成功');
      refresh();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败');
      }
    }
  };

  const batchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的数据');
      return;
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
        type: 'warning'
      });

      await api({
        ids: selectedRows.value.map((row: any) => row.id),
        action: 'batch_delete'
      });
      ElMessage.success('删除成功');
      selectedRows.value = [];
      refresh();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败');
      }
    }
  };

  watch([currentPage, pageSize], () => {
    if (!immediate) {
      fetchData();
    }
  });

  if (immediate) {
    fetchData();
  }

  return {
    loading,
    tableData,
    total,
    currentPage,
    pageSize,
    selectedRows,
    withContainerRef,
    fetchData,
    handleSizeChange,
    handleCurrentChange,
    refresh,
    reset,
    deleteRow,
    batchDelete,
    resetScrollTop
  };
}
