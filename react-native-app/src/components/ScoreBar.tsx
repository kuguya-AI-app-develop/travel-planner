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
