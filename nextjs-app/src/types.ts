export interface Trip {
  id: number;
  name: string;
  start: string;
  end: string;
  color: string;
}

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

export interface Destination {
  id: number;
  name: string;
  country: string;
  notes: string;
  scores: number[];
  selected: boolean;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: string;
  priceNum: number;
  scores: number[];
  selected: boolean;
}

export interface Expense {
  id: number;
  name: string;
  category: string;
  amount: number;
  status: 'planned' | 'booked' | 'paid';
  note: string;
  selected: boolean;
}

export interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

export type PlanStatus = 'draft' | 'active' | 'confirmed' | 'traveling' | 'done';

export interface ItineraryItem {
  id: number;
  date: string;
  time: string;
  type: 'sight' | 'food' | 'transport' | 'hotel' | 'other';
  title: string;
  meta: string;
  order: number;
}

export interface PackingItem {
  id: number;
  text: string;
  done: boolean;
}

export interface PackingCategory {
  id: number;
  name: string;
  items: PackingItem[];
}

export type DocStatus = 'valid' | 'expiring' | 'expired' | 'processing' | 'none';

export interface Document {
  id: number;
  name: string;
  type: string;
  number: string;
  expiry: string;
  status: DocStatus;
}

export interface Plan {
  id: number;
  name: string;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  trips: Trip[];
  flights: Flight[];
  destinations: Destination[];
  hotels: Hotel[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  itinerary: ItineraryItem[];
  packingCategories: PackingCategory[];
  documents: Document[];
}

export type TabType = 'calendar' | 'flights' | 'destinations' | 'hotels' | 'expenses' | 'itinerary' | 'packing' | 'documents' | 'plan-overview' | 'summary';