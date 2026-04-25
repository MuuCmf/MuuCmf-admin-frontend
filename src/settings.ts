const ENV = import.meta.env;

const defaultSettings: AppSettings = {
  // 系统Title
  name: ENV.VITE_FRAME_NAME,
  // 系统版本
  version: ENV.VITE_FRAME_VERSION,
  // 应用名称
  appName: ENV.VITE_APP_NAME
};

export default defaultSettings;
