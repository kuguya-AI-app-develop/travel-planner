import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Expense } from '../../../src/store/types';

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
    showToast('已添加消费');
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
    showToast('消费已更新');
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除消费', '确定要删除这项消费吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
        showToast('消费已删除');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="其他消费" />

        <Text style={styles.hint}>
          点击编辑消费，长按删除
        </Text>

        {plan.expenses.map((expense) => (
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
        ))}

        <AddButton label="添加消费" onPress={handleAddExpense} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditItem(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>编辑消费</Text>

            <Text style={styles.modalLabel}>名称</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.modalLabel}>分类</Text>
            <TextInput style={styles.modalInput} value={editCategory} onChangeText={setEditCategory} placeholder="门票、餐饮..." placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>金额</Text>
            <TextInput style={styles.modalInput} value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>备注</Text>
            <TextInput style={styles.modalInput} value={editNote} onChangeText={setEditNote} placeholder="备注信息" placeholderTextColor={Colors.mutedLight} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditItem(null)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.base,
    color: Colors.fg2,
  },
  modalSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: Typography.base,
    color: Colors.surface,
    fontWeight: Typography.semibold,
  },
});
