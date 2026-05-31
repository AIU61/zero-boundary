<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Award,
  BatteryCharging,
  Bot,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Coffee,
  Dumbbell,
  Gift,
  Home,
  MapPin,
  Orbit,
  QrCode,
  ScanLine,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  WalletCards,
  Zap
} from "lucide-vue-next";
import {
  claimTask,
  grantConsent,
  loadHome,
  verifyCheckin,
  type Benefit,
  type Governance,
  type HomePayload,
  type Merchant,
  type Task,
  type Wallet
} from "./api";

type Screen = "home" | "explore" | "tasks" | "route" | "brand" | "product" | "wallet" | "profile";

const screen = ref<Screen>("home");
const loading = ref(true);
const busy = ref(false);
const toast = ref("零界城市数据同步中...");
const task = ref<Task>();
const wallet = ref<Wallet>();
const merchants = ref<Merchant[]>([]);
const governance = ref<Governance>();
const lastBenefit = ref<Benefit>();

const images = {
  home: "/zero-ui/home.png",
  explore: "/zero-ui/explore.png",
  tasks: "/zero-ui/tasks.png",
  route: "/zero-ui/route.png",
  brand: "/zero-ui/brand.png",
  product: "/zero-ui/product.png",
  wallet: "/zero-ui/wallet.png",
  profile: "/zero-ui/profile.png"
};

const brands = [
  { name: "Zero Coffee", sub: "零界咖啡", distance: "120m", rating: "4.8", icon: Coffee, image: images.brand },
  { name: "零界花店", sub: "城市花艺", distance: "180m", rating: "4.9", icon: Sparkles, image: images.home },
  { name: "Zero Gym", sub: "能量健身房", distance: "260m", rating: "4.7", icon: Dumbbell, image: images.explore }
];

const uiTasks = [
  { type: "附近任务", title: "打卡 Zero Coffee", desc: "在 Zero Coffee 完成消费打卡", meta: "120m · 零界咖啡（静安店）", xp: 20, zc: 5, status: "0/1", image: images.brand },
  { type: "限时任务", title: "限时体验 · 零界健身房", desc: "在规定时间内完成一次健身体验", meta: "260m · Zero Gym（静安店）", xp: 40, zc: 10, status: "剩余 05:23:47", image: images.explore },
  { type: "组队任务", title: "组队探索 · 南京西路商圈", desc: "组队探索 3 个商业地标", meta: "2.3km · 南京西路商圈", xp: 60, zc: 15, status: "1/3", image: images.route },
  { type: "数据授权任务", title: "授权运动数据", desc: "授权运动数据，解锁专属推荐与奖励", meta: "有效期至 2026-06-15", xp: 30, zc: 8, status: "待授权", image: images.wallet }
];

const routeStops = [
  { title: "Zero Coffee", tags: ["咖啡", "社交", "打卡"], distance: "0m", badge: "起点", image: images.brand },
  { title: "潮玩集合店", tags: ["潮玩", "零售", "互动"], distance: "650m", image: images.home },
  { title: "ZERO CLUB Livehouse", tags: ["音乐", "演出", "派对"], distance: "1.1km", image: images.explore },
  { title: "零界SPACE 市集", tags: ["市集", "文创", "美食"], distance: "800m", image: images.brand },
  { title: "Rooftop Bar", tags: ["酒吧", "观景", "社交"], distance: "650m", badge: "终点", image: images.route }
];

const tickets = [
  { title: "ZERO CITY 夜游体验券", desc: "夜游项目单次体验", date: "有效期至 2026-06-15", count: "剩余 1 张", image: images.home },
  { title: "Zero Coffee 5 折券", desc: "全场饮品通用", date: "有效期至 2026-06-30", count: "剩余 2 张", image: images.brand },
  { title: "Zero Gym 周体验券", desc: "7 天全场通用", date: "有效期至 2026-06-28", count: "剩余 1 张", image: images.explore }
];

const primaryMerchant = computed(() => merchants.value.find((merchant) => merchant.id === task.value?.requiredMerchantId));
const energy = computed(() => wallet.value?.energy ?? 2680);
const benefitCount = computed(() => wallet.value?.benefits.length ?? 12);

onMounted(refresh);

async function refresh() {
  loading.value = true;
  try {
    const home: HomePayload = await loadHome();
    task.value = home.tasks[0];
    wallet.value = home.user;
    merchants.value = home.merchants;
    governance.value = home.governance;
    toast.value = "蓝岸商圈已同步，零界协议在线";
  } catch (error) {
    toast.value = `API 未连接：${error instanceof Error ? error.message : "未知错误"}`;
  } finally {
    loading.value = false;
  }
}

function navigate(target: Screen) {
  screen.value = target;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function completeCoffeeTask() {
  if (!task.value || !primaryMerchant.value) {
    toast.value = "任务或门店数据尚未同步";
    return;
  }

  busy.value = true;
  try {
    if (task.value.status === "available") {
      const claimed = await claimTask(task.value.id);
      task.value = claimed.task;
    }

    const verified = await verifyCheckin(task.value.id, primaryMerchant.value.id);
    wallet.value = verified.wallet;
    lastBenefit.value = verified.issuedBenefit;
    toast.value = "核销成功，数字票根已进入权益钱包";
    await refresh();
    navigate("wallet");
  } catch (error) {
    toast.value = error instanceof Error ? error.message : "任务核销失败";
  } finally {
    busy.value = false;
  }
}

async function authorizeData() {
  if (!primaryMerchant.value) return;
  busy.value = true;
  try {
    const result = await grantConsent(primaryMerchant.value.id);
    toast.value = `数据授权已存证：${result.consent.chainBusinessId}`;
  } catch (error) {
    toast.value = error instanceof Error ? error.message : "授权失败";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <main class="app-frame">
    <div class="phone-shell">
      <section v-if="screen === 'home'" class="screen page-with-nav">
        <AppHeader />
        <SearchBar placeholder="搜索品牌、任务、活动" />

        <HeroCard :image="images.home" title="ZERO CITY" subtitle="连接现实 与 未来商业" button="探索零界经济体" @click="navigate('explore')" />

        <GlowPanel title="附近品牌">
          <div class="brand-row">
            <button v-for="brand in brands" :key="brand.name" class="brand-card" @click="navigate('brand')">
              <img :src="brand.image" alt="" />
              <span class="brand-icon"><component :is="brand.icon" :size="18" /></span>
              <b>{{ brand.name }}</b>
              <small><MapPin :size="12" /> {{ brand.distance }} <Star :size="12" /> {{ brand.rating }}</small>
            </button>
          </div>
        </GlowPanel>

        <GlowPanel title="今日任务">
          <TaskLite title="打卡 Zero Coffee" desc="在 Zero Coffee 完成消费打卡" reward="+80 能量" @click="navigate('tasks')" />
          <TaskLite title="探索 2 个新品品牌" desc="浏览并关注任意 2 个新品品牌" reward="+60 能量" @click="navigate('tasks')" />
        </GlowPanel>

        <GlowPanel title="城市路线" action="">
          <div class="route-strip">
            <img :src="images.route" alt="" />
            <div>
              <b>南京西路 · 潮流探索路线</b>
              <span>2.3 km | 8 个站点</span>
              <div class="mini-icons"><ShoppingBag :size="16" /><Coffee :size="16" /><Sparkles :size="16" /><Dumbbell :size="16" /></div>
            </div>
            <button class="pill-action" @click="navigate('route')">去探索</button>
          </div>
        </GlowPanel>

        <GlowPanel title="我的资产" action="">
          <div class="asset-row">
            <button class="asset-mini" @click="navigate('wallet')">
              <span>零界能量</span>
              <b>{{ energy.toLocaleString() }}<Zap :size="20" /></b>
              <small>能量明细 ></small>
            </button>
            <button class="asset-mini purple" @click="navigate('wallet')">
              <span>权益钱包</span>
              <b>{{ benefitCount }} 项</b>
              <small>查看权益 ></small>
            </button>
          </div>
        </GlowPanel>
      </section>

      <section v-else-if="screen === 'explore'" class="screen page-with-nav">
        <AppHeader />
        <SearchBar placeholder="搜索地点、活动或任务" />
        <div class="chip-row">
          <button class="chip active">全部</button>
          <button class="chip">门店</button>
          <button class="chip">活动</button>
          <button class="chip">任务</button>
          <button class="chip">路线</button>
        </div>
        <div class="map-panel">
          <img :src="images.explore" alt="" />
          <div class="map-pin coffee">Zero Coffee<br /><small>120m</small></div>
          <div class="map-pin club">ZERO CLUB<br /><small>350m</small></div>
          <div class="map-pin gym">Zero Gym<br /><small>260m</small></div>
        </div>
        <GlowPanel title="附近推荐">
          <div class="brand-row">
            <button v-for="brand in brands" :key="brand.name" class="brand-card" @click="navigate('brand')">
              <img :src="brand.image" alt="" />
              <span class="brand-icon"><component :is="brand.icon" :size="18" /></span>
              <b>{{ brand.name }}</b>
              <small><MapPin :size="12" /> {{ brand.distance }} <Star :size="12" /> {{ brand.rating }}</small>
            </button>
          </div>
        </GlowPanel>
      </section>

      <section v-else-if="screen === 'tasks'" class="screen page-with-nav">
        <AppHeader :show-search="false" />
        <div class="title-row">
          <h1>任务中心</h1>
          <span><Zap :size="16" /> 今日活跃度 120</span>
        </div>
        <div class="chip-row wide">
          <button class="chip active">全部</button>
          <button class="chip">附近</button>
          <button class="chip">限时</button>
          <button class="chip">组队</button>
          <button class="chip">授权</button>
        </div>
        <GlowPanel v-for="item in uiTasks" :key="item.type" :title="item.type">
          <div class="task-card">
            <img :src="item.image" alt="" />
            <div class="task-main">
              <b>{{ item.title }}</b>
              <span>{{ item.desc }}</span>
              <small><MapPin :size="12" /> {{ item.meta }}</small>
              <div class="reward-row"><em>XP +{{ item.xp }}</em><em>ZC +{{ item.zc }}</em></div>
            </div>
            <div class="task-side">
              <strong>{{ item.status }}</strong>
              <button @click="item.type === '数据授权任务' ? authorizeData() : completeCoffeeTask()">{{ item.type === "数据授权任务" ? "查看权益" : "去完成" }}</button>
            </div>
          </div>
        </GlowPanel>
      </section>

      <section v-else-if="screen === 'route'" class="screen detail-screen">
        <BackHeader title="路线详情" @back="navigate('home')" />
        <div class="route-hero">
          <img :src="images.route" alt="" />
          <div>
            <h1>潮流探索路线 · 新中环线</h1>
            <p><MapPin :size="16" /> 5 个站点 <Orbit :size="16" /> 3.2km <ClipboardCheck :size="16" /> 约 90 分钟</p>
            <span>#潮流探索 #城市冒险 #新中环线</span>
          </div>
        </div>
        <GlowPanel>
          <div class="route-map">
            <span v-for="n in 5" :key="n">{{ n }}</span>
          </div>
          <div class="stop-list">
            <div v-for="(stop, index) in routeStops" :key="stop.title" class="stop-card">
              <strong>{{ index + 1 }}</strong>
              <img :src="stop.image" alt="" />
              <div><b>{{ stop.title }}</b><small>{{ stop.tags.join(" / ") }}</small></div>
              <span>{{ stop.distance }}</span>
            </div>
          </div>
        </GlowPanel>
        <GlowPanel title="完成路线可获得">
          <div class="reward-big"><b>+200 XP</b><b>+50 ZC</b></div>
        </GlowPanel>
        <button class="primary-cta" :disabled="busy" @click="completeCoffeeTask">开始路线</button>
      </section>

      <section v-else-if="screen === 'brand'" class="screen page-with-nav">
        <AppHeader />
        <HeroCard :image="images.brand" title="ZERO COFFEE" subtitle="零界咖啡 · 连接现实与未来商业" button="进入品牌世界" @click="navigate('product')" />
        <GlowPanel>
          <div class="brand-profile">
            <img :src="images.brand" alt="" />
            <div><h2>Zero Coffee / 零界咖啡</h2><p>在零界，咖啡不只是饮品，而是连接现实与未来的能量介质。</p><small>28.6 万关注者 | 128 家数字门店</small></div>
          </div>
          <button class="outline-wide">关注品牌</button>
        </GlowPanel>
        <div class="feature-grid">
          <button @click="navigate('product')"><ShoppingBag :size="24" />数字门店</button>
          <button><Ticket :size="24" />限定活动</button>
          <button><Coffee :size="24" />联名商品</button>
          <button><BriefcaseBusiness :size="24" />品牌故事</button>
        </div>
        <GlowPanel title="精选活动">
          <div class="event-card"><img :src="images.home" alt="" /><div><b>ZERO NIGHT</b><span>零界咖啡夜 · 未来共鸣</span></div><button>立即报名</button></div>
        </GlowPanel>
      </section>

      <section v-else-if="screen === 'product'" class="screen detail-screen">
        <BackHeader title="商品详情" @back="navigate('brand')" />
        <div class="product-hero">
          <img :src="images.product" alt="" />
          <div><span>ZERO COFFEE</span><h1>Zero 能量拿铁</h1><p><Zap :size="16" /> 唤醒能量 · 启动零界</p><b>¥36</b></div>
        </div>
        <GlowPanel title="数字权益（购买即享）">
          <BenefitRow title="+80 能量值" desc="购买即获得 +80 能量，可用于兑换数字商品或权益" value="价值 ¥8" />
          <BenefitRow title="零界会员成长值 +60" desc="助力升级，享受更多专属特权与折扣" value="价值 ¥6" />
          <BenefitRow title="9 折饮品券" desc="下次到店使用，全场饮品可享 9 折优惠" value="价值 ¥6" />
        </GlowPanel>
        <GlowPanel title="实体权益（到店可用）">
          <BenefitRow title="专属杯套" desc="Zero 能量拿铁限定杯套一个" value="价值 ¥5" />
          <BenefitRow title="门店 Wi-Fi 1 小时" desc="高速网络畅连 60 分钟" value="价值 ¥2" />
        </GlowPanel>
        <button class="primary-cta" @click="navigate('wallet')">加入购物车 ¥36</button>
      </section>

      <section v-else-if="screen === 'wallet'" class="screen page-with-nav">
        <AppHeader :show-search="false" />
        <div class="page-title">
          <h1>资产 / 钱包</h1>
          <p>管理你的能量、资产与数字权益</p>
        </div>
        <div class="energy-hero">
          <img :src="images.wallet" alt="" />
          <div><span>零界能量</span><b>{{ energy.toLocaleString() }}<Zap :size="32" /></b><small>≈ ¥268.00</small><button>能量明细</button></div>
        </div>
        <GlowPanel title="权益总览">
          <div class="summary-row"><Summary icon="shield" label="可用权益" value="12 项" /><Summary icon="hourglass" label="即将到期" value="3 项" /><Summary icon="award" label="累计获得" value="56 项" /></div>
        </GlowPanel>
        <GlowPanel title="核心权益">
          <div class="rights-grid"><span>会员特权</span><span>折扣权益</span><span>专属礼包</span><span>积分加速</span><span>合作权益</span><span>身份特权</span></div>
        </GlowPanel>
        <GlowPanel title="数字票证 / Digital Tickets">
          <div v-for="ticket in tickets" :key="ticket.title" class="ticket-row">
            <img :src="ticket.image" alt="" />
            <div><b>{{ ticket.title }}</b><span>{{ ticket.desc }}</span><small>{{ ticket.date }}</small></div>
            <button>立即使用</button>
          </div>
        </GlowPanel>
      </section>

      <section v-else class="screen page-with-nav">
        <AppHeader :show-search="false" />
        <div class="profile-card">
          <img :src="images.profile" alt="" />
          <div><h1>{{ wallet?.displayName ?? "林砚" }}</h1><p>{{ wallet?.level ?? "城市探索者 Lv.1" }}</p><small>{{ wallet?.didHash ?? "did:lingjie:8d09bd0e5d1d" }}</small></div>
        </div>
        <GlowPanel title="我的零界身份">
          <div class="summary-row"><Summary icon="zap" label="能量" :value="String(energy)" /><Summary icon="shield" label="信用" :value="String(wallet?.credit ?? 91)" /><Summary icon="gift" label="权益" :value="String(benefitCount)" /></div>
        </GlowPanel>
      </section>

      <div class="toast" :class="{ loading }">{{ toast }}</div>

      <nav class="bottom-nav">
        <button :class="{ active: screen === 'home' }" @click="navigate('home')"><Home :size="23" /><span>首页</span></button>
        <button :class="{ active: screen === 'explore' || screen === 'brand' || screen === 'product' || screen === 'route' }" @click="navigate('explore')"><Orbit :size="23" /><span>探索</span></button>
        <button :class="{ active: screen === 'tasks' }" @click="navigate('tasks')"><ClipboardCheck :size="23" /><span>任务</span></button>
        <button :class="{ active: screen === 'wallet' }" @click="navigate('wallet')"><WalletCards :size="23" /><span>资产</span></button>
        <button :class="{ active: screen === 'profile' }" @click="navigate('profile')"><CircleUserRound :size="23" /><span>我的</span></button>
      </nav>
    </div>
  </main>
</template>

<script lang="ts">
import type { Component } from "vue";

export default {
  components: {
    AppHeader: {
      props: { showSearch: { type: Boolean, default: true } },
      template: `
        <header class="app-header">
          <div class="location"><MapPin :size="20" /> 上海 · 静安区 <ChevronRight :size="16" /></div>
          <div class="logo">零界</div>
          <button class="ai-button"><Bot :size="26" /><span>AI助手</span></button>
        </header>
      `,
      components: { MapPin, ChevronRight, Bot }
    },
    SearchBar: {
      props: { placeholder: { type: String, default: "搜索品牌、任务、活动" } },
      template: `<div class="search-bar"><Search :size="22" /><span>{{ placeholder }}</span><ScanLine :size="20" /></div>`,
      components: { Search, ScanLine }
    },
    BackHeader: {
      props: { title: { type: String, required: true } },
      emits: ["back"],
      template: `<header class="back-header"><button @click="$emit('back')"><ChevronLeft :size="34" /></button><b>{{ title }}</b><button><Share2 :size="26" /></button></header>`,
      components: { ChevronLeft, Share2 }
    },
    HeroCard: {
      props: { image: String, title: String, subtitle: String, button: String },
      emits: ["click"],
      template: `<section class="hero-card" @click="$emit('click')"><img :src="image" alt="" /><div><h1>{{ title }}</h1><p>{{ subtitle }}</p><button>{{ button }} <ChevronRight :size="16" /></button></div></section>`,
      components: { ChevronRight }
    },
    GlowPanel: {
      props: { title: String, action: { type: String, default: "查看全部" } },
      template: `<section class="glow-panel"><div v-if="title" class="panel-head"><h2>{{ title }}</h2><button v-if="action !== ''">{{ action }} <ChevronRight :size="15" /></button></div><slot /></section>`,
      components: { ChevronRight }
    },
    TaskLite: {
      props: { title: String, desc: String, reward: String },
      emits: ["click"],
      template: `<div class="task-lite"><div class="task-icon"><ClipboardCheck :size="22" /></div><div><b>{{ title }}</b><span>{{ desc }}</span></div><em>{{ reward }}</em><button @click="$emit('click')">去完成</button></div>`,
      components: { ClipboardCheck }
    },
    BenefitRow: {
      props: { title: String, desc: String, value: String },
      template: `<div class="benefit-row"><span><Zap :size="20" /></span><div><b>{{ title }}</b><small>{{ desc }}</small></div><em>{{ value }}</em><ChevronRight :size="18" /></div>`,
      components: { Zap, ChevronRight }
    },
    Summary: {
      props: { icon: String, label: String, value: String },
      template: `<div class="summary"><ShieldCheck :size="32" /><span>{{ label }}</span><b>{{ value }}</b></div>`,
      components: { ShieldCheck }
    }
  }
};
</script>
