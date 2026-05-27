# 阶段1：项目基础搭建 + 底部Tab导航

## 目标
搭建可运行的旅行策划App基础框架，实现底部Tab导航和柯基配色主题系统。

## 原型参考
原型文件位置：`~/个人项目/travel-planner/react-native-app/prototype/travel-planner-mobile-corgi.html`

## 技术栈
- Expo SDK 56 + React Native
- expo-router（基于文件的路由）
- TypeScript
- React Context + useReducer（状态管理）

## 详细任务

### 1. 初始化Expo项目
在 `~/个人项目/travel-planner/react-native-app` 目录下初始化Expo项目：
```bash
npx create-expo-app@latest . --template blank-typescript
```

### 2. 安装依赖
```bash
npx expo install expo-router expo-constants expo-linking expo-status-bar expo-system-ui react-native-safe-area-context react-native-screens
```

### 3. 配置expo-router
修改 `package.json`：
```json
{
  "main": "expo-router/entry"
}
```

修改 `app.json`：
```json
{
  "expo": {
    "scheme": "travel-planner",
    "plugins": ["expo-router"]
  }
}
```

### 4. 创建柯基配色主题系统
创建文件 `src/theme/colors.ts`：
```typescript
// 柯基配色主题 - 基于oklch色彩空间
// 原型中使用的颜色值，转换为React Native可用的格式

export const Colors = {
  // 背景色
  bg: '#FDFBF7',           // oklch(97% 0.008 80)
  bgDeep: '#F8F4ED',       // oklch(95% 0.012 80)
  surface: '#FFFFFF',      // oklch(100% 0 0)
  surfaceRaised: '#F5F1E8',// oklch(96% 0.01 80)
  surfaceCard: '#FFFFFF',  // oklch(100% 0 0)
  
  // 前景色
  fg: '#2A2520',           // oklch(12% 0.02 60)
  fg2: '#4A4540',          // oklch(30% 0.015 60)
  muted: '#7A7570',        // oklch(50% 0.015 60)
  mutedLight: '#9A9590',   // oklch(65% 0.01 60)
  
  // 边框色
  border: '#E0DCD5',       // oklch(88% 0.01 80)
  borderLight: '#EBE8E2',  // oklch(92% 0.008 80)
  
  // 强调色（柯基橙）
  accent: '#D4A853',       // oklch(72% 0.18 80)
  accentDim: '#B8903A',    // oklch(60% 0.16 75)
  accentGlow: 'rgba(212, 168, 83, 0.15)',
  
  // 状态色
  success: '#5AA85A',      // oklch(55% 0.16 150)
  successDim: '#3D8A3D',   // oklch(42% 0.12 150)
  warn: '#D4A853',         // oklch(70% 0.18 75)
  warnDim: '#B8903A',      // oklch(55% 0.14 75)
  danger: '#CC4444',       // oklch(55% 0.22 25)
  dangerDim: '#AA3333',    // oklch(42% 0.16 25)
  
  // 特色色
  coral: '#CC6644',        // oklch(58% 0.18 35)
  teal: '#4488AA',         // oklch(52% 0.14 185)
  purple: '#8855CC',       // oklch(55% 0.20 300)
  pink: '#CC5577',         // oklch(60% 0.20 350)
  gold: '#D4A853',         // oklch(70% 0.16 80)
  goldDim: '#B8903A',      // oklch(55% 0.12 75)
  
  // 柯基特色色
  corgiBrown: '#8B6914',   // oklch(45% 0.12 55)
  corgiCream: '#F0E8D0',   // oklch(92% 0.04 80)
};
```

创建文件 `src/theme/typography.ts`：
```typescript
export const Typography = {
  // 字体
  display: 'SF Pro Display',
  body: 'SF Pro Text',
  mono: 'SF Mono',
  
  // 字号
  xs: 10,
  sm: 12,
  base: 13,
  md: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 24,
  '4xl': 28,
  
  // 字重
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
```

创建文件 `src/theme/spacing.ts`：
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};
```

创建文件 `src/theme/index.ts`：
```typescript
export { Colors } from './colors';
export { Typography } from './typography';
export { Spacing, Radius, Shadows } from './spacing';
```

### 5. 创建底部Tab导航
使用expo-router的Tab导航，创建文件结构：

```
app/
├── _layout.tsx          # 根布局（Tab导航）
├── (tabs)/
│   ├── _layout.tsx      # Tab布局配置
│   ├── index.tsx        # 首页
│   ├── calendar.tsx     # 日历
│   ├── tools.tsx        # 工具箱
│   ├── ai.tsx           # AI助手
│   └── budget.tsx       # 预算
```

修改 `app/(tabs)/_layout.tsx`：
```typescript
import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 83,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '日历',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: '工具',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: '预算',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 6. 创建各Tab页面骨架
修改 `app/(tabs)/index.tsx`（首页）：
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>旅行策划</Text>
        <Text style={styles.subtitle}>管理你的旅行计划</Text>
      </View>
      {/* 后续添加计划切换器、预算摘要、功能网格 */}
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
});
```

修改 `app/(tabs)/calendar.tsx`（日历）：
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>行程日历</Text>
        <Text style={styles.subtitle}>查看行程时间安排</Text>
      </View>
      {/* 后续添加日历组件 */}
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
});
```

修改 `app/(tabs)/tools.tsx`（工具箱）：
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';

export default function ToolsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>工具箱</Text>
        <Text style={styles.subtitle}>旅行规划全部功能</Text>
      </View>
      {/* 后续添加功能列表 */}
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
});
```

修改 `app/(tabs)/ai.tsx`（AI助手）：
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';

export default function AIScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI 助手</Text>
        <Text style={styles.subtitle}>智能旅行策划与设置</Text>
      </View>
      {/* 后续添加AI功能入口 */}
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
});
```

修改 `app/(tabs)/budget.tsx`（预算）：
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';

export default function BudgetScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>预算总结</Text>
        <Text style={styles.subtitle}>汇总所有已勾选项目费用</Text>
      </View>
      {/* 后续添加预算汇总 */}
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
});
```

### 7. 修改根布局
修改 `app/_layout.tsx`：
```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

## 验证标准
1. 运行 `npx expo start` 能成功启动
2. 底部显示5个Tab（首页、日历、工具、AI、预算）
3. 点击Tab能切换页面
4. 柯基配色正确应用（橙色强调色、米白色背景）
5. 每个页面显示标题和副标题

## 注意事项
- 确保所有文件使用UTF-8编码
- 确保TypeScript类型正确
- 确保expo-router配置正确
- 如果遇到问题，检查 `app.json` 和 `package.json` 配置
