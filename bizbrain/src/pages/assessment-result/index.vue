<template>
  <view class="result" :style="{ '--type-color': typeColor }">
    <view class="header">
      <text class="emoji">{{ result.typeEmoji }}</text>
      <text class="type-name">{{ result.type }}</text>
      <text class="type-label">{{ typeInfo?.name }}</text>
    </view>

    <view class="card traits-card">
      <text class="card-title">你的思维特征</text>
      <view class="traits">
        <view v-for="(trait, i) in result.traits" :key="i" class="trait-item">
          <text class="trait-dot">·</text>
          <text class="trait-text">{{ trait }}</text>
        </view>
      </view>
    </view>

    <view class="card blind-card">
      <text class="card-title">⚠️ 你的盲区</text>
      <text class="blind-text">{{ result.blindSpot }}</text>
    </view>

    <view class="card encourage-card">
      <text class="encourage-text">{{ result.encouragement }}</text>
    </view>

    <view class="start-hint">
      <text class="start-label">推荐起点</text>
      <text class="start-value">{{ result.recommendedStart }}</text>
    </view>

    <view class="actions">
      <button class="btn-share" @tap="shareResult">分享给朋友</button>
      <button class="btn-start" @tap="goMap">开始闯关 →</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AssessmentResult } from '../../prompts/assessment-analysis'
import { THINKING_TYPES } from '../../data/thinking-types'

const result = ref<AssessmentResult>({
  type: '白纸型',
  typeEmoji: '🌱',
  traits: ['对商业世界充满好奇', '没有固有偏见，可塑性强', '愿意从零开始学习'],
  blindSpot: '缺乏基础框架',
  encouragement: '每一个商业大咖都是从这里开始的！',
  recommendedStart: '新手村第一关',
})

const typeInfo = computed(() => THINKING_TYPES[result.value.type])
const typeColor = computed(() => typeInfo.value?.color ?? '#6c63ff')

onMounted(() => {
  const stored = uni.getStorageSync('biz_assessment_result')
  if (stored) {
    try { result.value = JSON.parse(stored) } catch {}
  }
})

function shareResult(): void {
  uni.showShareMenu({ withShareTicket: true })
}

function goMap(): void {
  uni.switchTab({ url: '/pages/map/index' })
}
</script>

<style lang="scss" scoped>
.result {
  min-height: 100vh;
  background: #0a0a14;
  padding: 60rpx 40rpx 80rpx;
}
.header {
  text-align: center;
  margin-bottom: 48rpx;
}
.emoji {
  font-size: 120rpx;
  display: block;
  margin-bottom: 24rpx;
}
.type-name {
  font-size: 60rpx;
  font-weight: 800;
  color: var(--type-color);
  display: block;
}
.type-label {
  font-size: 30rpx;
  color: rgba(224,224,240,0.5);
  display: block;
  margin-top: 12rpx;
}
.card {
  background: #13131f;
  border-radius: 28rpx;
  padding: 40rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.card-title {
  font-size: 28rpx;
  color: rgba(224,224,240,0.45);
  display: block;
  margin-bottom: 28rpx;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}
.traits { display: flex; flex-direction: column; gap: 20rpx; }
.trait-item { display: flex; align-items: flex-start; gap: 16rpx; }
.trait-dot { color: var(--type-color); font-size: 36rpx; line-height: 1.2; }
.trait-text { font-size: 32rpx; color: #e0e0f0; line-height: 1.6; }
.blind-card { border-color: rgba(255,107,107,0.2); }
.blind-text { font-size: 32rpx; color: rgba(224,224,240,0.8); line-height: 1.6; }
.encourage-card { background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.2); }
.encourage-text { font-size: 32rpx; color: rgba(224,224,240,0.85); line-height: 1.8; font-style: italic; }
.start-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 40rpx;
  background: rgba(240,180,41,0.08);
  border-radius: 20rpx;
  margin-bottom: 48rpx;
  border: 1rpx solid rgba(240,180,41,0.2);
}
.start-label { font-size: 28rpx; color: rgba(240,180,41,0.7); }
.start-value { font-size: 30rpx; color: #f0b429; font-weight: 600; }
.actions { display: flex; flex-direction: column; gap: 20rpx; }
.btn-start {
  background: #6c63ff;
  color: #fff;
  border-radius: 24rpx;
  font-size: 36rpx;
  font-weight: 700;
  height: 100rpx;
  line-height: 100rpx;
  border: none;
}
.btn-share {
  background: rgba(255,255,255,0.06);
  color: rgba(224,224,240,0.6);
  border-radius: 24rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  border: 1rpx solid rgba(255,255,255,0.1);
}
</style>
