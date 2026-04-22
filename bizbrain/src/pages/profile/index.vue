<template>
  <view class="profile-page">
    <!-- User header -->
    <view class="user-header">
      <view class="avatar-large">
        <text class="avatar-char">{{ avatarChar }}</text>
      </view>
      <view class="user-info">
        <text class="username">{{ user?.username ?? '未登录' }}</text>
        <view class="rank-row">
          <text class="rank-badge">{{ rank }}</text>
          <text class="xp-text">{{ totalXP }} XP</text>
        </view>
      </view>
    </view>

    <!-- Type card -->
    <view v-if="user?.thinking_type" class="type-card" :style="{ borderColor: typeColor + '44' }">
      <text class="type-emoji">{{ typeEmoji }}</text>
      <view class="type-info">
        <text class="type-label">你的思维类型</text>
        <text class="type-name" :style="{ color: typeColor }">{{ user.thinking_type }}</text>
      </view>
      <text class="retake-btn" @tap="retakeAssessment">重测 →</text>
    </view>

    <!-- Stats -->
    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-value">{{ completedCount }}</text>
        <text class="stat-label">完成关卡</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ user?.streak_days ?? 0 }}</text>
        <text class="stat-label">连续打卡</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ totalXP }}</text>
        <text class="stat-label">总经验值</text>
      </view>
    </view>

    <!-- XP progress to next rank -->
    <view class="rank-progress">
      <view class="rank-ends">
        <text class="rank-current">{{ rank }}</text>
        <text class="rank-next">{{ nextRank }}</text>
      </view>
      <view class="xp-bar-bg">
        <view class="xp-bar-fill" :style="{ width: xpPercent + '%' }" />
      </view>
      <text class="xp-hint">再获得 {{ xpToNext }} XP 升级为{{ nextRank }}</text>
    </view>

    <!-- Achievements -->
    <view class="achievements-section">
      <text class="section-title">成就徽章</text>
      <view class="achievements-grid">
        <view v-for="ach in ACHIEVEMENTS" :key="ach.key" class="achievement-item" :class="{ earned: earnedKeys.has(ach.key) }">
          <text class="ach-icon">{{ ach.icon }}</text>
          <text class="ach-name">{{ ach.name }}</text>
        </view>
      </view>
    </view>

    <!-- Actions -->
    <view class="actions">
      <view v-if="!user" class="action-row" @tap="goLogin">
        <text class="action-text">登录 / 注册</text>
        <text class="action-arrow">→</text>
      </view>
      <view v-else class="action-row danger" @tap="signOut">
        <text class="action-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '../../stores/user'
import { useMapStore } from '../../stores/map'
import { THINKING_TYPES } from '../../data/thinking-types'
import { RANK_THRESHOLDS } from '../../types/user'
import type { Rank } from '../../types/user'

const userStore = useUserStore()
const mapStore  = useMapStore()
const earnedKeys = ref<Set<string>>(new Set())

const ACHIEVEMENTS = [
  { key: 'first_case',       icon: '🧊', name: '破冰者' },
  { key: 'streak_7',         icon: '🔥', name: '一周达人' },
  { key: 'streak_30',        icon: '⚡', name: '习惯养成者' },
  { key: 'xp_300',           icon: '📊', name: '分析师' },
  { key: 'xp_800',           icon: '🎯', name: '顾问' },
  { key: 'complete_village', icon: '🏅', name: '新手毕业' },
  { key: 'tech_case',        icon: '💻', name: '科技观察家' },
]

const user         = computed(() => userStore.user)
const rank         = computed(() => userStore.rank)
const totalXP      = computed(() => userStore.totalXP)
const avatarChar   = computed(() => (user.value?.username ?? '?').charAt(0).toUpperCase())
const completedCount = computed(() => mapStore.completedIds.size)

const typeInfo  = computed(() => user.value?.thinking_type ? THINKING_TYPES[user.value.thinking_type] : null)
const typeColor = computed(() => typeInfo.value?.color ?? '#6c63ff')
const typeEmoji = computed(() => typeInfo.value?.emoji ?? '🧠')

const RANK_KEYS = Object.keys(RANK_THRESHOLDS) as Rank[]
const RANK_VALS = Object.values(RANK_THRESHOLDS)

const xpPercent = computed(() => {
  const idx = RANK_KEYS.indexOf(rank.value)
  const cur  = RANK_VALS[idx] ?? 0
  const next = RANK_VALS[idx + 1]
  if (!next) return 100
  return Math.min(100, Math.round(((totalXP.value - cur) / (next - cur)) * 100))
})

const xpToNext = computed(() => {
  const idx  = RANK_KEYS.indexOf(rank.value)
  const next = RANK_VALS[idx + 1]
  return next ? next - totalXP.value : 0
})

const nextRank = computed(() => {
  const idx = RANK_KEYS.indexOf(rank.value)
  return RANK_KEYS[idx + 1] ?? '已满级'
})

function retakeAssessment(): void {
  uni.navigateTo({ url: '/pages/onboarding/assessment' })
}

function goLogin(): void {
  uni.navigateTo({ url: '/pages/auth/login' })
}

async function signOut(): Promise<void> {
  await userStore.signOut()
  uni.reLaunch({ url: '/pages/index/index' })
}

onMounted(async () => {
  if (userStore.user?.id) {
    await mapStore.loadProgress(userStore.user.id)
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #0a0a14;
  padding: 32rpx 40rpx 80rpx;
}
.user-header {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 40rpx;
  padding: 40rpx;
  background: #13131f;
  border-radius: 28rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.avatar-large {
  width: 100rpx;
  height: 100rpx;
  background: rgba(108,99,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-char { font-size: 44rpx; color: #6c63ff; font-weight: 700; }
.user-info { flex: 1; }
.username   { font-size: 40rpx; font-weight: 700; color: #e0e0f0; display: block; margin-bottom: 12rpx; }
.rank-row   { display: flex; align-items: center; gap: 16rpx; }
.rank-badge {
  background: rgba(240,180,41,0.15);
  color: #f0b429;
  font-size: 24rpx;
  font-weight: 700;
  padding: 6rpx 18rpx;
  border-radius: 12rpx;
}
.xp-text { font-size: 26rpx; color: rgba(224,224,240,0.4); }

.type-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #13131f;
  border-radius: 24rpx;
  padding: 32rpx 40rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid;
}
.type-emoji  { font-size: 60rpx; }
.type-info   { flex: 1; }
.type-label  { font-size: 24rpx; color: rgba(224,224,240,0.4); display: block; margin-bottom: 8rpx; }
.type-name   { font-size: 36rpx; font-weight: 800; }
.retake-btn  { font-size: 26rpx; color: rgba(224,224,240,0.35); }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}
.stat-item {
  background: #13131f;
  border-radius: 20rpx;
  padding: 32rpx 20rpx;
  text-align: center;
  border: 1rpx solid rgba(255,255,255,0.05);
}
.stat-value { font-size: 52rpx; font-weight: 800; color: #e0e0f0; display: block; }
.stat-label { font-size: 24rpx; color: rgba(224,224,240,0.4); display: block; margin-top: 8rpx; }

.rank-progress {
  background: #13131f;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(255,255,255,0.05);
}
.rank-ends {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.rank-current { font-size: 28rpx; color: #f0b429; font-weight: 600; }
.rank-next    { font-size: 28rpx; color: rgba(224,224,240,0.4); }
.xp-bar-bg {
  height: 12rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}
.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c63ff, #f0b429);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}
.xp-hint { font-size: 24rpx; color: rgba(224,224,240,0.35); }

.achievements-section { margin-bottom: 40rpx; }
.section-title { font-size: 36rpx; font-weight: 700; color: #e0e0f0; display: block; margin-bottom: 24rpx; }
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}
.achievement-item {
  background: rgba(255,255,255,0.03);
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  border: 1rpx solid rgba(255,255,255,0.06);
  opacity: 0.35;
  &.earned { opacity: 1; background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); }
}
.ach-icon { font-size: 44rpx; display: block; margin-bottom: 8rpx; }
.ach-name { font-size: 22rpx; color: rgba(224,224,240,0.7); }

.actions { display: flex; flex-direction: column; gap: 16rpx; }
.action-row {
  background: #13131f;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid rgba(255,255,255,0.05);
  &.danger .action-text { color: #ff6b6b; }
}
.action-text  { font-size: 32rpx; color: rgba(224,224,240,0.8); }
.action-arrow { font-size: 28rpx; color: rgba(224,224,240,0.3); }
</style>
