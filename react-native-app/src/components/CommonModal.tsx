import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface CommonModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saveText?: string;
  cancelText?: string;
  saveDisabled?: boolean;
  children: React.ReactNode;
  scrollView?: boolean;
}

export function CommonModal({
  visible,
  title,
  onCancel,
  onSave,
  saveText = '保存',
  cancelText = '取消',
  saveDisabled = false,
  children,
  scrollView = true,
}: CommonModalProps) {
  const content = scrollView ? (
    <ScrollView showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.content}>
            {content}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saveDisabled && styles.saveBtnDisabled]}
              onPress={onSave}
              activeOpacity={0.7}
              disabled={saveDisabled}
            >
              <Text style={[styles.saveText, saveDisabled && styles.saveTextDisabled]}>
                {saveText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// 表单字段组件
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, required, children }: FormFieldProps) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>
        {label}
        {required && <Text style={fieldStyles.required}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

// 输入框组件
interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
}: FormInputProps) {
  return (
    <TextInput
      style={[inputStyles.input, multiline && { minHeight: 60 * numberOfLines }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.mutedLight}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

// 需要导入 TextInput
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    maxHeight: 400,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: Typography.base,
    color: Colors.fg2,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Colors.muted,
  },
  saveText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.surface,
  },
  saveTextDisabled: {
    color: Colors.surface,
  },
});

const fieldStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  required: {
    color: Colors.danger,
  },
});

const inputStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
});
