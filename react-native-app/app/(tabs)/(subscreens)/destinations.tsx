import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StarRating } from '../../../src/components/StarRating';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Destination } from '../../../src/store/types';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { DESTINATION, EMPTY_STATE } from '../../../src/constants/strings';

export default function DestinationsScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();
  const [editItem, setEditItem] = useState<Destination | null>(null);
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleToggleDest = (id: number) => {
    dispatch({ type: 'TOGGLE_DEST', payload: id });
  };

  const handleRateDest = (destId: number, critIdx: number, value: number) => {
    dispatch({
      type: 'RATE_DEST',
      payload: { destId, critIdx, value },
    });
  };

  const handleAddDest = () => {
    const newDest = {
      id: Date.now(),
      name: '新目的地',
      country: '国家',
      notes: '',
      scores: DESTINATION.CRITERIA.map(() => 3),
      selected: false,
    };
    dispatch({ type: 'ADD_DEST', payload: newDest });
    showToast(DESTINATION.ADD_SUCCESS);
  };

  const handleOpenEdit = (dest: Destination) => {
    setEditItem(dest);
    setEditName(dest.name);
    setEditCountry(dest.country);
    setEditNotes(dest.notes);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    dispatch({
      type: 'UPDATE_DEST',
      payload: { ...editItem, name: editName, country: editCountry, notes: editNotes },
    });
    setEditItem(null);
    showToast(DESTINATION.EDIT_SUCCESS);
  };

  const handleDelete = (id: number) => {
    Alert.alert(DESTINATION.DELETE_CONFIRM.split('？')[0], DESTINATION.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_DEST', payload: id });
        showToast(DESTINATION.DELETE_SUCCESS);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="目的地选择" />

        <Text style={styles.hint}>
          点击编辑目的地，长按删除
        </Text>

        {plan.destinations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{EMPTY_STATE.DESTINATION.TEXT}</Text>
            <Text style={styles.emptyHint}>{EMPTY_STATE.DESTINATION.HINT}</Text>
          </View>
        ) : (
          plan.destinations.map((dest) => {
          const avg = (dest.scores.reduce((a, b) => a + b, 0) / dest.scores.length).toFixed(1);

          return (
            <TouchableOpacity
              key={dest.id}
              style={styles.card}
              onPress={() => handleOpenEdit(dest)}
              onLongPress={() => handleDelete(dest.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => handleToggleDest(dest.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    dest.selected && styles.checkboxSelected,
                  ]}>
                    {dest.selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.destInfo}>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <Text style={styles.destCountry}>{dest.country}</Text>
                </View>
              </View>

              {dest.notes && (
                <Text style={styles.destNotes}>{dest.notes}</Text>
              )}

              <View style={styles.ratings}>
                {DESTINATION.CRITERIA.map((criteria, index) => (
                  <View key={criteria} style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>{criteria}</Text>
                    <StarRating
                      rating={dest.scores[index]}
                      onRate={(value) => handleRateDest(dest.id, index, value)}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.overall}>
                <Text style={styles.overallLabel}>{DESTINATION.OVERALL_SCORE}</Text>
                <Text style={styles.overallScore}>{avg}</Text>
              </View>
            </TouchableOpacity>
          );
        })
        )}

        <AddButton label={DESTINATION.ADD} onPress={handleAddDest} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={!!editItem}
        title={DESTINATION.EDIT}
        onCancel={() => setEditItem(null)}
        onSave={handleSaveEdit}
      >
        <FormField label={DESTINATION.NAME}>
          <FormInput value={editName} onChangeText={setEditName} />
        </FormField>

        <FormField label={DESTINATION.COUNTRY}>
          <FormInput value={editCountry} onChangeText={setEditCountry} />
        </FormField>

        <FormField label={DESTINATION.NOTES}>
          <FormInput
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder={DESTINATION.NOTES_PLACEHOLDER}
            multiline
            numberOfLines={3}
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
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: Typography.sm,
    color: Colors.mutedLight,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  destInfo: {
    flex: 1,
  },
  destName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  destCountry: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  destNotes: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  ratings: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingLabel: {
    minWidth: 28,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  overallLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  overallScore: {
    fontFamily: Typography.mono,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.coral,
  },
});
