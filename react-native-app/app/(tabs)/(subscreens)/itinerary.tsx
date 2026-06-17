import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { ItineraryItem } from '../../../src/store/types';

const TYPE_LABELS: Record<string, string> = {
  sight: '景点',
  food: '餐饮',
  transport: '交通',
  hotel: '住宿',
  other: '其他',
};

const TYPE_COLORS: Record<string, string> = {
  sight: Colors.accent,
  food: Colors.warn,
  transport: Colors.teal,
  hotel: Colors.purple,
  other: Colors.muted,
};

const TYPE_OPTIONS = ['sight', 'food', 'transport', 'hotel', 'other'] as const;

export default function ItineraryScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();
  const { visible, message, showToast, hideToast } = useToast();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editType, setEditType] = useState<ItineraryItem['type']>('other');
  const [editNotes, setEditNotes] = useState('');

  const grouped = plan.itineraryItems.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof plan.itineraryItems>);

  const dates = Object.keys(grouped).sort();

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    const today = new Date();
    setEditDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    setEditTime('09:00');
    setEditTitle('');
    setEditLocation('');
    setEditType('sight');
    setEditNotes('');
  };

  const handleOpenEdit = (item: ItineraryItem) => {
    setEditItem(item);
    setEditDate(item.date);
    setEditTime(item.time);
    setEditTitle(item.title);
    setEditLocation(item.location);
    setEditType(item.type);
    setEditNotes(item.notes);
  };

  const handleSave = () => {
    if (!editTitle.trim()) {
      showToast('请输入活动名称');
      return;
    }
    if (editItem) {
      dispatch({
        type: 'UPDATE_ITINERARY',
        payload: {
          ...editItem,
          date: editDate,
          time: editTime,
          title: editTitle.trim(),
          location: editLocation.trim(),
          type: editType,
          notes: editNotes.trim(),
        },
      });
      showToast('行程已更新');
    } else {
      dispatch({
        type: 'ADD_ITINERARY',
        payload: {
          date: editDate,
          time: editTime,
          title: editTitle.trim(),
          location: editLocation.trim(),
          type: editType,
          duration: 60,
          notes: editNotes.trim(),
        },
      });
      showToast('已添加行程');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除行程', '确定要删除这个行程项吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_ITINERARY', payload: id });
        showToast('行程已删除');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="每日行程" />

        <Text style={styles.hint}>
          点击行程项编辑，长按删除
        </Text>

        {dates.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无行程安排</Text>
          </View>
        ) : (
          dates.map((date) => {
            const items = grouped[date].sort((a, b) => a.time.localeCompare(b.time));
            const isExpanded = expandedDays.has(date);

            return (
              <View key={date} style={styles.dayContainer}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayDate}>
                    {date}{' '}
                    <Text style={styles.dayCount}>{items.length} 项</Text>
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={10}
                    color={Colors.muted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.dayBody}>
                    {items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => handleOpenEdit(item)}
                        onLongPress={() => handleDelete(item.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.itemTime}>{item.time}</Text>
                        <View
                          style={[
                            styles.itemDot,
                            { backgroundColor: TYPE_COLORS[item.type] || Colors.muted },
                          ]}
                        />
                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <View style={styles.itemMeta}>
                            <View style={[
                              styles.typeBadge,
                              { backgroundColor: (TYPE_COLORS[item.type] || Colors.muted) + '15' },
                            ]}>
                              <Text style={[
                                styles.typeText,
                                { color: TYPE_COLORS[item.type] || Colors.muted },
                              ]}>
                                {TYPE_LABELS[item.type]}
                              </Text>
                            </View>
                            <Text style={styles.itemLocation}>{item.location}</Text>
                            {item.notes && (
                              <Text style={styles.itemNotes}>{item.notes}</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        <AddButton label="添加行程" onPress={handleOpenAdd} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 添加/编辑弹窗 */}
      <Modal visible={!!editItem || editTitle !== ''} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditItem(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editItem ? '编辑行程' : '添加行程'}</Text>

            <Text style={styles.modalLabel}>日期</Text>
            <TextInput style={styles.modalInput} value={editDate} onChangeText={setEditDate} placeholder="2026-05-18" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>时间</Text>
            <TextInput style={styles.modalInput} value={editTime} onChangeText={setEditTime} placeholder="09:00" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>活动名称</Text>
            <TextInput style={styles.modalInput} value={editTitle} onChangeText={setEditTitle} placeholder="例如：浅草寺" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>地点</Text>
            <TextInput style={styles.modalInput} value={editLocation} onChangeText={setEditLocation} placeholder="选填" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>类型</Text>
            <View style={styles.typeGroup}>
              {TYPE_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, editType === t && { backgroundColor: TYPE_COLORS[t], borderColor: TYPE_COLORS[t] }]}
                  onPress={() => setEditType(t)}
                >
                  <Text style={[styles.typeBtnText, editType === t && { color: '#fff' }]}>
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>备注</Text>
            <TextInput style={styles.modalInput} value={editNotes} onChangeText={setEditNotes} placeholder="选填" placeholderTextColor={Colors.mutedLight} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditItem(null)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Toast visible={visible} message={message} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.muted,
  },
  dayContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayDate: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  dayCount: {
    fontSize: Typography.xs,
    color: Colors.muted,
    fontWeight: Typography.regular,
  },
  dayBody: {
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemTime: {
    fontFamily: Typography.mono,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    minWidth: 40,
    paddingTop: 2,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: Typography.semibold,
  },
  itemLocation: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  itemNotes: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  typeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  typeBtnText: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.base,
    color: Colors.fg2,
  },
  modalSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: Typography.base,
    color: Colors.surface,
    fontWeight: Typography.semibold,
  },
});
