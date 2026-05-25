import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Plan, Trip } from '../../types';
import CalendarView from '../../components/CalendarView';
import TripModal from '../../components/TripModal';

export default function CalendarScreen() {
  const { plans, loading, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const trips = selectedPlan?.trips ?? [];

  const handleAddTrip = useCallback((date: string) => {
    setEditingTrip(null);
    setDefaultDate(date);
    setShowTripModal(true);
  }, []);

  const handleEditTrip = useCallback((trip: Trip) => {
    setEditingTrip(trip);
    setDefaultDate(undefined);
    setShowTripModal(true);
  }, []);

  const handleSaveTrip = useCallback(async (tripData: Omit<Trip, 'id'> & { id?: number }) => {
    if (!selectedPlan) return;

    let updatedTrips: Trip[];
    if (tripData.id) {
      updatedTrips = trips.map((t) =>
        t.id === tripData.id ? { ...t, ...tripData } as Trip : t
      );
    } else {
      const newId = trips.length > 0 ? Math.max(...trips.map((t) => t.id)) + 1 : 1;
      updatedTrips = [...trips, { ...tripData, id: newId }];
    }

    try {
      await updatePlan(selectedPlan.id, { data: { trips: updatedTrips } });
      setShowTripModal(false);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '保存失败');
    }
  }, [selectedPlan, trips, updatePlan]);

  const handleDeleteTrip = useCallback(async () => {
    if (!selectedPlan || !editingTrip) return;

    const updatedTrips = trips.filter((t) => t.id !== editingTrip.id);
    try {
      await updatePlan(selectedPlan.id, { data: { trips: updatedTrips } });
      setShowTripModal(false);
      setEditingTrip(null);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '删除失败');
    }
  }, [selectedPlan, trips, editingTrip, updatePlan]);

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
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>还没有旅行计划</Text>
        <Text style={styles.hint}>请先在首页创建一个计划</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Plan selector */}
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
              style={[
                styles.planChip,
                selectedPlanId === item.id && styles.planChipActive,
              ]}
              onPress={() => setSelectedPlanId(item.id)}
            >
              <Text
                style={[
                  styles.planChipText,
                  selectedPlanId === item.id && styles.planChipTextActive,
                ]}
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
          <Text style={styles.hint}>请选择一个计划查看日历</Text>
        </View>
      ) : (
        <>
          <CalendarView
            trips={trips}
            onAddTrip={handleAddTrip}
            onEditTrip={handleEditTrip}
          />

          {/* Trip list */}
          {trips.length > 0 && (
            <View style={styles.tripList}>
              <Text style={styles.tripListTitle}>行程列表</Text>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripItem}
                  onPress={() => handleEditTrip(trip)}
                >
                  <View style={[styles.tripColor, { backgroundColor: trip.color }]} />
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripName}>{trip.name}</Text>
                    <Text style={styles.tripDate}>{trip.start} → {trip.end}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => handleAddTrip(new Date().toISOString().split('T')[0])}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <TripModal
        visible={showTripModal}
        trip={editingTrip}
        defaultDate={defaultDate}
        onSave={handleSaveTrip}
        onDelete={editingTrip ? handleDeleteTrip : undefined}
        onClose={() => setShowTripModal(false)}
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
  tripList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tripListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  tripColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  tripInfo: { flex: 1 },
  tripName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  tripDate: { fontSize: 13, color: '#888', marginTop: 2 },
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
