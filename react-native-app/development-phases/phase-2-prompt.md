# 阶段2：首页 + 计划管理

## 目标
完成首页核心功能，包括计划切换器、预算摘要卡片、功能模块网格和Toast提示组件。

## 前置条件
- 阶段1已完成，项目能正常运行
- 底部Tab导航正常工作
- 柯基配色主题系统已配置

## 原型参考
原型文件位置：`~/个人项目/travel-planner/react-native-app/prototype/travel-planner-mobile-corgi.html`

## 详细任务

### 1. 创建数据模型和状态管理
创建文件 `src/store/types.ts`：
```typescript
// 计划状态类型
export type PlanStatus = 'draft' | 'active' | 'confirmed' | 'traveling' | 'done';

// 计划状态配置
export const PLAN_STATUSES: Record<PlanStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: Colors.muted },
  active: { label: '进行中', color: Colors.accent },
  confirmed: { label: '已确认', color: Colors.success },
  traveling: { label: '已出行', color: Colors.accentDim },
  done: { label: '已完成', color: Colors.purple },
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
```

创建文件 `src/store/AppContext.tsx`：
```typescript
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Plan, Flight, Destination, Hotel, Expense, ChecklistItem } from './types';

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
  | { type: 'TOGGLE_FLIGHT'; payload: number }
  | { type: 'ADD_FLIGHT'; payload: Flight }
  | { type: 'TOGGLE_DEST'; payload: number }
  | { type: 'ADD_DEST'; payload: Destination }
  | { type: 'TOGGLE_HOTEL'; payload: number }
  | { type: 'ADD_HOTEL'; payload: Hotel }
  | { type: 'RATE_HOTEL'; payload: { hotelId: number; critIdx: number; value: number } }
  | { type: 'TOGGLE_EXPENSE'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'TOGGLE_CHECK'; payload: number }
  | { type: 'ADD_CHECK'; payload: ChecklistItem };

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
```

### 2. 创建Toast组件
创建文件 `src/components/Toast.tsx`：
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: Colors.fg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    zIndex: 400,
  },
  text: {
    color: Colors.bg,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    whiteSpace: 'nowrap',
  },
});
```

创建文件 `src/hooks/useToast.ts`：
```typescript
import { useState, useCallback } from 'react';

export function useToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, message, showToast, hideToast };
}
```

### 3. 创建计划切换器组件
创建文件 `src/components/PlanSwitcher.tsx`：
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useApp } from '../store/AppContext';
import { PLAN_STATUSES } from '../store/types';

interface PlanSwitcherProps {
  onPlanSelect: (planId: string) => void;
  onCreatePlan: () => void;
}

export function PlanSwitcher({ onPlanSelect, onCreatePlan }: PlanSwitcherProps) {
  const { state, getActivePlan } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const plan = getActivePlan();
  const status = PLAN_STATUSES[plan.status];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar" size={16} color={Colors.accent} />
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={10}
          color={Colors.muted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {Object.values(state.plans).map((p) => {
            const s = PLAN_STATUSES[p.status];
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.dropdownItem,
                  p.id === state.activePlanId && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onPlanSelect(p.id);
                  setIsOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemName}>{p.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: s.color + '20' }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>
                    {s.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onCreatePlan();
              setIsOpen(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownItemName, { color: Colors.accent }]}>
              + 新建计划
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  planName: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  dropdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: Colors.accent + '10',
  },
  dropdownItemName: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
});
```

### 4. 创建预算摘要卡片组件
创建文件 `src/components/SummaryCard.tsx`：
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface SummaryCardProps {
  label: string;
  value: string;
  note?: string;
  color: 'accent' | 'success' | 'warn' | 'coral';
}

const colorMap = {
  accent: Colors.accent,
  success: Colors.success,
  warn: Colors.warn,
  coral: Colors.coral,
};

export function SummaryCard({ label, value, note, color }: SummaryCardProps) {
  const bgColor = colorMap[color];

  return (
    <View style={styles.container}>
      <View style={[styles.decor, { backgroundColor: bgColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  decor: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.08,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.muted,
    fontWeight: Typography.semibold,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  value: {
    fontFamily: Typography.display,
    fontSize: Typography['3xl'],
    fontWeight: Typography.extrabold,
    letterSpacing: -0.03,
  },
  note: {
    fontSize: Typography.xs,
    color: Colors.mutedLight,
    marginTop: Spacing.xs,
  },
});
```

### 5. 创建功能模块网格组件
创建文件 `src/components/ToolCard.tsx`：
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface ToolCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  name: string;
  desc: string;
  onPress: () => void;
}

export function ToolCard({ icon, iconColor, iconBg, name, desc, onPress }: ToolCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  desc: {
    fontSize: Typography.xs,
    color: Colors.muted,
    lineHeight: 1.4,
  },
});
```

### 6. 更新首页页面
修改 `app/(tabs)/index.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { PlanSwitcher } from '../../src/components/PlanSwitcher';
import { SummaryCard } from '../../src/components/SummaryCard';
import { ToolCard } from '../../src/components/ToolCard';
import { Toast } from '../../src/components/Toast';
import { useToast } from '../../src/hooks/useToast';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const router = useRouter();
  const plan = getActivePlan();

  // 计算预算
  const selectedFlights = state.flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);
  const selectedHotels = state.hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + h.priceNum, 0);
  const selectedExpenses = state.expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);
  const total = flightTotal + hotelTotal + expenseTotal;

  // 计算待办完成
  const doneCount = state.checklistItems.filter(i => i.done).length;
  const totalCount = state.checklistItems.length;
  const donePercent = Math.round(doneCount / totalCount * 100);

  const handlePlanSelect = (planId: string) => {
    dispatch({ type: 'SELECT_PLAN', payload: planId });
    showToast('已切换到：' + state.plans[planId].name);
  };

  const handleCreatePlan = () => {
    const id = 'plan-' + (Object.keys(state.plans).length + 1);
    dispatch({
      type: 'CREATE_PLAN',
      payload: { id, name: '新计划 ' + (Object.keys(state.plans).length + 1) },
    });
    showToast('已创建新计划');
  };

  const tools = [
    {
      icon: 'calendar' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      name: '行程日历',
      desc: `${plan.trips.length} 个行程`,
      onPress: () => router.push('/calendar'),
    },
    {
      icon: 'airplane' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      name: '机票对比',
      desc: `${state.flights.length} 个航班`,
      onPress: () => router.push('/flights'),
    },
    {
      icon: 'location' as const,
      iconColor: Colors.coral,
      iconBg: Colors.coral + '15',
      name: '目的地',
      desc: `${state.destinations.length} 个目的地`,
      onPress: () => router.push('/destinations'),
    },
    {
      icon: 'bed' as const,
      iconColor: Colors.purple,
      iconBg: Colors.purple + '15',
      name: '酒店评分',
      desc: `${state.hotels.length} 家酒店`,
      onPress: () => router.push('/hotels'),
    },
    {
      icon: 'wallet' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      name: '其他消费',
      desc: `${state.expenses.length} 项消费`,
      onPress: () => router.push('/expenses'),
    },
    {
      icon: 'list' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      name: '每日行程',
      desc: `${plan.itineraryItems.length} 项活动`,
      onPress: () => router.push('/itinerary'),
    },
    {
      icon: 'checkbox' as const,
      iconColor: Colors.success,
      iconBg: Colors.success + '15',
      name: '行李清单',
      desc: `${plan.packingItems.filter(i => i.packed).length}/${plan.packingItems.length} 已打包`,
      onPress: () => router.push('/packing'),
    },
    {
      icon: 'document' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      name: '证件管理',
      desc: `${plan.documents.length} 个证件`,
      onPress: () => router.push('/documents'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>旅行策划</Text>
          <Text style={styles.subtitle}>管理你的旅行计划</Text>
        </View>

        <PlanSwitcher
          onPlanSelect={handlePlanSelect}
          onCreatePlan={handleCreatePlan}
        />

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="总预算"
            value={`¥${total.toLocaleString()}`}
            note="机票+酒店+消费"
            color="accent"
          />
          <SummaryCard
            label="待办完成"
            value={`${doneCount}/${totalCount}`}
            note={`${donePercent}% 已完成`}
            color="success"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>功能模块</Text>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <Toast visible={visible} message={message} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.display,
    fontSize: Typography['4xl'],
    fontWeight: Typography.extrabold,
    letterSpacing: -0.03,
    color: Colors.fg,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});
```

### 7. 更新根布局添加Provider
修改 `app/_layout.tsx`：
```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/store/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
```

## 验证标准
1. 首页显示计划切换器，点击可展开下拉列表
2. 能切换不同计划，显示对应的计划名称和状态
3. 能创建新计划，自动切换到新计划
4. 预算摘要卡片显示正确的总预算和待办完成情况
5. 功能模块网格显示8个工具卡片
6. 点击工具卡片能跳转到对应页面（暂时跳转到Tab页面）
7. Toast提示正常显示和隐藏

## 注意事项
- 确保所有组件导入路径正确
- 确保TypeScript类型定义完整
- 确保状态管理逻辑正确
- 如果遇到问题，检查expo-router的路由配置
