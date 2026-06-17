import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Colors, Typography, Spacing, Radius } from '../theme';

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
  rawText: string;
  onApply: (result: AIResultViewProps['result']) => void;
  onCopy: () => void;
  onBack: () => void;
}

export function AIResultView({ result, rawText, onApply, onCopy, onBack }: AIResultViewProps) {
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

        {/* Markdown 内容 */}
        <View style={styles.markdownContainer}>
          <Markdown style={markdownStyles}>{rawText}</Markdown>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.applyButton} onPress={() => onApply(result)}>
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

// Markdown 样式
const markdownStyles = {
  body: {
    fontSize: Typography.base,
    lineHeight: 24,
    color: Colors.fg,
  },
  heading1: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold as any,
    color: Colors.fg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heading2: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold as any,
    color: Colors.accent,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heading3: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold as any,
    color: Colors.fg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bold: {
    fontWeight: Typography.bold as any,
  },
  link: {
    color: Colors.accent,
  },
  list_item: {
    fontSize: Typography.base,
    color: Colors.fg,
    lineHeight: 24,
  },
  bullet_list: {
    marginBottom: Spacing.sm,
  },
  ordered_list: {
    marginBottom: Spacing.sm,
  },
  code_inline: {
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: Typography.sm,
    fontFamily: Typography.mono,
    color: Colors.accent,
  },
  code_block: {
    backgroundColor: Colors.surfaceRaised,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    fontFamily: Typography.mono,
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  fence: {
    backgroundColor: Colors.surfaceRaised,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    fontFamily: Typography.mono,
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    paddingLeft: Spacing.md,
    marginBottom: Spacing.sm,
    color: Colors.muted,
  },
  hr: {
    backgroundColor: Colors.border,
    height: 1,
    marginVertical: Spacing.md,
  },
  table: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  th: {
    padding: Spacing.sm,
    backgroundColor: Colors.surfaceRaised,
    fontWeight: Typography.bold as any,
  },
  td: {
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
};

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
  markdownContainer: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
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
