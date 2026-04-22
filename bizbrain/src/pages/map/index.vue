<template>
  <view class="map-page">
    <!-- XP Header -->
    <view class="xp-header">
      <view class="rank-badge">
        <text class="rank-text">{{ rank }}</text>
      </view>
      <view class="xp-info">
        <view class="xp-bar-bg">
          <view class="xp-bar-fill" :style="{ width: xpPercent + '%' }" />
        </view>
        <text class="xp-label">{{ totalXP }} XP · 距下一段位 {{ xpToNext }} XP</text>
      </view>
    </view>

    <!-- Map Canvas -->
    <scroll-view scroll-y class="map-scroll" :scroll-into-view="activeNodeId">
      <view class="map-canvas">
        <!-- Section banners -->
        <view
          v-for="s in SECTION_LABELS"
          :key="s.section"
          class="section-banner"
          :style="{ top: s.y + 'rpx', color: s.color }"
        >
          <text class="section-text">{{ s.section }}</text>
        </view>

        <!-- Connection lines (SVG) -->
        <svg class="lines-svg" width="750" height="1800" viewBox="0 0 750 1800">
          <line
            v-for="(pair, i) in connectedPairs"
            :key="i"
            :x1="pair[0].x + 55"
            :y1="pair[0].y + 55"
            :x2="pair[1].x + 55"
            :y2="pair[1].y + 55"
            stroke="rgba(108,99,255,0.2)"
            stroke-width="3"
            stroke-dasharray="8,6"
          />
        </svg>

        <!-- Nodes -->
        <view
          v-for="node in MAP_NODES"
          :key="node.id"
          :id="'node-' + node.id"
          class="map-node"
          :class="[nodeState(node.id), node.section === '框架岛' ? 'island' : '']"
          :style="{ left: node.x + 'rpx', top: node.y + 'rpx' }"
          @tap="openChallenge(node)"
        >
          <text class="node-num">{{ node.id }}</text>
          <view class="node-tooltip">
            <text class="tooltip-label">{{ node.label }}</text>
            <text class="tooltip-framework">{{ node.framework }} · {{ node.estimatedMin }}min</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useMapStore } from '../../stores/map'
import { MAP_NODES, SECTION_LABELS } from '../../data/map-nodes'
import { RANK_THRESHOLDS } from '../../types/user'
import type { MapNode } from '../../data/map-nodes'

const userStore = useUserStore()
const mapStore  = useMapStore()

const rank     = computed(() => userStore.rank)
const totalXP  = computed(() => userStore.totalXP)

const xpPercent = computed(() => {
  const thresholds = Object.values(RANK_THRESHOLDS)
  const keys = Object.keys(RANK_THRESHOLDS)
  const idx = keys.indexOf(rank.value)
  const current = thresholds[idx] ?? 0
  const next = thresholds[idx + 1] ?? current + 500
  return Math.min(100, Math.round(((totalXP.value - current) / (next - current)) * 100))
})

const xpToNext = computed(() => {
  const thresholds = Object.values(RANK_THRESHOLDS)
  const keys = Object.keys(RANK_THRESHOLDS)
  const idx = keys.indexOf(rank.value)
  const next = thresholds[idx + 1]
  return next ? next - totalXP.value : 0
})

const activeNodeId = computed(() => {
  const active = MAP_NODES.find(n => mapStore.nodeState(n.id) === 'active')
  return active ? 'node-' + active.id : undefined
})

// Build consecutive pairs for drawing lines
const connectedPairs = computed(() =>
  MAP_NODES.slice(0, -1).map((n, i) => [n, MAP_NODES[i + 1]])
)

function nodeState(id: number) {
  return mapStore.nodeState(id)
}

function openChallenge(node: MapNode): void {
  const state = mapStore.nodeState(node.id)
  if (state === 'locked') {
    uni.showToast({ title: '完成前一关才能解锁', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/challenge/index?position=${node.id}` })
}

onMounted(async () => {
  if (userStore.user?.id) {
    await mapStore.loadProgress(userStore.user.id)
  }
})
</script>

<style lang="scss" scoped>
.map-page {
  min-height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
}
.xp-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 40rpx;
  background: #13131f;
  border-bottom: 1rpx solid rgba(255,255,255,0.06);
}
.rank-badge {
  background: rgba(108,99,255,0.2);
  border: 1rpx solid rgba(108,99,255,0.4);
  border-radius: 12rpx;
  padding: 8rpx 20rpx;
}
.rank-text { font-size: 26rpx; color: #6c63ff; font-weight: 700; }
.xp-info { flex: 1; }
.xp-bar-bg {
  height: 8rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}
.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c63ff, #f0b429);
  border-radius: 4rpx;
  transition: width 0.5s ease;
}
.xp-label { font-size: 22rpx; color: rgba(224,224,240,0.4); }

.map-scroll { flex: 1; }
.map-canvas {
  position: relative;
  width: 750rpx;
  height: 1800rpx;
}
.lines-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 750rpx;
  height: 1800rpx;
}
.section-banner {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}
.section-text {
  font-size: 24rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  opacity: 0.6;
}

/* Map nodes */
.map-node {
  position: absolute;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &.completed {
    background: linear-gradient(135deg, #2dd4a0, #1bb580);
    box-shadow: 0 0 24rpx rgba(45,212,160,0.4);
  }
  &.active {
    background: linear-gradient(135deg, #6c63ff, #a78bfa);
    box-shadow: 0 0 32rpx rgba(108,99,255,0.6);
    animation: pulse 2s infinite;
  }
  &.locked {
    background: rgba(255,255,255,0.05);
    border: 2rpx solid rgba(255,255,255,0.12);
  }
  &.island .node-num { color: #4da6ff; }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 32rpx rgba(108,99,255,0.6); }
  50%       { box-shadow: 0 0 48rpx rgba(108,99,255,0.9); }
}

.node-num {
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
}

.node-tooltip {
  position: absolute;
  bottom: 124rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  white-space: nowrap;
  display: none;
}
.map-node.active .node-tooltip { display: block; }
.tooltip-label {
  font-size: 26rpx;
  color: #e0e0f0;
  display: block;
  font-weight: 600;
}
.tooltip-framework {
  font-size: 22rpx;
  color: rgba(224,224,240,0.45);
  display: block;
  margin-top: 4rpx;
}
</style>
