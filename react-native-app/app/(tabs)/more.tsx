import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

const MENU_ITEMS = [
  { title: 'AI 策划', icon: '🤖', route: '/ai-plan', section: 'AI' },
  { title: 'AI 聊天', icon: '💬', route: '/chat', section: 'AI' },
  { title: '酒店', icon: '🏨', route: '/plan/hotels', section: '旅行' },
  { title: '费用', icon: '💰', route: '/plan/expenses', section: '旅行' },
  { title: '行程', icon: '📋', route: '/plan/itinerary', section: '旅行' },
  { title: '打包', icon: '🎒', route: '/plan/packing', section: '旅行' },
  { title: '文档', icon: '📄', route: '/plan/documents', section: '旅行' },
  { title: '概览', icon: '📊', route: '/plan/overview', section: '旅行' },
  { title: '总结', icon: '📝', route: '/plan/summary', section: '旅行' },
];

const SECTIONS = ['AI', '旅行'];

export default function MoreScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>更多功能</Text>
      {isAdmin && (
        <View>
          <Text style={styles.sectionTitle}>管理</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin' as any)}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>管理员</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}
      {SECTIONS.map((section) => (
        <View key={section}>
          <Text style={styles.sectionTitle}>{section}</Text>
          {MENU_ITEMS.filter((item) => item.section === section).map((item) => (
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
        </View>
      ))}
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
});
