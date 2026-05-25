import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ItineraryItem } from '../types';

const TYPE_CONFIG: Record<ItineraryItem['type'], { icon: string; color: string; label: string }> = {
  sight: { icon: '👁', color: '#007AFF', label: '景点' },
  food: { icon: '🍴', color: '#FF9500', label: '美食' },
  transport: { icon: '🚗', color: '#5856D6', label: '交通' },
  hotel: { icon: '🛏', color: '#34C759', label: '住宿' },
  other: { icon: '⭐', color: '#FF2D55', label: '其他' },
};

interface Section {
  title: string;
  data: ItineraryItem[];
}

interface ItineraryViewProps {
  items: ItineraryItem[];
  onPressItem: (item: ItineraryItem) => void;
  onDeleteItem: (item: ItineraryItem) => void;
}

export default function ItineraryView({ items, onPressItem, onDeleteItem }: ItineraryViewProps) {
  const sections: Section[] = useMemo(() => {
    const grouped = new Map<string, ItineraryItem[]>();
    const sorted = [...items].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return a.order - b.order;
    });
    for (const item of sorted) {
      const key = item.date;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }
    return Array.from(grouped.entries()).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [items]);

  const renderItem = useCallback(
    ({ item }: { item: ItineraryItem }) => {
      const tc = TYPE_CONFIG[item.type];
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onPressItem(item)}
          onLongPress={() => onDeleteItem(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.time}>{item.time}</Text>
            <View style={[styles.typeBadge, { backgroundColor: tc.color + '18' }]}>
              <Text style={styles.typeIcon}>{tc.icon}</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title || '未命名'}
            </Text>
            {item.meta ? (
              <Text style={styles.cardMeta} numberOfLines={1}>
                {item.meta}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [onPressItem, onDeleteItem]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionDate}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length} 项</Text>
      </View>
    ),
    []
  );

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>还没有行程安排</Text>
        <Text style={styles.emptySubtitle}>点击右下角按钮添加行程项目</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  sectionDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 13,
    color: '#999',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    alignItems: 'center',
    marginRight: 14,
    width: 52,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 13,
    color: '#999',
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
});
