import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Flight } from '../types';

const STATUS_CONFIG: Record<Flight['status'], { label: string; color: string; bg: string }> = {
  booked: { label: '已预订', color: '#34C759', bg: '#E8F5E9' },
  pending: { label: '待定', color: '#FF9500', bg: '#FFF3E0' },
  compare: { label: '对比中', color: '#007AFF', bg: '#E3F2FD' },
};

interface FlightsViewProps {
  flights: Flight[];
  criteria: string[];
  onPressFlight: (flight: Flight) => void;
  onToggleSelect: (id: number) => void;
}

export default function FlightsView({ flights, criteria, onPressFlight, onToggleSelect }: FlightsViewProps) {
  const renderItem = useCallback(({ item }: { item: Flight }) => {
    const st = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity
        style={[styles.card, item.selected && styles.cardSelected]}
        onPress={() => onPressFlight(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.airlineRow}>
            <Text style={styles.airline}>{item.airline || '未命名'}</Text>
            {item.code ? <Text style={styles.code}>{item.code}</Text> : null}
          </View>
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: st.bg }]}
            onPress={() => onToggleSelect(item.id)}
          >
            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.route}>{item.route || '未设置路线'}</Text>

        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>出发</Text>
            <Text style={styles.timeValue}>{item.dep || '--'}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>到达</Text>
            <Text style={styles.timeValue}>{item.arr || '--'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.price}>{item.price > 0 ? `¥${item.price.toLocaleString()}` : '待定'}</Text>
          <Text style={styles.cls}>{item.cls || '经济舱'}</Text>
        </View>

        {criteria.length > 0 && Object.keys(item.notes).length > 0 && (
          <View style={styles.scoresSection}>
            {criteria.map((name, idx) => {
              const val = item.notes[idx];
              if (val === undefined) return null;
              const score = parseInt(val, 10) || 0;
              return (
                <View key={idx} style={styles.scoreRow}>
                  <Text style={styles.scoreName}>{name}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${score * 10}%` }]} />
                  </View>
                  <Text style={styles.scoreVal}>{score}</Text>
                </View>
              );
            })}
          </View>
        )}

        {item.selected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>已选择</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [criteria, onPressFlight, onToggleSelect]);

  if (flights.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>✈️</Text>
        <Text style={styles.emptyTitle}>还没有航班</Text>
        <Text style={styles.emptySubtitle}>点击右下角按钮添加航班</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={flights}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  airline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  code: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  route: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeBlock: {},
  timeLabel: {
    fontSize: 11,
    color: '#999',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  arrow: {
    fontSize: 16,
    color: '#ccc',
    marginHorizontal: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  cls: {
    fontSize: 13,
    color: '#888',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  scoresSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreName: {
    fontSize: 12,
    color: '#888',
    width: 60,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  scoreVal: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'right',
  },
  selectedIndicator: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  selectedText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});
