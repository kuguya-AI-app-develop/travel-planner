import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpensesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>费用管理</Text>
      <Text style={styles.subtitle}>查看和管理费用信息</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999' },
});
