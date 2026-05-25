import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Hotel } from '../types';

const DEFAULT_DIMENSIONS = ['性价比', '位置', '卫生', '设施', '服务'];

interface HotelsViewProps {
  hotels: Hotel[];
  onPressHotel: (hotel: Hotel) => void;
  onToggleSelect: (id: number) => void;
}

export default function HotelsView({ hotels, onPressHotel, onToggleSelect }: HotelsViewProps) {
  const renderItem = useCallback(({ item }: { item: Hotel }) => {
    const hasScores = item.scores.some((s) => s > 0);
    return (
      <TouchableOpacity
        style={[styles.card, item.selected && styles.cardSelected]}
        onPress={() => onPressHotel(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name || '未命名'}</Text>
            {item.location ? <Text style={styles.location}>{item.location}</Text> : null}
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

        {item.price ? (
          <Text style={styles.price}>{item.price}</Text>
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
  }, [onPressHotel, onToggleSelect]);

  if (hotels.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🏨</Text>
        <Text style={styles.emptyTitle}>还没有酒店</Text>
        <Text style={styles.emptySubtitle}>点击右下角按钮添加酒店</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={hotels}
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
  location: {
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
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
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
