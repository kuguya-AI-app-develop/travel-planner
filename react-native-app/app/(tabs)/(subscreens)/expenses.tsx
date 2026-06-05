import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

export default function ExpensesScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleExpense = (id: number) => {
    dispatch({ type: 'TOGGLE_EXPENSE', payload: id });
  };

  const handleAddExpense = () => {
    const newExpense = {
      id: Date.now(),
      name: '新消费',
      category: '其他',
      amount: 0,
      note: '',
      selected: false,
      status: 'pending' as const,
      actual: 0,
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    showToast('已添加消费');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="其他消费" />

        <Text style={styles.hint}>
          记录门票、餐饮等消费
        </Text>

        {state.expenses.map((expense) => (
          <View key={expense.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => handleToggleExpense(expense.id)}
              activeOpacity={0.7}
              style={styles.cardContent}
            >
              <View style={[
                styles.checkbox,
                expense.selected && styles.checkboxSelected,
              ]}>
                {expense.selected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseCat}>
                  {expense.category}
                  {expense.note ? ` · ${expense.note}` : ''}
                </Text>
              </View>

              <Text style={styles.amount}>
                ¥{expense.amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <AddButton label="添加消费" onPress={handleAddExpense} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <Toast visible={visible} message={message} onHide={hideToast} />
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
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  expenseCat: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  amount: {
    fontFamily: Typography.mono,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.warn,
  },
});
