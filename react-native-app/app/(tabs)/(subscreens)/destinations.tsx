import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { ScoreBar } from '../../../src/components/ScoreBar';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Destination } from '../../../src/store/types';

const DEST_CRITERIA = ['景色', '文化', '美食', '交通便利', '安全性', '性价比'];

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

  const handleAddDest = () => {
    const newDest = {
      id: Date.now(),
      name: '新目的地',
      country: '国家',
      notes: '',
      scores: DEST_CRITERIA.map(() => 3),
      selected: false,
    };
    dispatch({ type: 'ADD_DEST', payload: newDest });
    showToast('已添加目的地');
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
    showToast('目的地已更新');
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除目的地', '确定要删除这个目的地吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_DEST', payload: id });
        showToast('目的地已删除');
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

        {plan.destinations.map((dest) => {
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

              <View style={styles.scores}>
                {DEST_CRITERIA.map((criteria, index) => (
                  <ScoreBar
                    key={criteria}
                    label={criteria}
                    score={dest.scores[index]}
                    color={Colors.coral}
                  />
                ))}
              </View>

              <View style={styles.overall}>
                <Text style={styles.overallLabel}>综合评分</Text>
                <Text style={styles.overallScore}>{avg}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <AddButton label="添加目的地" onPress={handleAddDest} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditItem(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>编辑目的地</Text>

            <Text style={styles.modalLabel}>名称</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.modalLabel}>国家</Text>
            <TextInput style={styles.modalInput} value={editCountry} onChangeText={setEditCountry} />

            <Text style={styles.modalLabel}>备注</Text>
            <TextInput style={[styles.modalInput, { minHeight: 60 }]} value={editNotes} onChangeText={setEditNotes} multiline />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditItem(null)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveEdit}>
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
  scores: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
