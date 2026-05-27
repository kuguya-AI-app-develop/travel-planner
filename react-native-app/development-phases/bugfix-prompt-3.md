# 额外修改2：日历事件文字 + Badge修复 + 弹窗关闭 + 卡片跳转 + 预算布局

## 目标
完成5个修改：
1. 日历event显示文字，过长用省略号
2. Badge"汪"完整显示，不被切掉
3. 点击弹窗外关闭聊天弹窗
4. 首页8个卡片跳转修复
5. 预算页面4个卡片改为2x2布局

## 详细任务

### 1. 修改 Calendar.tsx - 日历事件显示文字
**文件位置：** `src/components/Calendar.tsx`

**修改第79-81行，将tripDot替换为tripLabel：**

**修改前：**
```typescript
{trip && (
  <View style={[styles.tripDot, { backgroundColor: trip.color }]} />
)}
```

**修改后：**
```typescript
{trip && (
  <View style={[styles.tripLabel, { backgroundColor: trip.color }]}>
    <Text style={styles.tripLabelText} numberOfLines={1}>
      {trip.name}
    </Text>
  </View>
)}
```

**修改样式（删除tripDot，添加tripLabel）：**

**删除：**
```typescript
tripDot: {
  position: 'absolute',
  left: 3,
  right: 3,
  bottom: 3,
  height: 4,
  borderRadius: 2,
},
```

**添加：**
```typescript
tripLabel: {
  marginTop: 2,
  paddingHorizontal: 2,
  paddingVertical: 1,
  borderRadius: 3,
  overflow: 'hidden',
},
tripLabelText: {
  fontSize: 8,
  fontWeight: Typography.semibold,
  color: '#FFFFFF',
  textAlign: 'center',
},
```

**同时调整dayCell的minHeight，给文字更多空间：**
```typescript
dayCell: {
  width: '14.28%',
  minHeight: 56, // 从48增加到56
  padding: Spacing.xs,
  borderRightWidth: 1,
  borderBottomWidth: 1,
  borderRightColor: Colors.borderLight,
  borderBottomColor: Colors.borderLight,
},
```

---

### 2. 修改 ChatFAB.tsx - Badge完整显示
**文件位置：** `src/components/ChatFAB.tsx`

**问题：** container设置了 `overflow: 'hidden'`，导致badge被切掉。

**修改container样式，删除overflow: 'hidden'：**
```typescript
container: {
  position: 'absolute',
  bottom: 96,
  right: 16,
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: Colors.gold,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
  // 删除 overflow: 'hidden'
  ...Shadows.md,
},
```

**调整badge位置，确保不被切掉：**
```typescript
badge: {
  position: 'absolute',
  top: -2,  // 从-4改为-2
  right: -2,  // 从-4改为-2
  minWidth: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: '#FF4444',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: Colors.bg,
  paddingHorizontal: 4,
},
```

---

### 3. 修改 index.tsx - 点击弹窗外关闭聊天 + 修复卡片跳转
**文件位置：** `app/(tabs)/index.tsx`

**3.1 添加Modal和TouchableWithoutFeedback导入：**
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
```

**3.2 修复8个卡片的跳转路由（第56-113行）：**

**修改前（所有都是router.push('/calendar')）：**
```typescript
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
    onPress: () => router.push('/calendar'),  // 错误
  },
  // ... 其他都是错误的
];
```

**修改后：**
```typescript
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
    onPress: () => router.push('/(tabs)/(subscreens)/flights'),
  },
  {
    icon: 'location' as const,
    iconColor: Colors.coral,
    iconBg: Colors.coral + '15',
    name: '目的地',
    desc: `${state.destinations.length} 个目的地`,
    onPress: () => router.push('/(tabs)/(subscreens)/destinations'),
  },
  {
    icon: 'bed' as const,
    iconColor: Colors.purple,
    iconBg: Colors.purple + '15',
    name: '酒店评分',
    desc: `${state.hotels.length} 家酒店`,
    onPress: () => router.push('/(tabs)/(subscreens)/hotels'),
  },
  {
    icon: 'wallet' as const,
    iconColor: Colors.warn,
    iconBg: Colors.warn + '15',
    name: '其他消费',
    desc: `${state.expenses.length} 项消费`,
    onPress: () => router.push('/(tabs)/(subscreens)/expenses'),
  },
  {
    icon: 'list' as const,
    iconColor: Colors.accent,
    iconBg: Colors.accent + '15',
    name: '每日行程',
    desc: `${plan.itineraryItems.length} 项活动`,
    onPress: () => router.push('/(tabs)/(subscreens)/itinerary'),
  },
  {
    icon: 'checkbox' as const,
    iconColor: Colors.success,
    iconBg: Colors.success + '15',
    name: '行李清单',
    desc: `${plan.packingItems.filter(i => i.packed).length}/${plan.packingItems.length} 已打包`,
    onPress: () => router.push('/(tabs)/(subscreens)/packing'),
  },
  {
    icon: 'document' as const,
    iconColor: Colors.teal,
    iconBg: Colors.teal + '15',
    name: '证件管理',
    desc: `${plan.documents.length} 个证件`,
    onPress: () => router.push('/(tabs)/(subscreens)/documents'),
  },
];
```

**3.3 修改聊天弹窗部分，添加点击外部关闭功能：**

**修改前（第157-161行）：**
```typescript
{/* 聊天FAB */}
<ChatFAB onPress={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />

{/* 聊天面板 */}
<ChatPanel visible={chatOpen} onClose={() => setChatOpen(false)} />
```

**修改后：**
```typescript
{/* 聊天FAB */}
<ChatFAB onPress={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />

{/* 聊天面板 - 使用Modal实现点击外部关闭 */}
<Modal
  visible={chatOpen}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setChatOpen(false)}
>
  <TouchableWithoutFeedback onPress={() => setChatOpen(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={styles.chatContainer}>
          <ChatPanel visible={true} onClose={() => setChatOpen(false)} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>
```

**添加样式：**
```typescript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
chatContainer: {
  width: '90%',
  maxHeight: '70%',
},
```

---

### 4. 修改 ChatPanel.tsx - 调整为嵌入式
**文件位置：** `src/components/ChatPanel.tsx`

**修改container样式，移除absolute定位（因为现在由Modal包裹）：**

**修改前：**
```typescript
container: {
  position: 'absolute',
  bottom: 100,
  right: 8,
  left: 8,
  top: 100,
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: Radius.xl,
  ...Shadows.md,
  zIndex: 200,
},
```

**修改后：**
```typescript
container: {
  flex: 1,
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: Radius.xl,
  overflow: 'hidden',
  ...Shadows.md,
},
```

---

### 5. 修改 budget.tsx - 4个卡片改为2x2布局
**文件位置：** `app/(tabs)/budget.tsx`

**修改summaryGrid样式（第130-136行）：**

**修改前：**
```typescript
summaryGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: Spacing.md,
  paddingHorizontal: Spacing.lg,
  marginBottom: Spacing.lg,
},
```

**修改后：**
```typescript
summaryGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: Spacing.md,
  paddingHorizontal: Spacing.lg,
  marginBottom: Spacing.lg,
},
```

**同时修改SummaryCard组件，确保宽度正确：**

**文件位置：** `src/components/SummaryCard.tsx`

**修改container样式：**
```typescript
container: {
  flex: 1,
  minWidth: '45%', // 确保两列布局
  backgroundColor: Colors.surfaceCard,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: Radius.lg,
  padding: Spacing.md,
  position: 'relative',
  overflow: 'hidden',
  ...Shadows.sm,
},
```

---

## 验证标准
1. 日历中的行程显示文字（如"东京购物之旅"），过长显示省略号
2. FAB按钮右上角的"汪"完整显示，不被切掉
3. 打开聊天弹窗后，点击弹窗外的灰色区域可以关闭弹窗
4. 首页8个卡片点击后跳转到正确的子页面
5. 预算页面4个卡片显示为2x2布局（2张一排，共2排）

## 注意事项
- 确保expo-router的路由路径正确
- 如果Modal不工作，检查react-native的版本兼容性
- 日历文字大小可以根据实际效果微调
- 预算卡片布局可能需要调整SummaryCard的宽度
