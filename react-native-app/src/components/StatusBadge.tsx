import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

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
