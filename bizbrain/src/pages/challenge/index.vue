<template>
  <view class="challenge-page">
    <!-- Step indicator -->
    <view class="step-dots">
      <view
        v-for="(s, i) in STEPS"
        :key="s"
        class="dot"
        :class="{ active: i === currentStepIndex, done: i < currentStepIndex }"
      />
    </view>

    <!-- Step: Context -->
    <view v-if="currentStep === 'context'" class="step-view">
      <view class="case-header">
        <text class="section-tag">{{ store.activeCase?.section }}</text>
        <text class="case-title">{{ store.activeCase?.title }}</text>
        <view class="meta-row">
          <text class="meta-tag">{{ store.activeCase?.difficulty }}</text>
          <text class="meta-tag">{{ store.activeCase?.framework }}</text>
          <text class="meta-tag">+{{ store.activeCase?.xp_reward }} XP</text>
        </view>
      </view>
      <view class="context-card">
        <text class="context-text">{{ store.activeCase?.context }}</text>
      </view>
      <button class="btn-primary" @tap="store.advanceStep()">开始分析 →</button>
    </view>

    <!-- Step: Q1 / Q2 / Q3 -->
    <view v-else-if="['q1-observe','q2-analyze','q3-decide'].includes(currentStep)" class="step-view">
      <text class="layer-badge">{{ layerLabel }}</text>
      <text class="question-text">{{ currentQuestion?.text }}</text>

      <!-- AI response bubble (after submit) -->
      <view v-if="currentAiResponse" class="ai-bubble">
        <text class="ai-label">🤖 教练回应</text>
        <text class="ai-text">{{ currentAiResponse }}</text>
      </view>

      <!-- AI loading -->
      <view v-if="store.isAiLoading" class="ai-loading">
        <view class="loading-dots">
          <view class="loading-dot" /><view class="loading-dot" /><view class="loading-dot" />
        </view>
        <text class="loading-text">AI 教练正在思考…</text>
      </view>

      <!-- Input -->
      <view v-if="!currentAiResponse && !store.isAiLoading" class="input-area">
        <textarea
          v-model="answerDraft"
          class="answer-input"
          placeholder="写下你的想法，不需要完美…"
          :maxlength="500"
          auto-height
        />
        <text class="word-count">{{ answerDraft.length }}/500</text>
        <button class="btn-primary" :disabled="answerDraft.trim().length < 5" @tap="submitAnswer">
          提交回答
        </button>
      </view>

      <!-- After AI response, continue button -->
      <button v-if="currentAiResponse && !store.isAiLoading" class="btn-primary" @tap="continueNext">
        {{ isLastQuestion ? '查看专业拆解' : '继续下一问 →' }}
      </button>
    </view>

    <!-- Step: Breakdown -->
    <view v-else-if="currentStep === 'breakdown'" class="step-view">
      <text class="section-title">📊 专业拆解</text>
      <view class="breakdown-card">
        <view class="framework-tag-row">
          <text class="framework-tag">{{ store.activeCase?.framework }}</text>
        </view>
        <text class="breakdown-text">{{ store.activeCase?.expert_breakdown }}</text>
      </view>
      <button class="btn-primary" @tap="store.advanceStep()">查看知识锚点 →</button>
    </view>

    <!-- Step: Anchors -->
    <view v-else-if="currentStep === 'anchors'" class="step-view">
      <text class="section-title">🔖 知识锚点</text>
      <view class="anchors-grid">
        <view
          v-for="anchor in store.activeCase?.key_anchors"
          :key="anchor"
          class="anchor-chip"
          @tap="openDictEntry(anchor)"
        >
          <text class="anchor-text">{{ anchor }}</text>
          <text class="anchor-arrow">→</text>
        </view>
      </view>
      <text class="anchor-hint">点击任意概念，跳转词典查看详细解释</text>
      <button class="btn-primary" @tap="handleComplete">完成本关，领取XP →</button>
    </view>

    <!-- Step: XP Reward -->
    <view v-else-if="currentStep === 'xp-reward'" class="step-view xp-view">
      <text class="xp-emoji">🎉</text>
      <text class="xp-amount">+{{ store.xpEarned }} XP</text>
      <text class="xp-label">恭喜完成关卡！</text>
      <text class="xp-rank">当前段位：{{ userRank }}</text>
      <button class="btn-primary" @tap="store.advanceStep()">看看大家怎么分析的 →</button>
    </view>

    <!-- Step: Community -->
    <view v-else-if="currentStep === 'community'" class="step-view">
      <text class="section-title">💬 大家的分析</text>

      <view v-if="comments.length" class="comments-list">
        <view v-for="c in comments" :key="c.id" class="comment-item">
          <text class="comment-author">{{ c.users?.username ?? '匿名用户' }}</text>
          <text class="comment-text">{{ c.content }}</text>
        </view>
      </view>
      <text v-else class="no-comments">还没有人发表分析，成为第一个吧</text>

      <view class="comment-input-row">
        <textarea v-model="commentDraft" class="comment-input" placeholder="分享你的分析…" :maxlength="300" auto-height />
        <button class="btn-send" :disabled="commentDraft.trim().length < 3" @tap="submitComment">发布</button>
      </view>

      <button class="btn-outline" @tap="goMap">返回地图</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useChallengeStore, CHALLENGE_STEPS } from '../../stores/challenge'
import { useUserStore } from '../../stores/user'
import { useChallenge } from '../../composables/useChallenge'
import { fetchCaseComments, addCaseComment } from '../../services/community'
import type { Comment } from '../../types/community'

const store     = useChallengeStore()
const userStore = useUserStore()
const { loadChallenge, submitAnswerAndAdvance, completeChallenge } = useChallenge()

const answerDraft  = ref('')
const commentDraft = ref('')
const comments     = ref<Comment[]>([])

const STEPS = CHALLENGE_STEPS
const currentStep      = computed(() => store.currentStep)
const currentStepIndex = computed(() => CHALLENGE_STEPS.indexOf(store.currentStep))
const userRank         = computed(() => userStore.rank)

const LAYER_LABELS: Record<string, string> = {
  'q1-observe': '第1问 · 观察层',
  'q2-analyze': '第2问 · 分析层',
  'q3-decide':  '第3问 · 决策层',
}

const layerLabel = computed(() => LAYER_LABELS[currentStep.value] ?? '')

const questionLayerIndex = computed(() => {
  if (currentStep.value === 'q1-observe') return 0
  if (currentStep.value === 'q2-analyze') return 1
  return 2
})

const currentQuestion = computed(() => store.questions[questionLayerIndex.value])
const currentLayer    = computed(() => (questionLayerIndex.value + 1) as 1 | 2 | 3)
const currentAiResponse = computed(() => store.aiResponses[questionLayerIndex.value] ?? '')
const isLastQuestion  = computed(() => currentStep.value === 'q3-decide')

async function submitAnswer(): Promise<void> {
  if (answerDraft.value.trim().length < 5) return
  await submitAnswerAndAdvance(answerDraft.value.trim(), currentLayer.value)
  answerDraft.value = ''
}

function continueNext(): void {
  store.advanceStep()
  answerDraft.value = ''
}

async function handleComplete(): Promise<void> {
  await completeChallenge()
}

function openDictEntry(term: string): void {
  uni.navigateTo({ url: `/pages/dictionary/entry?term=${encodeURIComponent(term)}` })
}

async function submitComment(): Promise<void> {
  if (!userStore.user?.id || commentDraft.value.trim().length < 3) return
  const c = await addCaseComment(userStore.user.id, store.activeCase!.id, commentDraft.value.trim())
  if (c) { comments.value.unshift(c); commentDraft.value = '' }
}

function goMap(): void {
  store.reset()
  uni.switchTab({ url: '/pages/map/index' })
}

onMounted(async () => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const position = parseInt((current as any).options?.position ?? '1', 10)
  await loadChallenge(position)

  // Load existing comments
  if (store.activeCase?.id) {
    comments.value = await fetchCaseComments(store.activeCase.id)
  }
})
</script>

<style lang="scss" scoped>
.challenge-page {
  min-height: 100vh;
  background: #0a0a14;
  padding: 24rpx 40rpx 80rpx;
}
.step-dots {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 48rpx;
}
.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  &.done    { background: #2dd4a0; }
  &.active  { background: #6c63ff; width: 32rpx; border-radius: 8rpx; }
}
.step-view { display: flex; flex-direction: column; gap: 32rpx; }

// Context step
.case-header {}
.section-tag {
  background: rgba(108,99,255,0.15);
  color: #6c63ff;
  font-size: 24rpx;
  padding: 6rpx 18rpx;
  border-radius: 16rpx;
  display: inline-block;
  margin-bottom: 20rpx;
}
.case-title { font-size: 44rpx; font-weight: 800; color: #e0e0f0; display: block; margin-bottom: 20rpx; }
.meta-row { display: flex; gap: 16rpx; flex-wrap: wrap; }
.meta-tag {
  background: rgba(255,255,255,0.06);
  color: rgba(224,224,240,0.6);
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
}
.context-card {
  background: #13131f;
  border-radius: 28rpx;
  padding: 40rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.context-text { font-size: 32rpx; color: rgba(224,224,240,0.85); line-height: 1.8; }

// Question step
.layer-badge {
  font-size: 26rpx;
  color: #6c63ff;
  font-weight: 600;
  background: rgba(108,99,255,0.12);
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  display: inline-block;
}
.question-text { font-size: 38rpx; color: #e0e0f0; font-weight: 600; line-height: 1.7; }
.ai-bubble {
  background: rgba(45,212,160,0.08);
  border: 1rpx solid rgba(45,212,160,0.2);
  border-radius: 24rpx;
  padding: 32rpx;
}
.ai-label { font-size: 26rpx; color: #2dd4a0; display: block; margin-bottom: 16rpx; font-weight: 600; }
.ai-text { font-size: 30rpx; color: rgba(224,224,240,0.88); line-height: 1.8; }
.ai-loading { display: flex; flex-direction: column; align-items: center; gap: 20rpx; padding: 40rpx; }
.loading-dots { display: flex; gap: 12rpx; }
.loading-dot {
  width: 16rpx; height: 16rpx; border-radius: 50%; background: #6c63ff;
  animation: bounce 1.2s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-12rpx); } }
.loading-text { font-size: 28rpx; color: rgba(224,224,240,0.4); }
.input-area { display: flex; flex-direction: column; gap: 16rpx; }
.answer-input {
  background: #13131f;
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
  padding: 28rpx;
  color: #e0e0f0;
  font-size: 32rpx;
  min-height: 160rpx;
  line-height: 1.7;
}
.word-count { font-size: 24rpx; color: rgba(224,224,240,0.3); text-align: right; }

// Breakdown step
.section-title { font-size: 40rpx; font-weight: 700; color: #e0e0f0; }
.breakdown-card {
  background: #13131f;
  border-radius: 28rpx;
  padding: 40rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.framework-tag-row { margin-bottom: 24rpx; }
.framework-tag {
  background: rgba(240,180,41,0.12);
  color: #f0b429;
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
}
.breakdown-text { font-size: 30rpx; color: rgba(224,224,240,0.85); line-height: 1.9; }

// Anchors step
.anchors-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.anchor-chip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(108,99,255,0.1);
  border: 1rpx solid rgba(108,99,255,0.25);
  border-radius: 20rpx;
  padding: 16rpx 28rpx;
}
.anchor-text { font-size: 30rpx; color: rgba(224,224,240,0.9); }
.anchor-arrow { font-size: 24rpx; color: #6c63ff; }
.anchor-hint { font-size: 26rpx; color: rgba(224,224,240,0.35); }

// XP step
.xp-view { align-items: center; padding-top: 80rpx; }
.xp-emoji { font-size: 120rpx; }
.xp-amount { font-size: 80rpx; font-weight: 900; color: #f0b429; }
.xp-label  { font-size: 40rpx; color: #e0e0f0; font-weight: 600; }
.xp-rank   { font-size: 32rpx; color: rgba(224,224,240,0.5); }

// Community step
.comments-list { display: flex; flex-direction: column; gap: 20rpx; }
.comment-item {
  background: #13131f;
  border-radius: 20rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}
.comment-author { font-size: 26rpx; color: #6c63ff; display: block; margin-bottom: 12rpx; font-weight: 600; }
.comment-text   { font-size: 30rpx; color: rgba(224,224,240,0.8); line-height: 1.7; }
.no-comments    { font-size: 30rpx; color: rgba(224,224,240,0.3); text-align: center; padding: 40rpx; }
.comment-input-row { display: flex; gap: 16rpx; align-items: flex-end; }
.comment-input {
  flex: 1;
  background: #13131f;
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  color: #e0e0f0;
  font-size: 30rpx;
  min-height: 100rpx;
}
.btn-send {
  background: #6c63ff;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  padding: 0 28rpx;
  height: 80rpx;
  line-height: 80rpx;
  white-space: nowrap;
}

// Common buttons
.btn-primary {
  background: #6c63ff;
  color: #fff;
  border-radius: 24rpx;
  font-size: 34rpx;
  font-weight: 600;
  height: 96rpx;
  line-height: 96rpx;
  border: none;
  &[disabled] { opacity: 0.4; }
}
.btn-outline {
  background: transparent;
  color: rgba(224,224,240,0.5);
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: 24rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}
</style>
