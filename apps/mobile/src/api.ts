export interface Merchant {
  id: string;
  name: string;
  scene: string;
  address: string;
  distanceMeters: number;
  rating: number;
  complianceStatus: "approved" | "pending" | "suspended";
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
  stops: Array<{ merchantId: string; title: string; action: string }>;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  type: string;
  transferable: false;
  cashable: false;
  expiresAt: string;
  status: string;
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
  governance: Governance;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:3100" : "");

const demoBenefit: Benefit = {
  id: "benefit-demo-ticket",
  title: "第一条夜行路线数字票根",
  description: "不可转让，绑定黑雨冷萃隐藏菜单资格和 7 日内复购权益。",
  type: "ticket",
  transferable: false,
  cashable: false,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "available",
  chainBusinessId: "benefit_demo_chain_receipt"
};

const demoHome: HomePayload = {
  user: {
    userId: "user-linyan",
    didHash: "did:lingjie:8d09bd0e5d1d",
    displayName: "林砚",
    level: "城市探索者 Lv.1",
    energy: 2680,
    contribution: 56,
    credit: 91,
    benefits: []
  },
  tasks: [
    {
      id: "task-night-route-001",
      title: "黑雨冷萃 - 夜行路线",
      subtitle: "到店试饮并完成真实核销，获得数字票根与隐藏菜单资格。",
      story: "雨夜里，第一杯冷萃把蓝岸商圈从流量黑箱里拉回真实体验。",
      rewardEnergy: 80,
      routeName: "第一条夜行路线",
      requiredMerchantId: "merchant-black-rain",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "available",
      stops: [
        { merchantId: "merchant-black-rain", title: "黑雨冷萃", action: "扫码核销试饮" },
        { merchantId: "merchant-neon-roast", title: "霓虹烘焙所", action: "解锁二段复购权益" }
      ]
    }
  ],
  merchants: [
    {
      id: "merchant-black-rain",
      name: "黑雨冷萃",
      scene: "独立咖啡",
      address: "蓝岸商圈 B1 夜行街 17 号",
      distanceMeters: 120,
      rating: 4.8,
      complianceStatus: "approved"
    },
    {
      id: "merchant-neon-roast",
      name: "霓虹烘焙所",
      scene: "精品咖啡",
      address: "蓝岸商圈东塔 1F",
      distanceMeters: 180,
      rating: 4.9,
      complianceStatus: "approved"
    }
  ],
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
    throw new Error(payload.error ?? "REQUEST_FAILED");
  }

  return payload as T;
}

async function requestOrFallback<T>(path: string, fallback: () => T | Promise<T>, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    return fallback();
  }

  try {
    return await requestJson<T>(path, init);
  } catch {
    return fallback();
  }
}

export function loadHome() {
  return requestOrFallback<HomePayload>("/api/home", () => demoState);
}

export function claimTask(taskId: string) {
  return requestOrFallback<{ task: Task }>(
    `/api/tasks/${taskId}/claim`,
    () => {
      const task = demoState.tasks.find((item) => item.id === taskId) ?? demoState.tasks[0];
      task.status = "claimed";
      return { task };
    },
    {
      method: "POST",
      body: JSON.stringify({ userId: "user-linyan" })
    }
  );
}

export function verifyCheckin(taskId: string, merchantId: string) {
  return requestOrFallback<{ wallet: Wallet; issuedBenefit: Benefit }>(
    `/api/checkins/qr/verify`,
    () => {
      const task = demoState.tasks.find((item) => item.id === taskId);
      if (task) task.status = "completed";
      demoState.user.energy += task?.rewardEnergy ?? 80;
      demoState.user.level = "咖啡猎人 Lv.2";
      demoState.user.benefits = [demoBenefit, ...demoState.user.benefits.filter((item) => item.id !== demoBenefit.id)];
      demoState.governance.verifiedCheckins += 1;
      demoState.governance.taskCompletionRate = 1;
      return { wallet: demoState.user, issuedBenefit: demoBenefit };
    },
    {
      method: "POST",
      body: JSON.stringify({
        userId: "user-linyan",
        taskId,
        merchantId,
        qrPayload: "LINGJIE:merchant-black-rain:task-night-route-001",
        deviceId: "mobile-demo-device"
      })
    }
  );
}

export function grantConsent(merchantId: string) {
  return requestOrFallback<{ consent: { id: string; status: string; chainBusinessId: string } }>(
    `/api/consents/grant`,
    () => ({
      consent: {
        id: "consent_demo",
        status: "active",
        chainBusinessId: "consent_demo_chain_receipt"
      }
    }),
    {
      method: "POST",
      body: JSON.stringify({
        userId: "user-linyan",
        merchantId,
        purpose: "用于复购提醒、口味偏好分析和路线推荐",
        rewardDescription: "隐藏菜单优先体验资格",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  );
}
