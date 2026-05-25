import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plan, PlanStatus } from '../types';
import { useRouter } from 'expo-router';

const STATUS_CONFIG: Record<PlanStatus, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: '#8E8E93', bg: '#F2F2F7' },
  active: { label: '进行中', color: '#007AFF', bg: '#E3F2FD' },
  confirmed: { label: '已确认', color: '#34C759', bg: '#E8F5E9' },
  traveling: { label: '旅行中', color: '#FF9500', bg: '#FFF3E0' },
  done: { label: '已完成', color: '#8E8E93', bg: '#F2F2F7' },
};

interface PlanCardProps {
  plan: Plan;
  isActive?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export default function PlanCard({ plan, isActive, onSelect, onDelete }: PlanCardProps) {
  const router = useRouter();
  const status = STATUS_CONFIG[plan.status];

  const handlePress = () => {
    if (onSelect) {
      onSelect();
    } else {
      router.push(`/plan/${plan.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{plan.name}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>
          {plan.startDate || '未设置'} → {plan.endDate || '未设置'}
        </Text>
      </View>

      <View style={styles.stats}>
        {plan.destinations.length > 0 && (
          <Text style={styles.stat}>📍 {plan.destinations.length} 个目的地</Text>
        )}
        {plan.flights.length > 0 && (
          <Text style={styles.stat}>✈️ {plan.flights.length} 个航班</Text>
        )}
        {plan.hotels.length > 0 && (
          <Text style={styles.stat}>🏨 {plan.hotels.length} 个酒店</Text>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    fontSize: 13,
    color: '#888',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  deleteText: {
    fontSize: 13,
    color: '#FF3B30',
  },
});
