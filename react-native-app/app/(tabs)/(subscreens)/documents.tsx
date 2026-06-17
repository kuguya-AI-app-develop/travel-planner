import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Document } from '../../../src/store/types';

const STATUS_MAP: Record<string, { label: string; bgColor: string; textColor: string }> = {
  valid: { label: '有效', bgColor: Colors.success + '15', textColor: Colors.success },
  expiring: { label: '即将过期', bgColor: Colors.warn + '15', textColor: Colors.warn },
  expired: { label: '已过期', bgColor: Colors.danger + '15', textColor: Colors.danger },
  processing: { label: '办理中', bgColor: Colors.accent + '15', textColor: Colors.accent },
  none: { label: '未办理', bgColor: Colors.muted + '15', textColor: Colors.muted },
};

const TYPE_ICONS: Record<string, string> = {
  passport: 'document',
  visa: 'clipboard',
  insurance: 'shield',
  booking: 'document-text',
  other: 'attach',
};

const TYPE_COLORS: Record<string, string> = {
  passport: Colors.accent,
  visa: Colors.warn,
  insurance: Colors.success,
  booking: Colors.teal,
  other: Colors.muted,
};

const STATUS_OPTIONS = ['valid', 'expiring', 'expired', 'processing', 'none'] as const;

export default function DocumentsScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();
  const { visible, message, showToast, hideToast } = useToast();
  const [editItem, setEditItem] = useState<Document | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [editStatus, setEditStatus] = useState<Document['status']>('none');
  const [editNotes, setEditNotes] = useState('');

  const handleAddDocument = () => {
    const newDoc = {
      id: Date.now(),
      name: '新证件',
      type: 'other' as const,
      number: '',
      expiry: '',
      status: 'none' as const,
      notes: '',
    };
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
    showToast('已添加证件');
  };

  const handleOpenEdit = (doc: Document) => {
    setEditItem(doc);
    setEditName(doc.name);
    setEditNumber(doc.number);
    setEditExpiry(doc.expiry);
    setEditStatus(doc.status);
    setEditNotes(doc.notes);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: {
        ...editItem,
        name: editName,
        number: editNumber,
        expiry: editExpiry,
        status: editStatus,
        notes: editNotes,
      },
    });
    setEditItem(null);
    showToast('证件已更新');
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除证件', '确定要删除这个证件吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_DOCUMENT', payload: id });
        showToast('证件已删除');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="证件管理" />

        <Text style={styles.hint}>
          点击编辑证件，长按删除
        </Text>

        {plan.documents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无证件记录</Text>
          </View>
        ) : (
          plan.documents.map((doc) => {
            const status = STATUS_MAP[doc.status] || STATUS_MAP.none;
            const iconName = TYPE_ICONS[doc.type] || 'attach';
            const iconColor = TYPE_COLORS[doc.type] || Colors.muted;

            return (
              <TouchableOpacity
                key={doc.id}
                style={styles.card}
                onPress={() => handleOpenEdit(doc)}
                onLongPress={() => handleDelete(doc.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={iconName as any} size={18} color={iconColor} />
                  </View>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                    <Text style={[styles.statusText, { color: status.textColor }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                {doc.number && (
                  <View style={styles.row}>
                    <Text style={styles.label}>号码</Text>
                    <Text style={styles.value}>{doc.number}</Text>
                  </View>
                )}
                {doc.expiry && (
                  <View style={styles.row}>
                    <Text style={styles.label}>有效期</Text>
                    <Text style={styles.value}>{doc.expiry}</Text>
                  </View>
                )}
                {doc.notes && (
                  <View style={styles.row}>
                    <Text style={styles.label}>备注</Text>
                    <Text style={styles.value}>{doc.notes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <AddButton label="添加证件" onPress={handleAddDocument} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditItem(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>编辑证件</Text>

            <Text style={styles.modalLabel}>证件名称</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.modalLabel}>证件号码</Text>
            <TextInput style={styles.modalInput} value={editNumber} onChangeText={setEditNumber} placeholder="选填" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>有效期</Text>
            <TextInput style={styles.modalInput} value={editExpiry} onChangeText={setEditExpiry} placeholder="2028-03-15" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>状态</Text>
            <View style={styles.statusGroup}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusBtn, editStatus === s && styles.statusBtnActive]}
                  onPress={() => setEditStatus(s)}
                >
                  <Text style={[styles.statusBtnText, editStatus === s && styles.statusBtnTextActive]}>
                    {STATUS_MAP[s].label}
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
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
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
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  label: {
    minWidth: 48,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.mutedLight,
  },
  value: {
    fontSize: Typography.sm,
    color: Colors.fg,
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
  statusGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  statusBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  statusBtnText: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  statusBtnTextActive: {
    color: Colors.surface,
    fontWeight: Typography.semibold,
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
