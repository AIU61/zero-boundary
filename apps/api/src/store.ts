import { nanoid } from "nanoid";
import type { Benefit, ChainReceipt, Checkin, CityRoute, Consent, Merchant, Order, Product, Task, UserWallet } from "./domain.js";

const now = Date.now();
const inThirtyDays = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
const inSevenDays = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();

export interface DataStore {
  merchants: Merchant[];
  tasks: Task[];
  routes: CityRoute[];
  products: Product[];
  orders: Order[];
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
    tasks: [
      {
        id: "task-night-route-001",
        title: "打卡 Zero Coffee",
        subtitle: "在 Zero Coffee 完成消费打卡，获得数字票根与隐藏菜单资格。",
        story: "雨夜里，第一杯冷萃把南京西路从流量黑箱里拉回真实体验。",
        rewardEnergy: 80,
        routeName: "南京西路·潮流探索路线",
        requiredMerchantId: "merchant-black-rain",
        expiresAt: inSevenDays,
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
        expiresAt: inSevenDays,
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
        expiresAt: inSevenDays,
        status: "available",
        stops: [
          { merchantId: "merchant-black-rain", title: "Zero Coffee", action: "集合" },
          { merchantId: "merchant-zero-gym", title: "Zero Gym", action: "完成小队打卡" }
        ]
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
    orders: [],
    wallets: [
      {
        userId,
        didHash: "did:lingjie:8d09bd0e5d1d",
        displayName: "林砚",
        level: "零界探索者 Lv.3",
        energy: 2680,
        contribution: 56,
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
    title: "ZERO CITY 夜行数字票根",
    description: "不可转让，绑定 Zero Coffee 隐藏菜单资格和 7 日内复购权益。",
    type: "ticket",
    transferable: false,
    cashable: false,
    expiresAt: inThirtyDays,
    status: "available",
    taskId,
    chainBusinessId
  };
}

export function createProductBenefit(userId: string, taskId: string, chainBusinessId: string, title: string): Benefit {
  return {
    id: `benefit_${nanoid(10)}`,
    userId,
    title,
    description: "该权益绑定真实门店服务，不可转让、不可提现、不可兑换现金。",
    type: "hidden_menu",
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
