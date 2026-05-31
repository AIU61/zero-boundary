<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { claimTask, grantConsent, loadHome, verifyCheckin, type HomePayload, type Merchant, type Task } from "./api";

type Screen =
  | "onboarding"
  | "login"
  | "home"
  | "explore"
  | "tasks"
  | "route"
  | "brand"
  | "product"
  | "wallet"
  | "profile";

interface Hotspot {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  to?: Screen;
  action?: "completeTask" | "authorize";
}

const screen = ref<Screen>("home");
const task = ref<Task>();
const merchants = ref<Merchant[]>([]);
const notice = ref("零界协议在线");
const busy = ref(false);

const screenImages: Record<Screen, string> = {
  onboarding: `${import.meta.env.BASE_URL}ui-screens/onboarding.png`,
  login: `${import.meta.env.BASE_URL}ui-screens/login.png`,
  home: `${import.meta.env.BASE_URL}ui-screens/home.png`,
  explore: `${import.meta.env.BASE_URL}ui-screens/explore.png`,
  tasks: `${import.meta.env.BASE_URL}ui-screens/tasks.png`,
  route: `${import.meta.env.BASE_URL}ui-screens/route.png`,
  brand: `${import.meta.env.BASE_URL}ui-screens/brand.png`,
  product: `${import.meta.env.BASE_URL}ui-screens/product.png`,
  wallet: `${import.meta.env.BASE_URL}ui-screens/wallet.png`,
  profile: `${import.meta.env.BASE_URL}ui-screens/profile.png`
};

const primaryMerchant = computed(() => merchants.value.find((merchant) => merchant.id === task.value?.requiredMerchantId));
const hasBottomNav = computed(() => ["home", "explore", "tasks", "brand", "wallet", "profile"].includes(screen.value));

onMounted(async () => {
  try {
    const home: HomePayload = await loadHome();
    task.value = home.tasks[0];
    merchants.value = home.merchants;
  } catch {
    notice.value = "演示模式";
  }
});

const hotspots = computed<Hotspot[]>(() => {
  const commonNav: Hotspot[] = hasBottomNav.value
    ? [
        { label: "首页", x: 0, y: 92.8, w: 20, h: 7.2, to: "home" },
        { label: "探索", x: 20, y: 92.8, w: 20, h: 7.2, to: "explore" },
        { label: "任务", x: 40, y: 92.8, w: 20, h: 7.2, to: "tasks" },
        { label: "资产", x: 60, y: 92.8, w: 20, h: 7.2, to: "wallet" },
        { label: "我的", x: 80, y: 92.8, w: 20, h: 7.2, to: "profile" }
      ]
    : [];

  const byScreen: Record<Screen, Hotspot[]> = {
    onboarding: [
      { label: "开启零界之旅", x: 8, y: 82.5, w: 84, h: 8.2, to: "home" },
      { label: "去登录", x: 36, y: 92, w: 28, h: 4, to: "login" }
    ],
    login: [
      { label: "返回", x: 2, y: 1.5, w: 10, h: 6, to: "onboarding" },
      { label: "登录", x: 10, y: 71.2, w: 80, h: 7.4, to: "home" },
      { label: "注册", x: 52, y: 42.5, w: 38, h: 6, to: "home" }
    ],
    home: [
      { label: "探索零界经济体", x: 8, y: 24, w: 28, h: 4.8, to: "explore" },
      { label: "附近品牌", x: 2, y: 34.8, w: 96, h: 16.8, to: "brand" },
      { label: "今日任务", x: 2, y: 52.6, w: 96, h: 13.5, to: "tasks" },
      { label: "城市路线", x: 2, y: 67.2, w: 96, h: 11.5, to: "route" },
      { label: "我的资产", x: 2, y: 79.4, w: 96, h: 12, to: "wallet" }
    ],
    explore: [
      { label: "Zero Coffee", x: 39, y: 31, w: 32, h: 8, to: "brand" },
      { label: "附近推荐", x: 2, y: 70, w: 96, h: 20, to: "brand" }
    ],
    tasks: [
      { label: "附近任务去完成", x: 74, y: 29, w: 20, h: 6, action: "completeTask" },
      { label: "限时任务去完成", x: 74, y: 46, w: 20, h: 6, to: "brand" },
      { label: "组队任务去完成", x: 74, y: 63.5, w: 20, h: 6, to: "route" },
      { label: "授权任务", x: 74, y: 80.5, w: 20, h: 6, action: "authorize" }
    ],
    route: [
      { label: "返回", x: 0, y: 0, w: 12, h: 7, to: "home" },
      { label: "开始路线", x: 6, y: 91.2, w: 88, h: 6.8, action: "completeTask" },
      { label: "站点 Zero Coffee", x: 8, y: 41.5, w: 84, h: 8.2, to: "brand" }
    ],
    brand: [
      { label: "进入品牌世界", x: 66, y: 45.5, w: 28, h: 5.2, to: "product" },
      { label: "数字门店", x: 2, y: 53, w: 24, h: 15, to: "product" },
      { label: "精选活动报名", x: 72, y: 81, w: 22, h: 5, to: "tasks" }
    ],
    product: [
      { label: "返回", x: 0, y: 0, w: 12, h: 7, to: "brand" },
      { label: "加入购物车", x: 3, y: 85.4, w: 94, h: 6.5, to: "wallet" }
    ],
    wallet: [
      { label: "能量明细", x: 6, y: 26.5, w: 20, h: 4.5, to: "tasks" },
      { label: "立即使用票证", x: 76, y: 74, w: 20, h: 16, to: "brand" }
    ],
    profile: [
      { label: "首页", x: 0, y: 92.8, w: 20, h: 7.2, to: "home" }
    ]
  };

  return [...(byScreen[screen.value] ?? []), ...commonNav];
});

function navigate(target: Screen) {
  screen.value = target;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function runHotspot(hotspot: Hotspot) {
  if (hotspot.action === "completeTask") {
    await completeTask();
    return;
  }

  if (hotspot.action === "authorize") {
    await authorizeData();
    return;
  }

  if (hotspot.to) {
    navigate(hotspot.to);
  }
}

async function completeTask() {
  if (!task.value || !primaryMerchant.value) {
    navigate("wallet");
    return;
  }

  busy.value = true;
  try {
    if (task.value.status === "available") {
      const claimed = await claimTask(task.value.id);
      task.value = claimed.task;
    }

    await verifyCheckin(task.value.id, primaryMerchant.value.id);
    notice.value = "核销成功，数字票根已进入权益钱包";
    navigate("wallet");
  } catch {
    notice.value = "演示核销完成";
    navigate("wallet");
  } finally {
    busy.value = false;
  }
}

async function authorizeData() {
  if (primaryMerchant.value) {
    await grantConsent(primaryMerchant.value.id).catch(() => undefined);
  }
  notice.value = "数据授权已存证";
  navigate("wallet");
}
</script>

<template>
  <main class="app-frame">
    <section class="phone-screen" :class="{ busy }">
      <img class="screen-image" :src="screenImages[screen]" :alt="`${screen} screen`" />
      <button
        v-for="hotspot in hotspots"
        :key="`${screen}-${hotspot.label}-${hotspot.x}-${hotspot.y}`"
        class="hotspot"
        :aria-label="hotspot.label"
        :style="{
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          width: `${hotspot.w}%`,
          height: `${hotspot.h}%`
        }"
        @click="runHotspot(hotspot)"
      />
    </section>
  </main>
</template>
