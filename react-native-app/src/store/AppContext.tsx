import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan, PlanStatus, Flight, Destination, Hotel, Expense, ChecklistItem, Document, ItineraryItem } from './types';

// AI 策划表单状态
export interface AIPlanFormState {
  destinations: string[];
  startDate: string;
  endDate: string;
  departCity: string;
  returnCity: string;
  hotelBudget: string;
  flightBudget: string;
  preferences: string[];
  special: string;
}

// 状态类型 — 所有数据都在 Plan 内部
interface AppState {
  plans: Record<string, Plan>;
  activePlanId: string;
  aiPlanForm: AIPlanFormState;
}

// Action类型
type AppAction =
  | { type: '__RESTORE__'; payload: AppState }
  | { type: 'SELECT_PLAN'; payload: string }
  | { type: 'CREATE_PLAN'; payload: { id: string; name: string } }
  | { type: 'DELETE_PLAN'; payload: string }
  | { type: 'UPDATE_PLAN'; payload: { id: string; name: string } }
  | { type: 'UPDATE_PLAN_STATUS'; payload: { id: string; status: PlanStatus } }
  | { type: 'TOGGLE_FLIGHT'; payload: number }
  | { type: 'ADD_FLIGHT'; payload: Flight }
  | { type: 'UPDATE_FLIGHT'; payload: Flight }
  | { type: 'DELETE_FLIGHT'; payload: number }
  | { type: 'TOGGLE_DEST'; payload: number }
  | { type: 'ADD_DEST'; payload: Destination }
  | { type: 'UPDATE_DEST'; payload: Destination }
  | { type: 'DELETE_DEST'; payload: number }
  | { type: 'TOGGLE_HOTEL'; payload: number }
  | { type: 'ADD_HOTEL'; payload: Hotel }
  | { type: 'UPDATE_HOTEL'; payload: Hotel }
  | { type: 'DELETE_HOTEL'; payload: number }
  | { type: 'RATE_HOTEL'; payload: { hotelId: number; critIdx: number; value: number } }
  | { type: 'TOGGLE_EXPENSE'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: number }
  | { type: 'TOGGLE_CHECK'; payload: number }
  | { type: 'ADD_CHECK'; payload: ChecklistItem }
  | { type: 'DELETE_CHECK'; payload: number }
  | { type: 'TOGGLE_PACK'; payload: number }
  | { type: 'ADD_PACK'; payload: { name: string; category: string } }
  | { type: 'UPDATE_PACK'; payload: { id: number; name: string; category: string } }
  | { type: 'DELETE_PACK'; payload: number }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: number }
  | { type: 'ADD_ITINERARY'; payload: Omit<ItineraryItem, 'id'> }
  | { type: 'UPDATE_ITINERARY'; payload: ItineraryItem }
  | { type: 'DELETE_ITINERARY'; payload: number }
  | { type: 'DELETE_TRIP'; payload: number }
  | { type: 'UPDATE_AI_PLAN_FORM'; payload: Partial<AIPlanFormState> }
  | { type: 'RESET_AI_PLAN_FORM' }
  | { type: 'APPLY_AI_PLAN'; payload: { itineraryItems: ItineraryItem[]; trip: { name: string; start: string; end: string; color: string } } };

// 辅助：更新当前活跃计划
function updateActivePlan(state: AppState, updater: (plan: Plan) => Plan): AppState {
  return {
    ...state,
    plans: {
      ...state.plans,
      [state.activePlanId]: updater(state.plans[state.activePlanId]),
    },
  };
}

// 初始数据
const demoPlan: Plan = {
  id: 'plan-demo',
  name: '东京·北海道全景之旅（示例）',
  status: 'active',
  itineraryItems: [
    { id: 1, date: '2026-05-18', time: '10:00', title: '抵达成田机场', location: '成田', type: 'transport', duration: 60, notes: '取行李、买西瓜卡' },
    { id: 2, date: '2026-05-18', time: '14:00', title: '酒店入住', location: '新宿', type: 'hotel', duration: 30, notes: '' },
    { id: 3, date: '2026-05-18', time: '16:00', title: '新宿逛街', location: '新宿', type: 'sight', duration: 180, notes: '歌舞伎町、百货商场' },
    { id: 4, date: '2026-05-19', time: '09:00', title: '浅草寺', location: '浅草', type: 'sight', duration: 120, notes: '雷门拍照' },
    { id: 5, date: '2026-05-19', time: '12:00', title: '午餐：天妇罗', location: '浅草', type: 'food', duration: 60, notes: '' },
    { id: 6, date: '2026-05-19', time: '14:00', title: '秋叶原', location: '秋叶原', type: 'sight', duration: 180, notes: '电器街、动漫周边' },
    { id: 7, date: '2026-05-20', time: '09:00', title: '东京迪士尼', location: '迪士尼', type: 'sight', duration: 600, notes: '全天游玩' },
    { id: 8, date: '2026-05-21', time: '08:00', title: '飞往札幌', location: '新千岁机场', type: 'transport', duration: 120, notes: '' },
    { id: 9, date: '2026-05-21', time: '14:00', title: '登别温泉', location: '登别', type: 'hotel', duration: 60, notes: '入住温泉旅馆' },
    { id: 10, date: '2026-05-22', time: '10:00', title: '札幌市区游览', location: '札幌', type: 'sight', duration: 240, notes: '狸小路商店街、电视塔' },
  ],
  packingItems: [
    { id: 1, name: '护照', category: '证件', packed: true },
    { id: 2, name: '签证复印件', category: '证件', packed: true },
    { id: 3, name: '机票行程单', category: '证件', packed: false },
    { id: 4, name: 'T恤 x5', category: '衣物', packed: false },
    { id: 5, name: '牛仔裤 x2', category: '衣物', packed: false },
    { id: 6, name: '充电器', category: '电子设备', packed: true },
    { id: 7, name: '充电宝', category: '电子设备', packed: false },
    { id: 8, name: '转换插头', category: '电子设备', packed: false },
  ],
  documents: [
    { id: 1, name: '护照', type: 'passport', number: 'E12345678', expiry: '2028-03-15', status: 'valid', notes: '' },
    { id: 2, name: '日本签证', type: 'visa', number: '', expiry: '2026-08-01', status: 'valid', notes: '单次入境' },
  ],
  trips: [
    { id: 1, name: '东京·北海道全景之旅', start: '2026-05-18', end: '2026-05-22', color: '#D4A853' },
  ],
  flights: [
    { id: 1, airline: '全日空航空', code: 'NH919', route: '上海→东京', dep: '08:30', arr: '12:45', price: 3280, cls: '经济舱', status: 'booked', selected: true, notes: { 0: '直飞', 1: '23kg', 2: '高', 3: '好' } },
    { id: 2, airline: '春秋航空', code: '9C6215', route: '札幌→上海', dep: '19:00', arr: '21:30', price: 1899, cls: '经济舱', status: 'pending', selected: false, notes: { 0: '直飞', 1: '15kg', 2: '中', 3: '一般' } },
  ],
  destinations: [
    { id: 1, name: '东京', country: '日本', notes: '购物天堂，交通便利', scores: [4, 4, 5, 5, 5, 4], selected: true },
    { id: 2, name: '北海道', country: '日本', notes: '自然风光，温泉胜地', scores: [5, 5, 4, 3, 5, 4], selected: true },
  ],
  hotels: [
    { id: 1, name: '东京新宿酒店', location: '新宿', price: '¥680/晚', priceNum: 680, scores: [4, 5, 4, 4, 3], selected: true, status: 'booked' },
    { id: 2, name: '登别温泉旅馆', location: '登别', price: '¥1200/晚', priceNum: 1200, scores: [5, 4, 5, 4, 5], selected: true, status: 'booked' },
  ],
  expenses: [
    { id: 1, name: '东京迪士尼门票', category: '门票', amount: 580, note: '成人一日票', selected: true, status: 'paid', actual: 580 },
    { id: 2, name: '温泉体验', category: '活动', amount: 350, note: '登别温泉', selected: true, status: 'pending', actual: 0 },
  ],
  checklistItems: [
    { id: 1, text: '购买往返机票', done: true },
    { id: 2, text: '预订酒店', done: true },
    { id: 3, text: '办理日本签证', done: true },
    { id: 4, text: '购买旅行保险', done: false },
    { id: 5, text: '兑换日元', done: false },
    { id: 6, text: '购买迪士尼门票', done: false },
  ],
};

const blankPlan: Omit<Plan, 'id' | 'name'> = {
  status: 'draft',
  itineraryItems: [],
  packingItems: [],
  documents: [],
  trips: [],
  flights: [],
  destinations: [],
  hotels: [],
  expenses: [],
  checklistItems: [],
};

const initialState: AppState = {
  plans: { 'plan-demo': demoPlan },
  activePlanId: 'plan-demo',
  aiPlanForm: {
    destinations: [''],
    startDate: '',
    endDate: '',
    departCity: '',
    returnCity: '',
    hotelBudget: 'any',
    flightBudget: 'any',
    preferences: [],
    special: '',
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  const pid = state.activePlanId;

  switch (action.type) {
    case '__RESTORE__':
      return { ...action.payload, aiPlanForm: state.aiPlanForm };

    case 'SELECT_PLAN':
      return { ...state, activePlanId: action.payload };

    case 'CREATE_PLAN':
      return {
        ...state,
        plans: {
          ...state.plans,
          [action.payload.id]: { id: action.payload.id, name: action.payload.name, ...blankPlan },
        },
        activePlanId: action.payload.id,
      };

    case 'DELETE_PLAN': {
      const { [action.payload]: _, ...rest } = state.plans;
      return {
        ...state,
        plans: rest,
        activePlanId: state.activePlanId === action.payload ? Object.keys(rest)[0] || '' : state.activePlanId,
      };
    }

    case 'UPDATE_PLAN':
      return { ...state, plans: { ...state.plans, [action.payload.id]: { ...state.plans[action.payload.id], name: action.payload.name } } };

    case 'UPDATE_PLAN_STATUS':
      return { ...state, plans: { ...state.plans, [action.payload.id]: { ...state.plans[action.payload.id], status: action.payload.status } } };

    // === Flights ===
    case 'TOGGLE_FLIGHT':
      return updateActivePlan(state, p => ({ ...p, flights: p.flights.map(f => f.id === action.payload ? { ...f, selected: !f.selected } : f) }));
    case 'ADD_FLIGHT':
      return updateActivePlan(state, p => ({ ...p, flights: [...p.flights, action.payload] }));
    case 'UPDATE_FLIGHT':
      return updateActivePlan(state, p => ({ ...p, flights: p.flights.map(f => f.id === action.payload.id ? action.payload : f) }));
    case 'DELETE_FLIGHT':
      return updateActivePlan(state, p => ({ ...p, flights: p.flights.filter(f => f.id !== action.payload) }));

    // === Destinations ===
    case 'TOGGLE_DEST':
      return updateActivePlan(state, p => ({ ...p, destinations: p.destinations.map(d => d.id === action.payload ? { ...d, selected: !d.selected } : d) }));
    case 'ADD_DEST':
      return updateActivePlan(state, p => ({ ...p, destinations: [...p.destinations, action.payload] }));
    case 'UPDATE_DEST':
      return updateActivePlan(state, p => ({ ...p, destinations: p.destinations.map(d => d.id === action.payload.id ? action.payload : d) }));
    case 'DELETE_DEST':
      return updateActivePlan(state, p => ({ ...p, destinations: p.destinations.filter(d => d.id !== action.payload) }));

    // === Hotels ===
    case 'TOGGLE_HOTEL':
      return updateActivePlan(state, p => ({ ...p, hotels: p.hotels.map(h => h.id === action.payload ? { ...h, selected: !h.selected } : h) }));
    case 'ADD_HOTEL':
      return updateActivePlan(state, p => ({ ...p, hotels: [...p.hotels, action.payload] }));
    case 'UPDATE_HOTEL':
      return updateActivePlan(state, p => ({ ...p, hotels: p.hotels.map(h => h.id === action.payload.id ? action.payload : h) }));
    case 'DELETE_HOTEL':
      return updateActivePlan(state, p => ({ ...p, hotels: p.hotels.filter(h => h.id !== action.payload) }));
    case 'RATE_HOTEL':
      return updateActivePlan(state, p => ({ ...p, hotels: p.hotels.map(h => h.id === action.payload.hotelId ? { ...h, scores: h.scores.map((s, i) => i === action.payload.critIdx ? action.payload.value : s) } : h) }));

    // === Expenses ===
    case 'TOGGLE_EXPENSE':
      return updateActivePlan(state, p => ({ ...p, expenses: p.expenses.map(e => e.id === action.payload ? { ...e, selected: !e.selected } : e) }));
    case 'ADD_EXPENSE':
      return updateActivePlan(state, p => ({ ...p, expenses: [...p.expenses, action.payload] }));
    case 'UPDATE_EXPENSE':
      return updateActivePlan(state, p => ({ ...p, expenses: p.expenses.map(e => e.id === action.payload.id ? action.payload : e) }));
    case 'DELETE_EXPENSE':
      return updateActivePlan(state, p => ({ ...p, expenses: p.expenses.filter(e => e.id !== action.payload) }));

    // === Checklist ===
    case 'TOGGLE_CHECK':
      return updateActivePlan(state, p => ({ ...p, checklistItems: p.checklistItems.map(i => i.id === action.payload ? { ...i, done: !i.done } : i) }));
    case 'ADD_CHECK':
      return updateActivePlan(state, p => ({ ...p, checklistItems: [...p.checklistItems, action.payload] }));
    case 'DELETE_CHECK':
      return updateActivePlan(state, p => ({ ...p, checklistItems: p.checklistItems.filter(i => i.id !== action.payload) }));

    // === Packing ===
    case 'TOGGLE_PACK':
      return updateActivePlan(state, p => ({ ...p, packingItems: p.packingItems.map(i => i.id === action.payload ? { ...i, packed: !i.packed } : i) }));
    case 'ADD_PACK': {
      const plan = state.plans[pid];
      const maxId = plan.packingItems.reduce((m, i) => Math.max(m, i.id), 0);
      return updateActivePlan(state, p => ({ ...p, packingItems: [...p.packingItems, { id: maxId + 1, name: action.payload.name, category: action.payload.category, packed: false }] }));
    }
    case 'UPDATE_PACK':
      return updateActivePlan(state, p => ({ ...p, packingItems: p.packingItems.map(i => i.id === action.payload.id ? { ...i, name: action.payload.name, category: action.payload.category } : i) }));
    case 'DELETE_PACK':
      return updateActivePlan(state, p => ({ ...p, packingItems: p.packingItems.filter(i => i.id !== action.payload) }));

    // === Documents ===
    case 'ADD_DOCUMENT':
      return updateActivePlan(state, p => ({ ...p, documents: [...p.documents, action.payload] }));
    case 'UPDATE_DOCUMENT':
      return updateActivePlan(state, p => ({ ...p, documents: p.documents.map(d => d.id === action.payload.id ? action.payload : d) }));
    case 'DELETE_DOCUMENT':
      return updateActivePlan(state, p => ({ ...p, documents: p.documents.filter(d => d.id !== action.payload) }));

    // === Itinerary ===
    case 'ADD_ITINERARY': {
      const plan = state.plans[pid];
      const maxId = plan.itineraryItems.reduce((m, i) => Math.max(m, i.id), 0);
      return updateActivePlan(state, p => ({ ...p, itineraryItems: [...p.itineraryItems, { ...action.payload, id: maxId + 1 }] }));
    }
    case 'UPDATE_ITINERARY':
      return updateActivePlan(state, p => ({ ...p, itineraryItems: p.itineraryItems.map(i => i.id === action.payload.id ? action.payload : i) }));
    case 'DELETE_ITINERARY':
      return updateActivePlan(state, p => ({ ...p, itineraryItems: p.itineraryItems.filter(i => i.id !== action.payload) }));

    // === Trips ===
    case 'DELETE_TRIP':
      return updateActivePlan(state, p => ({ ...p, trips: p.trips.filter(t => t.id !== action.payload) }));

    // === AI Plan ===
    case 'APPLY_AI_PLAN': {
      const { itineraryItems, trip } = action.payload;
      const plan = state.plans[pid];
      const startId = plan.itineraryItems.reduce((m, i) => Math.max(m, i.id), 0) + 1;
      const renumbered = itineraryItems.map((item, idx) => ({ ...item, id: startId + idx }));
      const tripId = plan.trips.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      return updateActivePlan(state, p => ({
        ...p,
        itineraryItems: [...p.itineraryItems, ...renumbered],
        trips: [...p.trips, { ...trip, id: tripId }],
      }));
    }

    // === AI Form ===
    case 'UPDATE_AI_PLAN_FORM':
      return { ...state, aiPlanForm: { ...state.aiPlanForm, ...action.payload } };
    case 'RESET_AI_PLAN_FORM':
      return { ...state, aiPlanForm: { destinations: [''], startDate: '', endDate: '', departCity: '', returnCity: '', hotelBudget: 'any', flightBudget: 'any', preferences: [], special: '' } };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getActivePlan: () => Plan;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
const STORAGE_KEY = '@travel_planner_state';
const STORAGE_VERSION = '@travel_planner_version';
const CURRENT_VERSION = 4;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getActivePlan = () => stateRef.current.plans[stateRef.current.activePlanId];

  useEffect(() => {
    (async () => {
      try {
        const [saved, savedVersion] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(STORAGE_VERSION),
        ]);
        const version = savedVersion ? parseInt(savedVersion, 10) : 0;
        if (saved && version >= CURRENT_VERSION) {
          dispatch({ type: '__RESTORE__', payload: JSON.parse(saved) });
        } else {
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialState)),
            AsyncStorage.setItem(STORAGE_VERSION, String(CURRENT_VERSION)),
          ]);
        }
      } catch {
        // 使用初始状态
      } finally {
        isLoaded.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      } catch {}
    }, 500);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch, getActivePlan }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
