export type Tab = 'home' | 'map' | 'tasks' | 'assets' | 'profile';
export type TaskStatus = 'available' | 'accepted' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardEnergy: number;
  tags: string[];
  type: 'route' | 'store' | 'brand';
  status: TaskStatus;
  location: string;
  estimatedMinutes: number;
  assetReward: string;
}

export interface UserProfile {
  zeroId: string;
  level: number;
  nickname: string;
  energy: number;
  creditScore: number;
  contribution: number;
}

export interface DigitalAsset {
  id: string;
  name: string;
  type: 'badge' | 'ticket' | 'coupon';
  description: string;
  issuer: string;
  imageUrl?: string;
  acquiredAt: string;
  expiresAt?: string;
}
