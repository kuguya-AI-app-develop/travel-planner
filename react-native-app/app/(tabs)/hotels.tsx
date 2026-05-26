import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Plan, Hotel } from '../../types';
import HotelsView from '../../components/HotelsView';
import HotelModal from '../../components/HotelModal';

export default function HotelsScreen() {
  const { plans, loading, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const hotels = selectedPlan?.hotels ?? [];

  const handlePressHotel = useCallback((hotel: Hotel) => {
    setEditingHotel(hotel);
    setShowModal(true);
  }, []);

  const handleToggleSelect = useCallback(async (id: number) => {
    if (!selectedPlan) return;
    const updated = hotels.map((h) => (h.id === id ? { ...h, selected: !h.selected } : h));
    try {
      await updatePlan(selectedPlan.id, { data: { hotels: updated } });
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '更新失败');
    }
  }, [selectedPlan, hotels, updatePlan]);

  const handleSave = useCallback(async (data: Omit<Hotel, 'id'> & { id?: number }) => {
    if (!selectedPlan || saving) return;
    setSaving(true);
    let updated: Hotel[];
    if (data.id) {
      updated = hotels.map((h) =>
        h.id === data.id ? { ...h, ...data } as Hotel : h
      );
    } else {
      const newId = hotels.length > 0 ? Math.max(...hotels.map((h) => h.id)) + 1 : 1;
      updated = [...hotels, { ...data, id: newId }];
    }

    try {
      await updatePlan(selectedPlan.id, { data: { hotels: updated } });
      setShowModal(false);
      setEditingHotel(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }, [selectedPlan, hotels, updatePlan, saving]);

  const handleDelete = useCallback(async () => {
    if (!selectedPlan || !editingHotel || saving) return;
    setSaving(true);
    const updated = hotels.filter((h) => h.id !== editingHotel.id);
    try {
      await updatePlan(selectedPlan.id, { data: { hotels: updated } });
      setShowModal(false);
      setEditingHotel(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '删除失败');
    } finally {
      setSaving(false);
    }
  }, [selectedPlan, hotels, editingHotel, updatePlan, saving]);

  const handleAdd = useCallback(() => {
    setEditingHotel(null);
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
        <Text style={styles.emptyIcon}>🏨</Text>
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
          <Text style={styles.hint}>请选择一个计划查看酒店</Text>
        </View>
      ) : (
        <>
          <HotelsView
            hotels={hotels}
            onPressHotel={handlePressHotel}
            onToggleSelect={handleToggleSelect}
          />

          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <HotelModal
        visible={showModal}
        hotel={editingHotel}
        saving={saving}
        onSave={handleSave}
        onDelete={editingHotel ? handleDelete : undefined}
        onClose={() => { setShowModal(false); setEditingHotel(null); }}
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
