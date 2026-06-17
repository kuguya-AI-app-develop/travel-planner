import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { useApp } from '../store/AppContext';
import { PLAN_STATUSES, PlanStatus } from '../store/types';

interface PlanSwitcherProps {
  onPlanSelect: (planId: string) => void;
  onCreatePlan: () => void;
}

export function PlanSwitcher({ onPlanSelect, onCreatePlan }: PlanSwitcherProps) {
  const { state, getActivePlan, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const plan = getActivePlan();
  const status = PLAN_STATUSES[plan.status];

  const handleDeletePlan = (planId: string) => {
    const planName = state.plans[planId]?.name || '此计划';
    Alert.alert(
      '确认删除',
      `确定要删除"${planName}"吗？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_PLAN', payload: planId });
          }
        },
      ]
    );
  };

  const handleOpenEdit = (planId: string) => {
    const planData = state.plans[planId];
    if (planData) {
      setEditPlanId(planId);
      setEditName(planData.name);
    }
  };

  const handleSaveEdit = () => {
    if (editPlanId && editName.trim()) {
      dispatch({ type: 'UPDATE_PLAN', payload: { id: editPlanId, name: editName.trim() } });
      setEditPlanId(null);
    }
  };

  const handleChangeStatus = (planId: string, newStatus: PlanStatus) => {
    dispatch({ type: 'UPDATE_PLAN_STATUS', payload: { id: planId, status: newStatus } });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar" size={16} color={Colors.accent} />
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={10}
          color={Colors.muted}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {Object.values(state.plans).map((p) => {
            const s = PLAN_STATUSES[p.status];
            return (
              <View key={p.id} style={styles.dropdownItemContainer}>
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    p.id === state.activePlanId && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    onPlanSelect(p.id);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemName} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.color + '20' }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>
                      {s.label}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.planActions}>
                  <TouchableOpacity
                    style={styles.planActionButton}
                    onPress={() => handleOpenEdit(p.id)}
                  >
                    <Ionicons name="create-outline" size={16} color={Colors.muted} />
                  </TouchableOpacity>
                  {Object.keys(state.plans).length > 1 && (
                    <TouchableOpacity
                      style={styles.planActionButton}
                      onPress={() => handleDeletePlan(p.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onCreatePlan();
              setIsOpen(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownItemName, { color: Colors.accent }]}>
              + 新建计划
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 编辑计划名称弹窗 */}
      <Modal visible={!!editPlanId} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditPlanId(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>编辑计划</Text>

            <Text style={styles.modalLabel}>计划名称</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="输入计划名称"
              placeholderTextColor={Colors.mutedLight}
            />

            <Text style={styles.modalLabel}>计划状态</Text>
            <View style={styles.statusGroup}>
              {(Object.keys(PLAN_STATUSES) as PlanStatus[]).map((s) => {
                const statusInfo = PLAN_STATUSES[s];
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      editPlanId && state.plans[editPlanId]?.status === s && {
                        backgroundColor: statusInfo.color,
                        borderColor: statusInfo.color,
                      },
                    ]}
                    onPress={() => editPlanId && handleChangeStatus(editPlanId, s)}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        editPlanId && state.plans[editPlanId]?.status === s && { color: '#fff' },
                      ]}
                    >
                      {statusInfo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditPlanId(null)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  planName: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  dropdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dropdownItemActive: {
    backgroundColor: Colors.accent + '10',
  },
  dropdownItemName: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    marginRight: Spacing.sm,
  },
  planActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.md,
    flexShrink: 0,
  },
  planActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
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
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  statusGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  statusBtnText: {
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
