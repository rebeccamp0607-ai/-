<template>
  <view class="complete-page">
    <text class="emoji">🎉</text>
    <text class="title">关卡完成！</text>
    <text class="xp">+{{ xp }} XP</text>
    <button class="btn" @tap="goMap">返回地图</button>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChallengeStore } from '../../stores/challenge'

const store = useChallengeStore()
const xp = ref(store.xpEarned || 50)

function goMap(): void {
  store.reset()
  uni.switchTab({ url: '/pages/map/index' })
}
</script>

<style scoped>
.complete-page {
  min-height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
}
.emoji  { font-size: 120rpx; }
.title  { font-size: 52rpx; font-weight: 800; color: #e0e0f0; }
.xp     { font-size: 64rpx; font-weight: 900; color: #f0b429; }
.btn    { background: #6c63ff; color: #fff; border: none; border-radius: 24rpx; font-size: 34rpx; padding: 0 60rpx; height: 96rpx; line-height: 96rpx; margin-top: 40rpx; }
</style>
