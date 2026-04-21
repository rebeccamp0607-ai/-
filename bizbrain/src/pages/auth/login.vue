<template>
  <view class="login-page">
    <view class="logo-area">
      <text class="logo-emoji">🧠</text>
      <text class="logo-title">BizBrain</text>
      <text class="logo-sub">商业思维训练营</text>
    </view>

    <view class="form-area">
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input
          v-model="phone"
          class="input-field"
          type="number"
          placeholder="请输入手机号"
          :maxlength="11"
        />
      </view>

      <view v-if="codeSent" class="input-group">
        <text class="input-label">验证码</text>
        <view class="code-row">
          <input v-model="code" class="input-field" type="number" placeholder="6位验证码" :maxlength="6" />
          <button class="btn-resend" :disabled="countdown > 0" @tap="sendCode">
            {{ countdown > 0 ? countdown + 's' : '重新发送' }}
          </button>
        </view>
      </view>

      <button
        v-if="!codeSent"
        class="btn-primary"
        :disabled="phone.length !== 11 || isSending"
        @tap="sendCode"
      >
        {{ isSending ? '发送中…' : '获取验证码' }}
      </button>

      <button
        v-else
        class="btn-primary"
        :disabled="code.length !== 6 || isVerifying"
        @tap="verify"
      >
        {{ isVerifying ? '登录中…' : '登录 / 注册' }}
      </button>
    </view>

    <text class="terms">登录即代表同意《用户协议》和《隐私政策》</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../../services/supabase'
import { useUserStore } from '../../stores/user'

const userStore  = useUserStore()
const phone      = ref('')
const code       = ref('')
const codeSent   = ref(false)
const isSending  = ref(false)
const isVerifying = ref(false)
const countdown  = ref(0)

async function sendCode(): Promise<void> {
  if (phone.value.length !== 11) return
  isSending.value = true
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: '+86' + phone.value,
    })
    if (error) throw error
    codeSent.value = true
    startCountdown()
  } catch (e: any) {
    uni.showToast({ title: e.message ?? '发送失败，请重试', icon: 'none' })
  } finally {
    isSending.value = false
  }
}

async function verify(): Promise<void> {
  if (code.value.length !== 6) return
  isVerifying.value = true
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: '+86' + phone.value,
      token: code.value,
      type: 'sms',
    })
    if (error) throw error
    await userStore.fetchProfile()
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (e: any) {
    uni.showToast({ title: e.message ?? '验证码错误', icon: 'none' })
  } finally {
    isVerifying.value = false
  }
}

function startCountdown(): void {
  countdown.value = 60
  const t = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(t)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #0a0a14;
  padding: 120rpx 48rpx 80rpx;
  display: flex;
  flex-direction: column;
}
.logo-area {
  text-align: center;
  margin-bottom: 96rpx;
}
.logo-emoji { font-size: 100rpx; display: block; margin-bottom: 20rpx; }
.logo-title { font-size: 56rpx; font-weight: 800; color: #e0e0f0; display: block; }
.logo-sub   { font-size: 30rpx; color: rgba(224,224,240,0.4); display: block; margin-top: 12rpx; }
.form-area  { display: flex; flex-direction: column; gap: 32rpx; margin-bottom: 48rpx; }
.input-group { display: flex; flex-direction: column; gap: 12rpx; }
.input-label { font-size: 28rpx; color: rgba(224,224,240,0.5); }
.input-field {
  background: #13131f;
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  padding: 28rpx;
  color: #e0e0f0;
  font-size: 34rpx;
  height: 96rpx;
}
.code-row { display: flex; gap: 16rpx; align-items: center; }
.code-row .input-field { flex: 1; }
.btn-resend {
  background: rgba(108,99,255,0.12);
  color: #6c63ff;
  border: 1rpx solid rgba(108,99,255,0.3);
  border-radius: 16rpx;
  font-size: 28rpx;
  padding: 0 24rpx;
  height: 96rpx;
  line-height: 96rpx;
  white-space: nowrap;
  &[disabled] { opacity: 0.4; }
}
.btn-primary {
  background: #6c63ff;
  color: #fff;
  border-radius: 24rpx;
  font-size: 36rpx;
  font-weight: 600;
  height: 100rpx;
  line-height: 100rpx;
  border: none;
  &[disabled] { opacity: 0.4; }
}
.terms {
  font-size: 24rpx;
  color: rgba(224,224,240,0.25);
  text-align: center;
  margin-top: auto;
}
</style>
