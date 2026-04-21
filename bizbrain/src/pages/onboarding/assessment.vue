<template>
  <view class="assessment">
    <!-- Progress bar -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progress + '%' }" />
    </view>
    <text class="progress-text">{{ currentQ + 1 }} / {{ total }}</text>

    <!-- Question card -->
    <view v-if="!isDone" class="question-card">
      <text class="scenario-tag">{{ question.scenario }}</text>
      <text class="question-text">{{ question.text }}</text>
      <view class="options">
        <view
          v-for="opt in question.options"
          :key="opt.key"
          class="option"
          :class="{ selected: selectedKey === opt.key }"
          @tap="choose(opt.key, opt.text)"
        >
          <text class="option-key">{{ opt.key }}</text>
          <text class="option-text">{{ opt.text }}</text>
        </view>
      </view>
    </view>

    <!-- Analyzing state -->
    <view v-else class="analyzing">
      <view class="spinner" />
      <text class="analyzing-text">AI 正在分析你的思维类型…</text>
      <text class="analyzing-sub">大约需要5秒</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAssessment } from '../../composables/useAssessment'
import { ASSESSMENT_QUESTIONS } from '../../data/assessment-questions'
import { useUserStore } from '../../stores/user'

const { currentQ, isDone, progress, isAnalyzing, result, selectAnswer, analyzeAnswers } = useAssessment()
const userStore = useUserStore()
const selectedKey = ref<string | null>(null)
const total = ASSESSMENT_QUESTIONS.length

const question = computed(() => ASSESSMENT_QUESTIONS[currentQ.value])

function choose(key: 'A' | 'B' | 'C' | 'D', text: string): void {
  selectedKey.value = key
  setTimeout(() => {
    selectedKey.value = null
    selectAnswer(key, text)
  }, 200)
}

// When all 5 answered, start analysis
watch(isDone, async (done) => {
  if (!done) return
  await analyzeAnswers()
})

// Navigate to result when analysis complete
watch(result, async (r) => {
  if (!r) return
  // Persist thinking type
  await userStore.updateThinkingType(r.type)
  uni.setStorageSync('biz_assessment_result', JSON.stringify(r))
  uni.redirectTo({ url: '/pages/assessment-result/index' })
})
</script>

<style lang="scss" scoped>
.assessment {
  min-height: 100vh;
  background: #0a0a14;
  padding: 0 40rpx 60rpx;
}
.progress-bar {
  height: 6rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 3rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #6c63ff;
  border-radius: 3rpx;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 26rpx;
  color: rgba(224,224,240,0.4);
  text-align: right;
  display: block;
  margin-bottom: 48rpx;
}
.question-card {
  background: #13131f;
  border-radius: 32rpx;
  padding: 48rpx;
  border: 1rpx solid rgba(255,255,255,0.08);
}
.scenario-tag {
  background: rgba(108,99,255,0.15);
  color: #6c63ff;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  margin-bottom: 32rpx;
  display: inline-block;
}
.question-text {
  font-size: 36rpx;
  color: #e0e0f0;
  line-height: 1.7;
  font-weight: 500;
  display: block;
  margin-bottom: 48rpx;
}
.options { display: flex; flex-direction: column; gap: 20rpx; }
.option {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(255,255,255,0.08);
  border-radius: 20rpx;
  padding: 28rpx;
  transition: all 0.2s;
  &.selected {
    background: rgba(108,99,255,0.2);
    border-color: #6c63ff;
  }
}
.option-key {
  width: 52rpx;
  height: 52rpx;
  min-width: 52rpx;
  border-radius: 50%;
  background: rgba(108,99,255,0.2);
  color: #6c63ff;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 52rpx;
}
.option-text {
  font-size: 30rpx;
  color: rgba(224,224,240,0.85);
  line-height: 1.6;
  flex: 1;
}
.analyzing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 160rpx;
}
.spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(108,99,255,0.2);
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 48rpx;
}
@keyframes spin { to { transform: rotate(360deg); } }
.analyzing-text {
  font-size: 36rpx;
  color: #e0e0f0;
  font-weight: 500;
  margin-bottom: 16rpx;
}
.analyzing-sub {
  font-size: 28rpx;
  color: rgba(224,224,240,0.4);
}
</style>
