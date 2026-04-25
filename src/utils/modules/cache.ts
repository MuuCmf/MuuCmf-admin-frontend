/**
 * 缓存模块
 * @param key 缓存键名
 * @param value 缓存值
 * @param expiration 过期时间，单位秒，默认10分钟
 * @returns 缓存值或false
 */
export function cache(key: string, value?: any, expiration: number = 600) {
  const nowTime: number = Date.parse(new Date().toString()) / 1000;

  if (value === undefined) {
    const val: any = localStorage.getItem(key);
    if (typeof val === 'string') {
      // 缓存存在，判断是否过期
      const temp: Array<any> = val.split('|_muu_|');
      if (!temp[1] || temp[1] <= nowTime) {
        localStorage.removeItem(key);
        console.log(key + '缓存已失效');
        return false;
      } else {
        return JSON.parse(temp[0]);
      }
    }
    return false;
  } else {
    const expire: number = nowTime + Number(expiration);
    localStorage.setItem(key, JSON.stringify(value) + '|_muu_|' + expire);
    //console.log('已经把' + key + '存入缓存,过期时间为' + expire)
    return false;
  }
}
