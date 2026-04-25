<template>
  <div class="member-detail">
    <div class="detail-header">
      <h3>用户详情</h3>
      <el-button type="primary" link @click="handleClose">
        <safe-icon icon="fas times" />
      </el-button>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="user-profile">
        <div class="profile-avatar">
          <el-avatar :size="80" :src="userInfo.avatar64" :alt="userInfo.nickname">
            {{ (userInfo.nickname || userInfo.username || '').charAt(0) }}
          </el-avatar>
        </div>
        <div class="profile-info">
          <div class="profile-nickname">{{ userInfo.nickname }}</div>
          <div class="profile-username">@{{ userInfo.username }}</div>
          <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'" size="small">
            {{ userInfo.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </div>
      </div>

      <div class="detail-sections">
        <div class="section">
          <div class="section-title">基本信息</div>
          <div class="section-content">
            <div class="info-item">
              <span class="label">用户ID</span>
              <span class="value">{{ userInfo.uid }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户名</span>
              <span class="value">{{ userInfo.username || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">昵称</span>
              <span class="value">{{ userInfo.nickname || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱</span>
              <span class="value">{{ userInfo.email || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机</span>
              <span class="value">{{ userInfo.phone || userInfo.mobile || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别</span>
              <span class="value">{{ getSexText(userInfo.sex) }}</span>
            </div>
            <div class="info-item">
              <span class="label">认证状态</span>
              <span class="value">
                <el-tag :type="getAuthTagType(userInfo.authentication || 0)" size="small">
                  {{ userInfo.authentication_text }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">账号信息</div>
          <div class="section-content">
            <div class="info-item">
              <span class="label">状态</span>
              <span class="value">
                <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'" size="small">
                  {{ userInfo.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">注册渠道</span>
              <span class="value">{{ userInfo.reg_channel_str || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间</span>
              <span class="value">{{ userInfo.create_time_str || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录时间</span>
              <span class="value">{{ userInfo.last_login_time_str || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录IP</span>
              <span class="value">{{ userInfo.last_login_ip || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">登录次数</span>
              <span class="value">{{ userInfo.login || 0 }}</span>
            </div>
            <div v-if="userInfo.auth_group && userInfo.auth_group.length > 0" class="info-item">
              <span class="label">用户组</span>
              <span class="value">
                <el-tag
                  v-for="group in userInfo.auth_group"
                  :key="group.id"
                  type="info"
                  size="small"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ group.title }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">资产信息</div>
          <div class="section-content">
            <div v-for="item in userInfo.score" :key="item.id" class="info-item">
              <span class="label">{{ item.title }}</span>
              <span class="value">{{ item.value }} {{ item.unit }}</span>
            </div>
            <div class="info-item">
              <span class="label">钱包余额</span>
              <span class="value">{{ userInfo.wallet.balance || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">冻结金额</span>
              <span class="value">{{ userInfo.wallet.freeze || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">可用余额</span>
              <span class="value">{{ userInfo.wallet.able_balance || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">累计收益</span>
              <span class="value">{{ userInfo.wallet.revenue || 0 }}</span>
            </div>
          </div>
        </div>

        <div v-if="userInfo.signature" class="section">
          <div class="section-title">个性签名</div>
          <div class="section-content">
            <div class="info-item">
              <span class="value">{{ userInfo.signature }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getMemberDetail } from '@/api/admin/member';

interface ScoreItem {
  id: number;
  title: string;
  status: number;
  unit: string;
  value: number;
}

interface Wallet {
  balance: number;
  freeze: number;
  revenue: number;
  able_balance: number;
}

interface UserInfo {
  uid: number;
  username: string;
  nickname: string;
  avatar64: string;
  status: number;
  email: string;
  phone: string;
  mobile: string;
  authentication: number;
  authentication_text: string;
  sex: number;
  signature: string;
  create_time_str: string;
  last_login_time_str: string;
  last_login_ip: string;
  login: number;
  auth_group: any[];
  reg_channel_str: string;
  score: ScoreItem[];
  wallet: Wallet;
}

interface Props {
  uid: number;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const userInfo = ref<UserInfo>({
  uid: 0,
  username: '',
  nickname: '',
  avatar64: '',
  status: 0,
  email: '',
  phone: '',
  mobile: '',
  authentication: 0,
  authentication_text: '',
  sex: 0,
  signature: '',
  create_time_str: '',
  last_login_time_str: '',
  last_login_ip: '',
  login: 0,
  auth_group: [],
  reg_channel_str: '',
  score: [],
  wallet: {
    balance: 0,
    freeze: 0,
    revenue: 0,
    able_balance: 0
  }
});

const getSexText = (sex: number) => {
  switch (sex) {
    case 1:
      return '男';
    case 2:
      return '女';
    default:
      return '保密';
  }
};

const getAuthTagType = (val: number) => {
  switch (val) {
    case 1:
      return 'success';
    case 0:
      return 'info';
    case -1:
      return 'danger';
    default:
      return 'info';
  }
};

const getUserDetail = async () => {
  if (!props.uid) return;

  loading.value = true;
  try {
    const res = await getMemberDetail({
      uid: props.uid
    });

    if (res.code === 200) {
      userInfo.value = res.data || userInfo.value;
    } else {
      ElMessage.error(res.msg || '获取用户详情失败');
    }
  } catch (error) {
    console.error('获取用户详情失败:', error);
    ElMessage.error('获取用户详情失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('close');
};

watch(
  () => props.uid,
  newUid => {
    if (newUid) {
      getUserDetail();
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.member-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 24px;

  .profile-avatar {
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .profile-nickname {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .profile-username {
      font-size: 14px;
      color: #909399;
    }
  }
}

.detail-sections {
  .section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.section-content {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }

  .label {
    font-size: 14px;
    color: #909399;
    flex-shrink: 0;
  }

  .value {
    font-size: 14px;
    color: #303133;
    text-align: right;
    flex: 1;
    margin-left: 20px;
    word-break: break-all;
  }
}

html.dark {
  .detail-header {
    border-bottom: 1px solid #4c4d4f;

    h3 {
      color: #e5eaf3;
    }
  }

  .user-profile {
    background-color: #1f1f1f;

    .profile-nickname {
      color: #e5eaf3;
    }

    .profile-username {
      color: #a3a6ad;
    }
  }

  .section-title {
    color: #e5eaf3;
    border-left-color: #409eff;
  }

  .section-content {
    background-color: #1f1f1f;
  }

  .info-item {
    border-bottom: 1px solid #4c4d4f;

    .label {
      color: #a3a6ad;
    }

    .value {
      color: #e5eaf3;
    }
  }
}
</style>
