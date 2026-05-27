# 阶段3：日历 + 工具箱 + 预算页面

## 目标
完成3个主要Tab页面：日历、工具箱、预算，实现完整功能交互。

## 前置条件
- 阶段1、2已完成，项目能正常运行
- 首页功能完整，状态管理正常
- 底部Tab导航正常工作

## 原型参考
原型文件位置：`~/个人项目/travel-planner/react-native-app/prototype/travel-planner-mobile-corgi.html`

## 详细任务

### 1. 创建日历组件
创建文件 `src/components/Calendar.tsx`：
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Trip } from '../store/types';

interface CalendarProps {
  trips: Trip[];
  onDateSelect?: (date: string) => void;
}

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function Calendar({ trips, onDateSelect }: CalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // 获取当月第一天是星期几
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // 获取当月天数
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // 获取上月天数
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 月份导航
  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // 检查日期是否有行程
  const getTripForDate = (dateStr: string): Trip | null => {
    for (const trip of trips) {
      if (dateStr >= trip.start && dateStr <= trip.end) {
        return trip;
      }
    }
    return null;
  };

  // 生成日历网格
  const renderCalendarDays = () => {
    const days = [];
    
    // 上月日期
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <View key={`prev-${i}`} style={[styles.dayCell, styles.otherMonth]}>
          <Text style={styles.dayText}>{day}</Text>
        </View>
      );
    }
    
    // 当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = currentYear === today.getFullYear() && 
                      currentMonth === today.getMonth() && 
                      day === today.getDate();
      const trip = getTripForDate(dateStr);
      
      days.push(
        <TouchableOpacity
          key={`current-${day}`}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={() => onDateSelect?.(dateStr)}
          activeOpacity={0.7}
        >
          <View style={[styles.dateContainer, isToday && styles.todayContainer]}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {day}
            </Text>
          </View>
          {trip && (
            <View style={[styles.tripDot, { backgroundColor: trip.color }]} />
          )}
        </TouchableOpacity>
      );
    }
    
    // 下月日期
    const totalCells = firstDayOfMonth + daysInMonth;
    const remaining = (7 - totalCells % 7) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push(
        <View key={`next-${i}`} style={[styles.dayCell, styles.otherMonth]}>
          <Text style={styles.dayText}>{i}</Text>
        </View>
      );
    }
    
    return days;
  };

  return (
    <View style={styles.container}>
      {/* 月份导航 */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth(-1)}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {currentYear}年{MONTH_NAMES[currentMonth]}
        </Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth(1)}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 星期头部 */}
      <View style={styles.weekHeader}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* 日历网格 */}
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: Typography.lg,
    color: Colors.fg2,
  },
  monthLabel: {
    fontFamily: Typography.display,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  weekDayCell: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 48,
    padding: Spacing.xs,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.borderLight,
    borderBottomColor: Colors.borderLight,
  },
  otherMonth: {
    opacity: 0.3,
  },
  todayCell: {
    backgroundColor: Colors.accent + '10',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayContainer: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    width: 22,
    height: 22,
  },
  dayText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
  todayText: {
    color: Colors.surface,
    fontWeight: Typography.bold,
  },
  tripDot: {
    position: 'absolute',
    left: 3,
    right: 3,
    bottom: 3,
    height: 4,
    borderRadius: 2,
  },
});
```

### 2. 创建时间轴组件
创建文件 `src/components/Timeline.tsx`：
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Trip } from '../store/types';

interface TimelineProps {
  trips: Trip[];
}

export function Timeline({ trips }: TimelineProps) {
  // 按开始日期排序
  const sortedTrips = [...trips].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <View style={styles.container}>
      {sortedTrips.map((trip) => (
        <View key={trip.id} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: trip.color }]} />
          <View style={styles.info}>
            <Text style={styles.name}>{trip.name}</Text>
            <Text style={styles.dates}>{trip.start} → {trip.end}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  dates: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
});
```

### 3. 更新日历页面
修改 `app/(tabs)/calendar.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { Calendar } from '../../src/components/Calendar';
import { Timeline } from '../../src/components/Timeline';

export default function CalendarScreen() {
  const { getActivePlan } = useApp();
  const plan = getActivePlan();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>行程日历</Text>
          <Text style={styles.subtitle}>查看行程时间安排</Text>
        </View>

        <Calendar trips={plan.trips} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>时间轴</Text>
        </View>

        <Timeline trips={plan.trips} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
  },
});
```

### 4. 创建列表项组件
创建文件 `src/components/ListItem.tsx`：
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface ListItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  onPress: () => void;
}

export function ListItem({ icon, iconColor, iconBg, title, desc, onPress }: ListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.mutedLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  desc: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
});
```

### 5. 更新工具箱页面
修改 `app/(tabs)/tools.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { ListItem } from '../../src/components/ListItem';
import { useRouter } from 'expo-router';

export default function ToolsScreen() {
  const router = useRouter();

  const tools = [
    {
      icon: 'airplane' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      title: '机票对比',
      desc: '对比航班价格与服务',
      onPress: () => router.push('/flights'),
    },
    {
      icon: 'location' as const,
      iconColor: Colors.coral,
      iconBg: Colors.coral + '15',
      title: '目的地选择',
      desc: '评估各目的地综合评分',
      onPress: () => router.push('/destinations'),
    },
    {
      icon: 'bed' as const,
      iconColor: Colors.purple,
      iconBg: Colors.purple + '15',
      title: '酒店评分',
      desc: '对比酒店价格与服务',
      onPress: () => router.push('/hotels'),
    },
    {
      icon: 'wallet' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      title: '其他消费',
      desc: '记录门票、餐饮等消费',
      onPress: () => router.push('/expenses'),
    },
    {
      icon: 'list' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      title: '每日行程',
      desc: '规划每天的具体安排',
      onPress: () => router.push('/itinerary'),
    },
    {
      icon: 'checkbox' as const,
      iconColor: Colors.success,
      iconBg: Colors.success + '15',
      title: '行李清单',
      desc: '逐项检查已打包物品',
      onPress: () => router.push('/packing'),
    },
    {
      icon: 'document' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      title: '证件管理',
      desc: '护照、签证、保险有效期',
      onPress: () => router.push('/documents'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>工具箱</Text>
          <Text style={styles.subtitle}>旅行规划全部功能</Text>
        </View>

        <View style={styles.listContainer}>
          {tools.map((tool, index) => (
            <ListItem key={index} {...tool} />
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
  listContainer: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
});
```

### 6. 创建待办清单组件
创建文件 `src/components/Checklist.tsx`：
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { ChecklistItem } from '../store/types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: number) => void;
  onAdd: () => void;
}

export function Checklist({ items, onToggle, onAdd }: ChecklistProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>待办事项</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, item.done && styles.itemDone]}
          onPress={() => onToggle(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.done ? 'checkbox' : 'square-outline'}
            size={18}
            color={item.done ? Colors.accent : Colors.muted}
          />
          <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  addButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  addButtonText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.fg2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemDone: {
    opacity: 0.6,
  },
  itemText: {
    flex: 1,
    fontSize: Typography.base,
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.mutedLight,
  },
});
```

### 7. 更新预算页面
修改 `app/(tabs)/budget.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { SummaryCard } from '../../src/components/SummaryCard';
import { Checklist } from '../../src/components/Checklist';
import { Toast } from '../../src/components/Toast';
import { useToast } from '../../src/hooks/useToast';

export default function BudgetScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();

  // 计算各项费用
  const selectedFlights = state.flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);
  const selectedHotels = state.hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + h.priceNum, 0);
  const selectedExpenses = state.expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);
  const total = flightTotal + hotelTotal + expenseTotal;

  // 已选目的地
  const selectedDests = state.destinations.filter(d => d.selected);

  const handleToggleCheck = (id: number) => {
    dispatch({ type: 'TOGGLE_CHECK', payload: id });
  };

  const handleAddCheck = () => {
    // 简单实现，实际可以用模态框
    const newItem = {
      id: Date.now(),
      text: '新待办事项',
      done: false,
    };
    dispatch({ type: 'ADD_CHECK', payload: newItem });
    showToast('已添加待办事项');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>预算总结</Text>
          <Text style={styles.subtitle}>汇总所有已勾选项目费用</Text>
        </View>

        {/* 费用汇总 */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            label="总费用"
            value={`¥${total.toLocaleString()}`}
            color="accent"
          />
          <SummaryCard
            label="机票"
            value={`¥${flightTotal.toLocaleString()}`}
            note={`${selectedFlights.length} 个航班`}
            color="success"
          />
          <SummaryCard
            label="酒店"
            value={`¥${hotelTotal.toLocaleString()}`}
            note={`${selectedHotels.length} 家酒店`}
            color="warn"
          />
          <SummaryCard
            label="其他消费"
            value={`¥${expenseTotal.toLocaleString()}`}
            note={`${selectedExpenses.length} 项`}
            color="coral"
          />
        </View>

        {/* 已选目的地 */}
        {selectedDests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>已选目的地</Text>
            </View>
            {selectedDests.map((dest) => (
              <View key={dest.id} style={styles.destItem}>
                <Text style={styles.destName}>
                  {dest.name}，{dest.country}
                </Text>
                <Text style={styles.destNotes}>{dest.notes}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 待办清单 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>待办清单</Text>
          </View>
          <Checklist
            items={state.checklistItems}
            onToggle={handleToggleCheck}
            onAdd={handleAddCheck}
          />
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
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
  },
  destItem: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  destName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  destNotes: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
});
```

### 8. 创建子页面路由
创建目录 `app/(tabs)/(subscreens)/`，用于存放子页面。

创建文件 `app/(tabs)/(subscreens)/_layout.tsx`：
```typescript
import { Stack } from 'expo-router';

export default function SubScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
```

创建占位页面文件：
- `app/(tabs)/(subscreens)/flights.tsx`
- `app/(tabs)/(subscreens)/destinations.tsx`
- `app/(tabs)/(subscreens)/hotels.tsx`
- `app/(tabs)/(subscreens)/expenses.tsx`
- `app/(tabs)/(subscreens)/itinerary.tsx`
- `app/(tabs)/(subscreens)/packing.tsx`
- `app/(tabs)/(subscreens)/documents.tsx`

每个占位页面内容相同：
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../../src/theme';

export default function SubScreenPlaceholder() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>页面开发中</Text>
        <Text style={styles.subtitle}>该功能将在后续阶段实现</Text>
      </View>
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

### 9. 更新路由配置
修改 `app/(tabs)/_layout.tsx`，添加子页面路由：

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
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '日历',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: '工具',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => (
            <Ionicons name="layers-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: '预算',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" size={22} color={color} />
          ),
        }}
      />
      {/* 子页面路由 - 隐藏Tab显示 */}
      <Tabs.Screen
        name="(subscreens)"
        options={{
          href: null, // 隐藏Tab
        }}
      />
    </Tabs>
  );
}
```

## 验证标准
1. 日历页面显示当月日历，能切换月份
2. 日期能正确标记行程（彩色圆点）
3. 今天日期有高亮显示
4. 时间轴显示行程列表，按日期排序
5. 工具箱页面显示7个功能入口
6. 点击功能入口能跳转到对应子页面（暂时显示占位页面）
7. 预算页面显示费用汇总卡片（4个）
8. 显示已选目的地
9. 待办清单能勾选和添加

## 注意事项
- 确保expo-router路由配置正确
- 确保子页面路由能正常跳转
- 确保状态管理在页面间同步
- 如果遇到问题，检查路由文件结构
