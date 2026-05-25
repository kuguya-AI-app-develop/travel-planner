import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Plan, ChecklistItem } from '../../types';
import SummaryView from '../../components/SummaryView';

export default function SummaryScreen() {
  const { plans, loading, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

  const handleToggleChecklist = useCallback(
    async (item: ChecklistItem) => {
      if (!selectedPlan) return;
      const updated = selectedPlan.checklist.map((c) =>
        c.id === item.id ? { ...c, done: !c.done } : c
      );
      try {
        await updatePlan(selectedPlan.id, { data: { checklist: updated } });
      } catch (e: unknown) {
        Alert.alert('错误', e instanceof Error ? e.message : '更新失败');
      }
    },
    [selectedPlan, updatePlan]
  );

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
        <Text style={styles.emptyIcon}>📝</Text>
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
          <Text style={styles.hint}>请选择一个计划查看汇总</Text>
        </View>
      ) : (
        <SummaryView plan={selectedPlan} onToggleChecklist={handleToggleChecklist} />
      )}
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
});
