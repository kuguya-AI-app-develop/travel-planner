import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { PackingCategory, PackingItem } from '../types';

interface PackingViewProps {
  categories: PackingCategory[];
  onUpdateCategories: (categories: PackingCategory[]) => void;
}

export default function PackingView({ categories, onUpdateCategories }: PackingViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set(categories.map((c) => c.id)));
  const [newGroupName, setNewGroupName] = useState('');
  const [addingItemToGroup, setAddingItemToGroup] = useState<number | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const doneItems = categories.reduce((sum, c) => sum + c.items.filter((i) => i.done).length, 0);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleItem = useCallback(
    (categoryId: number, itemId: number) => {
      const updated = categories.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
        };
      });
      onUpdateCategories(updated);
    },
    [categories, onUpdateCategories]
  );

  const handleAddGroup = useCallback(() => {
    if (!newGroupName.trim()) return;
    const maxId = categories.reduce((max, c) => Math.max(max, c.id), 0);
    const newGroup: PackingCategory = { id: maxId + 1, name: newGroupName.trim(), items: [] };
    onUpdateCategories([...categories, newGroup]);
    setNewGroupName('');
    setExpandedIds((prev) => new Set(prev).add(newGroup.id));
  }, [newGroupName, categories, onUpdateCategories]);

  const handleDeleteGroup = useCallback(
    (groupId: number) => {
      Alert.alert('确认删除', '确定要删除这个分组及其所有物品吗？', [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            onUpdateCategories(categories.filter((c) => c.id !== groupId));
          },
        },
      ]);
    },
    [categories, onUpdateCategories]
  );

  const handleAddItem = useCallback(
    (categoryId: number) => {
      if (!newItemText.trim()) return;
      const updated = categories.map((c) => {
        if (c.id !== categoryId) return c;
        const maxItemId = c.items.reduce((max, i) => Math.max(max, i.id), 0);
        return {
          ...c,
          items: [...c.items, { id: maxItemId + 1, text: newItemText.trim(), done: false }],
        };
      });
      onUpdateCategories(updated);
      setNewItemText('');
      setAddingItemToGroup(null);
    },
    [newItemText, categories, onUpdateCategories]
  );

  const handleDeleteItem = useCallback(
    (categoryId: number, itemId: number) => {
      const updated = categories.map((c) => {
        if (c.id !== categoryId) return c;
        return { ...c, items: c.items.filter((i) => i.id !== itemId) };
      });
      onUpdateCategories(updated);
    },
    [categories, onUpdateCategories]
  );

  const renderCategory = useCallback(
    ({ item }: { item: PackingCategory }) => {
      const catDone = item.items.filter((i) => i.done).length;
      const catTotal = item.items.length;
      const isExpanded = expandedIds.has(item.id);

      return (
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleExpand(item.id)}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionArrow}>{isExpanded ? '▼' : '▶'}</Text>
              <Text style={styles.sectionTitle}>{item.name}</Text>
            </View>
            <View style={styles.sectionRight}>
              <Text style={styles.sectionProgress}>
                {catDone}/{catTotal}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteGroup(item.id)} style={styles.deleteGroupBtn}>
                <Text style={styles.deleteGroupText}>删除</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.sectionBody}>
              {item.items.map((packingItem) => (
                <View key={packingItem.id} style={styles.itemRow}>
                  <TouchableOpacity
                    style={[styles.checkbox, packingItem.done && styles.checkboxDone]}
                    onPress={() => toggleItem(item.id, packingItem.id)}
                  >
                    {packingItem.done && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={[styles.itemText, packingItem.done && styles.itemTextDone]}>
                    {packingItem.text}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteItem(item.id, packingItem.id)}>
                    <Text style={styles.deleteItemText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {addingItemToGroup === item.id ? (
                <View style={styles.addItemRow}>
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="输入物品名称"
                    value={newItemText}
                    onChangeText={setNewItemText}
                    autoFocus
                    onSubmitEditing={() => handleAddItem(item.id)}
                  />
                  <TouchableOpacity style={styles.addItemConfirm} onPress={() => handleAddItem(item.id)}>
                    <Text style={styles.addItemConfirmText}>添加</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setAddingItemToGroup(null);
                      setNewItemText('');
                    }}
                  >
                    <Text style={styles.addItemCancel}>取消</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addItemBtn} onPress={() => setAddingItemToGroup(item.id)}>
                  <Text style={styles.addItemBtnText}>+ 添加物品</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      );
    },
    [expandedIds, addingItemToGroup, newItemText, toggleExpand, toggleItem, handleDeleteGroup, handleAddItem, handleDeleteItem]
  );

  return (
    <View style={styles.container}>
      {totalItems > 0 && (
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            整体进度：{doneItems}/{totalItems}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${totalItems > 0 ? (doneItems / totalItems) * 100 : 0}%` }]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0}%
          </Text>
        </View>
      )}

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎒</Text>
            <Text style={styles.emptyTitle}>还没有打包清单</Text>
            <Text style={styles.emptySubtitle}>在下方添加分组开始打包</Text>
          </View>
        }
      />

      <View style={styles.addGroupRow}>
        <TextInput
          style={styles.addGroupInput}
          placeholder="新分组名称（如：衣物、洗漱用品）"
          value={newGroupName}
          onChangeText={setNewGroupName}
          onSubmitEditing={handleAddGroup}
        />
        <TouchableOpacity style={styles.addGroupBtn} onPress={handleAddGroup}>
          <Text style={styles.addGroupBtnText}>添加</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginRight: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 10,
    width: 40,
    textAlign: 'right',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionArrow: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionProgress: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  deleteGroupBtn: {
    padding: 4,
  },
  deleteGroupText: {
    fontSize: 13,
    color: '#FF3B30',
  },
  sectionBody: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxDone: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteItemText: {
    fontSize: 20,
    color: '#C7C7CC',
    paddingHorizontal: 8,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  addItemConfirm: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addItemConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addItemCancel: {
    fontSize: 14,
    color: '#666',
    padding: 8,
  },
  addItemBtn: {
    marginTop: 6,
    paddingVertical: 6,
  },
  addItemBtnText: {
    fontSize: 14,
    color: '#007AFF',
  },
  addGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  addGroupInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addGroupBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addGroupBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
