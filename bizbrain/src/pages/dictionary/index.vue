<template>
  <view class="dict-page">
    <!-- Search bar -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input v-model="searchText" class="search-input" placeholder="搜索框架、概念…" />
      <text v-if="searchText" class="search-clear" @tap="searchText = ''">✕</text>
    </view>

    <!-- Category tabs -->
    <scroll-view scroll-x class="category-tabs">
      <view class="tabs-inner">
        <view
          v-for="cat in categories"
          :key="cat"
          class="tab"
          :class="{ active: activeCategory === cat }"
          @tap="activeCategory = cat"
        >
          <text class="tab-text">{{ cat }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Entry list -->
    <scroll-view scroll-y class="entry-list">
      <view v-if="filtered.length === 0" class="empty-state">
        <text class="empty-text">没有找到相关词条</text>
      </view>
      <view
        v-for="entry in filtered"
        :key="entry.term"
        class="entry-card"
        @tap="openEntry(entry)"
      >
        <view class="entry-header">
          <text class="entry-term">{{ entry.term }}</text>
          <text class="entry-category">{{ entry.category }}</text>
        </view>
        <text class="entry-plain">{{ entry.plain_explanation }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VOCABULARY_SEED } from '../../data/vocabulary-seed'
import type { VocabEntry } from '../../types/vocabulary'

const searchText     = ref('')
const activeCategory = ref('全部')

const categories = computed(() => {
  const cats = ['全部', ...new Set(VOCABULARY_SEED.map(e => e.category))]
  return cats
})

const filtered = computed(() => {
  let list = VOCABULARY_SEED as VocabEntry[]
  if (activeCategory.value !== '全部') {
    list = list.filter(e => e.category === activeCategory.value)
  }
  if (searchText.value.trim()) {
    const q = searchText.value.toLowerCase()
    list = list.filter(e =>
      e.term.toLowerCase().includes(q) ||
      e.plain_explanation.includes(q) ||
      e.related_terms.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

function openEntry(entry: any): void {
  uni.setStorageSync('biz_dict_entry', JSON.stringify(entry))
  uni.navigateTo({ url: `/pages/dictionary/entry?term=${encodeURIComponent(entry.term)}` })
}
</script>

<style lang="scss" scoped>
.dict-page {
  min-height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 24rpx 32rpx 0;
  background: #13131f;
  border-radius: 20rpx;
  padding: 0 24rpx;
  border: 1rpx solid rgba(255,255,255,0.08);
}
.search-icon { font-size: 32rpx; }
.search-input {
  flex: 1;
  font-size: 32rpx;
  color: #e0e0f0;
  height: 88rpx;
  line-height: 88rpx;
}
.search-clear { font-size: 30rpx; color: rgba(224,224,240,0.3); padding: 8rpx; }
.category-tabs { margin-top: 24rpx; white-space: nowrap; }
.tabs-inner { display: flex; padding: 0 32rpx; gap: 16rpx; }
.tab {
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  background: rgba(255,255,255,0.05);
  white-space: nowrap;
  &.active { background: rgba(108,99,255,0.2); }
}
.tab-text {
  font-size: 28rpx;
  color: rgba(224,224,240,0.6);
  .active & { color: #6c63ff; font-weight: 600; }
}
.entry-list { flex: 1; padding: 24rpx 32rpx; }
.empty-state { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 32rpx; color: rgba(224,224,240,0.3); }
.entry-card {
  background: #13131f;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.entry-term     { font-size: 36rpx; font-weight: 700; color: #e0e0f0; }
.entry-category {
  font-size: 22rpx;
  color: #6c63ff;
  background: rgba(108,99,255,0.12);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.entry-plain { font-size: 28rpx; color: rgba(224,224,240,0.6); line-height: 1.6; }
</style>
