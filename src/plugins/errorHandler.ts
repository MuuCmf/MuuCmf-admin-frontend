import { ElMessage } from 'element-plus';

export function setupErrorHandler(app: any) {
  app.config.errorHandler = (err: Error, instance: any, info: string) => {
    console.error('Global Error:', err, info);
    ElMessage.error(`应用错误: ${err.message}`);
  };

  window.onerror = (message: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
    // 忽略 ResizeObserver 错误，这是良性错误
    if (
      typeof message === 'string' &&
      message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      return true;
    }
    console.error('Window Error:', message, source, lineno, colno, error);
    ElMessage.error(`页面错误: ${typeof message === 'string' ? message : '未知错误'}`);
  };

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    ElMessage.error('未处理的Promise错误');
  });
}
