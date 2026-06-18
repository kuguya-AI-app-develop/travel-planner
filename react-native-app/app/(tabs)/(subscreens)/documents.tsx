import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Document } from '../../../src/store/types';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { DOCUMENT } from '../../../src/constants/strings';

const STATUS_MAP: Record<string, { label: string; bgColor: string; textColor: string }> = {
  valid: { label: DOCUMENT.STATUS_MAP.valid, bgColor: Colors.success + '15', textColor: Colors.success },
  expiring: { label: DOCUMENT.STATUS_MAP.expiring, bgColor: Colors.warn + '15', textColor: Colors.warn },
  expired: { label: DOCUMENT.STATUS_MAP.expired, bgColor: Colors.danger + '15', textColor: Colors.danger },
  processing: { label: DOCUMENT.STATUS_MAP.processing, bgColor: Colors.accent + '15', textColor: Colors.accent },
  none: { label: DOCUMENT.STATUS_MAP.none, bgColor: Colors.muted + '15', textColor: Colors.muted },
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
    showToast(DOCUMENT.ADD_SUCCESS);
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
    showToast(DOCUMENT.EDIT_SUCCESS);
  };

  const handleDelete = (id: number) => {
    Alert.alert(DOCUMENT.DELETE_CONFIRM.split('？')[0], DOCUMENT.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_DOCUMENT', payload: id });
        showToast(DOCUMENT.DELETE_SUCCESS);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="证件管理" />

        <Text style={styles.hint}>
          {DOCUMENT.HINT}
        </Text>

        {plan.documents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{DOCUMENT.NO_DATA}</Text>
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
                    <Text style={styles.label}>{DOCUMENT.NUMBER}</Text>
                    <Text style={styles.value}>{doc.number}</Text>
                  </View>
                )}
                {doc.expiry && (
                  <View style={styles.row}>
                    <Text style={styles.label}>{DOCUMENT.EXPIRY}</Text>
                    <Text style={styles.value}>{doc.expiry}</Text>
                  </View>
                )}
                {doc.notes && (
                  <View style={styles.row}>
                    <Text style={styles.label}>{DOCUMENT.NOTES}</Text>
                    <Text style={styles.value}>{doc.notes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <AddButton label={DOCUMENT.ADD} onPress={handleAddDocument} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={!!editItem}
        title={DOCUMENT.EDIT}
        onCancel={() => setEditItem(null)}
        onSave={handleSaveEdit}
      >
        <FormField label={DOCUMENT.NAME}>
          <FormInput value={editName} onChangeText={setEditName} />
        </FormField>

        <FormField label={DOCUMENT.NUMBER}>
          <FormInput
            value={editNumber}
            onChangeText={setEditNumber}
            placeholder={DOCUMENT.NUMBER_PLACEHOLDER}
          />
        </FormField>

        <FormField label={DOCUMENT.EXPIRY}>
          <FormInput
            value={editExpiry}
            onChangeText={setEditExpiry}
            placeholder={DOCUMENT.EXPIRY_PLACEHOLDER}
          />
        </FormField>

        <FormField label={DOCUMENT.STATUS}>
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
        </FormField>

        <FormField label={DOCUMENT.NOTES}>
          <FormInput
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder={DOCUMENT.NOTES_PLACEHOLDER}
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
  statusGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
});
