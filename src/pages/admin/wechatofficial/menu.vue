<template>
  <div class="page-container">
    <div class="page-content">
      <div class="with-container">
        <div class="menu-editor-wrapper">
          <div class="menu-preview">
            <div class="phone-frame">
              <div class="phone-screen">
                <div class="phone-header">
                  <div class="phone-time">{{ currentTime }}</div>
                  <div class="phone-icons">
                    <span class="icon">🔋</span>
                  </div>
                </div>
                <div class="phone-body">
                  <div class="chat-message">
                    <div class="message-content">
                      <div class="avatar">
                        <img v-if="config.cover_url" :src="config.cover_url" alt="avatar" />
                        <div v-else class="default-avatar">📱</div>
                      </div>
                      <div class="message-text">
                        <div class="account-name">{{ config.title || '公众号名称' }}</div>
                        <div class="message-bubble">欢迎关注公众号！</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="phone-footer">
                  <div class="menu-bar">
                    <div
                      v-for="(menu, index) in menuList"
                      :key="index"
                      class="menu-item"
                      :class="{ active: activeMenuIndex === index }"
                      @click="handleMenuClick(index)"
                    >
                      <div class="menu-name">{{ menu.name }}</div>
                      <div v-if="menu.sub_button && menu.sub_button.length > 0" class="sub-menu">
                        <div
                          v-for="(subMenu, subIndex) in menu.sub_button"
                          :key="subIndex"
                          class="sub-menu-item"
                          @click.stop="handleSubMenuClick(index, subIndex)"
                        >
                          {{ subMenu.name }}
                        </div>
                      </div>
                    </div>
                    <div v-if="menuList.length < 3" class="menu-item add-menu" @click="handleAddMenu">
                      <div class="menu-name">+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="menu-config">
            <div class="config-header">
              <h4>菜单配置</h4>
              <div class="actions">
                <el-button type="primary" :loading="saveLoading" @click="handleSave">发布菜单</el-button>
                <el-button @click="handleClear">清空菜单</el-button>
              </div>
            </div>

            <div v-if="activeMenu !== null" class="config-content">
              <div v-if="!activeMenu.sub_button || activeMenu.sub_button.length === 0" class="menu-type-tabs">
                <el-radio-group v-model="activeMenu.type" @change="handleTypeChange">
                  <el-radio value="click">点击事件</el-radio>
                  <el-radio value="view">跳转链接</el-radio>
                  <el-radio value="miniprogram">跳转小程序</el-radio>
                  <el-radio value="media_id">发送消息</el-radio>
                  <el-radio value="scancode_push">扫码推事件</el-radio>
                  <el-radio value="scancode_waitmsg">扫码带提示</el-radio>
                  <el-radio value="pic_sysphoto">系统拍照发图</el-radio>
                  <el-radio value="pic_photo_or_album">拍照或者相册</el-radio>
                  <el-radio value="pic_weixin">微信相册发图</el-radio>
                  <el-radio value="location_select">发送位置</el-radio>
                </el-radio-group>
              </div>

              <el-form :model="activeMenu" label-width="100px">
                <el-form-item label="菜单名称">
                  <el-input
                    v-model="activeMenu.name"
                    maxlength="16"
                    show-word-limit
                    :placeholder="isSubMenu ? '请输入子菜单名称（最多8个字）' : '请输入菜单名称（最多4个字）'"
                  />
                </el-form-item>

                <template v-if="!activeMenu.sub_button || activeMenu.sub_button.length === 0">
                  <el-form-item v-if="activeMenu.type === 'click'" label="菜单KEY">
                    <el-input v-model="activeMenu.key" placeholder="请输入菜单KEY值" />
                    <div class="form-tip">用于后台接收点击事件，建议使用英文和下划线</div>
                  </el-form-item>

                  <el-form-item v-if="activeMenu.type === 'view'" label="跳转链接">
                    <el-input v-model="activeMenu.url" placeholder="请输入跳转链接，以http://或https://开头" />
                    <div class="form-tip">用户点击菜单会跳转到该链接</div>
                  </el-form-item>

                  <el-form-item v-if="activeMenu.type === 'miniprogram'" label="小程序AppID">
                    <el-input v-model="activeMenu.appid" placeholder="请输入小程序AppID" />
                    <div class="form-tip">小程序的AppID</div>
                  </el-form-item>

                  <el-form-item v-if="activeMenu.type === 'miniprogram'" label="小程序路径">
                    <el-input v-model="activeMenu.pagepath" placeholder="请输入小程序页面路径" />
                    <div class="form-tip">小程序的页面路径，如 pages/index/index</div>
                  </el-form-item>

                  <el-form-item v-if="activeMenu.type === 'miniprogram'" label="备用网页">
                    <el-input v-model="activeMenu.url" placeholder="请输入备用网页链接" />
                    <div class="form-tip">旧版微信客户端无法打开小程序时打开的网页</div>
                  </el-form-item>

                  <el-form-item v-if="activeMenu.type === 'media_id'" label="消息类型">
                    <el-select
                      v-model="activeMenu.material_type"
                      placeholder="请选择消息类型"
                      @change="handleMsgTypeChange"
                    >
                      <el-option label="图片" value="image" />
                      <el-option label="语音" value="voice" />
                      <el-option label="视频" value="video" />
                      <el-option label="图文" value="news" />
                    </el-select>
                    <div class="form-tip">选择要发送的消息类型</div>
                  </el-form-item>

                  <el-form-item v-if="activeMenu.type === 'media_id' && activeMenu.material_type" label="选择素材">
                    <el-select
                      v-model="activeMenu.media_id"
                      placeholder="请选择素材"
                      filterable
                      :loading="materialLoading"
                      @focus="loadMaterials"
                      @change="handleMaterialChange"
                    >
                      <el-option
                        v-for="item in materialList"
                        :key="item.media_id"
                        :label="item.name"
                        :value="item.media_id"
                      />
                    </el-select>
                    <div class="form-tip">选择要发送的素材</div>
                  </el-form-item>
                </template>

                <el-form-item>
                  <el-button type="danger" @click="handleDeleteMenu">删除菜单</el-button>
                  <el-button v-if="isSubMenu && activeSubMenuIndex > 0" @click="handleMoveSubMenu(-1)">上移</el-button>
                  <el-button
                    v-if="
                      isSubMenu &&
                      currentParentMenu &&
                      currentParentMenu.sub_button &&
                      activeSubMenuIndex < currentParentMenu.sub_button.length - 1
                    "
                    @click="handleMoveSubMenu(1)"
                    >下移</el-button
                  >
                  <el-button
                    v-if="!isSubMenu && (!activeMenu.sub_button || activeMenu.sub_button.length < 5)"
                    @click="handleAddSubMenu"
                    >添加子菜单</el-button
                  >
                </el-form-item>
                <el-form-item v-if="!isSubMenu && activeMenu.sub_button && activeMenu.sub_button.length > 0">
                  <el-tag type="info"> 已添加 {{ activeMenu.sub_button.length }} 个子菜单 </el-tag>
                </el-form-item>
              </el-form>
            </div>

            <div v-else class="config-empty">
              <el-icon :size="48" color="#c0c4cc">
                <Menu />
              </el-icon>
              <p>请点击左侧菜单进行配置</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Menu } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { request } from '@/utils/modules/request';

interface MenuItem {
  name: string;
  type?: string;
  key?: string;
  url?: string;
  appid?: string;
  pagepath?: string;
  msg_type?: string;
  material_type?: string;
  media_id?: string;
  material?: any;
  sub_button?: MenuItem[];
}

interface MaterialItem {
  media_id: string;
  name: string;
  type: string;
  update_time: number;
  url?: string;
  title?: string;
  thumb_url?: string;
  content?: any;
}

const menuList = ref<MenuItem[]>([]);
const activeMenuIndex = ref<number>(-1);
const activeSubMenuIndex = ref<number>(-1);
const activeMenu = ref<MenuItem | null>(null);
const saveLoading = ref(false);
const materialLoading = ref(false);
const materialList = ref<MaterialItem[]>([]);
const config = reactive({
  title: '',
  cover_url: ''
});

const currentTime = ref('');

const isSubMenu = computed(() => activeSubMenuIndex.value !== -1);

const currentParentMenu = computed(() => {
  if (activeMenuIndex.value === -1) {
    return null;
  }
  return menuList.value[activeMenuIndex.value] || null;
});

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 获取配置
const getConfig = async () => {
  try {
    const res = await request({
      url: 'admin/wechat/config',
      method: 'GET'
    });
    if (res.code === 200) {
      config.title = res.data.title || '';
      config.cover_url = res.data.cover_url || '';
    }
  } catch (error) {
    console.error('获取配置失败:', error);
  }
};

// 获取菜单
const getMenu = async () => {
  try {
    const res = await request({
      url: 'admin/wechat/menu',
      method: 'GET',
      data: {
        output: 'json'
      }
    });
    if (res.code === 200) {
      const data = res.data || {};
      let buttons: any[] = [];
      if (Array.isArray(data)) {
        buttons = data;
      } else {
        buttons = data.button || [];
      }

      menuList.value = buttons.map((item: any) => {
        const menuItem: MenuItem = {
          name: item.name || '菜单名称'
        };
        if (item.type) menuItem.type = item.type;
        if (item.key) menuItem.key = item.key;
        if (item.url) menuItem.url = item.url;
        if (item.appid) menuItem.appid = item.appid;
        if (item.pagepath) menuItem.pagepath = item.pagepath;
        if (item.material_type) menuItem.material_type = item.material_type;
        if (item.media_id) menuItem.media_id = item.media_id;
        if (item.msg_type) menuItem.msg_type = item.msg_type;

        if (item.sub_button && Array.isArray(item.sub_button)) {
          menuItem.sub_button = item.sub_button.map((sub: any) => {
            const subItem: MenuItem = {
              name: sub.name || '子菜单名称'
            };
            if (sub.type) subItem.type = sub.type;
            if (sub.key) subItem.key = sub.key;
            if (sub.url) subItem.url = sub.url;
            if (sub.appid) subItem.appid = sub.appid;
            if (sub.pagepath) subItem.pagepath = sub.pagepath;
            if (sub.material_type) subItem.material_type = sub.material_type;
            if (sub.media_id) subItem.media_id = sub.media_id;
            if (sub.msg_type) subItem.msg_type = sub.msg_type;
            return subItem;
          });
        }

        return menuItem;
      });
    }
  } catch (error) {
    console.error('获取菜单失败:', error);
  }
};

const handleMenuClick = (index: number) => {
  const menu = menuList.value[index];
  activeMenuIndex.value = index;
  activeSubMenuIndex.value = -1;
  activeMenu.value = menu;
  console.log('选中菜单:', menu);
  console.log('material_type:', menu.material_type);
  console.log('material:', menu.material);
};

const handleSubMenuClick = (menuIndex: number, subIndex: number) => {
  activeMenuIndex.value = menuIndex;
  activeSubMenuIndex.value = subIndex;
  const parentMenu = menuList.value[menuIndex];
  if (parentMenu.sub_button && parentMenu.sub_button[subIndex]) {
    activeMenu.value = parentMenu.sub_button[subIndex];
  }
};

const handleAddMenu = () => {
  if (menuList.value.length >= 3) {
    ElMessage.warning('最多只能添加3个一级菜单');
    return;
  }
  menuList.value.push({
    name: '菜单名称'
  });
  activeMenuIndex.value = menuList.value.length - 1;
  activeSubMenuIndex.value = -1;
  activeMenu.value = menuList.value[menuList.value.length - 1];
};

const handleAddSubMenu = () => {
  if (!activeMenu.value) return;
  if (!activeMenu.value.sub_button) {
    activeMenu.value.sub_button = [];
  }
  if (activeMenu.value.sub_button.length >= 5) {
    ElMessage.warning('最多只能添加5个二级菜单');
    return;
  }
  const newSubMenu = {
    name: '子菜单名称'
  };
  activeMenu.value.sub_button.push(newSubMenu);
  activeSubMenuIndex.value = activeMenu.value.sub_button.length - 1;
  activeMenu.value = activeMenu.value.sub_button[activeSubMenuIndex.value];
};

const handleDeleteMenu = () => {
  ElMessageBox.confirm('确定要删除此菜单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (isSubMenu.value) {
        const parentMenu = menuList.value[activeMenuIndex.value];
        if (parentMenu.sub_button) {
          parentMenu.sub_button.splice(activeSubMenuIndex.value, 1);
          if (parentMenu.sub_button.length === 0) {
            delete parentMenu.sub_button;
            activeMenu.value = parentMenu;
            activeSubMenuIndex.value = -1;
          } else {
            if (activeSubMenuIndex.value >= parentMenu.sub_button.length) {
              activeSubMenuIndex.value = parentMenu.sub_button.length - 1;
            }
            activeMenu.value = parentMenu.sub_button[activeSubMenuIndex.value];
          }
        }
      } else {
        menuList.value.splice(activeMenuIndex.value, 1);
        activeMenu.value = null;
        activeMenuIndex.value = -1;
        activeSubMenuIndex.value = -1;
      }
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

const handleMoveSubMenu = (direction: number) => {
  if (activeMenuIndex.value === -1) {
    return;
  }

  const parentMenu = menuList.value[activeMenuIndex.value];
  if (!parentMenu || !parentMenu.sub_button) {
    return;
  }

  const currentIndex = activeSubMenuIndex.value;
  const newIndex = currentIndex + direction;

  if (newIndex < 0 || newIndex >= parentMenu.sub_button.length) {
    return;
  }

  const temp = parentMenu.sub_button[currentIndex];
  parentMenu.sub_button[currentIndex] = parentMenu.sub_button[newIndex];
  parentMenu.sub_button[newIndex] = temp;

  activeSubMenuIndex.value = newIndex;
  activeMenu.value = parentMenu.sub_button[newIndex];

  ElMessage.success(direction < 0 ? '上移成功' : '下移成功');
};

const handleTypeChange = () => {
  if (activeMenu.value) {
    delete activeMenu.value.key;
    delete activeMenu.value.url;
    delete activeMenu.value.appid;
    delete activeMenu.value.pagepath;
    delete activeMenu.value.msg_type;
    delete activeMenu.value.material_type;
    delete activeMenu.value.media_id;
    delete activeMenu.value.material;
  }
};

// 素材选择变化时的处理方法
const handleMaterialChange = () => {
  console.log('Selected material:', activeMenu.value?.media_id);
};

const handleMsgTypeChange = () => {
  if (activeMenu.value) {
    delete activeMenu.value.media_id;
    delete activeMenu.value.material;
    materialList.value = [];
  }
};

const loadMaterials = async () => {
  if (!activeMenu.value || !activeMenu.value.material_type) {
    return;
  }

  materialLoading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat/material/list',
      method: 'POST',
      data: {
        type: activeMenu.value.material_type,
        page: 1
      }
    });
    if (res.code === 200) {
      const data = res.data || {};
      const items = data.item || [];
      materialList.value = items.map((item: any) => {
        const materialItem: MaterialItem = {
          media_id: item.media_id,
          name: item.name || item.title || item.media_id,
          type: item.type,
          update_time: item.update_time
        };

        if (item.url) {
          materialItem.url = item.url;
        }
        if (item.thumb_url) {
          materialItem.thumb_url = item.thumb_url;
        }
        if (item.content) {
          materialItem.content = item.content;
        }
        if (item.title) {
          materialItem.title = item.title;
        }

        return materialItem;
      });
    }
  } catch (error) {
    console.error('获取素材失败:', error);
    ElMessage.error('获取素材失败');
  } finally {
    materialLoading.value = false;
  }
};

const handleSave = async () => {
  for (let i = 0; i < menuList.value.length; i++) {
    const item = menuList.value[i];
    if (!item.name || item.name.trim() === '') {
      ElMessage.error(`第 ${i + 1} 个一级菜单名称不能为空`);
      return;
    }
    if (item.sub_button && item.sub_button.length > 0) {
      for (let j = 0; j < item.sub_button.length; j++) {
        const sub = item.sub_button[j];
        if (!sub.name || sub.name.trim() === '') {
          ElMessage.error(`第 ${i + 1} 个一级菜单的第 ${j + 1} 个子菜单名称不能为空`);
          return;
        }
      }
    }
  }

  const menuData = menuList.value.map(item => {
    const menuItem: any = {
      name: item.name || '菜单名称'
    };
    if (item.sub_button && item.sub_button.length > 0) {
      menuItem.sub_button = item.sub_button.map(sub => {
        const subItem: any = {
          name: sub.name || '子菜单名称'
        };
        if (sub.type) {
          subItem.type = sub.type;
        }
        if (sub.key) {
          subItem.key = sub.key;
        }
        if (sub.url) {
          subItem.url = sub.url;
        }
        if (sub.appid) {
          subItem.appid = sub.appid;
        }
        if (sub.pagepath) {
          subItem.pagepath = sub.pagepath;
        }
        if (sub.material_type) {
          subItem.material_type = sub.material_type;
        }
        if (sub.media_id) {
          subItem.media_id = sub.media_id;
        }
        return subItem;
      });
    } else {
      if (item.type) {
        menuItem.type = item.type;
      }
      if (item.key) {
        menuItem.key = item.key;
      }
      if (item.url) {
        menuItem.url = item.url;
      }
      if (item.appid) {
        menuItem.appid = item.appid;
      }
      if (item.pagepath) {
        menuItem.pagepath = item.pagepath;
      }
      if (item.material_type) {
        menuItem.material_type = item.material_type;
      }
      if (item.media_id) {
        menuItem.media_id = item.media_id;
      }
    }
    return menuItem;
  });

  saveLoading.value = true;
  try {
    const res = await request({
      url: 'admin/wechat/menu',
      method: 'POST',
      data: {
        json: JSON.stringify(menuData)
      }
    });
    if (res.code === 200) {
      ElMessage.success('发布成功');
    } else {
      ElMessage.error(res.msg || '发布失败');
    }
  } catch (error) {
    console.error('发布失败:', error);
    ElMessage.error('发布失败');
  } finally {
    saveLoading.value = false;
  }
};

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有菜单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      menuList.value = [];
      activeMenu.value = null;
      activeMenuIndex.value = -1;
      activeSubMenuIndex.value = -1;
      ElMessage.success('清空成功');
    })
    .catch(() => {});
};

let timer: number;

onMounted(() => {
  getConfig();
  getMenu();
  updateTime();
  timer = setInterval(updateTime, 1000) as unknown as number;
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.page-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.page-content {
  padding: 20px;
}

.menu-editor-wrapper {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.menu-preview {
  flex-shrink: 0;
}

.phone-frame {
  width: 320px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 8px solid #1a1a1a;
}

.phone-screen {
  display: flex;
  flex-direction: column;
  height: 580px;
  background: #f5f5f5;
}

.phone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #1a1a1a;
  color: #fff;
}

.phone-time {
  font-size: 14px;
  font-weight: 500;
}

.phone-icons {
  display: flex;
  gap: 8px;

  .icon {
    font-size: 14px;
  }
}

.phone-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.chat-message {
  margin-bottom: 20px;
}

.message-content {
  display: flex;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .default-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #409eff;
    color: #fff;
    font-size: 20px;
  }
}

.message-text {
  flex: 1;
}

.account-name {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.message-bubble {
  background: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  color: #303133;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.phone-footer {
  background: #f7f7f7;
  border-top: 1px solid #e4e7ed;
}

.menu-bar {
  display: flex;
  height: 50px;
}

.menu-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-right: 1px solid #e4e7ed;
  transition: background-color 0.3s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: #f0f0f0;
  }

  &.active {
    background: #e6f7ff;
  }

  &.add-menu {
    font-size: 24px;
    color: #909399;
  }
}

.menu-name {
  font-size: 14px;
  color: #303133;
}

.sub-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.sub-menu-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.menu-config {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  min-height: 580px;
  display: flex;
  flex-direction: column;
}

.config-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .actions {
    display: flex;
    gap: 12px;
  }
}

.config-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.config-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.menu-type-tabs {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  :deep(.el-radio) {
    margin-right: 0;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
  display: block;
  width: 100%;
  clear: both;
  margin-left: 0;
  float: none;
}

:deep(.el-form-item__content) {
  .form-tip {
    margin-left: 0 !important;
    display: block !important;
    width: 100% !important;
  }
}

html.dark {
  .page-header {
    background-color: #262626;
  }

  .page-content {
    background-color: #262626;
  }

  .phone-frame {
    background: #262626;
    border-color: #363636;
  }

  .phone-screen {
    background: #1a1a1a;
  }

  .phone-header {
    background: #262626;
  }

  .message-bubble {
    background: #333333;
    color: #e5e5e5;
  }

  .phone-footer {
    background: #262626;
  }

  .menu-bar {
    background: #262626;
  }

  .menu-item {
    border-right-color: #363636;

    &:hover {
      background: #333333;
    }

    &.active {
      background: #1a3a5c;
    }
  }

  .menu-name {
    color: #e5e5e5;
  }

  .sub-menu {
    background: #262626;
    border-color: #363636;
  }

  .sub-menu-item {
    color: #e5e5e5;
    border-bottom-color: #363636;

    &:hover {
      background: #333333;
    }
  }

  .menu-config {
    background: #262626;
  }

  .config-header {
    border-bottom-color: #363636;

    h4 {
      color: #e5e5e5;
    }
  }

  .menu-type-tabs {
    border-bottom-color: #363636;
  }
}
</style>
