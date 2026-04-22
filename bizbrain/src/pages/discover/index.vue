<template>
  <view class="discover-page">
    <!-- Header -->
    <view class="page-header">
      <text class="header-title">发现</text>
      <view class="compose-btn" @tap="showCompose = true">
        <text class="compose-icon">✏️</text>
      </view>
    </view>

    <!-- Feed -->
    <scroll-view scroll-y class="feed" @scrolltolower="loadMore">
      <view v-if="posts.length === 0 && !isLoading" class="empty-state">
        <text class="empty-emoji">💬</text>
        <text class="empty-title">还没有帖子</text>
        <text class="empty-sub">分享你观察到的商业现象，开始第一篇！</text>
      </view>

      <view v-for="post in posts" :key="post.id" class="post-card">
        <view class="post-meta">
          <view class="avatar">
            <text class="avatar-text">{{ (post.users?.username ?? '?').charAt(0).toUpperCase() }}</text>
          </view>
          <view class="meta-info">
            <text class="post-author">{{ post.users?.username ?? '匿名用户' }}</text>
            <text class="post-time">{{ formatTime(post.created_at) }}</text>
          </view>
          <view class="category-badge">
            <text class="category-text">{{ post.category }}</text>
          </view>
        </view>
        <text class="post-content">{{ post.content }}</text>
        <view class="post-actions">
          <view class="action-item">
            <text class="action-icon">👍</text>
            <text class="action-count">{{ post.likes }}</text>
          </view>
        </view>
      </view>

      <view v-if="isLoading" class="loading-row">
        <text class="loading-text">加载中…</text>
      </view>
    </scroll-view>

    <!-- Compose modal -->
    <view v-if="showCompose" class="compose-overlay" @tap.self="showCompose = false">
      <view class="compose-modal">
        <text class="compose-title">分享你的商业观察</text>
        <textarea
          v-model="newContent"
          class="compose-input"
          placeholder="你今天观察到什么有趣的商业现象？"
          :maxlength="300"
          auto-height
          focus
        />
        <text class="compose-count">{{ newContent.length }}/300</text>
        <view class="compose-actions">
          <button class="btn-cancel" @tap="showCompose = false">取消</button>
          <button class="btn-post" :disabled="newContent.trim().length < 10" @tap="submitPost">发布</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPosts, createPost } from '../../services/community'
import { useUserStore } from '../../stores/user'
import type { Post } from '../../types/community'

const userStore  = useUserStore()
const posts      = ref<Post[]>([])
const isLoading  = ref(false)
const showCompose = ref(false)
const newContent  = ref('')

async function load(): Promise<void> {
  isLoading.value = true
  posts.value = await fetchPosts(20)
  isLoading.value = false
}

async function loadMore(): Promise<void> {
  // Simple pagination placeholder — extend with offset when needed
}

async function submitPost(): Promise<void> {
  if (!userStore.user?.id || newContent.value.trim().length < 10) return
  const post = await createPost(userStore.user.id, newContent.value.trim())
  if (post) {
    posts.value.unshift(post)
    newContent.value = ''
    showCompose.value = false
  }
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return mins + '分钟前'
  if (mins < 1440) return Math.floor(mins / 60) + '小时前'
  return Math.floor(mins / 1440) + '天前'
}

onMounted(load)
</script>

<style lang="scss" scoped>
.discover-page {
  min-height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 40rpx;
  border-bottom: 1rpx solid rgba(255,255,255,0.06);
}
.header-title { font-size: 44rpx; font-weight: 800; color: #e0e0f0; }
.compose-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(108,99,255,0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.compose-icon { font-size: 32rpx; }

.feed { flex: 1; padding: 24rpx 32rpx; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
  text-align: center;
}
.empty-emoji { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 36rpx; color: #e0e0f0; font-weight: 600; margin-bottom: 16rpx; }
.empty-sub   { font-size: 28rpx; color: rgba(224,224,240,0.4); }

.post-card {
  background: #13131f;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.avatar {
  width: 64rpx;
  height: 64rpx;
  background: rgba(108,99,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-text { font-size: 28rpx; color: #6c63ff; font-weight: 700; }
.meta-info { flex: 1; }
.post-author { font-size: 28rpx; color: #e0e0f0; font-weight: 600; display: block; }
.post-time   { font-size: 24rpx; color: rgba(224,224,240,0.35); }
.category-badge {
  background: rgba(240,180,41,0.1);
  border-radius: 12rpx;
  padding: 6rpx 16rpx;
}
.category-text { font-size: 22rpx; color: #f0b429; }
.post-content {
  font-size: 30rpx;
  color: rgba(224,224,240,0.85);
  line-height: 1.8;
  display: block;
  margin-bottom: 20rpx;
}
.post-actions { display: flex; gap: 32rpx; }
.action-item { display: flex; align-items: center; gap: 8rpx; }
.action-icon  { font-size: 28rpx; }
.action-count { font-size: 26rpx; color: rgba(224,224,240,0.4); }

.loading-row { text-align: center; padding: 32rpx; }
.loading-text { font-size: 28rpx; color: rgba(224,224,240,0.3); }

/* Compose modal */
.compose-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}
.compose-modal {
  width: 100%;
  background: #13131f;
  border-radius: 40rpx 40rpx 0 0;
  padding: 48rpx 40rpx 60rpx;
}
.compose-title { font-size: 36rpx; font-weight: 700; color: #e0e0f0; display: block; margin-bottom: 32rpx; }
.compose-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(255,255,255,0.08);
  border-radius: 20rpx;
  padding: 24rpx;
  color: #e0e0f0;
  font-size: 32rpx;
  min-height: 180rpx;
  line-height: 1.7;
  box-sizing: border-box;
}
.compose-count { font-size: 24rpx; color: rgba(224,224,240,0.3); text-align: right; display: block; margin: 12rpx 0 24rpx; }
.compose-actions { display: flex; gap: 20rpx; }
.btn-cancel {
  flex: 1;
  background: rgba(255,255,255,0.06);
  color: rgba(224,224,240,0.5);
  border: none;
  border-radius: 20rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}
.btn-post {
  flex: 2;
  background: #6c63ff;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 34rpx;
  font-weight: 600;
  height: 88rpx;
  line-height: 88rpx;
  &[disabled] { opacity: 0.4; }
}
</style>
