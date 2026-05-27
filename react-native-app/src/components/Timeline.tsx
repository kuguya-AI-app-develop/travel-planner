import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Trip } from '../store/types';

interface TimelineProps {
  trips: Trip[];
}

export function Timeline({ trips }: TimelineProps) {
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
