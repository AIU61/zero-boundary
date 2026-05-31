<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  API_BASE,
  askAssistant,
  claimTask,
  completeTaskById,
  demoLogin,
  grantConsent,
  listChainReceipts,
  listConsents,
  loadHome,
  loadWallet,
  orderProduct,
  redeemBenefit,
  revokeConsent,
  searchZero,
  startRoute,
  verifyCheckin,
  type Benefit,
  type ChainReceipt,
  type CityRoute,
  type Consent,
  type HomePayload,
  type Merchant,
  type Product,
  type Task,
  type Wallet
} from "./api";

type Screen = "onboarding" | "login" | "home" | "explore" | "tasks" | "route" | "brand" | "product" | "wallet" | "profile";

type HotspotAction =
  | "login"
  | "location"
  | "search"
  | "assistant"
  | "showMerchant"
  | "showProduct"
  | "showWallet"
  | "showEnergy"
  | "claimTask"
  | "completeCheckin"
  | "completeTask"
  | "startRoute"
  | "orderProduct"
  | "redeemBenefit"
  | "grantConsent"
  | "toggleConsent"
  | "showChain"
  | "showGovernance"
  | "showProfile";

interface Hotspot {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  to?: Screen;
  action?: HotspotAction;
  taskId?: string;
  merchantId?: string;
  productId?: string;
  routeId?: string;
}

interface PanelRow {
  label: string;
  value: string;
}

const screen = ref<Screen>("home");
const wallet = ref<Wallet>();
const tasks = ref<Task[]>([]);
const merchants = ref<Merchant[]>([]);
const routes = ref<CityRoute[]>([]);
const products = ref<Product[]>([]);
const consents = ref<Consent[]>([]);
const chainReceipts = ref<ChainReceipt[]>([]);
const busy = ref(false);
const toast = ref("正在连接零界协议");
const panelOpen = ref(false);
const panelTitle = ref("零界协议");
const panelStatus = ref("待命");
const panelRows = ref<PanelRow[]>([]);
const lastReceiptId = ref("");
let toastTimer: number | undefined;

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

const primaryTask = computed(() => tasks.value.find((task) => task.id === "task-night-route-001") ?? tasks.value[0]);
const brandTask = computed(() => tasks.value.find((task) => task.id === "task-brand-scout-002") ?? tasks.value[1] ?? primaryTask.value);
const teamTask = computed(() => tasks.value.find((task) => task.id === "task-team-route-003") ?? tasks.value[2] ?? primaryTask.value);
const primaryRoute = computed(() => routes.value[0]);
const primaryProduct = computed(() => products.value[0]);
const activeConsent = computed(() => consents.value.find((consent) => consent.status === "active"));
const activeBenefit = computed(() => wallet.value?.benefits.find((benefit) => benefit.status === "available"));
const hasBottomNav = computed(() => ["home", "explore", "tasks", "brand", "wallet", "profile"].includes(screen.value));

onMounted(async () => {
  await refreshHome();
  showToast(API_BASE ? "前后端已连接：API 3100" : "线上静态演示模式：本地启动 API 后自动联通");
});

const hotspots = computed<Hotspot[]>(() => {
  const commonNav: Hotspot[] = hasBottomNav.value
    ? [
        { label: "首页", x: 0, y: 92.8, w: 20, h: 7.2, to: "home" },
        { label: "探索", x: 20, y: 92.8, w: 20, h: 7.2, to: "explore", action: "search" },
        { label: "任务", x: 40, y: 92.8, w: 20, h: 7.2, to: "tasks" },
        { label: "资产", x: 60, y: 92.8, w: 20, h: 7.2, to: "wallet", action: "showWallet" },
        { label: "我的", x: 80, y: 92.8, w: 20, h: 7.2, to: "profile", action: "showProfile" }
      ]
    : [];

  const topActions: Hotspot[] = ["home", "explore", "tasks", "brand", "wallet", "profile"].includes(screen.value)
    ? [
        { label: "当前位置", x: 0, y: 0, w: 27, h: 6.2, action: "location" },
        { label: "AI 助手", x: 85, y: 0, w: 14, h: 8.2, action: "assistant" }
      ]
    : [];

  const byScreen: Record<Screen, Hotspot[]> = {
    onboarding: [
      { label: "开启零界之旅", x: 8, y: 82.5, w: 84, h: 8.2, action: "login", to: "home" },
      { label: "去登录", x: 36, y: 92, w: 28, h: 4, to: "login" }
    ],
    login: [
      { label: "返回", x: 2, y: 1.5, w: 10, h: 6, to: "onboarding" },
      { label: "注册", x: 52, y: 42.5, w: 38, h: 6, action: "login", to: "home" },
      { label: "登录", x: 10, y: 71.2, w: 80, h: 7.4, action: "login", to: "home" }
    ],
    home: [
      { label: "搜索品牌任务活动", x: 3, y: 6.7, w: 82, h: 6, action: "search" },
      { label: "扫码核销", x: 85, y: 6.7, w: 11, h: 6, action: "completeCheckin" },
      { label: "探索零界经济体", x: 8, y: 24, w: 28, h: 4.8, action: "search", to: "explore" },
      { label: "附近品牌", x: 2, y: 34.8, w: 96, h: 16.8, action: "showMerchant", to: "brand" },
      { label: "今日任务", x: 2, y: 52.6, w: 72, h: 13.5, action: "claimTask", to: "tasks" },
      { label: "任务去完成", x: 77, y: 57.6, w: 20, h: 4, action: "completeCheckin" },
      { label: "城市路线", x: 2, y: 67.2, w: 74, h: 11.5, action: "startRoute", to: "route" },
      { label: "去探索路线", x: 76, y: 70.1, w: 21, h: 5.4, action: "startRoute", to: "route" },
      { label: "我的资产", x: 2, y: 79.4, w: 96, h: 12, action: "showWallet", to: "wallet" }
    ],
    explore: [
      { label: "搜索探索", x: 4, y: 7, w: 76, h: 6, action: "search" },
      { label: "品牌地图", x: 78, y: 7, w: 18, h: 6, action: "location" },
      { label: "Zero Coffee", x: 39, y: 31, w: 32, h: 8, action: "showMerchant", merchantId: "merchant-black-rain", to: "brand" },
      { label: "零界花店", x: 8, y: 52, w: 38, h: 12, action: "showMerchant", merchantId: "merchant-flower", to: "brand" },
      { label: "Zero Gym", x: 54, y: 52, w: 38, h: 12, action: "showMerchant", merchantId: "merchant-zero-gym", to: "brand" },
      { label: "附近推荐", x: 2, y: 70, w: 96, h: 20, action: "showMerchant", to: "brand" }
    ],
    tasks: [
      { label: "任务列表刷新", x: 2, y: 16, w: 96, h: 10, action: "showGovernance" },
      { label: "附近任务去完成", x: 74, y: 29, w: 20, h: 6, action: "completeCheckin", taskId: primaryTask.value?.id },
      { label: "限时任务去完成", x: 74, y: 46, w: 20, h: 6, action: "completeTask", taskId: brandTask.value?.id, to: "brand" },
      { label: "组队任务去完成", x: 74, y: 63.5, w: 20, h: 6, action: "startRoute", routeId: primaryRoute.value?.id, to: "route" },
      { label: "授权任务", x: 74, y: 80.5, w: 20, h: 6, action: "grantConsent" }
    ],
    route: [
      { label: "返回", x: 0, y: 0, w: 12, h: 7, to: "home" },
      { label: "路线详情", x: 7, y: 15, w: 86, h: 18, action: "startRoute" },
      { label: "站点 Zero Coffee", x: 8, y: 41.5, w: 84, h: 8.2, action: "showMerchant", merchantId: "merchant-black-rain", to: "brand" },
      { label: "站点权益", x: 8, y: 51, w: 84, h: 13, action: "grantConsent" },
      { label: "开始路线", x: 6, y: 91.2, w: 88, h: 6.8, action: "completeCheckin" }
    ],
    brand: [
      { label: "品牌数据", x: 5, y: 15, w: 90, h: 28, action: "showMerchant", merchantId: "merchant-black-rain" },
      { label: "进入品牌世界", x: 66, y: 45.5, w: 28, h: 5.2, action: "showProduct", productId: "product-black-rain-coldbrew", to: "product" },
      { label: "数字门店", x: 2, y: 53, w: 32, h: 15, action: "showProduct", productId: "product-black-rain-coldbrew", to: "product" },
      { label: "权益配置", x: 36, y: 53, w: 30, h: 15, action: "grantConsent" },
      { label: "链上存证", x: 68, y: 53, w: 30, h: 15, action: "showChain" },
      { label: "精选活动报名", x: 72, y: 81, w: 22, h: 5, action: "completeTask", taskId: brandTask.value?.id, to: "tasks" }
    ],
    product: [
      { label: "返回", x: 0, y: 0, w: 12, h: 7, to: "brand" },
      { label: "商品详情", x: 5, y: 14, w: 90, h: 54, action: "showProduct", productId: "product-black-rain-coldbrew" },
      { label: "查看链上规则", x: 12, y: 71, w: 35, h: 6, action: "showChain" },
      { label: "授权偏好", x: 52, y: 71, w: 35, h: 6, action: "grantConsent" },
      { label: "加入购物车", x: 3, y: 85.4, w: 94, h: 6.5, action: "orderProduct", productId: "product-black-rain-coldbrew", to: "wallet" }
    ],
    wallet: [
      { label: "钱包概览", x: 5, y: 13, w: 90, h: 16, action: "showWallet" },
      { label: "能量明细", x: 6, y: 26.5, w: 24, h: 4.5, action: "showEnergy" },
      { label: "权益钱包", x: 4, y: 50, w: 92, h: 22, action: "showWallet" },
      { label: "链上存证", x: 5, y: 72, w: 35, h: 15, action: "showChain" },
      { label: "立即使用票证", x: 67, y: 72, w: 30, h: 17, action: "redeemBenefit" }
    ],
    profile: [
      { label: "零界 ID", x: 5, y: 12, w: 90, h: 18, action: "showProfile" },
      { label: "数据授权", x: 5, y: 31, w: 90, h: 12, action: "toggleConsent" },
      { label: "链上存证查询", x: 5, y: 44, w: 90, h: 12, action: "showChain" },
      { label: "平台治理", x: 5, y: 57, w: 90, h: 12, action: "showGovernance" },
      { label: "首页", x: 0, y: 92.8, w: 20, h: 7.2, to: "home" }
    ]
  };

  return [...topActions, ...(byScreen[screen.value] ?? []), ...commonNav];
});

async function refreshHome() {
  const payload = await loadHome();
  applyHome(payload);
}

function applyHome(payload: HomePayload) {
  wallet.value = payload.user;
  tasks.value = payload.tasks;
  merchants.value = payload.merchants;
  routes.value = payload.routes;
  products.value = payload.products;
  consents.value = payload.consents;
  chainReceipts.value = payload.chainReceipts;
}

async function refreshRuntime() {
  const [walletPayload, consentPayload, receiptPayload] = await Promise.all([loadWallet(), listConsents(), listChainReceipts()]);
  wallet.value = walletPayload.wallet;
  consents.value = consentPayload.consents;
  chainReceipts.value = receiptPayload.receipts;
}

function navigate(target: Screen) {
  screen.value = target;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function runHotspot(hotspot: Hotspot) {
  if (busy.value) return;

  try {
    if (hotspot.action) {
      busy.value = true;
      await runAction(hotspot);
    }

    if (hotspot.to) {
      navigate(hotspot.to);
    }
  } catch (error) {
    showPanel("操作未完成", describeError(error), [
      { label: "运行模式", value: API_BASE ? "已连接本地 API" : "静态 fallback" },
      { label: "建议", value: "确认后端服务在 3100 端口运行后重试" }
    ]);
  } finally {
    busy.value = false;
  }
}

async function runAction(hotspot: Hotspot) {
  switch (hotspot.action) {
    case "login":
      await loginAction();
      return;
    case "location":
      showLocationAction();
      return;
    case "search":
      await searchAction();
      return;
    case "assistant":
      await assistantAction();
      return;
    case "showMerchant":
      showMerchantAction(hotspot.merchantId);
      return;
    case "showProduct":
      showProductAction(hotspot.productId);
      return;
    case "showWallet":
      await showWalletAction();
      return;
    case "showEnergy":
      showEnergyAction();
      return;
    case "claimTask":
      await claimTaskAction(hotspot.taskId);
      return;
    case "completeCheckin":
      await completeCheckinAction(hotspot.taskId);
      return;
    case "completeTask":
      await completeGenericTaskAction(hotspot.taskId);
      return;
    case "startRoute":
      await startRouteAction(hotspot.routeId);
      return;
    case "orderProduct":
      await orderProductAction(hotspot.productId);
      return;
    case "redeemBenefit":
      await redeemBenefitAction();
      return;
    case "grantConsent":
      await grantConsentAction();
      return;
    case "toggleConsent":
      await toggleConsentAction();
      return;
    case "showChain":
      await showChainAction();
      return;
    case "showGovernance":
      await showGovernanceAction();
      return;
    case "showProfile":
      showProfileAction();
      return;
  }
}

async function loginAction() {
  const result = await demoLogin();
  wallet.value = result.wallet;
  showPanel("登录成功", "零界 ID 已激活", [
    { label: "用户", value: result.wallet.displayName },
    { label: "DID", value: result.wallet.didHash },
    { label: "等级", value: result.wallet.level }
  ]);
  showToast("登录态已和后端钱包同步");
}

async function searchAction() {
  const result = await searchZero("Zero Coffee");
  showPanel("搜索结果", `找到 ${result.merchants.length + result.tasks.length + result.routes.length + result.products.length} 个相关对象`, [
    { label: "品牌", value: result.merchants.map((item) => item.name).join(" / ") || "无" },
    { label: "任务", value: result.tasks.map((item) => item.title).join(" / ") || "无" },
    { label: "路线", value: result.routes.map((item) => item.title).join(" / ") || "无" },
    { label: "商品", value: result.products.map((item) => item.title).join(" / ") || "无" }
  ]);
}

async function assistantAction() {
  const result = await askAssistant("下一步应该完成什么");
  showPanel("AI 助手", result.reply, [
    { label: "建议动作", value: result.nextAction.type },
    { label: "目标 ID", value: result.nextAction.id }
  ]);
}

function showLocationAction() {
  showPanel("附近门店", "门店列表来自后端商家审核数据", merchants.value.map((merchant) => ({ label: merchant.name, value: `${merchant.distanceMeters}m · ${merchant.scene} · ${merchant.complianceStatus}` })));
}

function showMerchantAction(merchantId?: string) {
  const merchant = merchants.value.find((item) => item.id === merchantId) ?? merchants.value[0];
  if (!merchant) return;

  showPanel("数字门店", merchant.description ?? merchant.scene, [
    { label: "门店", value: merchant.name },
    { label: "地址", value: merchant.address },
    { label: "距离", value: `${merchant.distanceMeters}m` },
    { label: "审核状态", value: merchant.complianceStatus === "approved" ? "已审核" : "待审核" }
  ]);
}

function showProductAction(productId?: string) {
  const product = products.value.find((item) => item.id === productId) ?? primaryProduct.value;
  if (!product) return;

  showPanel("商品权益", product.description, [
    { label: "商品", value: product.title },
    { label: "价格", value: formatMoney(product.priceCents) },
    { label: "发放权益", value: product.benefitTitle },
    { label: "合规", value: "不可转让 / 不可提现 / 不兑换现金" }
  ]);
}

async function showWalletAction() {
  await refreshRuntime();
  const currentWallet = wallet.value;
  if (!currentWallet) return;

  showPanel("权益钱包", "钱包状态已从后端刷新", [
    { label: "零界能量", value: `${currentWallet.energy}` },
    { label: "贡献值", value: `${currentWallet.contribution}` },
    { label: "可用权益", value: `${currentWallet.benefits.filter((item) => item.status === "available").length}` },
    { label: "最近票根", value: currentWallet.benefits[0]?.title ?? "暂无，完成打卡后自动到账" }
  ]);
}

function showEnergyAction() {
  const currentWallet = wallet.value;
  if (!currentWallet) return;

  showPanel("能量明细", "能量只作为 App 内成长值，不上链、不提现、不转让", [
    { label: "当前能量", value: `${currentWallet.energy}` },
    { label: "等级", value: currentWallet.level },
    { label: "信用分", value: `${currentWallet.credit}` },
    { label: "贡献值", value: `${currentWallet.contribution}` }
  ]);
}

async function claimTaskAction(taskId?: string) {
  const task = getTask(taskId);
  if (!task) return;

  const result = await claimTask(task.id);
  upsertTask(result.task);
  showPanel("任务已领取", result.task.subtitle, [
    { label: "任务", value: result.task.title },
    { label: "奖励", value: `+${result.task.rewardEnergy} 能量` },
    { label: "状态", value: result.task.status }
  ]);
}

async function completeCheckinAction(taskId?: string) {
  const task = getTask(taskId);
  if (!task) return;

  if (task.status === "available") {
    const claimed = await claimTask(task.id);
    upsertTask(claimed.task);
  }

  const result = await verifyCheckin(task.id, task.requiredMerchantId);
  wallet.value = result.wallet;
  lastReceiptId.value = result.issuedBenefit.chainBusinessId ?? "";
  await refreshHome();
  showPanel("扫码核销成功", "后端已生成履约记录，并写入联盟链存证哈希", [
    { label: "任务", value: task.title },
    { label: "发放权益", value: result.issuedBenefit.title },
    { label: "权益状态", value: result.issuedBenefit.status },
    { label: "链上业务 ID", value: lastReceiptId.value || "已写入" }
  ]);
  showToast("票根已进入权益钱包");
  navigate("wallet");
}

async function completeGenericTaskAction(taskId?: string) {
  const task = getTask(taskId);
  if (!task) return;

  const result = await completeTaskById(task.id);
  upsertTask(result.task);
  wallet.value = result.wallet;
  lastReceiptId.value = result.issuedBenefit.chainBusinessId ?? "";
  await refreshRuntime();
  showPanel("任务完成", "非扫码任务已通过后端完成接口发放权益", [
    { label: "任务", value: result.task.title },
    { label: "奖励", value: `+${result.task.rewardEnergy} 能量` },
    { label: "权益", value: result.issuedBenefit.title },
    { label: "链上凭证", value: result.receipts.map((item) => item.registry).join(" / ") }
  ]);
}

async function startRouteAction(routeId?: string) {
  const route = routes.value.find((item) => item.id === routeId) ?? primaryRoute.value;
  if (!route) return;

  const result = await startRoute(route.id);
  upsertRoute(result.route);
  upsertTask(result.task);
  showPanel("路线已启动", result.route.subtitle, [
    { label: "路线", value: result.route.title },
    { label: "距离", value: `${result.route.distanceKm} km` },
    { label: "站点", value: `${result.route.stopCount} 个` },
    { label: "任务状态", value: result.task.status }
  ]);
}

async function orderProductAction(productId?: string) {
  const product = products.value.find((item) => item.id === productId) ?? primaryProduct.value;
  if (!product) return;

  const result = await orderProduct(product.id);
  wallet.value = result.wallet;
  lastReceiptId.value = result.receipt.businessId;
  await refreshRuntime();
  showPanel("下单成功", "已发放绑定真实权益的数字凭证", [
    { label: "订单", value: result.order.id },
    { label: "金额", value: formatMoney(result.order.amountCents) },
    { label: "权益", value: result.benefit.title },
    { label: "链上凭证", value: result.receipt.txId ?? result.receipt.businessId }
  ]);
  showToast("权益已到账");
}

async function redeemBenefitAction() {
  if (!activeBenefit.value) {
    await completeCheckinAction(primaryTask.value?.id);
    return;
  }

  const result = await redeemBenefit(activeBenefit.value.id);
  wallet.value = result.wallet;
  lastReceiptId.value = result.receipt.businessId;
  await refreshRuntime();
  showPanel("权益已使用", "使用状态已回写后端，并生成链上状态存证", [
    { label: "权益", value: result.benefit.title },
    { label: "状态", value: result.benefit.status },
    { label: "凭证", value: result.receipt.txId ?? result.receipt.businessId }
  ]);
}

async function grantConsentAction() {
  const merchant = merchants.value[0];
  if (!merchant) return;

  const result = await grantConsent(merchant.id);
  await refreshRuntime();
  lastReceiptId.value = result.consent.chainBusinessId;
  showPanel("数据授权已存证", "用户授权用途、期限和回报已写入 ConsentRegistry", [
    { label: "门店", value: merchant.name },
    { label: "用途", value: result.consent.purpose },
    { label: "回报", value: result.consent.rewardDescription },
    { label: "状态", value: result.consent.status }
  ]);
}

async function toggleConsentAction() {
  if (!activeConsent.value) {
    await grantConsentAction();
    return;
  }

  const result = await revokeConsent(activeConsent.value.id);
  await refreshRuntime();
  showPanel("授权已撤回", "企业侧不可再查询撤回后的授权数据", [
    { label: "授权 ID", value: result.consent.id },
    { label: "状态", value: result.consent.status },
    { label: "撤回时间", value: formatDate(result.consent.revokedAt) }
  ]);
}

async function showChainAction() {
  const result = await listChainReceipts();
  chainReceipts.value = result.receipts;
  const recent = result.receipts.slice(-4).reverse();

  showPanel("链上存证查询", `${result.receipts.length} 条业务凭证，链上只保存哈希和状态`, [
    ...recent.map((receipt) => ({ label: receipt.registry, value: `${receipt.status} · ${receipt.txId ?? receipt.businessId}` })),
    { label: "最近业务 ID", value: lastReceiptId.value || recent[0]?.businessId || "暂无" }
  ]);
}

async function showGovernanceAction() {
  await refreshHome();
  const completed = tasks.value.filter((task) => task.status === "completed").length;
  const approved = merchants.value.filter((merchant) => merchant.complianceStatus === "approved").length;
  showPanel("平台治理看板", "商家审核、任务审核、反作弊和链上存证状态", [
    { label: "已审核商家", value: `${approved}` },
    { label: "待审核商家", value: `${merchants.value.length - approved}` },
    { label: "任务完成率", value: formatPercent(tasks.value.length === 0 ? 0 : completed / tasks.value.length) },
    { label: "链上凭证", value: `${chainReceipts.value.length}` }
  ]);
}

function showProfileAction() {
  const currentWallet = wallet.value;
  if (!currentWallet) return;

  showPanel("零界 ID", "DID 只用于可信证明，手机号等敏感信息不上链", [
    { label: "用户", value: currentWallet.displayName },
    { label: "DID Hash", value: currentWallet.didHash },
    { label: "等级", value: currentWallet.level },
    { label: "授权", value: activeConsent.value ? "已授权，可点击撤回" : "未授权，可点击开启" }
  ]);
}

function getTask(taskId?: string) {
  return tasks.value.find((task) => task.id === taskId) ?? primaryTask.value;
}

function upsertTask(task: Task) {
  tasks.value = tasks.value.map((item) => (item.id === task.id ? task : item));
}

function upsertRoute(route: CityRoute) {
  routes.value = routes.value.map((item) => (item.id === route.id ? route : item));
}

function showPanel(title: string, status: string, rows: PanelRow[]) {
  panelTitle.value = title;
  panelStatus.value = status;
  panelRows.value = rows;
  panelOpen.value = true;
}

function closePanel() {
  panelOpen.value = false;
}

function showToast(message: string) {
  toast.value = message;
  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    toast.value = "";
  }, 3200);
}

function formatMoney(priceCents: number) {
  return `¥${(priceCents / 100).toFixed(2)}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "暂无";
}

function describeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const errorMap: Record<string, string> = {
    DUPLICATE_CHECKIN: "该任务已经核销过，不能重复扫码。",
    TASK_ALREADY_COMPLETED: "该任务已经完成，可到钱包查看权益。",
    BENEFIT_NOT_AVAILABLE: "该权益当前不可使用，可能已使用或已过期。",
    CONSENT_NOT_FOUND: "当前没有可撤回的授权记录。"
  };
  return errorMap[message] ?? message;
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
        :title="hotspot.label"
        :style="{
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          width: `${hotspot.w}%`,
          height: `${hotspot.h}%`
        }"
        @click="runHotspot(hotspot)"
      />

      <p v-if="toast" class="toast">{{ toast }}</p>

      <aside v-if="panelOpen" class="action-sheet" aria-live="polite">
        <button class="sheet-close" aria-label="关闭" @click="closePanel">×</button>
        <p class="sheet-kicker">Lingjie Protocol</p>
        <h2>{{ panelTitle }}</h2>
        <p class="sheet-status">{{ panelStatus }}</p>
        <dl>
          <div v-for="row in panelRows" :key="`${row.label}-${row.value}`" class="sheet-row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </aside>
    </section>
  </main>
</template>
