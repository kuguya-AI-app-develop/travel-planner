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
