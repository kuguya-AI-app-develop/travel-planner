# 阶段4：子页面实现（上）

## 目标
完成前5个子页面：机票对比、目的地选择、酒店评分、其他消费、每日行程。

## 前置条件
- 阶段1、2、3已完成，项目能正常运行
- 主要Tab页面功能完整
- 子页面路由已配置，占位页面存在

## 原型参考
原型文件位置：`~/个人项目/travel-planner/react-native-app/prototype/travel-planner-mobile-corgi.html`

## 详细任务

### 1. 创建状态标签组件
创建文件 `src/components/StatusBadge.tsx`：
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '../theme';

type StatusType = 'booked' | 'pending' | 'compare' | 'paid';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; bgColor: string; textColor: string }> = {
  booked: { label: '已订', bgColor: Colors.success + '15', textColor: Colors.success },
  pending: { label: '待定', bgColor: Colors.warn + '15', textColor: Colors.warn },
  compare: { label: '对比中', bgColor: Colors.accent + '15', textColor: Colors.accent },
  paid: { label: '已付', bgColor: Colors.success + '15', textColor: Colors.success },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: 0.02,
  },
});
```

### 2. 创建星星评分组件
创建文件 `src/components/StarRating.tsx`：
```typescript
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 18,
  onRate,
  readonly = false,
}: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onRate?.(star)}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? Colors.gold : Colors.mutedLight}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});
```

### 3. 创建评分条组件
创建文件 `src/components/ScoreBar.tsx`：
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  color?: string;
}

export function ScoreBar({
  label,
  score,
  maxScore = 5,
  color = Colors.coral,
}: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    minWidth: 28,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
  barContainer: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  score: {
    fontSize: Typography.xs,
    fontFamily: Typography.mono,
    fontWeight: Typography.semibold,
  },
});
```

### 4. 创建返回头部组件
创建文件 `src/components/BackHeader.tsx`：
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../theme';
import { useRouter } from 'expo-router';

interface BackHeaderProps {
  title: string;
}

export function BackHeader({ title }: BackHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={18} color={Colors.fg2} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
});
```

### 5. 创建添加按钮组件
创建文件 `src/components/AddButton.tsx`：
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface AddButtonProps {
  label: string;
  onPress: () => void;
}

export function AddButton({ label, onPress }: AddButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="add" size={16} color={Colors.muted} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
});
```

### 6. 实现机票对比页面
修改 `app/(tabs)/(subscreens)/flights.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const FLIGHT_CRITERIA = ['中转', '行李额度', '准点率', '舒适度'];

export default function FlightsScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleFlight = (id: number) => {
    dispatch({ type: 'TOGGLE_FLIGHT', payload: id });
  };

  const handleAddFlight = () => {
    const newFlight = {
      id: Date.now(),
      airline: '新航班',
      code: 'XX000',
      route: '出发→到达',
      dep: '00:00',
      arr: '00:00',
      price: 0,
      cls: '经济舱',
      status: 'compare' as const,
      selected: false,
      notes: {},
    };
    dispatch({ type: 'ADD_FLIGHT', payload: newFlight });
    showToast('已添加航班');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="机票对比" />
        
        <Text style={styles.hint}>
          勾选已确定的航班，价格将计入预算
        </Text>

        {state.flights.map((flight) => (
          <View key={flight.id} style={styles.card}>
            <View style={styles.cardTop}>
              <TouchableOpacity
                onPress={() => handleToggleFlight(flight.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  flight.selected && styles.checkboxSelected,
                ]}>
                  {flight.selected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.flightInfo}>
                <Text style={styles.airline}>
                  {flight.airline}{' '}
                  <Text style={styles.flightCode}>{flight.code}</Text>
                </Text>
                <Text style={styles.route}>
                  {flight.route} · {flight.dep}-{flight.arr} · {flight.cls}
                </Text>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.price}>¥{flight.price.toLocaleString()}</Text>
                <StatusBadge status={flight.status} />
              </View>
            </View>

            <View style={styles.criteria}>
              {FLIGHT_CRITERIA.map((criteria, index) => (
                <Text key={criteria} style={styles.criteriaItem}>
                  {criteria}: {flight.notes[index] || '—'}
                </Text>
              ))}
            </View>
          </View>
        ))}

        <AddButton label="添加航班" onPress={handleAddFlight} />
        
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
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  flightInfo: {
    flex: 1,
  },
  airline: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  flightCode: {
    fontSize: Typography.sm,
    color: Colors.muted,
    fontWeight: Typography.regular,
  },
  route: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  price: {
    fontFamily: Typography.mono,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  criteria: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  criteriaItem: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
});
```

### 7. 实现目的地选择页面
修改 `app/(tabs)/(subscreens)/destinations.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { ScoreBar } from '../../../src/components/ScoreBar';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const DEST_CRITERIA = ['景色', '文化', '美食', '交通便利', '安全性', '性价比'];

export default function DestinationsScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleDest = (id: number) => {
    dispatch({ type: 'TOGGLE_DEST', payload: id });
  };

  const handleAddDest = () => {
    const newDest = {
      id: Date.now(),
      name: '新目的地',
      country: '国家',
      notes: '',
      scores: DEST_CRITERIA.map(() => 3),
      selected: false,
    };
    dispatch({ type: 'ADD_DEST', payload: newDest });
    showToast('已添加目的地');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="目的地选择" />
        
        <Text style={styles.hint}>
          评估各目的地优缺点
        </Text>

        {state.destinations.map((dest) => {
          const avg = (dest.scores.reduce((a, b) => a + b, 0) / dest.scores.length).toFixed(1);
          
          return (
            <View key={dest.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => handleToggleDest(dest.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    dest.selected && styles.checkboxSelected,
                  ]}>
                    {dest.selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.destInfo}>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <Text style={styles.destCountry}>{dest.country}</Text>
                </View>
              </View>

              {dest.notes && (
                <Text style={styles.destNotes}>{dest.notes}</Text>
              )}

              <View style={styles.scores}>
                {DEST_CRITERIA.map((criteria, index) => (
                  <ScoreBar
                    key={criteria}
                    label={criteria}
                    score={dest.scores[index]}
                    color={Colors.coral}
                  />
                ))}
              </View>

              <View style={styles.overall}>
                <Text style={styles.overallLabel}>综合评分</Text>
                <Text style={styles.overallScore}>{avg}</Text>
              </View>
            </View>
          );
        })}

        <AddButton label="添加目的地" onPress={handleAddDest} />
        
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
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  destInfo: {
    flex: 1,
  },
  destName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  destCountry: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  destNotes: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  scores: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  overallLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  overallScore: {
    fontFamily: Typography.mono,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.coral,
  },
});
```

### 8. 实现酒店评分页面
修改 `app/(tabs)/(subscreens)/hotels.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StarRating } from '../../../src/components/StarRating';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const HOTEL_CRITERIA = ['性价比', '位置', '卫生', '设施', '服务'];

export default function HotelsScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleHotel = (id: number) => {
    dispatch({ type: 'TOGGLE_HOTEL', payload: id });
  };

  const handleRateHotel = (hotelId: number, critIdx: number, value: number) => {
    dispatch({
      type: 'RATE_HOTEL',
      payload: { hotelId, critIdx, value },
    });
  };

  const handleAddHotel = () => {
    const newHotel = {
      id: Date.now(),
      name: '新酒店',
      location: '位置',
      price: '¥0/晚',
      priceNum: 0,
      scores: HOTEL_CRITERIA.map(() => 3),
      selected: false,
      status: 'pending' as const,
    };
    dispatch({ type: 'ADD_HOTEL', payload: newHotel });
    showToast('已添加酒店');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="酒店评分" />
        
        <Text style={styles.hint}>
          勾选最终酒店，点击星星评分
        </Text>

        {state.hotels.map((hotel) => {
          const avg = (hotel.scores.reduce((a, b) => a + b, 0) / hotel.scores.length).toFixed(1);
          
          return (
            <View key={hotel.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => handleToggleHotel(hotel.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    hotel.selected && styles.checkboxSelected,
                  ]}>
                    {hotel.selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <Text style={styles.hotelLoc}>{hotel.location}</Text>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{hotel.price}</Text>
                  <StatusBadge status={hotel.status} />
                </View>
              </View>

              <View style={styles.ratings}>
                {HOTEL_CRITERIA.map((criteria, index) => (
                  <View key={criteria} style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>{criteria}</Text>
                    <StarRating
                      rating={hotel.scores[index]}
                      onRate={(value) => handleRateHotel(hotel.id, index, value)}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.overall}>
                <Text style={styles.overallLabel}>综合评分</Text>
                <Text style={styles.overallScore}>{avg}</Text>
              </View>
            </View>
          );
        })}

        <AddButton label="添加酒店" onPress={handleAddHotel} />
        
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
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  hotelLoc: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  price: {
    fontFamily: Typography.mono,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  ratings: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingLabel: {
    minWidth: 24,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  overallLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  overallScore: {
    fontFamily: Typography.mono,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gold,
  },
});
```

### 9. 实现其他消费页面
修改 `app/(tabs)/(subscreens)/expenses.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

export default function ExpensesScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleExpense = (id: number) => {
    dispatch({ type: 'TOGGLE_EXPENSE', payload: id });
  };

  const handleAddExpense = () => {
    const newExpense = {
      id: Date.now(),
      name: '新消费',
      category: '其他',
      amount: 0,
      note: '',
      selected: false,
      status: 'pending' as const,
      actual: 0,
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    showToast('已添加消费');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="其他消费" />
        
        <Text style={styles.hint}>
          记录门票、餐饮等消费
        </Text>

        {state.expenses.map((expense) => (
          <View key={expense.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => handleToggleExpense(expense.id)}
              activeOpacity={0.7}
              style={styles.cardContent}
            >
              <View style={[
                styles.checkbox,
                expense.selected && styles.checkboxSelected,
              ]}>
                {expense.selected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseCat}>
                  {expense.category}
                  {expense.note ? ` · ${expense.note}` : ''}
                </Text>
              </View>
              
              <Text style={styles.amount}>
                ¥{expense.amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <AddButton label="添加消费" onPress={handleAddExpense} />
        
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
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  expenseCat: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  amount: {
    fontFamily: Typography.mono,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.warn,
  },
});
```

### 10. 实现每日行程页面
修改 `app/(tabs)/(subscreens)/itinerary.tsx`：
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';

const TYPE_LABELS: Record<string, string> = {
  sight: '景点',
  food: '餐饮',
  transport: '交通',
  hotel: '住宿',
  other: '其他',
};

const TYPE_COLORS: Record<string, string> = {
  sight: Colors.accent,
  food: Colors.warn,
  transport: Colors.teal,
  hotel: Colors.purple,
  other: Colors.muted,
};

export default function ItineraryScreen() {
  const { getActivePlan } = useApp();
  const plan = getActivePlan();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // 按日期分组
  const grouped = plan.itineraryItems.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof plan.itineraryItems>);

  // 按日期排序
  const dates = Object.keys(grouped).sort();

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="每日行程" />
        
        <Text style={styles.hint}>
          点击日期展开，规划具体安排
        </Text>

        {dates.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无行程安排</Text>
          </View>
        ) : (
          dates.map((date) => {
            const items = grouped[date].sort((a, b) => a.time.localeCompare(b.time));
            const isExpanded = expandedDays.has(date);
            
            return (
              <View key={date} style={styles.dayContainer}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayDate}>
                    {date}{' '}
                    <Text style={styles.dayCount}>{items.length} 项</Text>
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={10}
                    color={Colors.muted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.dayBody}>
                    {items.map((item) => (
                      <View key={item.id} style={styles.item}>
                        <Text style={styles.itemTime}>{item.time}</Text>
                        <View
                          style={[
                            styles.itemDot,
                            { backgroundColor: TYPE_COLORS[item.type] || Colors.muted },
                          ]}
                        />
                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <View style={styles.itemMeta}>
                            <View style={[
                              styles.typeBadge,
                              { backgroundColor: (TYPE_COLORS[item.type] || Colors.muted) + '15' },
                            ]}>
                              <Text style={[
                                styles.typeText,
                                { color: TYPE_COLORS[item.type] || Colors.muted },
                              ]}>
                                {TYPE_LABELS[item.type]}
                              </Text>
                            </View>
                            <Text style={styles.itemLocation}>{item.location}</Text>
                            {item.notes && (
                              <Text style={styles.itemNotes}>{item.notes}</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
        
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
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.muted,
  },
  dayContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayDate: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  dayCount: {
    fontSize: Typography.xs,
    color: Colors.muted,
    fontWeight: Typography.regular,
  },
  dayBody: {
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemTime: {
    fontFamily: Typography.mono,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    minWidth: 40,
    paddingTop: 2,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: Typography.semibold,
  },
  itemLocation: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  itemNotes: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
});
```

## 验证标准
1. 机票对比页面显示航班列表，能勾选和取消勾选
2. 显示航班信息（航空公司、价格、状态、评分标准）
3. 能添加新航班
4. 目的地选择页面显示目的地列表，能勾选
5. 显示评分条和综合评分
6. 能添加新目的地
7. 酒店评分页面显示酒店列表，能勾选
8. 星星评分功能正常
9. 能添加新酒店
10. 其他消费页面显示消费列表，能勾选
11. 能添加新消费
12. 每日行程页面按日期分组显示
13. 点击日期能展开/折叠
14. 行程项显示时间、类型标签、位置、备注

## 注意事项
- 确保所有组件导入路径正确
- 确保状态管理在页面间同步
- 确保返回导航正常工作
- 如果遇到问题，检查expo-router的路由配置
