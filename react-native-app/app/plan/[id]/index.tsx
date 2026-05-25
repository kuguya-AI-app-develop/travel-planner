import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PlanOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>计划概览</Text>
      <Text style={styles.subtitle}>计划 ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999' },
});
