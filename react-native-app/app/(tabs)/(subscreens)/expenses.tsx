import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Expense } from '../../../src/store/types';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { EXPENSE, EMPTY_STATE } from '../../../src/constants/strings';

export default function ExpensesScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');

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
    showToast(EXPENSE.ADD_SUCCESS);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditItem(expense);
    setEditName(expense.name);
    setEditCategory(expense.category);
    setEditAmount(String(expense.amount));
    setEditNote(expense.note);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    dispatch({
      type: 'UPDATE_EXPENSE',
      payload: {
        ...editItem,
        name: editName,
        category: editCategory,
        amount: Number(editAmount) || 0,
        note: editNote,
      },
    });
    setEditItem(null);
    showToast(EXPENSE.EDIT_SUCCESS);
  };

  const handleDelete = (id: number) => {
    Alert.alert(EXPENSE.DELETE_CONFIRM.split('？')[0], EXPENSE.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
        showToast(EXPENSE.DELETE_SUCCESS);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="其他消费" />

        <Text style={styles.hint}>
          {EXPENSE.HINT}
        </Text>

        {plan.expenses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{EMPTY_STATE.EXPENSE.TEXT}</Text>
            <Text style={styles.emptyHint}>{EMPTY_STATE.EXPENSE.HINT}</Text>
          </View>
        ) : (
          plan.expenses.map((expense) => (
          <View key={expense.id} style={styles.card}>
            <View style={styles.cardContent}>
              <TouchableOpacity
                onPress={() => handleToggleExpense(expense.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  expense.selected && styles.checkboxSelected,
                ]}>
                  {expense.selected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.expenseInfo}
                onPress={() => handleOpenEdit(expense)}
                onLongPress={() => handleDelete(expense.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseCat}>
                  {expense.category}
                  {expense.note ? ` · ${expense.note}` : ''}
                </Text>
              </TouchableOpacity>

              <Text style={styles.amount}>
                ¥{expense.amount.toLocaleString()}
              </Text>
            </View>
          </View>
        ))
        )}

        <AddButton label={EXPENSE.ADD} onPress={handleAddExpense} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={!!editItem}
        title={EXPENSE.EDIT}
        onCancel={() => setEditItem(null)}
        onSave={handleSaveEdit}
      >
        <FormField label={EXPENSE.NAME}>
          <FormInput value={editName} onChangeText={setEditName} />
        </FormField>

        <FormField label={EXPENSE.CATEGORY}>
          <FormInput
            value={editCategory}
            onChangeText={setEditCategory}
            placeholder={EXPENSE.CATEGORY_PLACEHOLDER}
          />
        </FormField>

        <FormField label={EXPENSE.AMOUNT}>
          <FormInput
            value={editAmount}
            onChangeText={setEditAmount}
            placeholder={EXPENSE.AMOUNT_PLACEHOLDER}
            keyboardType="numeric"
          />
        </FormField>

        <FormField label={EXPENSE.NOTE}>
          <FormInput
            value={editNote}
            onChangeText={setEditNote}
            placeholder={EXPENSE.NOTE_PLACEHOLDER}
          />
        </FormField>
      </CommonModal>

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
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: Typography.sm,
    color: Colors.mutedLight,
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
