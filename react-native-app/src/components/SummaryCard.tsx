import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const pawsImage = require('../../assets/paws.png');

interface SummaryCardProps {
  label: string;
  value: string;
  note?: string;
  color: 'accent' | 'success' | 'warn' | 'coral';
  showIcon?: boolean;
}

export function SummaryCard({ label, value, note, color, showIcon = true }: SummaryCardProps) {
  return (
    <View style={styles.container}>
      {showIcon && (
        <Image source={pawsImage} style={styles.icon} />
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  icon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    opacity: 0.4,
    resizeMode: 'contain',
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
