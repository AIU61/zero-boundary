export type TaskStatus = "available" | "claimed" | "completed" | "expired";
export type CheckinStatus = "pending" | "verified" | "rejected";
export type BenefitStatus = "available" | "used" | "expired";
export type ConsentStatus = "active" | "revoked" | "expired";
export type ChainStatus = "pending" | "confirmed" | "failed";
export type OrderStatus = "created" | "paid" | "cancelled";

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

export interface RouteStop {
  merchantId: string;
  title: string;
  action: string;
}

export interface Task {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  rewardEnergy: number;
  routeName: string;
  stops: RouteStop[];
  requiredMerchantId: string;
  expiresAt: string;
  status: TaskStatus;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
}

export interface Benefit {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "ticket" | "hidden_menu" | "coupon" | "priority";
  transferable: false;
  cashable: false;
  expiresAt: string;
  status: BenefitStatus;
  taskId?: string;
  chainBusinessId?: string;
}

export interface CityRoute {
  id: string;
  title: string;
  subtitle: string;
  taskId: string;
  distanceKm: number;
  stopCount: number;
  status: "locked" | "available" | "started" | "completed";
  stops: RouteStop[];
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

export interface Order {
  id: string;
  userId: string;
  productId: string;
  merchantId: string;
  amountCents: number;
  status: OrderStatus;
  createdAt: string;
  benefitId?: string;
}

export interface UserWallet {
  userId: string;
  didHash: string;
  displayName: string;
  level: string;
  energy: number;
  contribution: number;
  credit: number;
  benefits: Benefit[];
}

export interface Checkin {
  id: string;
  userId: string;
  taskId: string;
  merchantId: string;
  qrPayload: string;
  deviceId: string;
  status: CheckinStatus;
  reason?: string;
  createdAt: string;
  chainBusinessId?: string;
}

export interface Consent {
  id: string;
  userId: string;
  merchantId: string;
  purpose: string;
  rewardDescription: string;
  expiresAt: string;
  status: ConsentStatus;
  createdAt: string;
  revokedAt?: string;
  chainBusinessId: string;
}

export interface ChainReceipt {
  businessId: string;
  registry: "TaskReceiptRegistry" | "ConsentRegistry" | "BenefitCredentialRegistry";
  payloadHash: string;
  status: ChainStatus;
  txId?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface GovernanceSummary {
  approvedMerchants: number;
  pendingMerchants: number;
  taskCompletionRate: number;
  verifiedCheckins: number;
  rejectedCheckins: number;
  pendingChainReceipts: number;
}
