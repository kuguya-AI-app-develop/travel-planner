import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';

const pomeranianImage = require('../../assets/pomeranian-planner.jpg');

interface AIResultViewProps {
  result: {
    title: string;
    days: number;
    spots: number;
    budget: string;
    itinerary: Array<{
      day: number;
      title: string;
      items: Array<{
        time: string;
        content: string;
        location?: string;
      }>;
    }>;
    tips?: string[];
  };
  onApply: () => void;
  onCopy: () => void;
  onBack: () => void;
}

export function AIResultView({ result, onApply, onCopy, onBack }: AIResultViewProps) {
  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 生成结果</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>已完成</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* 统计摘要 */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{result.days}</Text>
            <Text style={styles.summaryLabel}>天</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{result.spots}</Text>
            <Text style={styles.summaryLabel}>景点</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{result.budget}</Text>
            <Text style={styles.summaryLabel}>预算</Text>
          </View>
        </View>

        {/* 每日行程 */}
        {result.itinerary.map((day) => (
          <View key={day.day} style={styles.daySection}>
            <View style={styles.dayTitleRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day.day}</Text>
              </View>
              <Text style={styles.dayTitle}>{day.title}</Text>
            </View>

            {day.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemTime}>{item.time}</Text>
                <View style={styles.itemContent}>
                  <Text style={styles.itemText}>{item.content}</Text>
                  {item.location && (
                    <View style={styles.itemLocation}>
                      <Ionicons name="location-outline" size={11} color={Colors.accent} />
                      <Text style={styles.itemLocationText}>{item.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* 旅行贴士 */}
        {result.tips && result.tips.length > 0 && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>旅行贴士</Text>
            {result.tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.applyButton} onPress={onApply}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.applyButtonText}>应用到当前计划</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
          <Ionicons name="copy-outline" size={18} color={Colors.fg2} />
          <Text style={styles.copyButtonText}>复制</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    fontFamily: Typography.display,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.success + '20',
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.success,
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: Typography.bold,
    color: Colors.accent,
    fontFamily: Typography.display,
  },
  summaryLabel: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  daySection: {
    marginBottom: Spacing.xl,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  dayTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemTime: {
    fontSize: Typography.sm,
    color: Colors.muted,
    fontWeight: Typography.semibold,
    minWidth: 45,
    fontVariant: ['tabular-nums'],
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: Typography.base,
    lineHeight: 20,
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  itemLocationText: {
    fontSize: Typography.xs,
    color: Colors.accent,
  },
  tipsContainer: {
    backgroundColor: Colors.warn + '10',
    borderWidth: 1,
    borderColor: Colors.warn + '30',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.warn,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.sm,
    lineHeight: 20,
    color: Colors.fg,
    marginBottom: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  copyButtonText: {
    color: Colors.fg2,
    fontSize: Typography.base,
  },
});
