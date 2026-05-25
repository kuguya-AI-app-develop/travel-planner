import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Plan, Destination } from '../../types';
import DestinationsView from '../../components/DestinationsView';
import DestinationModal from '../../components/DestinationModal';

export default function DestinationsScreen() {
  const { plans, loading, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const destinations = selectedPlan?.destinations ?? [];

  const handlePressDestination = useCallback((destination: Destination) => {
    setEditingDestination(destination);
    setShowModal(true);
  }, []);

  const handleToggleSelect = useCallback(async (id: number) => {
    if (!selectedPlan) return;
    const updated = destinations.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d));
    try {
      await updatePlan(selectedPlan.id, { data: { destinations: updated } });
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '更新失败');
    }
  }, [selectedPlan, destinations, updatePlan]);

  const handleSave = useCallback(async (data: Omit<Destination, 'id'> & { id?: number }) => {
    if (!selectedPlan) return;

    let updated: Destination[];
    if (data.id) {
      updated = destinations.map((d) =>
        d.id === data.id ? { ...d, ...data } as Destination : d
      );
    } else {
      const newId = destinations.length > 0 ? Math.max(...destinations.map((d) => d.id)) + 1 : 1;
      updated = [...destinations, { ...data, id: newId }];
    }

    try {
      await updatePlan(selectedPlan.id, { data: { destinations: updated } });
      setShowModal(false);
      setEditingDestination(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '保存失败');
    }
  }, [selectedPlan, destinations, updatePlan]);

  const handleDelete = useCallback(async () => {
    if (!selectedPlan || !editingDestination) return;
    const updated = destinations.filter((d) => d.id !== editingDestination.id);
    try {
      await updatePlan(selectedPlan.id, { data: { destinations: updated } });
      setShowModal(false);
      setEditingDestination(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '删除失败');
    }
  }, [selectedPlan, destinations, editingDestination, updatePlan]);

  const handleAdd = useCallback(() => {
    setEditingDestination(null);
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
        <Text style={styles.emptyIcon}>📍</Text>
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
          <Text style={styles.hint}>请选择一个计划查看目的地</Text>
        </View>
      ) : (
        <>
          <DestinationsView
            destinations={destinations}
            onPressDestination={handlePressDestination}
            onToggleSelect={handleToggleSelect}
          />

          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <DestinationModal
        visible={showModal}
        destination={editingDestination}
        onSave={handleSave}
        onDelete={editingDestination ? handleDelete : undefined}
        onClose={() => { setShowModal(false); setEditingDestination(null); }}
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
