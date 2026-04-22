<script setup lang="ts">
import { onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore } from "./stores/user";
import { useMapStore } from "./stores/map";

onLaunch(async () => {
  const userStore = useUserStore();
  await userStore.fetchProfile();

  if (!userStore.isLoggedIn) {
    // Not logged in — check if assessment was already done locally
    const savedResult = uni.getStorageSync("biz_assessment_result");
    if (!savedResult) {
      uni.reLaunch({ url: "/pages/onboarding/welcome" });
    } else {
      // Has local result, go to map (guest mode)
      uni.reLaunch({ url: "/pages/map/index" });
    }
    return;
  }

  if (!userStore.thinkingType) {
    uni.reLaunch({ url: "/pages/onboarding/assessment" });
    return;
  }

  // Load map progress
  const mapStore = useMapStore();
  await mapStore.loadProgress(userStore.user!.id);
});

onShow(() => {
  // Streak check on every foreground
  const saved = uni.getStorageSync("biz_last_active");
  const today = new Date().toDateString();
  if (saved !== today) {
    uni.setStorageSync("biz_last_active", today);
  }
});
</script>
<style></style>
