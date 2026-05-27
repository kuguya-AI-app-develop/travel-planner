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

        {loading && (
          <View style={styles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>AI 正在为你策划旅行…</Text>
              <Text style={styles.loadingHint}>通常需要 10-30 秒</Text>
            </View>
          </View>
        )}

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
