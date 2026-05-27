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
