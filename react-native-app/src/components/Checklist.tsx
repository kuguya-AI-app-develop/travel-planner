import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { ChecklistItem } from '../store/types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: number) => void;
  onAdd: () => void;
}

export function Checklist({ items, onToggle, onAdd }: ChecklistProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>待办事项</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, item.done && styles.itemDone]}
          onPress={() => onToggle(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.done ? 'checkbox' : 'square-outline'}
            size={18}
            color={item.done ? Colors.accent : Colors.muted}
          />
          <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  addButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  addButtonText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.fg2,
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
