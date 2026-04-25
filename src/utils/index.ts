import dayjs from 'dayjs';

/**
 * 防抖函数
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 *
 * @param func - 需要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 返回一个新的防抖函数
 *
 * @example
 * const debouncedSearch = debounce((value) => {
 *   console.log('搜索:', value)
 * }, 300)
 *
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value))
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 *
 * @param func - 需要节流的函数
 * @param wait - 等待时间（毫秒）
 * @returns 返回一个新的节流函数
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('滚动位置:', window.scrollY)
 * }, 100)
 *
 * window.addEventListener('scroll', throttledScroll)
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 异步防抖函数
 * 对异步函数进行防抖处理，在防抖期间会取消之前的请求
 *
 * @param func - 需要防抖的异步函数
 * @param wait - 等待时间（毫秒）
 * @returns 返回一个新的防抖异步函数
 *
 * @example
 * const debouncedFetch = debounceAsync(async (id: number) => {
 *   const res = await fetch(`/api/data/${id}`)
 *   return res.json()
 * }, 300)
 *
 * debouncedFetch(1).then(data => console.log(data))
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (abortController) {
        abortController.abort();
      }

      timeout = setTimeout(async () => {
        try {
          abortController = new AbortController();
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            reject(error);
          }
        } finally {
          timeout = null;
          abortController = null;
        }
      }, wait);
    });
  };
}

/**
 * 深度克隆对象
 * 创建一个对象的深拷贝，避免引用传递导致的问题
 *
 * @param obj - 需要克隆的对象
 * @returns 返回克隆后的新对象
 *
 * @example
 * const original = { a: 1, b: { c: 2 } }
 * const cloned = deepClone(original)
 * cloned.b.c = 3
 * console.log(original.b.c) // 2 (原对象不受影响)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 格式化日期
 * 将日期格式化为指定的字符串格式
 *
 * @param date - 日期对象、日期字符串或时间戳
 * @param format - 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 返回格式化后的日期字符串
 *
 * @example
 * formatDate(new Date()) // '2024-01-21 10:30:00'
 * formatDate('2024-01-21', 'YYYY-MM-DD') // '2024-01-21'
 * formatDate(1705825800000, 'YYYY年MM月DD日') // '2024年01月21日'
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format);
}

/**
 * 格式化数字
 * 将数字格式化为指定小数位数的字符串
 *
 * @param num - 需要格式化的数字
 * @param decimals - 保留的小数位数，默认为2
 * @returns 返回格式化后的数字字符串
 *
 * @example
 * formatNumber(3.14159) // '3.14'
 * formatNumber(3.14159, 4) // '3.1416'
 * formatNumber(100) // '100.00'
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * 格式化文件大小
 * 将字节数转换为人类可读的文件大小格式（B、KB、MB、GB、TB）
 *
 * @param bytes - 文件大小（字节）
 * @returns 返回格式化后的文件大小字符串
 *
 * @example
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824) // '1.00 GB'
 * formatFileSize(0) // '0 B'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 生成UUID（通用唯一识别码）
 * 生成一个符合 RFC 4122 标准的 UUID v4 格式字符串
 *
 * @returns 返回UUID字符串，格式为 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 *
 * @example
 * generateUUID() // '550e8400-e29b-41d4-a716-446655440000'
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 下载文件
 * 通过创建隐藏的a标签触发文件下载
 *
 * @param url - 文件的URL地址
 * @param filename - 下载后保存的文件名
 *
 * @example
 * downloadFile('https://example.com/file.pdf', 'document.pdf')
 * downloadFile('/api/export', 'data.xlsx')
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 复制文本到剪贴板
 * 使用现代浏览器的 Clipboard API 将文本复制到剪贴板
 *
 * @param text - 需要复制的文本内容
 * @returns 返回Promise，成功返回true，失败返回false
 *
 * @example
 * copyToClipboard('Hello World').then(success => {
 *   if (success) {
 *     console.log('复制成功')
 *   } else {
 *     console.log('复制失败')
 *   }
 * })
 */
export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

/**
 * 验证邮箱格式
 * 使用正则表达式验证邮箱地址格式是否正确
 *
 * @param email - 需要验证的邮箱地址
 * @returns 返回true表示格式正确，false表示格式错误
 *
 * @example
 * validateEmail('test@example.com') // true
 * validateEmail('invalid-email') // false
 * validateEmail('test@') // false
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 验证手机号格式
 * 验证中国大陆手机号格式（1开头，11位数字）
 *
 * @param phone - 需要验证的手机号
 * @returns 返回true表示格式正确，false表示格式错误
 *
 * @example
 * validatePhone('13800138000') // true
 * validatePhone('12345') // false
 * validatePhone('23800138000') // false
 */
export function validatePhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
}

/**
 * 验证身份证号格式
 * 验证中国大陆身份证号格式（15位或18位）
 *
 * @param idCard - 需要验证的身份证号
 * @returns 返回true表示格式正确，false表示格式错误
 *
 * @example
 * validateIdCard('11010519491231002X') // true
 * validateIdCard('11010519491231002') // true
 * validateIdCard('12345') // false
 */
export function validateIdCard(idCard: string): boolean {
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return regex.test(idCard);
}

/**
 * 获取URL查询参数
 * 从当前页面的URL中获取指定名称的查询参数值
 *
 * @param name - 查询参数的名称
 * @returns 返回参数值，如果不存在则返回null
 *
 * @example
 * // URL: https://example.com?page=2&size=10
 * getQueryString('page') // '2'
 * getQueryString('size') // '10'
 * getQueryString('name') // null
 */
export function getQueryString(name: string): string | null {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
}

/**
 * 设置URL查询参数
 * 在当前页面的URL中设置或更新指定的查询参数，并更新浏览器历史记录
 *
 * @param name - 查询参数的名称
 * @param value - 查询参数的值
 *
 * @example
 * // URL: https://example.com?page=1
 * setQueryString('page', '2')
 * // URL变为: https://example.com?page=2
 * setQueryString('size', '10')
 * // URL变为: https://example.com?page=2&size=10
 */
export function setQueryString(name: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url.toString());
}

/**
 * 移除URL查询参数
 * 从当前页面的URL中移除指定的查询参数，并更新浏览器历史记录
 *
 * @param name - 需要移除的查询参数名称
 *
 * @example
 * // URL: https://example.com?page=2&size=10
 * removeQueryString('page')
 * // URL变为: https://example.com?size=10
 */
export function removeQueryString(name: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.pushState({}, '', url.toString());
}

/**
 * 判断是否为移动设备
 * 通过检测User-Agent判断当前设备是否为移动设备
 *
 * @returns 返回true表示是移动设备，false表示是桌面设备
 *
 * @example
 * if (isMobile()) {
 *   console.log('当前是移动设备')
 * }
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 判断是否为桌面设备
 * 通过检测User-Agent判断当前设备是否为桌面设备
 *
 * @returns 返回true表示是桌面设备，false表示是移动设备
 *
 * @example
 * if (isDesktop()) {
 *   console.log('当前是桌面设备')
 * }
 */
export function isDesktop(): boolean {
  return !isMobile();
}

/**
 * 判断是否为微信浏览器
 * 通过检测User-Agent判断当前浏览器是否为微信内置浏览器
 *
 * @returns 返回true表示是微信浏览器，false表示不是
 *
 * @example
 * if (isWeChat()) {
 *   console.log('当前在微信中打开')
 * }
 */
export function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}

/**
 * 异步延迟函数
 * 使当前执行流程延迟指定的毫秒数
 *
 * @param ms - 延迟的时间（毫秒）
 * @returns 返回Promise，延迟结束后resolve
 *
 * @example
 * async function example() {
 *   console.log('开始')
 *   await sleep(1000)
 *   console.log('1秒后')
 * }
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * 对异步函数进行重试，直到成功或达到最大重试次数
 *
 * @param fn - 需要重试的异步函数
 * @param retries - 最大重试次数，默认为3次
 * @param delay - 每次重试之间的延迟时间（毫秒），默认为1000ms
 * @returns 返回Promise，成功时resolve结果，失败时reject错误
 *
 * @example
 * retry(() => fetch('/api/data'), 3, 1000)
 *   .then(data => console.log('成功:', data))
 *   .catch(err => console.log('失败:', err))
 */
export function retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = async (remaining: number) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (remaining <= 1) {
          reject(error);
        } else {
          setTimeout(() => attempt(remaining - 1), delay);
        }
      }
    };
    attempt(retries);
  });
}

/**
 * 解析URL查询参数
 * 将URL字符串解析为URLSearchParams对象，方便获取查询参数
 *
 * @param url - 需要解析的URL字符串
 * @returns 返回URLSearchParams对象
 *
 * @example
 * const params = parseUrl('https://example.com?page=2&size=10')
 * params.get('page') // '2'
 * params.get('size') // '10'
 */
export function parseUrl(url: string): URLSearchParams {
  const urlObj = new URL(url);
  return urlObj.searchParams;
}

/**
 * 构建URL
 * 在基础URL上添加查询参数，返回完整的URL字符串
 *
 * @param base - 基础URL
 * @param params - 需要添加的查询参数对象
 * @returns 返回构建后的完整URL字符串
 *
 * @example
 * buildUrl('https://example.com/api', { page: 1, size: 10 })
 * // 'https://example.com/api?page=1&size=10'
 */
export function buildUrl(base: string, params: Record<string, any>): string {
  const urlObj = new URL(base);
  Object.keys(params).forEach(key => {
    urlObj.searchParams.set(key, String(params[key]));
  });
  return urlObj.toString();
}

/**
 * 判断值是否为空
 * 检查值是否为null、undefined、空字符串、空数组或空对象
 *
 * @param value - 需要检查的值
 * @returns 返回true表示为空，false表示不为空
 *
 * @example
 * isEmpty(null) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 * isEmpty([1, 2, 3]) // false
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * 判断两个值是否相等
 * 通过JSON.stringify比较两个值是否相等（深度比较）
 *
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 返回true表示相等，false表示不相等
 *
 * @example
 * isEqual({ a: 1 }, { a: 1 }) // true
 * isEqual({ a: 1 }, { a: 2 }) // false
 * isEqual([1, 2], [1, 2]) // true
 * isEqual([1, 2], [1, 3]) // false
 */
export function isEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * 排除对象属性
 * 从对象中排除指定的属性，返回新对象
 *
 * @param obj - 原始对象
 * @param keys - 需要排除的属性名数组
 * @returns 返回排除指定属性后的新对象
 *
 * @example
 * const user = { id: 1, name: '张三', password: '123456' }
 * omit(user, ['password'])
 * // { id: 1, name: '张三' }
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * 选择对象属性
 * 从对象中选择指定的属性，返回新对象
 *
 * @param obj - 原始对象
 * @param keys - 需要选择的属性名数组
 * @returns 返回只包含指定属性的新对象
 *
 * @example
 * const user = { id: 1, name: '张三', age: 25, email: 'test@example.com' }
 * pick(user, ['id', 'name'])
 * // { id: 1, name: '张三' }
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}
