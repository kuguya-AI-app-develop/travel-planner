import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

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

export default function DocumentsScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();
  const { visible, message, showToast, hideToast } = useToast();

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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="证件管理" />

        <Text style={styles.hint}>
          记录护照、签证、保险信息
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
              <View key={doc.id} style={styles.card}>
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
              </View>
            );
          })
        )}

        <AddButton label="添加证件" onPress={handleAddDocument} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

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
});
