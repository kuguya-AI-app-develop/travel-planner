import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlans } from '../../hooks/usePlans';
import { Plan } from '../../types';

const QUICK_LINKS = [
  { icon: '📅', title: '行程日历', route: '/calendar', color: '#FF6B6B' },
  { icon: '✈️', title: '机票对比', route: '/flights', color: '#48DBFB' },
  { icon: '📍', title: '目的地', route: '/destinations', color: '#FECA57' },
  { icon: '🏨', title: '酒店', route: '/hotels', color: '#FF9F43' },
  { icon: '💰', title: '其他消费', route: '/expenses', color: '#34C759' },
  { icon: '📋', title: '每日行程', route: '/itinerary', color: '#5F27CD' },
  { icon: '🎒', title: '行李清单', route: '/packing', color: '#FF6B9D' },
  { icon: '📄', title: '证件管理', route: '/documents', color: '#576574' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#8E8E93' },
  active: { label: '进行中', color: '#34C759' },
  confirmed: { label: '已确认', color: '#007AFF' },
  traveling: { label: '旅行中', color: '#FF9500' },
  done: { label: '已完成', color: '#8E8E93' },
};

export default function HomeScreen() {
  const router = useRouter();
  const { plans, loading, createPlan, deletePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      Alert.alert('提示', '请输入计划名称');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await createPlan(newPlanName.trim());
      setNewPlanName('');
      setShowCreateModal(false);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = (plan: Plan) => {
    Alert.alert('确认删除', `确定要删除计划"${plan.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deletePlan(plan.id).catch((e: unknown) =>
            Alert.alert('错误', e instanceof Error ? e.message : '删除失败')
          );
          if (selectedPlanId === plan.id) setSelectedPlanId(null);
        },
      },
    ]);
  };

  const statusInfo = selectedPlan ? (STATUS_MAP[selectedPlan.status] ?? STATUS_MAP.draft) : null;
  const tripCount = selectedPlan?.trips?.length ?? 0;
  const destCount = selectedPlan?.destinations?.length ?? 0;
  const flightCount = selectedPlan?.flights?.length ?? 0;
  const hotelCount = selectedPlan?.hotels?.length ?? 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 计划选择器 */}
      <View style={styles.planSelector}>
        <View style={styles.planSelectorHeader}>
          <Text style={styles.planLabel}>当前计划</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.addButtonText}>+ 新建</Text>
          </TouchableOpacity>
        </View>
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
              onLongPress={() => handleDeletePlan(item)}
            >
              <Text
                style={[styles.planChipText, selectedPlanId === item.id && styles.planChipTextActive]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyHint}>暂无计划，点击"新建"创建</Text>
          }
        />
      </View>

      {/* 计划基本信息 */}
      {selectedPlan ? (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.planName}>{selectedPlan.name}</Text>
            {statusInfo && (
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tripCount}</Text>
              <Text style={styles.statLabel}>行程</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{destCount}</Text>
              <Text style={styles.statLabel}>目的地</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{flightCount}</Text>
              <Text style={styles.statLabel}>航班</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{hotelCount}</Text>
              <Text style={styles.statLabel}>酒店</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✈️</Text>
          <Text style={styles.emptyTitle}>请选择或创建一个旅行计划</Text>
          <Text style={styles.emptySubtitle}>长按计划标签可删除</Text>
        </View>
      )}

      {/* 快捷入口 */}
      <Text style={styles.sectionTitle}>快捷入口</Text>
      <View style={styles.grid}>
        {QUICK_LINKS.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.gridItem}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.gridIcon, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.gridEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.gridText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 新建计划 Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新建旅行计划</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="输入计划名称"
              value={newPlanName}
              onChangeText={setNewPlanName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, saving && { opacity: 0.6 }]}
                onPress={handleCreatePlan}
                disabled={saving}
              >
                <Text style={styles.modalConfirmText}>{saving ? '创建中...' : '创建'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  planSelector: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  planSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  planList: { gap: 8 },
  planChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
  },
  planChipActive: { backgroundColor: '#007AFF' },
  planChipText: { fontSize: 14, color: '#333' },
  planChipTextActive: { color: '#fff', fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#999', paddingVertical: 4 },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#007AFF' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  emptyCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#999' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gridIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridEmoji: { fontSize: 24 },
  gridText: { fontSize: 12, color: '#333', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { padding: 10 },
  modalCancelText: { fontSize: 16, color: '#666' },
  modalConfirm: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
