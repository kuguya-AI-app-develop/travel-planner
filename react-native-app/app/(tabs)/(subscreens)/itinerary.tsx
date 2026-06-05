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

  const grouped = plan.itineraryItems.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof plan.itineraryItems>);

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
