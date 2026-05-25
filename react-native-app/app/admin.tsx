import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import UserModal, { AdminUser } from '../components/UserModal';

export default function AdminScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.get<{ users: AdminUser[] }>('/api/admin/users');
      setUsers(data.users || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isAdmin) {
        router.replace('/(tabs)');
        return;
      }
      loadUsers();
    }, [isAdmin, loadUsers])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadUsers();
  }

  function handleAdd() {
    setEditingUser(null);
    setModalVisible(true);
  }

  function handleEdit(user: AdminUser) {
    setEditingUser(user);
    setModalVisible(true);
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  }

  function renderItem({ item }: { item: AdminUser }) {
    const isAdminRole = item.role === 'admin';
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={[styles.roleBadge, isAdminRole ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
            <Text style={[styles.roleBadgeText, isAdminRole ? styles.roleBadgeTextAdmin : styles.roleBadgeTextUser]}>
              {isAdminRole ? '管理员' : '用户'}
            </Text>
          </View>
        </View>
        <Text style={styles.createdAt}>创建于 {formatDate(item.createdAt)}</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>用户管理</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无用户</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <UserModal
        visible={modalVisible}
        user={editingUser}
        onClose={() => setModalVisible(false)}
        onSaved={loadUsers}
        onDeleted={loadUsers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 50,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeAdmin: {
    backgroundColor: '#FFF3E0',
  },
  roleBadgeUser: {
    backgroundColor: '#f0f0f0',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadgeTextAdmin: {
    color: '#FF9500',
  },
  roleBadgeTextUser: {
    color: '#888',
  },
  createdAt: {
    fontSize: 13,
    color: '#999',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
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
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 30,
  },
});
