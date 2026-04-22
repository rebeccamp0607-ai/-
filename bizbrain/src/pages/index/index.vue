<template>
  <view class="splash">
    <text class="splash-emoji">🧠</text>
    <text class="splash-title">BizBrain</text>
    <text class="splash-sub">商业思维训练营</text>
  </view>
</template>

<script setup lang="ts">
// This page is a splash screen only. App.vue handles routing on onLaunch.
</script>

<style>
.splash {
  min-height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.splash-emoji { font-size: 120rpx; margin-bottom: 32rpx; }
.splash-title { font-size: 64rpx; font-weight: 900; color: #e0e0f0; }
.splash-sub   { font-size: 32rpx; color: rgba(224,224,240,0.4); margin-top: 16rpx; }
</style>
