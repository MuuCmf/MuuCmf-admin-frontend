/**
 * @description 判读是否为外链
 * @param path
 * @returns {boolean}
 */
export function isExternal(path: string) {
  return /^(https?:|mailto:|tel:|\/\/)/.test(path);
}

/**
 * @description 校验密码是否小于6位
 * @param value
 * @returns {boolean}
 */
export function isPassword(value: string | any[]) {
  return value.length >= 6;
}

/**
 * @description 判断是否为数字
 * @param value
 * @returns {boolean}
 */
export function isNumber(value: string) {
  const reg = /^[0-9]*$/;
  return reg.test(value);
}

/**
 * @description 判断是否是名称
 * @param value
 * @returns {boolean}
 */
export function isName(value: string) {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
  return reg.test(value);
}

/**
 * @description 判断是否为IP
 * @param ip
 * @returns {boolean}
 */
export function isIP(ip: string) {
  const reg =
    /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  return reg.test(ip);
}

/**
 * @description 判断是否是传统网站
 * @param url
 * @returns {boolean}
 */
export function isUrl(url: string) {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
}

/**
 * @description 判断是否是小写字母
 * @param value
 * @returns {boolean}
 */
export function isLowerCase(value: string) {
  const reg = /^[a-z]+$/;
  return reg.test(value);
}

/**
 * @description 判断是否是大写字母
 * @param value
 * @returns {boolean}
 */
export function isUpperCase(value: string) {
  const reg = /^[A-Z]+$/;
  return reg.test(value);
}

/**
 * @description 判断是否是大写字母开头
 * @param value
 * @returns {boolean}
 */
export function isAlphabets(value: string) {
  const reg = /^[A-Za-z]+$/;
  return reg.test(value);
}

/**
 * @description 判断是否是字符串
 * @param value
 * @returns {boolean}
 */
export function isString(value: any) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * @description 判断是否是数组
 * @param arg
 */
export function isArray(arg: string | (string | number)[]) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
  return Array.isArray(arg);
}

/**
 * @description 判断是否是端口号
 * @param value
 * @returns {boolean}
 */
export function isPort(value: string) {
  const reg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
  return reg.test(value);
}

/**
 * @description 判断是否是手机号
 * @param value
 * @returns {boolean}
 */
export function isPhone(value: string) {
  const reg = /^((13[0-9])|(14[5-7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\d{8}$/;
  return reg.test(value);
}

/**
 * @description 判断是否是身份证号(第二代)
 * @param value
 * @returns {boolean}
 */
export function isIdCard(value: string) {
  const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return reg.test(value);
}

/**
 * @description 判断是否是邮箱
 * @param value
 * @returns {boolean}
 */
export function isEmail(value: string) {
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  return reg.test(value);
}

/**
 * @description 判断是否中文
 * @param value
 * @returns {boolean}
 */
export function isChina(value: string) {
  const reg = /^[\u4E00-\u9FA5]{2,4}$/;
  return reg.test(value);
}

/**
 * @description 判断是否为空
 * @param value
 * @returns {boolean}
 */
export function isBlank(value: string | null) {
  return value === null || false || value === '' || value.trim() === '' || value.toLocaleLowerCase().trim() === 'null';
}

/**
 * @description 判断是否为固话
 * @param value
 * @returns {boolean}
 */
export function isTel(value: string) {
  const reg = /^(400|800)([0-9\\-]{7,10})|(([0-9]{4}|[0-9]{3})([- ])?)?([0-9]{7,8})(([- 转])*([0-9]{1,4}))?$/;
  return reg.test(value);
}

/**
 * @description 判断是否为数字且最多两位小数
 * @param value
 * @returns {boolean}
 */
export function isNum(value: string) {
  const reg = /^\d+(\.\d{1,2})?$/;
  return reg.test(value);
}

/**
 * @description 判断是否为json
 * @param value
 * @returns {boolean}
 */
export function isJson(value: string | null) {
  if (typeof value === 'string')
    try {
      const obj = JSON.parse(value);
      return !!(typeof obj === 'object' && obj);
    } catch {
      return false;
    }
  return false;
}

/**
 * @description 手机号码校验
 * @param value
 * @returns {boolean}
 */
export function validateIsphone(rule: any, value: any, callback: any) {
  if (value || rule.required) {
    if (!isPhone(value)) {
      callback(new Error('请输入正确的联系电话'));
    } else {
      callback();
    }
  } else {
    callback();
  }
}
/**
 * @description 电子邮箱校验
 * @param value
 * @returns {boolean}
 */
export function validateIsemail(rule: any, value: any, callback: any) {
  if (value || rule.required) {
    if (!isEmail(value)) {
      callback(new Error('请输入正确的电子邮箱'));
    } else {
      callback();
    }
  } else {
    callback();
  }
}

// 校验数字
export function validateNumber(rule: any, value: any, callback: any) {
  if (value || rule.required) {
    const v = value || '';
    const pattern = /^[0-9]{1,8}$/;
    if (!pattern.test(v)) {
      callback(new Error('请输入1-8位数字'));
    } else {
      callback();
    }
  } else {
    callback();
  }
}

/**
 * @description 数字校验保留小数后俩位
 * @param value
 * @returns {boolean}
 */
export function validateIsNum(value: any, callback: any) {
  const reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/;
  if (!reg.test(value)) {
    callback(new Error('请保留小数后俩位'));
  }
}

// 用户账号校验
export function validateCommonAccont(value: any, callback: any) {
  const commonNoChars = '~!@#$%^&*()_+|}{":?><,./;' + '’[]\\=-` ';
  const noChars = commonNoChars;
  const v = value || '';
  for (let i = 0; i < noChars.length; i++) {
    const char = noChars[i];
    if (v.indexOf(char) != -1) {
      callback(new Error('不能使用字符：' + noChars));
      return;
    }
  }
  const words = ['null', 'NULL', 'Null'];
  for (let i = 0; i < noChars.length; i++) {
    const word = words[i];
    if (v.indexOf(word) != -1) {
      callback(new Error('不能包含： ' + word));
      return;
    }
  }
  callback();
}

//域名校验
export function validateURL(value: any, callback: any) {
  const strRegex =
    '^((https|http|ftp|rtsp|mms)?://)' +
    "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + // ftp的user@
    '(([0-9]{1,3}.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
    '|' + // 允许IP和DOMAIN（域名）
    "([0-9a-z_!~*'()-]+.)*" + // 域名- www.
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // 二级域名
    '[a-z]{2,6})' + // first level domain- .com or .museum
    '(:[0-9]{1,4})?' + // 端口- :80
    '((/?)|' + // a slash isn't required if there is no file name
    "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  const re = new RegExp(strRegex);

  if (value && !re.test(value)) {
    callback(new Error('请输入正确地址'));
  }
  callback();
}

/**
 * @description 路由地址校验
 * @param value
 * @returns {boolean}
 */
export function validateCommonPath(value: any, callback: any) {
  const commonNoChars = '~!@#$%^&*()_+|}{":?><,.;' + '’[]\\=-` ';
  const noChars = commonNoChars;
  const v = value || '';

  for (let i = 0; i < noChars.length; i++) {
    const char = noChars[i];
    if (v.indexOf(char) != -1) {
      callback(new Error('不能使用字符：' + noChars));
      return;
    }
  }

  const words = ['null', 'NULL'];
  for (let i = 0; i < noChars.length; i++) {
    const word = words[i];
    if (v.indexOf(word) != -1) {
      callback(new Error('不能包含： ' + word));
      return;
    }
  }

  callback();
}

/**
 * 中文 + 字母 + 数字 + "-" 的组合
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
export function validateRoleRuler(value: any, callback: any) {
  const v = value || '';
  const commonNoChars = '~!@#$%^&*()+|}{":?><,./;' + '’[]\\=` ';
  const pattern = /[~!@#$%^&*()_+|}{":?><,./\\;'[\]=` 、]|([Nn][Uu][Ll][Ll])/;
  if (pattern.test(v)) {
    callback(new Error('不能使用' + commonNoChars));
    return;
  }
  callback();
}

/**
 * @description 数字校验保留小数后俩位
 * @param value
 * @returns {boolean}
 */
export function isNumberDot(value: any, callback: any) {
  if (value) {
    const reg = /^\d+\.?\d{0,2}$/;
    const flag = reg.test(value);
    if (!flag) {
      callback(new Error('请输入正确数字'));
    }
    callback();
  }
  callback();
}

/**
 * @description 百分制数字校验保留小数后俩位
 * @param value
 * @returns {boolean}
 */
export function isPerNumber(value: any, callback: any) {
  const reg = /^([0-9]\d{0,1}|100$)(\.\d{1,2})?$/;
  const flag = reg.test(value);
  if (!flag) {
    callback(new Error('请输入正确百分制数字'));
  }
  callback();
}
