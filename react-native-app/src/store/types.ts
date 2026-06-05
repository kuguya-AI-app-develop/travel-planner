// 计划状态类型
export type PlanStatus = 'draft' | 'active' | 'confirmed' | 'traveling' | 'done';

// 计划状态配置
export const PLAN_STATUSES: Record<PlanStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#7A7570' },
  active: { label: '进行中', color: '#D4A853' },
  confirmed: { label: '已确认', color: '#5AA85A' },
  traveling: { label: '已出行', color: '#B8903A' },
  done: { label: '已完成', color: '#8855CC' },
};

// 行程项类型
export interface ItineraryItem {
  id: number;
  date: string;
  time: string;
  title: string;
  location: string;
  type: 'sight' | 'food' | 'transport' | 'hotel' | 'other';
  duration: number;
  notes: string;
}

// 行李项类型
export interface PackingItem {
  id: number;
  name: string;
  category: string;
  packed: boolean;
}

// 证件类型
export interface Document {
  id: number;
  name: string;
  type: 'passport' | 'visa' | 'insurance' | 'booking' | 'other';
  number: string;
  expiry: string;
  status: 'valid' | 'expiring' | 'expired' | 'processing' | 'none';
  notes: string;
}

// 行程类型
export interface Trip {
  id: number;
  name: string;
  start: string;
  end: string;
  color: string;
}

// 计划类型
export interface Plan {
  id: string;
  name: string;
  status: PlanStatus;
  itineraryItems: ItineraryItem[];
  packingItems: PackingItem[];
  documents: Document[];
  trips: Trip[];
}

// 航班类型
export interface Flight {
  id: number;
  airline: string;
  code: string;
  route: string;
  dep: string;
  arr: string;
  price: number;
  cls: string;
  status: 'booked' | 'pending' | 'compare';
  selected: boolean;
  notes: Record<number, string>;
}

// 目的地类型
export interface Destination {
  id: number;
  name: string;
  country: string;
  notes: string;
  scores: number[];
  selected: boolean;
}

// 酒店类型
export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: string;
  priceNum: number;
  scores: number[];
  selected: boolean;
  status: 'booked' | 'pending';
}

// 消费类型
export interface Expense {
  id: number;
  name: string;
  category: string;
  amount: number;
  note: string;
  selected: boolean;
  status: 'paid' | 'pending';
  actual: number;
}

// 待办事项类型
export interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}
