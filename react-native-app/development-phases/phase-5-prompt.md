# 阶段5：子页面实现（下）+ 聊天功能

## 目标
完成剩余子页面（行李清单、证件管理、AI策划、AI设置）和聊天功能。

## 前置条件
- 阶段1、2、3、4已完成，项目能正常运行
- 前5个子页面功能完整
- 状态管理和组件库已完善

## 原型参考
原型文件位置：`~/个人项目/travel-planner/react-native-app/prototype/travel-planner-mobile-corgi.html`

## 详细任务

### 1. 创建进度条组件
创建文件 `src/components/ProgressBar.tsx`：
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
  showText?: boolean;
}

export function ProgressBar({
  current,
  total,
  color = Colors.success,
  showText = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      {showText && (
        <Text style={styles.text}>
          {current}/{total} 已打包 ({percentage}%)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  barContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  text: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
});
```

### 2. 实现行李清单页面
修改 `app/(tabs)/(subscreens)/packing.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { ProgressBar } from '../../../src/components/ProgressBar';

export default function PackingScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();

  // 按分类分组
  const grouped = plan.packingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof plan.packingItems>);

  const total = plan.packingItems.length;
  const done = plan.packingItems.filter(i => i.packed).length;

  const handleTogglePack = (id: number) => {
    dispatch({ type: 'TOGGLE_PACK', payload: id });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="行李清单" />
        
        <Text style={styles.hint}>
          出发前逐项检查
        </Text>

        <ProgressBar current={done} total={total} />

        {Object.entries(grouped).map(([category, items]) => {
          const catDone = items.filter(i => i.packed).length;
          
          return (
            <View key={category} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>
                  {catDone}/{items.length}
                </Text>
              </View>

              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.item, item.packed && styles.itemDone]}
                  onPress={() => handleTogglePack(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.packed ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={item.packed ? Colors.accent : Colors.muted}
                  />
                  <Text style={[styles.itemText, item.packed && styles.itemTextDone]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        
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
  categoryContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  categoryCount: {
    fontSize: Typography.xs,
    color: Colors.muted,
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

### 3. 实现证件管理页面
修改 `app/(tabs)/(subscreens)/documents.tsx`：
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const STATUS_MAP: Record<string, { label: string; bgColor: string; textColor: string }> = {
  valid: { label: '有效', bgColor: Colors.success + '15', textColor: Colors.success },
  expiring: { label: '即将过期', bgColor: Colors.warn + '15', textColor: Colors.warn },
  expired: { label: '已过期', bgColor: Colors.danger + '15', textColor: Colors.danger },
  processing: { label: '办理中', bgColor: Colors.accent + '15', textColor: Colors.accent },
  none: { label: '未办理', bgColor: Colors.muted + '15', textColor: Colors.muted },
};

const TYPE_ICONS: Record<string, string> = {
  passport: 'document',
  visa: 'clipboard',
  insurance: 'shield',
  booking: 'document-text',
  other: 'attach',
};

const TYPE_COLORS: Record<string, string> = {
  passport: Colors.accent,
  visa: Colors.warn,
  insurance: Colors.success,
  booking: Colors.teal,
  other: Colors.muted,
};

export default function DocumentsScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();
  const { visible, message, showToast, hideToast } = useToast();

  const handleAddDocument = () => {
    const newDoc = {
      id: Date.now(),
      name: '新证件',
      type: 'other' as const,
      number: '',
      expiry: '',
      status: 'none' as const,
      notes: '',
    };
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
    showToast('已添加证件');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="证件管理" />
        
        <Text style={styles.hint}>
          记录护照、签证、保险信息
        </Text>

        {plan.documents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无证件记录</Text>
          </View>
        ) : (
          plan.documents.map((doc) => {
            const status = STATUS_MAP[doc.status] || STATUS_MAP.none;
            const iconName = TYPE_ICONS[doc.type] || 'attach';
            const iconColor = TYPE_COLORS[doc.type] || Colors.muted;
            
            return (
              <View key={doc.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={iconName as any} size={18} color={iconColor} />
                  </View>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                    <Text style={[styles.statusText, { color: status.textColor }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                {doc.number && (
                  <View style={styles.row}>
                    <Text style={styles.label}>号码</Text>
                    <Text style={styles.value}>{doc.number}</Text>
                  </View>
                )}
                {doc.expiry && (
                  <View style={styles.row}>
                    <Text style={styles.label}>有效期</Text>
                    <Text style={styles.value}>{doc.expiry}</Text>
                  </View>
                )}
                {doc.notes && (
                  <View style={styles.row}>
                    <Text style={styles.label}>备注</Text>
                    <Text style={styles.value}>{doc.notes}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        <AddButton label="添加证件" onPress={handleAddDocument} />
        
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
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  label: {
    minWidth: 48,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.mutedLight,
  },
  value: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
});
```

### 4. 实现AI智能策划页面
修改 `app/(tabs)/(subscreens)/ai-plan.tsx`：
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { BackHeader } from '../../../src/components/BackHeader';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const TRAVEL_STYLES = [
  { value: 'balanced', label: '均衡休闲' },
  { value: 'culture', label: '文化探索' },
  { value: 'food', label: '美食之旅' },
  { value: 'shopping', label: '购物天堂' },
  { value: 'adventure', label: '户外冒险' },
  { value: 'family', label: '亲子出行' },
  { value: 'romantic', label: '浪漫蜜月' },
  { value: 'business', label: '商务出行' },
];

export default function AIPlanScreen() {
  const { visible, message, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [dest, setDest] = useState('');
  const [days, setDays] = useState('5');
  const [startDate, setStartDate] = useState('');
  const [numPeople, setNumPeople] = useState('2');
  const [budget, setBudget] = useState('');
  const [style, setStyle] = useState('balanced');
  const [special, setSpecial] = useState('');

  const handleGenerate = () => {
    if (!dest.trim()) {
      showToast('请输入目的地');
      return;
    }

    setLoading(true);
    setResult(null);

    // 模拟AI生成
    setTimeout(() => {
      setLoading(false);
      setResult(`# ${dest} ${days}日旅行计划

## Day 1 — 抵达与探索

- **10:00** 抵达机场，购买交通卡
- **14:00** 酒店入住
- **16:00** 市区逛街
- **19:00** 晚餐：当地特色美食

## Day 2 — 文化体验

- **09:00** 著名景点游览
- **12:00** 午餐：特色餐厅
- **14:00** 文化街区探索
- **18:00** 观赏夜景

## Day 3 — 深度游玩

- **09:00** 主题乐园全天游玩
- **21:00** 返回酒店休息

---
*此为 AI 模拟生成结果，实际使用需配置真实 API Key*`);
    }, 2000);
  };

  const handleClear = () => {
    setDest('');
    setDays('5');
    setStartDate('');
    setNumPeople('2');
    setBudget('');
    setStyle('balanced');
    setSpecial('');
    setResult(null);
  };

  const handleApply = () => {
    showToast('已应用到当前计划');
  };

  const handleCopy = () => {
    showToast('已复制到剪贴板');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="AI 智能策划" />

        {/* 表单 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>旅行需求</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI 策划</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>目的地</Text>
                <TextInput
                  style={styles.input}
                  value={dest}
                  onChangeText={setDest}
                  placeholder="例如：东京"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>出行天数</Text>
                <TextInput
                  style={styles.input}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>出发日期</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="2026-06-01"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>出行人数</Text>
                <TextInput
                  style={styles.input}
                  value={numPeople}
                  onChangeText={setNumPeople}
                  keyboardType="number-pad"
                  placeholder="2"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>总预算 (¥)</Text>
                <TextInput
                  style={styles.input}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="number-pad"
                  placeholder="15000"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>旅行风格</Text>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerText}>
                    {TRAVEL_STYLES.find(s => s.value === style)?.label || '选择风格'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={Colors.muted} />
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>特殊需求（可选）</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={special}
                onChangeText={setSpecial}
                placeholder="有老人同行、想看樱花…"
                placeholderTextColor={Colors.mutedLight}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGenerate}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>生成旅行计划</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.ghostButtonText}>清空</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 加载状态 */}
        {loading && (
          <View style={styles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>AI 正在为你策划旅行…</Text>
              <Text style={styles.loadingHint}>通常需要 10-30 秒</Text>
            </View>
          </View>
        )}

        {/* 结果 */}
        {result && (
          <View style={styles.card}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>AI 生成结果</Text>
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={handleApply}
                  activeOpacity={0.7}
                >
                  <Text style={styles.smallButtonText}>应用</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Text style={styles.smallButtonText}>复制</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          </View>
        )}

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
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.warn + '15',
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.warn,
  },
  form: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  field: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
  textarea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  pickerText: {
    fontSize: Typography.base,
    color: Colors.fg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  ghostButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  ghostButtonText: {
    color: Colors.fg2,
    fontSize: Typography.base,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  loadingText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginTop: Spacing.md,
  },
  loadingHint: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  smallButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  smallButtonText: {
    fontSize: Typography.sm,
    color: Colors.fg2,
  },
  resultContent: {
    padding: Spacing.lg,
  },
  resultText: {
    fontSize: Typography.base,
    lineHeight: 20,
    color: Colors.fg,
  },
});
```

### 5. 实现AI设置页面
修改 `app/(tabs)/(subscreens)/ai-settings.tsx`：
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { BackHeader } from '../../../src/components/BackHeader';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'zhipu', label: '智谱 (GLM)' },
  { value: 'moonshot', label: 'Moonshot (Kimi)' },
  { value: 'qwen', label: '通义千问' },
  { value: 'custom', label: '自定义 (OpenAI 兼容)' },
];

const MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  zhipu: ['glm-4', 'glm-4-flash'],
  moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  custom: ['custom-model'],
};

export default function AISettingsScreen() {
  const { visible, message, showToast, hideToast } = useToast();
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const models = MODELS[newProvider] || [];
    setModel(models[0] || '');
  };

  const handleSave = () => {
    showToast('设置已保存');
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      showToast('连接成功！模型响应正常。');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="AI 设置" />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document" size={20} color={Colors.accent} />
            <Text style={styles.cardTitle}>模型配置</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>AI 服务商</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>
                {PROVIDERS.find(p => p.value === provider)?.label || '选择服务商'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={Colors.muted} />
            </View>

            <Text style={styles.label}>模型名称</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>{model}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.muted} />
            </View>

            <Text style={styles.label}>API Key</Text>
            <View style={styles.keyContainer}>
              <TextInput
                style={styles.keyInput}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showKey}
                placeholder="sk-..."
                placeholderTextColor={Colors.mutedLight}
              />
              <TouchableOpacity
                style={styles.keyToggle}
                onPress={() => setShowKey(!showKey)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showKey ? 'eye-off' : 'eye'}
                  size={16}
                  color={Colors.muted}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>API Base URL（可选）</Text>
            <TextInput
              style={styles.input}
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder="https://api.openai.com/v1"
              placeholderTextColor={Colors.mutedLight}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>保存设置</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostButton}
                onPress={handleTestConnection}
                activeOpacity={0.7}
              >
                <Text style={styles.ghostButtonText}>测试连接</Text>
              </TouchableOpacity>
            </View>

            {testStatus === 'success' && (
              <View style={styles.statusSuccess}>
                <Text style={styles.statusTextSuccess}>连接成功！模型响应正常。</Text>
              </View>
            )}
          </View>
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
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  form: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  pickerText: {
    fontSize: Typography.base,
    color: Colors.fg,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  keyInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
  },
  keyToggle: {
    padding: Spacing.md,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  ghostButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  ghostButtonText: {
    color: Colors.fg2,
    fontSize: Typography.base,
  },
  statusSuccess: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.sm,
  },
  statusTextSuccess: {
    fontSize: Typography.sm,
    color: Colors.success,
  },
});
```

### 6. 创建聊天组件
创建文件 `src/components/ChatPanel.tsx`：
```typescript
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface Message {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

const QUICK_REPLIES = ['推荐景点', '预算规划', '签证问题', '美食推荐', '交通攻略'];

const REPLY_MAP: Record<string, string> = {
  '推荐景点': '东京推荐：浅草寺、秋叶原、迪士尼、涩谷十字路口、明治神宫。京都推荐：伏见稻荷大社、金阁寺、岚山竹林。',
  '预算规划': '建议分配：机票30%、住宿30%、餐饮20%、门票购物20%。你目前预算约 ¥15,000，足够5天东京深度游。',
  '签证问题': '日本单次旅游签证需要：护照原件、2寸白底照片、在职证明、银行流水。一般7-10个工作日出签。',
  '美食推荐': '东京必吃：寿司之神（需提前预约）、一兰拉面、筑地海鲜丼、秋叶原女仆咖啡、新宿烧鸟。',
  '交通攻略': '推荐购买西瓜卡（Suica），覆盖地铁/公交/便利店。东京地铁24小时券 ¥600 适合密集出行。',
};

interface ChatPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function ChatPanel({ visible, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '你好！我是你的旅行助手，有什么可以帮你的？', time: '09:00' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setMessages(prev => [...prev, { role: 'user', text: messageText, time }]);
    setInput('');
    setIsTyping(true);

    // 模拟AI回复
    setTimeout(() => {
      const reply = REPLY_MAP[messageText] || 
        `关于"${messageText}"，这是一个很好的问题！建议你参考行程日历中的安排，或者使用 AI 策划功能生成详细方案。`;
      
      setMessages(prev => [...prev, { role: 'bot', text: reply, time }]);
      setIsTyping(false);
    }, 1200);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>旅行助手</Text>
          <Text style={styles.headerStatus}>在线 · 随时帮你规划</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot,
            ]}
          >
            {msg.role === 'bot' && (
              <View style={styles.avatar}>
                <Ionicons name="paw" size={14} color={Colors.surface} />
              </View>
            )}
            <View style={styles.messageContent}>
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                ]}
              >
                <Text style={[
                  styles.bubbleText,
                  msg.role === 'user' && styles.bubbleTextUser,
                ]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[
                styles.time,
                msg.role === 'user' && styles.timeUser,
              ]}>
                {msg.time}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <View style={styles.quickReplies}>
        {QUICK_REPLIES.map((reply) => (
          <TouchableOpacity
            key={reply}
            style={styles.quickButton}
            onPress={() => handleSend(reply)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickButtonText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="问我任何旅行问题…"
          placeholderTextColor={Colors.mutedLight}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSend()}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={14} color={Colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 156,
    right: 12,
    left: 12,
    maxHeight: 420,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    ...Shadows.md,
    zIndex: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.gold,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.surface,
    fontWeight: Typography.bold,
    fontSize: Typography.base,
  },
  headerStatus: {
    color: Colors.surface,
    opacity: 0.7,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.corgiCream,
    minHeight: 180,
    maxHeight: 240,
  },
  messageRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageRowBot: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageContent: {
    flex: 1,
  },
  bubble: {
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
  },
  bubbleBot: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.gold,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: Typography.sm,
    lineHeight: 18,
    color: Colors.fg,
  },
  bubbleTextUser: {
    color: Colors.surface,
  },
  time: {
    fontSize: 9,
    color: Colors.mutedLight,
    marginTop: 2,
  },
  timeUser: {
    textAlign: 'right',
  },
  typingContainer: {
    flexDirection: 'row',
    gap: 3,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.mutedLight,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.corgiCream,
  },
  quickButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  quickButtonText: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 7. 创建聊天浮动按钮
创建文件 `src/components/ChatFAB.tsx`：
```typescript
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '../theme';

interface ChatFABProps {
  onPress: () => void;
  isOpen: boolean;
}

export function ChatFAB({ onPress, isOpen }: ChatFABProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isOpen ? (
        <Ionicons name="close" size={20} color={Colors.surface} />
      ) : (
        <View style={styles.avatar}>
          <Ionicons name="paw" size={24} color={Colors.surface} />
        </View>
      )}
      {!isOpen && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    ...Shadows.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
});
```

### 8. 更新首页添加聊天功能
修改 `app/(tabs)/index.tsx`，在首页添加聊天FAB和聊天面板：

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { PlanSwitcher } from '../../src/components/PlanSwitcher';
import { SummaryCard } from '../../src/components/SummaryCard';
import { ToolCard } from '../../src/components/ToolCard';
import { ChatFAB } from '../../src/components/ChatFAB';
import { ChatPanel } from '../../src/components/ChatPanel';
import { Toast } from '../../src/components/Toast';
import { useToast } from '../../src/hooks/useToast';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const router = useRouter();
  const plan = getActivePlan();
  const [chatOpen, setChatOpen] = useState(false);

  // 计算预算（同阶段2）
  // ...

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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 首页内容同阶段2 */}
        {/* ... */}
      </ScrollView>

      {/* 聊天FAB */}
      <ChatFAB onPress={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />
      
      {/* 聊天面板 */}
      <ChatPanel visible={chatOpen} onClose={() => setChatOpen(false)} />

      <Toast visible={visible} message={message} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  // 其他样式同阶段2
});
```

### 9. 更新Reducer添加缺失的Action
在 `src/store/AppContext.tsx` 中添加：

```typescript
// 在 AppAction 类型中添加：
| { type: 'TOGGLE_PACK'; payload: number }
| { type: 'ADD_DOCUMENT'; payload: Document }

// 在 reducer 中添加：
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
```

### 10. 创建子页面路由文件
创建以下文件：
- `app/(tabs)/(subscreens)/ai-plan.tsx`（AI智能策划页面）
- `app/(tabs)/(subscreens)/ai-settings.tsx`（AI设置页面）

确保这些文件指向正确的组件。

## 验证标准
1. 行李清单页面显示进度条和分类列表
2. 能勾选打包状态，进度条实时更新
3. 证件管理页面显示证件列表
4. 能添加新证件，显示状态标签
5. AI智能策划页面表单完整
6. 能生成模拟AI结果，显示加载动画
7. AI设置页面配置完整
8. 能保存设置和测试连接
9. 首页显示聊天FAB按钮
10. 点击FAB能打开聊天面板
11. 能发送消息和接收模拟回复
12. 快速回复功能正常

## 注意事项
- 确保所有组件导入路径正确
- 确保Reducer包含所有需要的Action
- 确保聊天组件的Z-index正确，不会被其他元素遮挡
- 确保键盘弹出时聊天面板能正确调整
- 如果遇到问题，检查组件的样式和布局
