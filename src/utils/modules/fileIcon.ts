/* 获取文件图标
 * @param {Object} filename
 */
export function fileIcon(filename: string) {
  const filename_arr = filename.split('.');
  const ext = filename_arr[filename_arr.length - 1];
  let icon;
  switch (ext) {
    case 'txt':
      icon = 'txt.png';
      break;
    case 'zip':
      icon = 'zip.png';
      break;
    case '7z':
    case 'rar':
      icon = 'rar.png';
      break;
    case 'pptx':
    case 'ppt':
      icon = 'ppt.png';
      break;
    case 'xlsx':
    case 'xls':
      icon = 'xls.png';
      break;
    case 'docx':
    case 'doc':
      icon = 'word.png';
      break;
    case 'pdf':
      icon = 'pdf.png';
      break;
    default:
      icon = 'unknown.png';
      break;
  }
  return window.location.origin + 'static/forum/images/file/' + icon;
}
