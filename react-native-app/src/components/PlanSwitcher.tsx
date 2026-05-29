import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useApp } from '../store/AppContext';
import { PLAN_STATUSES } from '../store/types';

interface PlanSwitcherProps {
  onPlanSelect: (planId: string) => void;
  onCreatePlan: () => void;
  onEditPlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
}

export function PlanSwitcher({ onPlanSelect, onCreatePlan, onEditPlan, onDeletePlan }: PlanSwitcherProps) {
  const { state, getActivePlan, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const plan = getActivePlan();
  const status = PLAN_STATUSES[plan.status];

  const handleDeletePlan = (planId: string) => {
    const planName = state.plans[planId]?.name || '此计划';
    Alert.alert(
      '确认删除',
      `确定要删除"${planName}"吗？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_PLAN', payload: planId });
            if (onDeletePlan) onDeletePlan(planId);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar" size={16} color={Colors.accent} />
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={10}
          color={Colors.muted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {Object.values(state.plans).map((p) => {
            const s = PLAN_STATUSES[p.status];
            return (
              <View key={p.id} style={styles.dropdownItemContainer}>
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    p.id === state.activePlanId && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    onPlanSelect(p.id);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemName}>{p.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.color + '20' }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>
                      {s.label}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.planActions}>
                  {onEditPlan && (
                    <TouchableOpacity
                      style={styles.planActionButton}
                      onPress={() => onEditPlan(p.id)}
                    >
                      <Ionicons name="create-outline" size={16} color={Colors.muted} />
                    </TouchableOpacity>
                  )}
                  {onDeletePlan && Object.keys(state.plans).length > 1 && (
                    <TouchableOpacity
                      style={styles.planActionButton}
                      onPress={() => handleDeletePlan(p.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onCreatePlan();
              setIsOpen(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownItemName, { color: Colors.accent }]}>
              + 新建计划
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  planName: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  dropdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dropdownItemActive: {
    backgroundColor: Colors.accent + '10',
  },
  dropdownItemName: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  planActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  planActionButton: {
    padding: Spacing.xs,
  },
});
