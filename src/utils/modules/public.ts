import { useClipboard } from '@vueuse/core';
import { ElMessage } from 'element-plus';

/**
 * 获取url地址参数
 * @param paraName
 */
export function getUrlParam(paraName: string): string {
  const url = document.location.toString();
  const arrObj = url.split('?');

  if (arrObj.length > 1) {
    const arrPara = arrObj[1].split('&');
    let arr;

    for (let i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split('=');

      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return '';
  } else {
    return '';
  }
}

// 复制文本
export function handleCopy(text: string) {
  const { copy, isSupported } = useClipboard();
  if (!isSupported) {
    ElMessage.error('您的浏览器不支持Clipboard API');
    return;
  }
  copy(text);
  ElMessage.success(`复制成功`);
}

// 环境变量
const ENV = import.meta.env;
let siteroot = window.location.protocol + '//' + window.location.host + '/';
if (ENV.MODE == 'development') {
  siteroot = ENV.VITE_APP_SERVER;
}
export const rootUrl = siteroot;

// 头像加载失败处理
export const handleAvatarError = (event: Event) => {
  const defaultAvatar =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMSIgZmlsbD0iI0UzQjhDRiIvPjwvc3ZnPg==';
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};
