import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Plan, Expense } from '../../types';
import ExpensesView from '../../components/ExpensesView';
import ExpenseModal from '../../components/ExpenseModal';

export default function ExpensesScreen() {
  const { plans, loading, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const expenses = selectedPlan?.expenses ?? [];

  const handlePressExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  }, []);

  const handleSave = useCallback(
    async (data: Omit<Expense, 'id'> & { id?: number }) => {
      if (!selectedPlan || saving) return;
      setSaving(true);
      let updated: Expense[];
      if (data.id) {
        updated = expenses.map((e) => (e.id === data.id ? ({ ...e, ...data } as Expense) : e));
      } else {
        const newId = expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;
        updated = [...expenses, { ...data, id: newId }];
      }

      try {
        await updatePlan(selectedPlan.id, { data: { expenses: updated } });
        setShowModal(false);
        setEditingExpense(null);
      } catch (e: unknown) {
        Alert.alert('错误', e instanceof Error ? e.message : '保存失败');
      } finally {
        setSaving(false);
      }
    },
    [selectedPlan, expenses, updatePlan, saving]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedPlan || !editingExpense || saving) return;
    setSaving(true);
    const updated = expenses.filter((e) => e.id !== editingExpense.id);
    try {
      await updatePlan(selectedPlan.id, { data: { expenses: updated } });
      setShowModal(false);
      setEditingExpense(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '删除失败');
    } finally {
      setSaving(false);
    }
  }, [selectedPlan, expenses, editingExpense, updatePlan, saving]);

  const handleAdd = useCallback(() => {
    setEditingExpense(null);
    setShowModal(true);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>加载中...</Text>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={styles.emptyTitle}>还没有旅行计划</Text>
        <Text style={styles.hint}>请先在首页创建一个计划</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.planSelector}>
        <Text style={styles.planLabel}>当前计划：</Text>
        <FlatList
          horizontal
          data={plans}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.planList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.planChip, selectedPlanId === item.id && styles.planChipActive]}
              onPress={() => setSelectedPlanId(item.id)}
            >
              <Text
                style={[styles.planChipText, selectedPlanId === item.id && styles.planChipTextActive]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {!selectedPlan ? (
        <View style={styles.center}>
          <Text style={styles.hint}>请选择一个计划查看费用</Text>
        </View>
      ) : (
        <>
          <ExpensesView expenses={expenses} onPressExpense={handlePressExpense} />

          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <ExpenseModal
        visible={showModal}
        expense={editingExpense}
        saving={saving}
        onSave={handleSave}
        onDelete={editingExpense ? handleDelete : undefined}
        onClose={() => {
          setShowModal(false);
          setEditingExpense(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  hint: { fontSize: 14, color: '#999' },
  planSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  planLabel: { fontSize: 14, color: '#666', marginRight: 8 },
  planList: { gap: 8 },
  planChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
  },
  planChipActive: { backgroundColor: '#007AFF' },
  planChipText: { fontSize: 14, color: '#333' },
  planChipTextActive: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
});
