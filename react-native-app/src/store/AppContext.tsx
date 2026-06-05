import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Plan, Flight, Destination, Hotel, Expense, ChecklistItem, Document } from './types';

// 状态类型
interface AppState {
  plans: Record<string, Plan>;
  activePlanId: string;
  flights: Flight[];
  destinations: Destination[];
  hotels: Hotel[];
  expenses: Expense[];
  checklistItems: ChecklistItem[];
  nextId: {
    flight: number;
    dest: number;
    expense: number;
    hotel: number;
    check: number;
  };
}

// Action类型
type AppAction =
  | { type: 'SELECT_PLAN'; payload: string }
  | { type: 'CREATE_PLAN'; payload: { id: string; name: string } }
  | { type: 'DELETE_PLAN'; payload: string }
  | { type: 'TOGGLE_FLIGHT'; payload: number }
  | { type: 'ADD_FLIGHT'; payload: Flight }
  | { type: 'DELETE_FLIGHT'; payload: number }
  | { type: 'TOGGLE_DEST'; payload: number }
  | { type: 'ADD_DEST'; payload: Destination }
  | { type: 'DELETE_DEST'; payload: number }
  | { type: 'TOGGLE_HOTEL'; payload: number }
  | { type: 'ADD_HOTEL'; payload: Hotel }
  | { type: 'DELETE_HOTEL'; payload: number }
  | { type: 'RATE_HOTEL'; payload: { hotelId: number; critIdx: number; value: number } }
  | { type: 'TOGGLE_EXPENSE'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: number }
  | { type: 'TOGGLE_CHECK'; payload: number }
  | { type: 'ADD_CHECK'; payload: ChecklistItem }
  | { type: 'TOGGLE_PACK'; payload: number }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'DELETE_TRIP'; payload: number };

// 初始数据
const initialState: AppState = {
  plans: {
    'plan-1': {
      id: 'plan-1',
      name: '东京购物之旅',
      status: 'active',
      itineraryItems: [
        { id: 1, date: '2026-05-18', time: '10:00', title: '抵达成田机场', location: '成田', type: 'transport', duration: 60, notes: '取行李、买西瓜卡' },
        { id: 2, date: '2026-05-18', time: '14:00', title: '酒店入住', location: '新宿', type: 'hotel', duration: 30, notes: '' },
        { id: 3, date: '2026-05-18', time: '16:00', title: '新宿逛街', location: '新宿', type: 'sight', duration: 180, notes: '歌舞伎町、百货商场' },
        { id: 4, date: '2026-05-19', time: '09:00', title: '浅草寺', location: '浅草', type: 'sight', duration: 120, notes: '雷门拍照' },
        { id: 5, date: '2026-05-19', time: '12:00', title: '午餐：天妇罗', location: '浅草', type: 'food', duration: 60, notes: '' },
        { id: 6, date: '2026-05-19', time: '14:00', title: '秋叶原', location: '秋叶原', type: 'sight', duration: 180, notes: '电器街、动漫周边' },
        { id: 7, date: '2026-05-20', time: '09:00', title: '东京迪士尼', location: '迪士尼', type: 'sight', duration: 600, notes: '全天游玩' },
      ],
      packingItems: [
        { id: 1, name: '护照', category: '证件', packed: true },
        { id: 2, name: '签证复印件', category: '证件', packed: true },
        { id: 3, name: '机票行程单', category: '证件', packed: false },
        { id: 4, name: 'T恤 x5', category: '衣物', packed: false },
        { id: 5, name: '牛仔裤 x2', category: '衣物', packed: false },
        { id: 6, name: '内衣裤 x5', category: '衣物', packed: false },
        { id: 7, name: '充电器', category: '电子设备', packed: true },
        { id: 8, name: '充电宝', category: '电子设备', packed: false },
        { id: 9, name: '转换插头', category: '电子设备', packed: false },
      ],
      documents: [
        { id: 1, name: '护照', type: 'passport', number: 'E12345678', expiry: '2028-03-15', status: 'valid', notes: '' },
        { id: 2, name: '日本签证', type: 'visa', number: '', expiry: '2026-08-01', status: 'valid', notes: '单次入境' },
        { id: 3, name: '旅行保险', type: 'insurance', number: 'INS-2026-001', expiry: '2026-05-30', status: 'valid', notes: '含医疗' },
      ],
      trips: [
        { id: 1, name: '东京购物之旅', start: '2026-05-18', end: '2026-05-22', color: '#D4A853' },
        { id: 2, name: '京都赏樱', start: '2026-05-10', end: '2026-05-13', color: '#5AA85A' },
        { id: 3, name: '大阪美食', start: '2026-05-14', end: '2026-05-15', color: '#8B6914' },
      ],
    },
    'plan-2': {
      id: 'plan-2',
      name: '北海道温泉之旅',
      status: 'draft',
      itineraryItems: [
        { id: 1, date: '2026-07-01', time: '08:00', title: '飞往札幌', location: '新千岁机场', type: 'transport', duration: 120, notes: '' },
        { id: 2, date: '2026-07-01', time: '14:00', title: '登别温泉', location: '登别', type: 'hotel', duration: 60, notes: '入住温泉旅馆' },
      ],
      packingItems: [
        { id: 1, name: '护照', category: '证件', packed: false },
        { id: 2, name: '泳衣', category: '衣物', packed: false },
      ],
      documents: [],
      trips: [
        { id: 1, name: '北海道温泉', start: '2026-07-01', end: '2026-07-05', color: '#5AA85A' },
      ],
    },
  },
  activePlanId: 'plan-1',
  flights: [
    { id: 1, airline: '全日空航空', code: 'NH919', route: '上海→东京', dep: '08:30', arr: '12:45', price: 3280, cls: '经济舱', status: 'booked', selected: true, notes: { 0: '直飞', 1: '23kg', 2: '高', 3: '好' } },
    { id: 2, airline: '春秋航空', code: '9C6215', route: '东京→上海', dep: '19:00', arr: '21:30', price: 1899, cls: '经济舱', status: 'pending', selected: false, notes: { 0: '直飞', 1: '15kg', 2: '中', 3: '一般' } },
    { id: 3, airline: '吉祥航空', code: 'HO1335', route: '上海→大阪', dep: '10:15', arr: '14:00', price: 2450, cls: '经济舱', status: 'compare', selected: false, notes: { 0: '经停', 1: '20kg', 2: '中', 3: '中' } },
  ],
  destinations: [
    { id: 1, name: '东京', country: '日本', notes: '购物天堂，交通便利', scores: [4, 4, 5, 5, 5, 4], selected: true },
    { id: 2, name: '京都', country: '日本', notes: '古都风情，文化深厚', scores: [5, 5, 4, 3, 5, 4], selected: false },
    { id: 3, name: '大阪', country: '日本', notes: '美食之都，物价友好', scores: [3, 3, 5, 4, 5, 5], selected: false },
  ],
  hotels: [
    { id: 1, name: '东京新宿酒店', location: '新宿', price: '¥680/晚', priceNum: 680, scores: [4, 5, 4, 4, 3], selected: true, status: 'booked' },
    { id: 2, name: '浅草旅馆', location: '浅草', price: '¥420/晚', priceNum: 420, scores: [5, 3, 3, 3, 4], selected: false, status: 'pending' },
    { id: 3, name: '银座高端酒店', location: '银座', price: '¥1200/晚', priceNum: 1200, scores: [3, 5, 5, 5, 5], selected: false, status: 'pending' },
  ],
  expenses: [
    { id: 1, name: '东京迪士尼门票', category: '门票', amount: 580, note: '成人一日票', selected: true, status: 'paid', actual: 580 },
    { id: 2, name: '和服体验租赁', category: '设备租赁', amount: 350, note: '京都寺庙拍照', selected: true, status: 'pending', actual: 0 },
    { id: 3, name: '寿司之神预约', category: '餐饮', amount: 1200, note: '数寄屋桥次郎', selected: false, status: 'pending', actual: 0 },
  ],
  checklistItems: [
    { id: 1, text: '购买上海→东京机票', done: true },
    { id: 2, text: '购买东京→上海机票', done: false },
    { id: 3, text: '预订东京新宿酒店', done: false },
    { id: 4, text: '办理日本签证', done: true },
    { id: 5, text: '购买旅行保险', done: false },
    { id: 6, text: '兑换日元', done: false },
    { id: 7, text: '购买迪士尼门票', done: false },
  ],
  nextId: { flight: 4, dest: 4, expense: 4, hotel: 4, check: 8 },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_PLAN':
      return { ...state, activePlanId: action.payload };

    case 'CREATE_PLAN':
      return {
        ...state,
        plans: {
          ...state.plans,
          [action.payload.id]: {
            id: action.payload.id,
            name: action.payload.name,
            status: 'draft',
            itineraryItems: [],
            packingItems: [],
            documents: [],
            trips: [],
          },
        },
        activePlanId: action.payload.id,
      };

    case 'DELETE_PLAN': {
      const { [action.payload]: deleted, ...remainingPlans } = state.plans;
      const newActivePlanId = state.activePlanId === action.payload
        ? Object.keys(remainingPlans)[0] || ''
        : state.activePlanId;
      return {
        ...state,
        plans: remainingPlans,
        activePlanId: newActivePlanId,
      };
    }

    case 'TOGGLE_FLIGHT':
      return {
        ...state,
        flights: state.flights.map(f =>
          f.id === action.payload ? { ...f, selected: !f.selected } : f
        ),
      };

    case 'ADD_FLIGHT':
      return {
        ...state,
        flights: [...state.flights, action.payload],
        nextId: { ...state.nextId, flight: state.nextId.flight + 1 },
      };

    case 'DELETE_FLIGHT':
      return {
        ...state,
        flights: state.flights.filter(f => f.id !== action.payload),
      };

    case 'TOGGLE_DEST':
      return {
        ...state,
        destinations: state.destinations.map(d =>
          d.id === action.payload ? { ...d, selected: !d.selected } : d
        ),
      };

    case 'ADD_DEST':
      return {
        ...state,
        destinations: [...state.destinations, action.payload],
        nextId: { ...state.nextId, dest: state.nextId.dest + 1 },
      };

    case 'DELETE_DEST':
      return {
        ...state,
        destinations: state.destinations.filter(d => d.id !== action.payload),
      };

    case 'TOGGLE_HOTEL':
      return {
        ...state,
        hotels: state.hotels.map(h =>
          h.id === action.payload ? { ...h, selected: !h.selected } : h
        ),
      };

    case 'ADD_HOTEL':
      return {
        ...state,
        hotels: [...state.hotels, action.payload],
        nextId: { ...state.nextId, hotel: state.nextId.hotel + 1 },
      };

    case 'DELETE_HOTEL':
      return {
        ...state,
        hotels: state.hotels.filter(h => h.id !== action.payload),
      };

    case 'RATE_HOTEL':
      return {
        ...state,
        hotels: state.hotels.map(h =>
          h.id === action.payload.hotelId
            ? { ...h, scores: h.scores.map((s, i) => i === action.payload.critIdx ? action.payload.value : s) }
            : h
        ),
      };

    case 'TOGGLE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload ? { ...e, selected: !e.selected } : e
        ),
      };

    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        nextId: { ...state.nextId, expense: state.nextId.expense + 1 },
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };

    case 'TOGGLE_CHECK':
      return {
        ...state,
        checklistItems: state.checklistItems.map(i =>
          i.id === action.payload ? { ...i, done: !i.done } : i
        ),
      };

    case 'ADD_CHECK':
      return {
        ...state,
        checklistItems: [...state.checklistItems, action.payload],
        nextId: { ...state.nextId, check: state.nextId.check + 1 },
      };

    case 'TOGGLE_PACK':
      return {
        ...state,
        plans: {
          ...state.plans,
          [state.activePlanId]: {
            ...state.plans[state.activePlanId],
            packingItems: state.plans[state.activePlanId].packingItems.map(i =>
              i.id === action.payload ? { ...i, packed: !i.packed } : i
            ),
          },
        },
      };

    case 'ADD_DOCUMENT':
      return {
        ...state,
        plans: {
          ...state.plans,
          [state.activePlanId]: {
            ...state.plans[state.activePlanId],
            documents: [...state.plans[state.activePlanId].documents, action.payload],
          },
        },
      };

    case 'DELETE_TRIP':
      return {
        ...state,
        plans: {
          ...state.plans,
          [state.activePlanId]: {
            ...state.plans[state.activePlanId],
            trips: state.plans[state.activePlanId].trips.filter(t => t.id !== action.payload),
          },
        },
      };

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
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const getActivePlan = () => state.plans[state.activePlanId];

  return (
    <AppContext.Provider value={{ state, dispatch, getActivePlan }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
