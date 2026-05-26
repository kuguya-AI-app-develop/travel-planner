import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Plan, ItineraryItem } from '../../types';
import ItineraryView from '../../components/ItineraryView';
import ItineraryModal from '../../components/ItineraryModal';

export default function ItineraryScreen() {
  const { plans, loading, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const itinerary = selectedPlan?.itinerary ?? [];

  const handlePressItem = useCallback((item: ItineraryItem) => {
    setEditingItem(item);
    setShowModal(true);
  }, []);

  const handleDeleteItem = useCallback(
    (item: ItineraryItem) => {
      if (!selectedPlan) return;
      Alert.alert('确认删除', '确定要删除这个行程项目吗？', [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updated = itinerary.filter((i) => i.id !== item.id);
            try {
              await updatePlan(selectedPlan.id, { data: { itinerary: updated } });
            } catch (e: unknown) {
              Alert.alert('错误', e instanceof Error ? e.message : '删除失败');
            }
          },
        },
      ]);
    },
    [selectedPlan, itinerary, updatePlan]
  );

  const handleSave = useCallback(
    async (data: Omit<ItineraryItem, 'id'> & { id?: number }) => {
      if (!selectedPlan || saving) return;
      setSaving(true);
      let updated: ItineraryItem[];
      if (data.id) {
        updated = itinerary.map((i) =>
          i.id === data.id ? ({ ...i, ...data } as ItineraryItem) : i
        );
      } else {
        const newId = itinerary.length > 0 ? Math.max(...itinerary.map((i) => i.id)) + 1 : 1;
        updated = [...itinerary, { ...data, id: newId, order: itinerary.length }];
      }

      try {
        await updatePlan(selectedPlan.id, { data: { itinerary: updated } });
        setShowModal(false);
        setEditingItem(null);
      } catch (e: unknown) {
        Alert.alert('错误', e instanceof Error ? e.message : '保存失败');
      } finally {
        setSaving(false);
      }
    },
    [selectedPlan, itinerary, updatePlan, saving]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedPlan || !editingItem || saving) return;
    setSaving(true);
    const updated = itinerary.filter((i) => i.id !== editingItem.id);
    try {
      await updatePlan(selectedPlan.id, { data: { itinerary: updated } });
      setShowModal(false);
      setEditingItem(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '删除失败');
    } finally {
      setSaving(false);
    }
  }, [selectedPlan, itinerary, editingItem, updatePlan, saving]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
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
        <Text style={styles.emptyIcon}>📋</Text>
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
          <Text style={styles.hint}>请选择一个计划查看行程</Text>
        </View>
      ) : (
        <>
          <ItineraryView
            items={itinerary}
            onPressItem={handlePressItem}
            onDeleteItem={handleDeleteItem}
          />

          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <ItineraryModal
        visible={showModal}
        item={editingItem}
        saving={saving}
        onSave={handleSave}
        onDelete={editingItem ? handleDelete : undefined}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
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
