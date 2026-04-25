<template>
  <el-container class="main">
    <el-form :model="form" class="form" @keyup.enter="onSubmit">
      <div v-if="method == 'password'" class="method-item scan-qrcode-login" @click="changeLoginMethod()">
        <div class="login-method" data-type="scan">
          <div class="title">微信扫码登录</div>
          <div class="icon">
            <safe-icon icon="qrcode" />
          </div>
        </div>
      </div>

      <div v-if="method == 'scan'" class="method-item password-login" @click="changeLoginMethod()">
        <div class="login-method" data-type="normal">
          <div class="title">账号输入登录</div>
          <div class="icon">
            <safe-icon icon="user" />
          </div>
        </div>
      </div>

      <div v-if="method == 'password'" class="method-password-section">
        <div class="login-type">
          <div
            class="item"
            :class="inputLoginType == 'password' ? 'active' : ''"
            @click="changeInputLoginType('password')"
          >
            <span class="val">密码登录</span>
          </div>
          <div
            class="item"
            :class="inputLoginType == 'captcha' ? 'active' : ''"
            @click="changeInputLoginType('captcha')"
          >
            <span class="val">验证码登录</span>
          </div>
        </div>

        <div class="type-section">
          <el-form-item>
            <el-input v-model="form.account" class="input" placeholder="请输入账号/手机/邮箱" />
          </el-form-item>

          <el-form-item v-if="inputLoginType == 'password'">
            <el-input v-model="form.password" class="input" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item v-if="inputLoginType == 'captcha'" class="verify">
            <el-input v-model="form.verify" class="input" type="text" placeholder="请输入验证码">
              <template #append>
                <el-button
                  v-if="countDownTime == 60"
                  type="primary"
                  plain
                  :loading="sendCodeLoading"
                  @click="getVerify"
                  >{{ verifyCodeBtnText }}</el-button
                >
                <el-button v-else plain disabled @click="getVerify">{{ verifyCodeBtnText }}</el-button>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <el-form-item class="submit-sec">
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="onSubmit"
            >登录</el-button
          >
        </el-form-item>
      </div>

      <div v-if="method == 'scan'" class="method-scan-section">
        <h3>微信扫码登录</h3>
        <div class="qrcode-img-box">
          <img class="image" :src="qrcodeSrc" />
        </div>
        <div class="tip">请使用微信扫描二维码登录</div>
      </div>
    </el-form>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuth } from '@/composables/useAuth';
import { request } from '@/utils/modules/request';

const ENV = import.meta.env;
const { loading, login, sendVerifyCode } = useAuth();

const method = ref('password');
const inputLoginType = ref('password');
const sendCodeLoading = ref(false);
const verifyCodeBtnText = ref('获取验证码');
const countDownTime = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

const form = reactive({
  login_type: 'password',
  account: '',
  password: '',
  verify: '',
  channel: 'pc'
});

const sceneKey = ref('');
const qrcodeSrc = ref('assets/images/qrcode_preview.jpg');

const changeLoginMethod = async () => {
  if (method.value == 'password') {
    method.value = 'scan';
    await initWechatQrcode();
    await hasScan();
  } else {
    method.value = 'password';
  }
};

const changeInputLoginType = (val: string) => {
  inputLoginType.value = val;
  form.login_type = val;
};

const getVerify = async () => {
  if (!form.account) {
    ElMessage.warning('请输入账号');
    return;
  }

  sendCodeLoading.value = true;
  const result = await sendVerifyCode(form.account);
  sendCodeLoading.value = false;

  if (result.success) {
    startCountDown();
  }
};

const startCountDown = () => {
  countDownTime.value = 60;
  verifyCodeBtnText.value = `${countDownTime.value}s`;

  timer = setInterval(() => {
    if (countDownTime.value > 0) {
      verifyCodeBtnText.value = `${countDownTime.value}s`;
      countDownTime.value--;
    } else {
      clearInterval(timer!);
      countDownTime.value = 60;
      verifyCodeBtnText.value = '获取验证码';
    }
  }, 1000);
};

const initWechatQrcode = async () => {
  sceneKey.value = Number(Math.random().toString().substr(2, 48) + Date.now()).toString(36);

  let host = window.location.origin;
  if (ENV.MODE == 'development') {
    host = ENV.VITE_APP_SERVER;
  }
  if (ENV.MODE == 'production') {
    host = window.location.origin;
  }
  let path = `${host}/api/wechat/qrcode?scene_key=${sceneKey.value}`;
  qrcodeSrc.value = path;
};

const hasScan = async () => {
  if (method.value == 'scan') {
    request({
      url: 'api/wechat/has_scan',
      method: 'GET',
      data: {
        scene_key: sceneKey.value
      }
    }).then((res: any) => {
      if (res.code == 200) {
        scanLogin();
      } else {
        setTimeout(() => {
          hasScan();
        }, 3000);
      }
    });
  }
};

const scanLogin = async () => {
  const _result = await login({
    channel: 'pc',
    login_type: 'password'
  });
};

const onSubmit = async () => {
  if (!form.account) {
    ElMessage.warning('请输入账号');
    return;
  }

  if (inputLoginType.value == 'password' && !form.password) {
    ElMessage.warning('请输入密码');
    return;
  }

  if (inputLoginType.value == 'captcha' && !form.verify) {
    ElMessage.warning('请输入验证码');
    return;
  }

  await login(form);
};

onMounted(() => {
  if (method.value == 'scan') {
    initWechatQrcode();
    hasScan();
  }
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped lang="scss">
.main {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  align-items: center;
  background-color: #f2f2f2;

  .form {
    width: 600px;
    min-height: 400px;
    background-color: #fff;
    border-radius: 20px;
    padding: 32px 20px 40px 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.01);
    margin-top: 218px;

    .method-item {
      .login-method {
        display: flex;

        .title {
          height: 26px;
          border: 1px solid #d4d4d4;
          font-size: 13px;
          color: #777;
          margin-left: auto;
          margin-top: 24px;
          line-height: 24px;
          padding: 0 15px 0 12px;
          position: relative;
          z-index: 1;

          &::after {
            content: '';
            width: 10px;
            height: 10px;
            background: #fff;
            position: absolute;
            top: 7px;
            right: -6px;
            transform-origin: 0, 0;
            transform: rotate(45deg);
            border-top: 1px solid #d4d4d4;
            border-right: 1px solid #d4d4d4;
          }
        }

        .icon {
          font-size: 46px;
          color: #999;
          position: relative;
          cursor: pointer;

          &::after {
            content: '';
            width: 62px;
            height: 30px;
            background: #fff;
            position: absolute;
            top: 28px;
            left: -20px;
            transform-origin: 0, 0;
            transform: rotate(45deg);
          }
        }
      }
    }

    .method-password-section {
      width: 380px;
      margin: 20px auto;

      .login-type {
        display: flex;
        align-items: center;
        width: 100%;
        height: 50px;
        padding: 0 20px;
        margin-bottom: 35px;

        .item {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--text-color-light);
          font-size: 20px;
          cursor: pointer;

          .val {
            padding: 5px 0;
            border-bottom: 4px solid #fff;
          }
        }

        .active {
          .val {
            border-bottom: 4px solid #333;
          }
        }
      }

      .type-section {
        margin-bottom: 48px;
      }

      .el-form-item {
        margin-bottom: 30px;
      }

      .input {
        border: 0;
        border-bottom: 1px solid #ddd;

        :deep(.el-input__wrapper) {
          font-size: 15px;
          box-shadow: none !important;
        }
      }

      .verify {
        :deep(.el-input-group__append) {
          box-shadow: none !important;
          margin-bottom: 5px;
          border-radius: 8px;

          .el-button {
            font-size: 15px;
          }
        }
      }

      .submit-sec {
        text-align: center;

        .submit-btn {
          display: block;
          padding: 20px 0;
          height: 56px;
          font-size: 18px;
          flex: 1;
        }
      }
    }

    .method-scan-section {
      h3 {
        text-align: center;
        line-height: 50px;
      }

      .qrcode-img-box {
        width: 268px;
        height: 268px;
        margin: 10px auto;
        background-color: #f2f2f2;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .tip {
        font-size: 14px;
        line-height: 32px;
        color: var(--text-color-light);
        text-align: center;
      }
    }
  }
}

.dark .main {
  background-color: #1a1a1a;

  .form {
    background-color: #262626;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.4);

    .method-item {
      .login-method {
        .title {
          border-color: #363636;
          color: #a8a8a7;
          background-color: #262626;

          &::after {
            background: #262626;
            border-top-color: #363636;
            border-right-color: #363636;
          }
        }

        .icon {
          color: #a8a8a7;

          &::after {
            background: #262626;
          }

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }

    .method-password-section {
      .login-type {
        .item {
          color: #e5e5e5;

          .val {
            border-bottom-color: #262626;
          }
        }

        .active {
          .val {
            border-bottom-color: var(--el-color-primary);
          }
        }
      }

      .input {
        border-bottom-color: #363636;

        :deep(.el-input__wrapper) {
          background-color: transparent;

          .el-input__inner {
            color: #e5e5e5;
            &::placeholder {
              color: #666;
            }
          }
        }

        &:focus-within {
          border-bottom-color: var(--el-color-primary);
        }
      }

      .verify {
        :deep(.el-input-group__append) {
          background-color: #333333;
          border-color: #363636;

          .el-button {
            color: #e5e5e5;
            border-color: #363636;

            &:hover {
              background-color: #404040;
            }
          }
        }
      }
    }

    .method-scan-section {
      h3 {
        color: #e5e5e5;
      }

      .qrcode-img-box {
        background-color: #333333;
        border: 1px solid #363636;
      }

      .tip {
        color: #a8a8a7;
      }
    }
  }
}
</style>
