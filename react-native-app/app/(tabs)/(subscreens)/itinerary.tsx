import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { ItineraryItem } from '../../../src/store/types';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { ITINERARY, EMPTY_STATE } from '../../../src/constants/strings';

const TYPE_LABELS: Record<string, string> = {
  sight: ITINERARY.TYPES.sight,
  food: ITINERARY.TYPES.food,
  transport: ITINERARY.TYPES.transport,
  hotel: ITINERARY.TYPES.hotel,
  other: ITINERARY.TYPES.other,
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
      showToast(ITINERARY.TITLE_REQUIRED);
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
      showToast(ITINERARY.EDIT_SUCCESS);
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
      showToast(ITINERARY.ADD_SUCCESS);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(ITINERARY.DELETE_CONFIRM.split('？')[0], ITINERARY.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_ITINERARY', payload: id });
        showToast(ITINERARY.DELETE_SUCCESS);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="每日行程" />

        <Text style={styles.hint}>
          {ITINERARY.HINT}
        </Text>

        {dates.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{EMPTY_STATE.ITINERARY.TEXT}</Text>
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

        <AddButton label={ITINERARY.ADD} onPress={handleOpenAdd} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 添加/编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={!!editItem || editTitle !== ''}
        title={editItem ? ITINERARY.EDIT : ITINERARY.ADD}
        onCancel={() => setEditItem(null)}
        onSave={handleSave}
      >
        <FormField label={ITINERARY.DATE}>
          <FormInput
            value={editDate}
            onChangeText={setEditDate}
            placeholder={ITINERARY.DATE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={ITINERARY.TIME}>
          <FormInput
            value={editTime}
            onChangeText={setEditTime}
            placeholder={ITINERARY.TIME_PLACEHOLDER}
          />
        </FormField>

        <FormField label={ITINERARY.TITLE} required>
          <FormInput
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder={ITINERARY.TITLE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={ITINERARY.LOCATION}>
          <FormInput
            value={editLocation}
            onChangeText={setEditLocation}
            placeholder={ITINERARY.LOCATION_PLACEHOLDER}
          />
        </FormField>

        <FormField label={ITINERARY.TYPE}>
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
        </FormField>

        <FormField label={ITINERARY.NOTES}>
          <FormInput
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder={ITINERARY.NOTES_PLACEHOLDER}
          />
        </FormField>
      </CommonModal>

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
  typeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
});
