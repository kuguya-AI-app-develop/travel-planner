import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  visible,
  message = '加载中...',
  transparent = true,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={transparent} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.accent} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

// 内联Loading（不使用Modal）
interface InlineLoadingProps {
  visible: boolean;
  message?: string;
}

export function InlineLoading({ visible, message }: InlineLoadingProps) {
  if (!visible) return null;

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color={Colors.accent} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
}

// 按钮Loading状态
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

export function ButtonLoading({ loading, children }: ButtonLoadingProps) {
  return (
    <View style={styles.buttonContainer}>
      {loading && (
        <View style={styles.buttonLoadingOverlay}>
          <ActivityIndicator size="small" color={Colors.surface} />
        </View>
      )}
      <View style={[loading && styles.buttonDisabled]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.base,
    color: Colors.fg,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  inlineMessage: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  buttonContainer: {
    position: 'relative',
  },
  buttonLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
