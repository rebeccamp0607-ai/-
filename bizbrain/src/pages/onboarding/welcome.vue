<template>
  <view class="welcome">
    <swiper class="swiper" :current="slide" :indicator-dots="true" indicator-color="rgba(255,255,255,0.3)" indicator-active-color="#6c63ff" @change="onSlideChange">
      <swiper-item v-for="(item, i) in slides" :key="i" class="slide">
        <view class="slide-content">
          <text class="slide-emoji">{{ item.emoji }}</text>
          <text class="slide-title">{{ item.title }}</text>
          <text class="slide-desc">{{ item.desc }}</text>
        </view>
      </swiper-item>
    </swiper>

    <view class="bottom">
      <button v-if="slide < slides.length - 1" class="btn-skip" @tap="goAssessment">跳过</button>
      <button class="btn-main" @tap="slide < slides.length - 1 ? nextSlide() : goAssessment()">
        {{ slide < slides.length - 1 ? '下一步' : '开始测评' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const slide = ref(0)

const slides = [
  {
    emoji: '🧠',
    title: '欢迎来到 BizBrain',
    desc: '像打游戏一样，练出商业头脑。每天5分钟，用真实案例训练你的商业分析思维。',
  },
  {
    emoji: '🗺️',
    title: '解锁你的商业地图',
    desc: '从新手村到热点战场，30+ 个精选案例等你闯关。每一关都让你获得真实的商业洞察。',
  },
  {
    emoji: '🤖',
    title: 'AI 教练全程引导',
    desc: '不只是看答案——AI 会问你问题、引导你思考，让每次分析都内化为你自己的能力。',
  },
]

function nextSlide(): void { slide.value++ }
function onSlideChange(e: any): void { slide.value = e.detail.current }

function goAssessment(): void {
  uni.navigateTo({ url: '/pages/onboarding/assessment' })
}
</script>

<style lang="scss" scoped>
.welcome {
  min-height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
}
.swiper {
  flex: 1;
  height: 70vh;
}
.slide {
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide-content {
  padding: 60rpx 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.slide-emoji {
  font-size: 100rpx;
  margin-bottom: 48rpx;
}
.slide-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #e0e0f0;
  margin-bottom: 32rpx;
}
.slide-desc {
  font-size: 32rpx;
  color: rgba(224, 224, 240, 0.65);
  line-height: 1.7;
}
.bottom {
  padding: 40rpx 48rpx 80rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.btn-main {
  background: #6c63ff;
  color: #fff;
  border-radius: 24rpx;
  font-size: 34rpx;
  font-weight: 600;
  height: 96rpx;
  line-height: 96rpx;
  border: none;
}
.btn-skip {
  background: transparent;
  color: rgba(224, 224, 240, 0.45);
  border: none;
  font-size: 30rpx;
}
</style>
