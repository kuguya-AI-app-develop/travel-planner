# 后端数据交互实现

## 目标
将App数据改为通过API从后端获取，删除本地硬编码数据。

## 后端API分析

### 已有API：
| API | 方法 | 功能 |
|-----|------|------|
| `/api/auth/login` | POST | 用户登录，返回 `{ user, token }` |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/plans` | GET | 获取用户的所有计划 |
| `/api/plans` | POST | 创建新计划 |
| `/api/plans` | PUT | 更新计划 |
| `/api/plans` | DELETE | 删除计划 |
| `/api/chat` | POST | AI聊天 |
| `/api/ai/test-key` | POST | 测试API Key |
| `/api/ai/generate-plan` | POST | AI生成计划 |

### 后端Plan结构：
```typescript
{
  id: number;
  userId: number;
  name: string;
  status: string;  // 'draft' | 'active' | 'confirmed' | 'traveling' | 'done'
  startDate: string | null;
  endDate: string | null;
  data: string | null;  // JSON格式，存储itineraryItems, packingItems, documents, trips
}
```

---

## 详细任务

### 1. 创建API客户端工具
**新建文件：** `src/utils/apiClient.ts`

```typescript
import * as SecureStore from 'expo-secure-store';

// API基础URL（根据环境配置）
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // 开发环境
  : 'https://your-production-url.vercel.app/api';  // 生产环境

// 存储键名
const TOKEN_KEY = 'auth-token';

/**
 * 获取认证token
 */
async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * 保存认证token
 */
async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * 删除认证token
 */
async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * 发起API请求
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `请求失败: ${response.status}`);
  }

  return data;
}

// ============ 认证API ============

export async function login(username: string, password: string) {
  const data = await request<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  await setToken(data.token);
  return data;
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } finally {
    await removeToken();
  }
}

export async function getCurrentUser() {
  return request<{ user: any }>('/auth/me');
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

// ============ 计划API ============

export async function getPlans() {
  return request<{ plans: any[] }>('/plans');
}

export async function createPlan(planData: {
  name: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  data?: any;
}) {
  return request<{ plan: any }>('/plans', {
    method: 'POST',
    body: JSON.stringify(planData),
  });
}

export async function updatePlan(id: number, updates: {
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  data?: any;
}) {
  return request<{ plan: any }>('/plans', {
    method: 'PUT',
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function deletePlan(id: number) {
  return request<{ ok: boolean }>(`/plans?id=${id}`, {
    method: 'DELETE',
  });
}

// ============ 聊天API ============

export async function sendChatMessage(messages: any[], config?: {
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}) {
  return request<{ text: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, ...config }),
  });
}

export async function testApiKey(config: {
  apiKey: string;
  provider?: string;
  model?: string;
  baseUrl?: string;
}) {
  return request<{ ok: boolean }>('/ai/test-key', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}
```

### 2. 修改 AppContext.tsx - 从后端加载数据
**文件位置：** `src/store/AppContext.tsx`

**修改内容：**
- 删除硬编码的初始数据
- 添加从后端加载数据的逻辑
- 修改所有Action调用API

**完整修改后代码：**
```typescript
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Plan, Flight, Destination, Hotel, Expense, ChecklistItem, Document } from './types';
import * as api from '../utils/apiClient';

// 状态类型
interface AppState {
  plans: Record<string, Plan>;
  activePlanId: string;
  flights: Flight[];
  destinations: Destination[];
  hotels: Hotel[];
  expenses: Expense[];
  checklistItems: ChecklistItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Action类型
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOAD_PLANS'; payload: Record<string, Plan> }
  | { type: 'SELECT_PLAN'; payload: string }
  | { type: 'CREATE_PLAN'; payload: { id: string; name: string } }
  | { type: 'UPDATE_PLAN'; payload: { id: string; updates: Partial<Plan> } }
  | { type: 'DELETE_PLAN'; payload: string }
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
  | { type: 'ADD_CHECK'; payload: ChecklistItem }
  | { type: 'TOGGLE_PACK'; payload: number }
  | { type: 'ADD_DOCUMENT'; payload: Document };

// 初始状态（空）
const initialState: AppState = {
  plans: {},
  activePlanId: '',
  flights: [],
  destinations: [],
  hotels: [],
  expenses: [],
  checklistItems: [],
  isLoading: true,
  isAuthenticated: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'LOAD_PLANS':
      return { ...state, plans: action.payload };
    
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
    
    case 'UPDATE_PLAN':
      return {
        ...state,
        plans: {
          ...state.plans,
          [action.payload.id]: {
            ...state.plans[action.payload.id],
            ...action.payload.updates,
          },
        },
      };
    
    case 'DELETE_PLAN': {
      const { [action.payload]: _, ...remainingPlans } = state.plans;
      const newActiveId = state.activePlanId === action.payload
        ? Object.keys(remainingPlans)[0] || ''
        : state.activePlanId;
      return { ...state, plans: remainingPlans, activePlanId: newActiveId };
    }
    
    case 'TOGGLE_FLIGHT':
      return {
        ...state,
        flights: state.flights.map(f =>
          f.id === action.payload ? { ...f, selected: !f.selected } : f
        ),
      };
    
    case 'ADD_FLIGHT':
      return { ...state, flights: [...state.flights, action.payload] };
    
    case 'TOGGLE_DEST':
      return {
        ...state,
        destinations: state.destinations.map(d =>
          d.id === action.payload ? { ...d, selected: !d.selected } : d
        ),
      };
    
    case 'ADD_DEST':
      return { ...state, destinations: [...state.destinations, action.payload] };
    
    case 'TOGGLE_HOTEL':
      return {
        ...state,
        hotels: state.hotels.map(h =>
          h.id === action.payload ? { ...h, selected: !h.selected } : h
        ),
      };
    
    case 'ADD_HOTEL':
      return { ...state, hotels: [...state.hotels, action.payload] };
    
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
      return { ...state, expenses: [...state.expenses, action.payload] };
    
    case 'TOGGLE_CHECK':
      return {
        ...state,
        checklistItems: state.checklistItems.map(i =>
          i.id === action.payload ? { ...i, done: !i.done } : i
        ),
      };
    
    case 'ADD_CHECK':
      return { ...state, checklistItems: [...state.checklistItems, action.payload] };
    
    case 'TOGGLE_PACK':
      return {
        ...state,
        plans: {
          ...state.plans,
          [state.activePlanId]: {
            ...state.plans[state.activePlanId],
            packingItems: state.plans[state.activePlanId]?.packingItems.map(i =>
              i.id === action.payload ? { ...i, packed: !i.packed } : i
            ) || [],
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
            documents: [...(state.plans[state.activePlanId]?.documents || []), action.payload],
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
  // 新增：异步操作方法
  loadPlans: () => Promise<void>;
  createPlanAsync: (name: string) => Promise<void>;
  savePlanAsync: (planId: string) => Promise<void>;
  deletePlanAsync: (planId: string) => Promise<void>;
  loginAsync: (username: string, password: string) => Promise<void>;
  logoutAsync: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const isAuth = await api.isLoggedIn();
      if (isAuth) {
        const { user } = await api.getCurrentUser();
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        await loadPlans();
      }
    } catch (e) {
      console.log('Auth check failed:', e);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 启动时检查认证
  useEffect(() => {
    checkAuth();
  }, []);

  // 从后端加载计划
  const loadPlans = async () => {
    try {
      const { plans } = await api.getPlans();
      const plansMap: Record<string, Plan> = {};
      
      plans.forEach((plan: any) => {
        const planData = plan.data ? JSON.parse(plan.data) : {};
        plansMap[String(plan.id)] = {
          id: String(plan.id),
          name: plan.name,
          status: plan.status,
          itineraryItems: planData.itineraryItems || [],
          packingItems: planData.packingItems || [],
          documents: planData.documents || [],
          trips: planData.trips || [],
        };
      });
      
      dispatch({ type: 'LOAD_PLANS', payload: plansMap });
      
      // 设置活跃计划
      if (Object.keys(plansMap).length > 0 && !state.activePlanId) {
        dispatch({ type: 'SELECT_PLAN', payload: Object.keys(plansMap)[0] });
      }
    } catch (e) {
      console.log('Failed to load plans:', e);
    }
  };

  // 登录
  const loginAsync = async (username: string, password: string) => {
    const { user, token } = await api.login(username, password);
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    await loadPlans();
  };

  // 登出
  const logoutAsync = async () => {
    await api.logout();
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    dispatch({ type: 'LOAD_PLANS', payload: {} });
    dispatch({ type: 'SELECT_PLAN', payload: '' });
  };

  // 创建计划
  const createPlanAsync = async (name: string) => {
    const { plan } = await api.createPlan({
      name,
      status: 'draft',
      data: JSON.stringify({
        itineraryItems: [],
        packingItems: [],
        documents: [],
        trips: [],
      }),
    });
    
    dispatch({
      type: 'CREATE_PLAN',
      payload: { id: String(plan.id), name: plan.name },
    });
  };

  // 保存计划到后端
  const savePlanAsync = async (planId: string) => {
    const plan = state.plans[planId];
    if (!plan) return;

    const planData = {
      itineraryItems: plan.itineraryItems,
      packingItems: plan.packingItems,
      documents: plan.documents,
      trips: plan.trips,
    };

    await api.updatePlan(Number(planId), {
      name: plan.name,
      status: plan.status,
      data: JSON.stringify(planData),
    });
  };

  // 删除计划
  const deletePlanAsync = async (planId: string) => {
    await api.deletePlan(Number(planId));
    dispatch({ type: 'DELETE_PLAN', payload: planId });
  };

  const getActivePlan = () => state.plans[state.activePlanId] || {
    id: '',
    name: '',
    status: 'draft',
    itineraryItems: [],
    packingItems: [],
    documents: [],
    trips: [],
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      getActivePlan,
      loadPlans,
      createPlanAsync,
      savePlanAsync,
      deletePlanAsync,
      loginAsync,
      logoutAsync,
      checkAuth,
    }}>
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

### 3. 创建登录页面
**新建文件：** `app/login.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/theme';
import { useApp } from '../src/store/AppContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginAsync } = useApp();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    try {
      await loginAsync(username, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('登录失败', e.message || '请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>旅行策划</Text>
          <Text style={styles.subtitle}>登录你的账号</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="请输入用户名"
            placeholderTextColor={Colors.mutedLight}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            placeholderTextColor={Colors.mutedLight}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '登录中...' : '登录'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontFamily: Typography.display,
    fontSize: 32,
    fontWeight: Typography.extrabold,
    color: Colors.fg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.md,
    color: Colors.muted,
  },
  form: {
    gap: Spacing.md,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.muted,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    fontSize: Typography.base,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
  button: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
});
```

### 4. 修改根布局 - 添加认证检查
**文件位置：** `app/_layout.tsx`

```typescript
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/store/AppContext';
import { useEffect } from 'react';

function RootLayoutNav() {
  const { state } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!state.isAuthenticated && !inAuthGroup) {
      // 未登录，跳转到登录页
      router.replace('/login');
    } else if (state.isAuthenticated && inAuthGroup) {
      // 已登录，跳转到首页
      router.replace('/(tabs)');
    }
  }, [state.isAuthenticated, state.isLoading, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
```

### 5. 修改首页 - 添加登出功能
**文件位置：** `app/(tabs)/index.tsx`

**添加登出按钮：**
```typescript
import { useApp } from '../../src/store/AppContext';

// 在组件中添加
const { logoutAsync } = useApp();

const handleLogout = async () => {
  Alert.alert(
    '确认登出',
    '确定要登出吗？',
    [
      { text: '取消', style: 'cancel' },
      { text: '登出', onPress: () => logoutAsync() },
    ]
  );
};

// 在header部分添加登出按钮
<View style={styles.header}>
  <View>
    <Text style={styles.title}>旅行策划</Text>
    <Text style={styles.subtitle}>管理你的旅行计划</Text>
  </View>
  <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
    <Ionicons name="log-out-outline" size={24} color={Colors.muted} />
  </TouchableOpacity>
</View>
```

### 6. 修改数据保存逻辑
**在各页面中添加保存功能：**

例如，在添加航班、酒店等操作后，调用保存：

```typescript
const { dispatch, savePlanAsync, state } = useApp();

const handleAddFlight = () => {
  // 添加到本地状态
  dispatch({ type: 'ADD_FLIGHT', payload: newFlight });
  
  // 保存到后端
  savePlanAsync(state.activePlanId);
};
```

---

## 需要删除的文件/代码

1. **删除 AppContext.tsx 中的硬编码数据**
   - 删除 initialState 中的所有示例数据

2. **删除 AsyncStorage 相关代码**
   - ChatPanel.tsx 中的 AsyncStorage 导入和使用
   - ai-settings.tsx 中的 AsyncStorage 导入和使用

---

## 验证标准
1. 启动App时显示登录页面
2. 输入正确的用户名密码后能登录
3. 登录后能从后端加载计划数据
4. 创建新计划能保存到后端
5. 修改计划能同步到后端
6. 删除计划能同步到后端
7. 登出后清除本地数据
8. 重启App后如果token有效，自动登录

## 注意事项
- 需要配置正确的API_BASE_URL
- 需要确保后端CORS配置允许App访问
- 需要处理网络错误和loading状态
- 需要实现token刷新机制（可选）

## 后续优化
1. 添加离线支持（本地缓存 + 同步队列）
2. 添加token自动刷新
3. 添加数据同步冲突处理
4. 添加更多CRUD操作（航班、酒店等单独管理）
