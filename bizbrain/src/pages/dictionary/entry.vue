<template>
  <view class="entry-page">
    <view class="header-card">
      <text class="term-name">{{ entry.term }}</text>
      <text class="category-tag">{{ entry.category }}</text>
      <text class="plain-text">{{ entry.plain_explanation }}</text>
    </view>

    <view class="section-block">
      <text class="section-title">📖 正式定义</text>
      <text class="section-body">{{ entry.formal_definition }}</text>
    </view>

    <view class="section-block">
      <text class="section-title">💡 经典案例</text>
      <text class="section-body">{{ entry.example }}</text>
    </view>

    <view class="section-block">
      <text class="section-title">🎯 什么时候用</text>
      <view class="use-cases">
        <view v-for="(uc, i) in entry.use_cases" :key="i" class="use-case-item">
          <text class="uc-dot">·</text>
          <text class="uc-text">{{ uc }}</text>
        </view>
      </view>
    </view>

    <view v-if="entry.misconceptions" class="section-block warn-block">
      <text class="section-title">⚠️ 常见误区</text>
      <text class="section-body">{{ entry.misconceptions }}</text>
    </view>

    <view v-if="entry.related_terms?.length" class="section-block">
      <text class="section-title">🔗 相关概念</text>
      <view class="related-chips">
        <view
          v-for="t in entry.related_terms"
          :key="t"
          class="related-chip"
          @tap="openRelated(t)"
        >
          <text>{{ t }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { VocabEntry } from '../../types/vocabulary'
import { VOCABULARY_SEED } from '../../data/vocabulary-seed'

const entry = ref<VocabEntry>({
  id: 0,
  term: '',
  category: '',
  plain_explanation: '',
  formal_definition: '',
  example: '',
  use_cases: [],
  related_terms: [],
})

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const term = decodeURIComponent((current as any).options?.term ?? '')

  // Try local storage first (from dictionary list tap)
  const stored = uni.getStorageSync('biz_dict_entry')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.term === term) { entry.value = { id: 0, ...parsed }; return }
    } catch {}
  }

  // Fall back to seed data search
  const found = VOCABULARY_SEED.find(e => e.term === term)
  if (found) entry.value = { id: 0, ...found }
})

function openRelated(term: string): void {
  const found = VOCABULARY_SEED.find(e => e.term === term)
  if (found) uni.setStorageSync('biz_dict_entry', JSON.stringify(found))
  uni.navigateTo({ url: `/pages/dictionary/entry?term=${encodeURIComponent(term)}` })
}
</script>

<style lang="scss" scoped>
.entry-page {
  min-height: 100vh;
  background: #0a0a14;
  padding: 32rpx 40rpx 80rpx;
}
.header-card {
  background: #13131f;
  border-radius: 28rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(108,99,255,0.15);
}
.term-name {
  font-size: 52rpx;
  font-weight: 800;
  color: #e0e0f0;
  display: block;
  margin-bottom: 16rpx;
}
.category-tag {
  font-size: 24rpx;
  color: #6c63ff;
  background: rgba(108,99,255,0.12);
  padding: 6rpx 20rpx;
  border-radius: 16rpx;
  display: inline-block;
  margin-bottom: 24rpx;
}
.plain-text {
  font-size: 36rpx;
  color: rgba(224,224,240,0.75);
  line-height: 1.7;
  font-style: italic;
}
.section-block {
  background: #13131f;
  border-radius: 24rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(255,255,255,0.05);
  &.warn-block { border-color: rgba(255,107,107,0.15); }
}
.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: rgba(224,224,240,0.5);
  display: block;
  margin-bottom: 20rpx;
}
.section-body { font-size: 30rpx; color: rgba(224,224,240,0.85); line-height: 1.9; }
.use-cases { display: flex; flex-direction: column; gap: 16rpx; }
.use-case-item { display: flex; gap: 12rpx; }
.uc-dot { color: #6c63ff; font-size: 32rpx; line-height: 1.2; }
.uc-text { font-size: 30rpx; color: rgba(224,224,240,0.8); line-height: 1.6; flex: 1; }
.related-chips { display: flex; flex-wrap: wrap; gap: 16rpx; }
.related-chip {
  background: rgba(108,99,255,0.1);
  border: 1rpx solid rgba(108,99,255,0.2);
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
  color: rgba(224,224,240,0.8);
}
</style>
