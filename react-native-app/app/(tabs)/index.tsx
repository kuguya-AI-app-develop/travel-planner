import React, { useState } from 'react';
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
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { usePlans } from '../../hooks/usePlans';
import PlanCard from '../../components/PlanCard';
import { Plan } from '../../types';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { plans, loading, error, createPlan, deletePlan } = usePlans();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      Alert.alert('提示', '请输入计划名称');
      return;
    }
    try {
      await createPlan(newPlanName.trim());
      setNewPlanName('');
      setShowCreateModal(false);
    } catch (e: unknown) {
      Alert.alert('错误', e instanceof Error ? e.message : '创建失败');
    }
  };

  const handleDeletePlan = (plan: Plan) => {
    Alert.alert('确认删除', `确定要删除计划"${plan.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deletePlan(plan.id).catch((e: unknown) =>
          Alert.alert('错误', e instanceof Error ? e.message : '删除失败')
        ),
      },
    ]);
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>✈️</Text>
      <Text style={styles.emptyTitle}>还没有旅行计划</Text>
      <Text style={styles.emptySubtitle}>点击下方按钮创建你的第一个计划</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>你好，{user?.username}</Text>
          <Text style={styles.role}>角色：{user?.role}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>退出</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>我的旅行计划</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+ 新建</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => window.location.reload()}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PlanCard plan={item} onDelete={() => handleDeletePlan(item)} />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={plans.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

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
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreatePlan}>
                <Text style={styles.modalConfirmText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  role: { fontSize: 13, color: '#666', marginTop: 2 },
  logoutButton: { padding: 8 },
  logoutText: { fontSize: 14, color: '#FF3B30' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  list: { paddingBottom: 20 },
  emptyList: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#999' },
  loader: { flex: 1, justifyContent: 'center' },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: '#FF3B30', marginBottom: 8 },
  retryText: { fontSize: 14, color: '#007AFF' },
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
