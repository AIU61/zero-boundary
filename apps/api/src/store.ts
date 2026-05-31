import { nanoid } from "nanoid";
import type { Benefit, ChainReceipt, Checkin, Consent, Merchant, Task, UserWallet } from "./domain.js";

const now = Date.now();
const inThirtyDays = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
const inSevenDays = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();

export interface DataStore {
  merchants: Merchant[];
  tasks: Task[];
  wallets: UserWallet[];
  checkins: Checkin[];
  consents: Consent[];
  chainReceipts: ChainReceipt[];
}

export function createSeedStore(): DataStore {
  const userId = "user-linyan";

  return {
    merchants: [
      {
        id: "merchant-black-rain",
        name: "黑雨冷萃",
        scene: "独立咖啡",
        address: "蓝岸商圈 B1 夜行街 17 号",
        distanceMeters: 320,
        rating: 4.8,
        complianceStatus: "approved"
      },
      {
        id: "merchant-neon-roast",
        name: "霓虹烘焙所",
        scene: "精品咖啡",
        address: "蓝岸商圈东塔 1F",
        distanceMeters: 580,
        rating: 4.6,
        complianceStatus: "approved"
      },
      {
        id: "merchant-late-lab",
        name: "Late Lab 深夜实验室",
        scene: "夜生活联名",
        address: "蓝岸商圈屋顶花园",
        distanceMeters: 760,
        rating: 4.7,
        complianceStatus: "pending"
      }
    ],
    tasks: [
      {
        id: "task-night-route-001",
        title: "黑雨冷萃 - 夜行路线",
        subtitle: "到店试饮并完成真实核销，获得数字票根与隐藏菜单资格。",
        story: "雨夜里，第一杯冷萃把蓝岸商圈从流量黑箱里拉回真实体验。",
        rewardEnergy: 43,
        routeName: "第一条夜行路线",
        requiredMerchantId: "merchant-black-rain",
        expiresAt: inSevenDays,
        status: "available",
        stops: [
          { merchantId: "merchant-black-rain", title: "黑雨冷萃", action: "扫码核销试饮" },
          { merchantId: "merchant-neon-roast", title: "霓虹烘焙所", action: "解锁二段复购权益" }
        ]
      }
    ],
    wallets: [
      {
        userId,
        didHash: "did:lingjie:8d09bd0e5d1d",
        displayName: "林砚",
        level: "城市探索者 Lv.1",
        energy: 12,
        contribution: 8,
        credit: 91,
        benefits: []
      }
    ],
    checkins: [],
    consents: [],
    chainReceipts: []
  };
}

export function createTicketBenefit(userId: string, taskId: string, chainBusinessId: string): Benefit {
  return {
    id: `benefit_${nanoid(10)}`,
    userId,
    title: "第一条夜行路线数字票根",
    description: "不可转让，绑定黑雨冷萃隐藏菜单资格和 7 日内复购权益。",
    type: "ticket",
    transferable: false,
    cashable: false,
    expiresAt: inThirtyDays,
    status: "available",
    taskId,
    chainBusinessId
  };
}

export const DEFAULT_USER_ID = "user-linyan";
export const VALID_QR_PAYLOAD = "LINGJIE:merchant-black-rain:task-night-route-001";
