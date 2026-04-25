declare global {
  /**
   * 响应数据
   */
  interface ResponseData<T = any> {
    code: number;
    data: T;
    msg: string;
  }

  /**
   * 页签对象
   */
  interface TagView {
    /** 页签名称 */
    name: string;
    /** 页签标题 */
    title: string;
    /** 页签路由路径 */
    path: string;
    /** 页签路由完整路径 */
    fullPath: string;
    /** 页签图标 */
    icon?: string;
    /** 是否固定页签 */
    affix?: boolean;
    /** 是否开启缓存 */
    keepAlive?: boolean;
    /** 路由查询参数 */
    query?: any;
  }

  /**
   * 系统设置
   */
  interface AppSettings {
    /** 系统标题 */
    name: string;
    /** 系统版本 */
    version: string;
    /** 应用名称 */
    appName: string;
  }

  /**
   * 配置项
   */
  interface ConfigItem {
    /** 配置项ID */
    id: number;
    /** 配置项名称 */
    name: string;
    /** 配置项标题 */
    title: string;
    /** 配置项额外信息 */
    extra: string;
    /** 配置项值 */
    value: string;
    /** 配置项分组 */
    group: string;
    /** 配置项备注 */
    remark: string;
    /** 配置项类型 */
    type: string;
    /** 配置项缩略图 */
    thumb?: Record<string, string>;
    /** 配置项类型文本 */
    type_name?: string;
    /** 配置项分组文本 */
    group_name?: string;
    /** 配置项排序 */
    sort?: number;
    /** 配置项URL */
    url?: string;
  }

  /**
   * 配置分组
   */
  interface ConfigGroup {
    [key: string]: string;
  }

  /**
   * 菜单项
   */
  interface MenuItem {
    /** 菜单ID */
    id: string;
    /** 父级菜单ID */
    pid: string;
    /** 菜单标题 */
    title: string;
    /** 菜单URL */
    url: string;
    /** 菜单图标 */
    icon?: string;
    /** 模块名 */
    module?: string;
    /** 分组 */
    group?: string;
    /** 提示 */
    tip?: string;
    /** 类型 */
    type?: number;
    /** 是否开发环境 */
    is_dev?: number;
    /** 排序 */
    sort?: number;
    /** 是否显示 */
    hide?: number;
    /** 是否显示文本 */
    hide_str?: string;
    /** 类型文本 */
    type_str?: string;
    /** 子菜单列表 */
    _child?: MenuItem[];
    /** 子菜单列表 */
    lists?: MenuItem[];
  }

  /**
   * 菜单分组
   */
  interface MenuItemGroup {
    /** 分组ID */
    id: number;
    /** 分组名称 */
    title: string;
    /** 菜单列表 */
    lists: MenuItem[];
  }

  /**
   * 用户信息
   */
  interface UserInfo {
    /** 用户ID */
    uid: number;
    /** 用户昵称 */
    nickname: string;
    /** 密码 */
    password?: string;
    /** 确认密码 */
    confirmPassword?: string;
    /** 性别 */
    sex?: number;
    /** 性别文本 */
    sex_str?: string;
    /** 头像 */
    avatar?: string;
    /** 头像64 */
    avatar64?: string;
    /** 头像128 */
    avatar128?: string;
    /** 头像256 */
    avatar256?: string;
    /** 头像512 */
    avatar512?: string;
    /** 签名 */
    signature?: string;
    /** 用户名 */
    username?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    mobile?: string;
    /** 认证状态 */
    authentication?: number;
    /** 认证状态文本 */
    authentication_text?: string;
    /** 认证组 */
    auth_group?: object[];
    /** 积分 */
    score?: object[];
    /** 最后登录IP */
    last_login_ip?: string;
    /** 注册时间 */
    create_time?: string;
    /** 更新时间 */
    update_time?: string;
    /** 注册时间格式化 */
    create_time_str?: string;
    /** 更新时间格式化 */
    update_time_str?: string;
    /** 注册时间格式化友好 */
    create_time_friendly_str?: string;
    /** 更新时间格式化友好 */
    update_time_friendly_str?: string;
    /** 状态 */
    status?: number;
    /** 状态文本 */
    status_text?: string;
  }

  /**
   * 侧边栏菜单激活状态
   */
  interface AsideMenusActive {
    group_key: number;
    menu_key: number;
  }

  /**
   * 登录表单
   */
  interface LoginForm {
    username: string;
    password: string;
    captcha?: string;
  }

  /**
   * 请求配置
   */
  interface RequestConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  }
}
export {};
