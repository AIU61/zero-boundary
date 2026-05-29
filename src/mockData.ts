import { UserProfile, Task, DigitalAsset } from "./types";

export const mockUser: UserProfile = {
  zeroId: "Z-8492-AX",
  level: 28,
  nickname: "林砚",
  energy: 88888,
  creditScore: 850,
  contribution: 1204
};

export const featuredRoute: Task = {
  id: "route-night-walk-1",
  title: "黑雨冷萃 - 夜行路线",
  description: "探索蓝岸商圈的隐藏咖啡体验。在雨夜造访沈予安的独立咖啡馆，完成试饮任务即可解锁神秘数字票根与隐藏菜单资格。",
  rewardEnergy: 500,
  tags: ["夜行路线", "咖啡猎人", "蓝岸商圈"],
  type: 'route',
  status: 'available',
  location: "蓝岸商圈 · 沈予安咖啡馆",
  estimatedMinutes: 35,
  assetReward: "第一滴黑雨徽章"
};

export const nearbyTasks: Task[] = [
  {
    id: "task-1",
    title: "潮牌新季试穿体验",
    description: "前往 ZERO 潮牌概念店，授权试穿偏好数据，获取专属立减权益。",
    rewardEnergy: 200,
    tags: ["数据授权", "品牌联动"],
    type: 'brand',
    status: 'available',
    location: "ZERO 潮牌概念店",
    estimatedMinutes: 18,
    assetReward: "新季试穿立减券"
  },
  {
    id: "task-2",
    title: "Livehouse 音波收集",
    description: "在蓝岸 Livehouse 完成打卡，获取本场演出限定数字票根。",
    rewardEnergy: 300,
    tags: ["路线节点", "限时"],
    type: 'store',
    status: 'available',
    location: "蓝岸 Livehouse",
    estimatedMinutes: 25,
    assetReward: "现场限定票根"
  }
];

export const userAssets: DigitalAsset[] = [
  {
    id: "asset-1",
    name: "第一滴黑雨",
    type: "badge",
    description: "完成首次黑雨冷萃路线纪念",
    issuer: "沈予安咖啡馆",
    acquiredAt: "2041-05-28T22:15:00Z"
  },
  {
    id: "asset-2",
    name: "蓝岸常客票根",
    type: "ticket",
    description: "蓝岸商圈联合积分加速权",
    issuer: "蓝岸商圈联盟",
    acquiredAt: "2041-05-15T18:30:00Z",
    expiresAt: "2041-07-15T23:59:59Z"
  },
  {
    id: "asset-3",
    name: "沈予安的隐藏菜单",
    type: "coupon",
    description: "凭此证可点单未公开饮品",
    issuer: "沈予安咖啡馆",
    acquiredAt: "2041-05-28T23:00:00Z",
    expiresAt: "2041-06-30T23:59:59Z"
  }
];

export const rewardAssetsByTaskId: Record<string, DigitalAsset> = {
  "route-night-walk-1": {
    id: "reward-route-night-walk-1",
    name: "黑雨履约凭证",
    type: "badge",
    description: "完成黑雨冷萃夜行路线后自动铸造，可用于解锁下一段路线。",
    issuer: "ZERO Boundary",
    acquiredAt: "2041-05-30T21:20:00Z"
  },
  "task-1": {
    id: "reward-task-1",
    name: "新季试穿立减券",
    type: "coupon",
    description: "授权试穿偏好数据后获得，可在 ZERO 潮牌概念店抵扣。",
    issuer: "ZERO 潮牌概念店",
    acquiredAt: "2041-05-30T18:40:00Z",
    expiresAt: "2041-06-30T23:59:59Z"
  },
  "task-2": {
    id: "reward-task-2",
    name: "蓝岸现场限定票根",
    type: "ticket",
    description: "Livehouse 音波收集完成纪念，记录本场演出和城市声纹。",
    issuer: "蓝岸 Livehouse",
    acquiredAt: "2041-05-30T22:10:00Z",
    expiresAt: "2041-08-01T23:59:59Z"
  }
};
