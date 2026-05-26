import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function MoreScreen() {
  const router = useRouter();
  const { isAdmin, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>更多功能</Text>

      {/* 规划区域 */}
      <Text style={styles.sectionTitle}>规划</Text>
      {[
        { icon: '💰', title: '其他消费', route: '/expenses' },
        { icon: '📋', title: '每日行程', route: '/itinerary' },
        { icon: '🎒', title: '行李清单', route: '/packing' },
        { icon: '📄', title: '证件管理', route: '/documents' },
        { icon: '📊', title: '计划总览', route: '/plan/overview' },
      ].map((item) => (
        <TouchableOpacity
          key={item.title}
          style={styles.menuItem}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <Text style={styles.menuText}>{item.title}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* 汇总区域 */}
      <Text style={styles.sectionTitle}>汇总</Text>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/summary' as any)}
      >
        <Text style={styles.menuIcon}>📝</Text>
        <Text style={styles.menuText}>预算总结</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* 功能区域 */}
      <Text style={styles.sectionTitle}>功能</Text>
      {[
        { icon: '🤖', title: 'AI 策划', route: '/ai-plan' },
        { icon: '💬', title: 'AI 聊天', route: '/chat' },
        { icon: '⚙️', title: 'AI 设置', route: '/ai-settings' },
      ].map((item) => (
        <TouchableOpacity
          key={item.title}
          style={styles.menuItem}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <Text style={styles.menuText}>{item.title}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* 管理区域 */}
      {isAdmin && (
        <>
          <Text style={styles.sectionTitle}>管理</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin' as any)}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>管理员</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 退出登录 */}
      <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={logout}>
        <Text style={styles.menuIcon}>🚪</Text>
        <Text style={[styles.menuText, styles.logoutText]}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: '#1a1a1a' },
  arrow: { fontSize: 20, color: '#C7C7CC' },
  logoutItem: {
    marginTop: 24,
    marginBottom: 40,
  },
  logoutText: {
    color: '#FF3B30',
  },
});
