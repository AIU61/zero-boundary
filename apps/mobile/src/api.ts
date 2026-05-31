export interface Merchant {
  id: string;
  name: string;
  scene: string;
  address: string;
  distanceMeters: number;
  rating: number;
  complianceStatus: "approved" | "pending" | "suspended";
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  rewardEnergy: number;
  routeName: string;
  requiredMerchantId: string;
  expiresAt: string;
  status: "available" | "claimed" | "completed" | "expired";
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  stops: Array<{ merchantId: string; title: string; action: string }>;
}

export interface CityRoute {
  id: string;
  title: string;
  subtitle: string;
  taskId: string;
  distanceKm: number;
  stopCount: number;
  status: "locked" | "available" | "started" | "completed";
  stops: Array<{ merchantId: string; title: string; action: string }>;
}

export interface Product {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  priceCents: number;
  benefitTitle: string;
  status: "available" | "sold_out";
}

export interface Benefit {
  id: string;
  userId?: string;
  title: string;
  description: string;
  type: string;
  transferable: false;
  cashable: false;
  expiresAt: string;
  status: "available" | "used" | "expired" | string;
  taskId?: string;
  chainBusinessId?: string;
}

export interface Wallet {
  userId: string;
  didHash: string;
  displayName: string;
  level: string;
  energy: number;
  contribution: number;
  credit: number;
  benefits: Benefit[];
}

export interface Consent {
  id: string;
  userId: string;
  merchantId: string;
  purpose: string;
  rewardDescription: string;
  expiresAt: string;
  status: "active" | "revoked" | "expired";
  createdAt: string;
  revokedAt?: string;
  chainBusinessId: string;
}

export interface ChainReceipt {
  businessId: string;
  registry: "TaskReceiptRegistry" | "ConsentRegistry" | "BenefitCredentialRegistry";
  payloadHash: string;
  status: "pending" | "confirmed" | "failed";
  txId?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface Governance {
  approvedMerchants: number;
  pendingMerchants: number;
  taskCompletionRate: number;
  verifiedCheckins: number;
  rejectedCheckins: number;
  pendingChainReceipts: number;
}

export interface HomePayload {
  user: Wallet;
  tasks: Task[];
  merchants: Merchant[];
  routes: CityRoute[];
  products: Product[];
  consents: Consent[];
  chainReceipts: ChainReceipt[];
  governance: Governance;
}

export interface SearchPayload {
  keyword: string;
  merchants: Merchant[];
  tasks: Task[];
  routes: CityRoute[];
  products: Product[];
}

export const DEFAULT_USER_ID = "user-linyan";
export const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:3100" : "");

class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(getErrorMessage(payload));
    this.status = status;
    this.payload = payload;
  }
}

const thirtyDaysFromNow = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const sevenDaysFromNow = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const demoHome: HomePayload = {
  user: {
    userId: DEFAULT_USER_ID,
    didHash: "did:lingjie:8d09bd0e5d1d",
    displayName: "林砚",
    level: "零界探索者 Lv.3",
    energy: 2680,
    contribution: 56,
    credit: 91,
    benefits: []
  },
  tasks: [
    {
      id: "task-night-route-001",
      title: "打卡 Zero Coffee",
      subtitle: "在 Zero Coffee 完成消费打卡，获得数字票根与隐藏菜单资格。",
      story: "雨夜里，第一杯冷萃把南京西路从流量黑箱里拉回真实体验。",
      rewardEnergy: 80,
      routeName: "南京西路·潮流探索路线",
      requiredMerchantId: "merchant-black-rain",
      expiresAt: sevenDaysFromNow(),
      status: "available",
      stops: [
        { merchantId: "merchant-black-rain", title: "Zero Coffee", action: "扫码核销消费打卡" },
        { merchantId: "merchant-flower", title: "零界花店", action: "解锁二段复购权益" }
      ]
    },
    {
      id: "task-brand-scout-002",
      title: "探索 2 个新品牌",
      subtitle: "浏览并关注任意 2 个新品牌，获得能量奖励。",
      story: "城市品牌不是广告牌，而是被真实路过的人点亮的坐标。",
      rewardEnergy: 60,
      routeName: "附近品牌探索",
      requiredMerchantId: "merchant-flower",
      expiresAt: sevenDaysFromNow(),
      status: "available",
      stops: [
        { merchantId: "merchant-flower", title: "零界花店", action: "浏览数字门店" },
        { merchantId: "merchant-zero-gym", title: "Zero Gym", action: "关注品牌动态" }
      ]
    },
    {
      id: "task-team-route-003",
      title: "组队完成夜行路线",
      subtitle: "邀请好友完成路线站点，解锁优先预约权益。",
      story: "零界路线让小队协作变成可信的线下履约记录。",
      rewardEnergy: 120,
      routeName: "夜行小队路线",
      requiredMerchantId: "merchant-zero-gym",
      expiresAt: sevenDaysFromNow(),
      status: "available",
      stops: [
        { merchantId: "merchant-black-rain", title: "Zero Coffee", action: "集合" },
        { merchantId: "merchant-zero-gym", title: "Zero Gym", action: "完成小队打卡" }
      ]
    }
  ],
  merchants: [
    {
      id: "merchant-black-rain",
      name: "Zero Coffee",
      scene: "夜行咖啡",
      address: "上海静安区 南京西路 108 号",
      distanceMeters: 120,
      rating: 4.8,
      complianceStatus: "approved",
      description: "黑雨冷萃首发门店，绑定夜行路线、隐藏菜单和数字票根。"
    },
    {
      id: "merchant-flower",
      name: "零界花店",
      scene: "花艺生活",
      address: "上海静安区 南京西路 126 号",
      distanceMeters: 180,
      rating: 4.9,
      complianceStatus: "approved",
      description: "花艺、咖啡和城市路线的联名站点。"
    },
    {
      id: "merchant-zero-gym",
      name: "Zero Gym",
      scene: "运动健康",
      address: "上海静安区 南京西路 168 号 B1",
      distanceMeters: 260,
      rating: 4.7,
      complianceStatus: "pending",
      description: "运动消费与城市贡献值试点门店。"
    }
  ],
  routes: [
    {
      id: "route-night-001",
      title: "南京西路·潮流探索路线",
      subtitle: "2.3 km | 8 个站点 | 咖啡、花店、运动与夜生活联名",
      taskId: "task-night-route-001",
      distanceKm: 2.3,
      stopCount: 8,
      status: "available",
      stops: [
        { merchantId: "merchant-black-rain", title: "Zero Coffee", action: "到店扫码" },
        { merchantId: "merchant-flower", title: "零界花店", action: "领取联名权益" },
        { merchantId: "merchant-zero-gym", title: "Zero Gym", action: "解锁复购路线" }
      ]
    }
  ],
  products: [
    {
      id: "product-black-rain-coldbrew",
      merchantId: "merchant-black-rain",
      title: "黑雨冷萃隐藏菜单",
      description: "购买后发放不可转让的隐藏菜单资格，绑定 7 日内复购权益。",
      priceCents: 3800,
      benefitTitle: "黑雨冷萃隐藏菜单资格",
      status: "available"
    },
    {
      id: "product-route-pass",
      merchantId: "merchant-black-rain",
      title: "ZERO CITY 夜行体验券",
      description: "适用于夜行路线门店权益，不支持转让、提现或二级交易。",
      priceCents: 6800,
      benefitTitle: "ZERO CITY 夜行体验券",
      status: "available"
    }
  ],
  consents: [],
  chainReceipts: [],
  governance: {
    approvedMerchants: 2,
    pendingMerchants: 1,
    taskCompletionRate: 0,
    verifiedCheckins: 0,
    rejectedCheckins: 0,
    pendingChainReceipts: 0
  }
};

let demoState = structuredClone(demoHome);

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload as T;
}

async function requestOrFallback<T>(path: string, fallback: () => T | Promise<T>, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    return fallback();
  }

  try {
    return await requestJson<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) {
      throw error;
    }
    return fallback();
  }
}

export function loadHome() {
  return requestOrFallback<HomePayload>("/api/home", () => snapshotDemo());
}

export function demoLogin() {
  return requestOrFallback<{ user: Wallet; wallet: Wallet }>(
    "/api/auth/demo-login",
    () => ({ user: snapshotDemo().user, wallet: snapshotDemo().user }),
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID })
    }
  );
}

export function claimTask(taskId: string) {
  return requestOrFallback<{ task: Task }>(
    `/api/tasks/${taskId}/claim`,
    () => {
      const task = findDemoTask(taskId);
      task.status = "claimed";
      task.claimedBy = DEFAULT_USER_ID;
      task.claimedAt = new Date().toISOString();
      return { task: structuredClone(task) };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID })
    }
  );
}

export function completeTaskById(taskId: string) {
  return requestOrFallback<{ task: Task; wallet: Wallet; issuedBenefit: Benefit; receipts: ChainReceipt[] }>(
    `/api/tasks/${taskId}/complete`,
    () => {
      const task = findDemoTask(taskId);
      if (task.status !== "completed") {
        task.status = "completed";
        task.claimedBy = task.claimedBy ?? DEFAULT_USER_ID;
        task.claimedAt = task.claimedAt ?? new Date().toISOString();
        task.completedAt = new Date().toISOString();
        demoState.user.energy += task.rewardEnergy;
        demoState.user.contribution += 5;
      }
      const benefit = createDemoBenefit("ZERO CITY 任务数字票根", taskId, `benefit_task_${Date.now()}`);
      const receipts = [createDemoReceipt(`task_receipt_${Date.now()}`, "TaskReceiptRegistry"), createDemoReceipt(benefit.chainBusinessId!, "BenefitCredentialRegistry")];
      demoState.user.benefits = [benefit, ...demoState.user.benefits];
      demoState.chainReceipts.push(...receipts);
      refreshDemoGovernance();
      return { task: structuredClone(task), wallet: structuredClone(demoState.user), issuedBenefit: structuredClone(benefit), receipts: structuredClone(receipts) };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID })
    }
  );
}

export function startRoute(routeId: string) {
  return requestOrFallback<{ route: CityRoute; task: Task }>(
    `/api/routes/${routeId}/start`,
    () => {
      const route = demoState.routes.find((item) => item.id === routeId) ?? demoState.routes[0];
      const task = findDemoTask(route.taskId);
      route.status = "started";
      if (task.status === "available") {
        task.status = "claimed";
        task.claimedBy = DEFAULT_USER_ID;
        task.claimedAt = new Date().toISOString();
      }
      return { route: structuredClone(route), task: structuredClone(task) };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID })
    }
  );
}

export function verifyCheckin(taskId: string, merchantId: string) {
  return requestOrFallback<{ wallet: Wallet; issuedBenefit: Benefit; checkin?: { chainBusinessId?: string; status: string } }>(
    "/api/checkins/qr/verify",
    () => {
      const task = findDemoTask(taskId);
      if (task.status !== "completed") {
        task.status = "completed";
        task.completedAt = new Date().toISOString();
        demoState.user.energy += task.rewardEnergy;
        demoState.user.contribution += 5;
        demoState.user.level = "咖啡猎人 Lv.4";
      }

      const benefit = createDemoBenefit("ZERO CITY 夜行数字票根", taskId, `benefit_demo_${Date.now()}`);
      demoState.user.benefits = [benefit, ...demoState.user.benefits.filter((item) => item.taskId !== taskId || item.type !== "ticket")];
      demoState.chainReceipts.push(createDemoReceipt(`task_receipt_demo_${Date.now()}`, "TaskReceiptRegistry"));
      demoState.chainReceipts.push(createDemoReceipt(benefit.chainBusinessId!, "BenefitCredentialRegistry"));
      refreshDemoGovernance();
      return { wallet: structuredClone(demoState.user), issuedBenefit: structuredClone(benefit), checkin: { status: "verified", chainBusinessId: benefit.chainBusinessId } };
    },
    {
      method: "POST",
      body: JSON.stringify({
        userId: DEFAULT_USER_ID,
        taskId,
        merchantId,
        qrPayload: "LINGJIE:merchant-black-rain:task-night-route-001",
        deviceId: "mobile-demo-device"
      })
    }
  );
}

export function orderProduct(productId: string) {
  return requestOrFallback<{ order: { id: string; status: string; amountCents: number }; benefit: Benefit; wallet: Wallet; receipt: ChainReceipt }>(
    `/api/products/${productId}/order`,
    () => {
      const product = demoState.products.find((item) => item.id === productId) ?? demoState.products[0];
      const orderId = `order_demo_${Date.now()}`;
      const benefit = createDemoBenefit(product.benefitTitle, product.id, `benefit_order_${orderId}`, "hidden_menu");
      const receipt = createDemoReceipt(benefit.chainBusinessId!, "BenefitCredentialRegistry");
      demoState.user.benefits = [benefit, ...demoState.user.benefits];
      demoState.chainReceipts.push(receipt);
      return {
        order: { id: orderId, status: "paid", amountCents: product.priceCents },
        benefit: structuredClone(benefit),
        wallet: structuredClone(demoState.user),
        receipt: structuredClone(receipt)
      };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID, quantity: 1 })
    }
  );
}

export function redeemBenefit(benefitId: string) {
  return requestOrFallback<{ benefit: Benefit; wallet: Wallet; receipt: ChainReceipt }>(
    `/api/benefits/${benefitId}/redeem`,
    () => {
      const benefit = demoState.user.benefits.find((item) => item.id === benefitId) ?? demoState.user.benefits[0] ?? createDemoBenefit("演示权益", "manual", `benefit_redeem_${Date.now()}`);
      benefit.status = "used";
      const receipt = createDemoReceipt(`${benefit.chainBusinessId ?? benefit.id}_redeem`, "BenefitCredentialRegistry");
      demoState.chainReceipts.push(receipt);
      return { benefit: structuredClone(benefit), wallet: structuredClone(demoState.user), receipt: structuredClone(receipt) };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID })
    }
  );
}

export function grantConsent(merchantId: string) {
  return requestOrFallback<{ consent: Consent }>(
    "/api/consents/grant",
    () => {
      const consent: Consent = {
        id: `consent_demo_${Date.now()}`,
        userId: DEFAULT_USER_ID,
        merchantId,
        purpose: "用于复购提醒、口味偏好分析和路线推荐",
        rewardDescription: "隐藏菜单优先体验资格",
        expiresAt: sevenDaysFromNow(),
        status: "active",
        createdAt: new Date().toISOString(),
        chainBusinessId: `consent_chain_demo_${Date.now()}`
      };
      demoState.consents = [consent, ...demoState.consents];
      demoState.chainReceipts.push(createDemoReceipt(consent.chainBusinessId, "ConsentRegistry"));
      return { consent: structuredClone(consent) };
    },
    {
      method: "POST",
      body: JSON.stringify({
        userId: DEFAULT_USER_ID,
        merchantId,
        purpose: "用于复购提醒、口味偏好分析和路线推荐",
        rewardDescription: "隐藏菜单优先体验资格",
        expiresAt: sevenDaysFromNow()
      })
    }
  );
}

export function revokeConsent(consentId: string) {
  return requestOrFallback<{ consent: Consent }>(
    "/api/consents/revoke",
    () => {
      const consent = demoState.consents.find((item) => item.id === consentId) ?? demoState.consents[0];
      if (!consent) {
        throw new Error("没有可撤回的授权");
      }
      consent.status = "revoked";
      consent.revokedAt = new Date().toISOString();
      demoState.chainReceipts.push(createDemoReceipt(`${consent.chainBusinessId}_revoke`, "ConsentRegistry"));
      return { consent: structuredClone(consent) };
    },
    {
      method: "POST",
      body: JSON.stringify({ consentId })
    }
  );
}

export function loadWallet() {
  return requestOrFallback<{ wallet: Wallet }>(`/api/wallet?userId=${DEFAULT_USER_ID}`, () => ({ wallet: structuredClone(demoState.user) }));
}

export function listConsents() {
  return requestOrFallback<{ consents: Consent[] }>(`/api/consents?userId=${DEFAULT_USER_ID}`, () => ({ consents: structuredClone(demoState.consents) }));
}

export function listChainReceipts() {
  return requestOrFallback<{ receipts: ChainReceipt[] }>("/api/chain/receipts", () => ({ receipts: structuredClone(demoState.chainReceipts) }));
}

export function searchZero(keyword: string) {
  const query = encodeURIComponent(keyword);
  return requestOrFallback<SearchPayload>(
    `/api/search?q=${query}`,
    () => {
      const normalized = keyword.trim().toLowerCase();
      const matches = (value: string) => normalized.length === 0 || value.toLowerCase().includes(normalized);
      return {
        keyword,
        merchants: structuredClone(demoState.merchants.filter((item) => [item.name, item.scene, item.address, item.description ?? ""].some(matches))),
        tasks: structuredClone(demoState.tasks.filter((item) => [item.title, item.subtitle, item.routeName].some(matches))),
        routes: structuredClone(demoState.routes.filter((item) => [item.title, item.subtitle].some(matches))),
        products: structuredClone(demoState.products.filter((item) => [item.title, item.description, item.benefitTitle].some(matches)))
      };
    }
  );
}

export function askAssistant(message: string) {
  return requestOrFallback<{ reply: string; nextAction: { type: string; id: string } }>(
    "/api/ai/assistant",
    () => {
      const activeTask = demoState.tasks.find((item) => item.status !== "completed") ?? demoState.tasks[0];
      return {
        reply: `建议先完成「${activeTask.title}」，到店扫码后会写入联盟链存证，并发放不可转让权益。`,
        nextAction: { type: "task", id: activeTask.id }
      };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: DEFAULT_USER_ID, message })
    }
  );
}

function snapshotDemo() {
  refreshDemoGovernance();
  return structuredClone(demoState);
}

function findDemoTask(taskId: string) {
  return demoState.tasks.find((item) => item.id === taskId) ?? demoState.tasks[0];
}

function createDemoBenefit(title: string, taskId: string, chainBusinessId: string, type = "ticket"): Benefit {
  return {
    id: `benefit_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    userId: DEFAULT_USER_ID,
    title,
    description: "该权益绑定真实门店服务，不可转让、不可提现、不可兑换现金。",
    type,
    transferable: false,
    cashable: false,
    expiresAt: thirtyDaysFromNow(),
    status: "available",
    taskId,
    chainBusinessId
  };
}

function createDemoReceipt(businessId: string, registry: ChainReceipt["registry"]): ChainReceipt {
  const now = new Date().toISOString();
  return {
    businessId,
    registry,
    payloadHash: `demo_hash_${Math.random().toString(16).slice(2, 18)}`,
    status: "confirmed",
    txId: `fisco_mock_${Math.random().toString(16).slice(2, 18)}`,
    createdAt: now,
    confirmedAt: now
  };
}

function refreshDemoGovernance() {
  const completedTasks = demoState.tasks.filter((item) => item.status === "completed").length;
  demoState.governance = {
    approvedMerchants: demoState.merchants.filter((item) => item.complianceStatus === "approved").length,
    pendingMerchants: demoState.merchants.filter((item) => item.complianceStatus === "pending").length,
    taskCompletionRate: demoState.tasks.length === 0 ? 0 : completedTasks / demoState.tasks.length,
    verifiedCheckins: completedTasks,
    rejectedCheckins: 0,
    pendingChainReceipts: demoState.chainReceipts.filter((item) => item.status === "pending").length
  };
}

function getErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return "REQUEST_FAILED";
}
