/**
 * FontAwesome 图标名称转换工具
 * 用于处理 FontAwesome 5 到 FontAwesome 6 的图标名称兼容性问题
 */

/**
 * 解析图标名称并返回正确的 prefix 和 iconName
 * @param iconString 图标名称（可能包含前缀，如 'hand-pointer-o' 或 'fas hand-pointer'）
 * @returns 返回 { prefix, iconName }
 */
export const parseIconName = (iconString: string | undefined): { prefix: string; iconName: string } => {
  if (!iconString || typeof iconString !== 'string') {
    return { prefix: 'fas', iconName: 'question-circle' };
  }

  // 去除可能的空格
  const trimmedIcon = iconString.trim();

  // 检查是否已经包含前缀（如 'fas hand-pointer'）
  const parts = trimmedIcon.split(/\s+/);

  if (parts.length > 1) {
    // 已经有前缀
    const prefix = parts[0].toLowerCase();
    const iconName = parts.slice(1).join('-');
    return { prefix, iconName };
  }

  // 处理带 '-o' 后缀的图标（FontAwesome 5 的空心图标）
  if (trimmedIcon.endsWith('-o')) {
    // 去掉 '-o' 后缀，返回实心图标（因为没有空心图标包）
    const iconName = trimmedIcon.slice(0, -2);
    return { prefix: 'fas', iconName };
  }

  // 默认返回实心图标
  return { prefix: 'fas', iconName: trimmedIcon };
};

/**
 * 将图标字符串转换为图标数组格式
 * @param iconString 图标名称
 * @returns 返回图标数组 ['fas', 'icon-name']
 */
export const getIconArray = (iconString: string | undefined): string[] => {
  const { prefix, iconName } = parseIconName(iconString);
  return [prefix, iconName];
};

/**
 * 判断图标是否有效
 * @param iconString 图标名称
 * @returns 是否为有效图标
 */
export const isValidIcon = (iconString: string | undefined): boolean => {
  if (!iconString || typeof iconString !== 'string') return false;
  const trimmedIcon = iconString.trim();
  // 简单检查：至少包含字母和可能的连字符
  return /^[a-zA-Z][a-zA-Z0-9-]*$/.test(trimmedIcon);
};
