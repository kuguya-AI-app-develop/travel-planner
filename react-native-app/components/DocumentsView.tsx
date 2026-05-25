import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Document, DocStatus } from '../types';

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string }> = {
  valid: { label: '有效', color: '#34C759', bg: '#E8F5E9' },
  expiring: { label: '即将过期', color: '#FF9500', bg: '#FFF3E0' },
  expired: { label: '已过期', color: '#FF3B30', bg: '#FFEBEE' },
  processing: { label: '办理中', color: '#007AFF', bg: '#E3F2FD' },
  none: { label: '无', color: '#8E8E93', bg: '#F2F2F7' },
};

interface DocumentsViewProps {
  documents: Document[];
  onPressDocument: (doc: Document) => void;
}

export default function DocumentsView({ documents, onPressDocument }: DocumentsViewProps) {
  const renderItem = useCallback(
    ({ item }: { item: Document }) => {
      const st = STATUS_CONFIG[item.status];
      return (
        <TouchableOpacity style={styles.card} onPress={() => onPressDocument(item)} activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{item.name || '未命名'}</Text>
            <View style={[styles.statusTag, { backgroundColor: st.bg }]}>
              <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.type}>{item.type}</Text>
            {item.number ? <Text style={styles.number}>{item.number}</Text> : null}
          </View>
          {item.expiry ? (
            <Text style={styles.expiry}>到期：{item.expiry}</Text>
          ) : null}
        </TouchableOpacity>
      );
    },
    [onPressDocument]
  );

  if (documents.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={styles.emptyTitle}>还没有证件记录</Text>
        <Text style={styles.emptySubtitle}>点击右下角按钮添加证件</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={documents}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#555',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  number: {
    fontSize: 14,
    color: '#555',
  },
  expiry: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
});
