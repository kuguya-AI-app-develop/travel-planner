import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Destination } from '../types';

const DEFAULT_DIMENSIONS = ['景色', '文化', '美食', '交通便利', '安全性', '性价比'];

interface DestinationsViewProps {
  destinations: Destination[];
  onPressDestination: (destination: Destination) => void;
  onToggleSelect: (id: number) => void;
}

export default function DestinationsView({ destinations, onPressDestination, onToggleSelect }: DestinationsViewProps) {
  const renderItem = useCallback(({ item }: { item: Destination }) => {
    const hasScores = item.scores.some((s) => s > 0);
    return (
      <TouchableOpacity
        style={[styles.card, item.selected && styles.cardSelected]}
        onPress={() => onPressDestination(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name || '未命名'}</Text>
            {item.country ? <Text style={styles.country}>{item.country}</Text> : null}
          </View>
          <TouchableOpacity
            style={[styles.selectBtn, item.selected && styles.selectBtnActive]}
            onPress={() => onToggleSelect(item.id)}
          >
            <Text style={[styles.selectBtnText, item.selected && styles.selectBtnTextActive]}>
              {item.selected ? '已选' : '选择'}
            </Text>
          </TouchableOpacity>
        </View>

        {item.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        ) : null}

        {hasScores && (
          <View style={styles.scoresSection}>
            {DEFAULT_DIMENSIONS.map((dim, idx) => {
              const val = item.scores[idx] ?? 0;
              if (val === 0) return null;
              return (
                <View key={idx} style={styles.scoreRow}>
                  <Text style={styles.scoreName}>{dim}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${val * 10}%` }]} />
                  </View>
                  <Text style={styles.scoreVal}>{val}</Text>
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
  }, [onPressDestination, onToggleSelect]);

  if (destinations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyTitle}>还没有目的地</Text>
        <Text style={styles.emptySubtitle}>点击右下角按钮添加目的地</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={destinations}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  country: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  selectBtnActive: {
    backgroundColor: '#E3F2FD',
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectBtnTextActive: {
    color: '#007AFF',
  },
  notes: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
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
