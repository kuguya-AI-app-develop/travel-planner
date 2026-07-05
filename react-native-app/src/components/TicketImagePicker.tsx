import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { CommonModal } from './CommonModal';
import { recognizeTicket, TicketInfo, RecognitionStatus } from '../utils/ticketOcr';
import { TICKET_SCAN } from '../constants/strings';

interface TicketImagePickerProps {
  visible: boolean;
  onCancel: () => void;
  onRecognized: (ticketInfo: TicketInfo) => void;
}

export function TicketImagePicker({
  visible,
  onCancel,
  onRecognized,
}: TicketImagePickerProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // 重置状态
  const resetState = () => {
    setImageUri(null);
    setStatus('idle');
    setError(null);
  };

  // 关闭弹窗
  const handleCancel = () => {
    resetState();
    onCancel();
  };

  // 显示图片来源选择
  const handleShowImageSource = () => {
    Alert.alert(
      '选择图片来源',
      '请选择机票截图的来源',
      [
        { text: TICKET_SCAN.CANCEL, style: 'cancel' },
        { text: TICKET_SCAN.PICK_FROM_LIBRARY, onPress: handlePickFromLibrary },
        { text: TICKET_SCAN.TAKE_PHOTO, onPress: handleTakePhoto },
      ]
    );
  };

  // 选择图片（从相册）
  const handlePickFromLibrary = async () => {
    try {
      // 请求相册权限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          TICKET_SCAN.LIBRARY_PERMISSION,
          '请在设置中开启相册权限',
          [
            { text: TICKET_SCAN.CANCEL, style: 'cancel' },
            { text: TICKET_SCAN.OPEN_SETTINGS, onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setStatus('idle');
        setError(null);
      }
    } catch (err) {
      console.error('选择图片失败:', err);
      setError('选择图片失败，请重试');
    }
  };

  // 拍照
  const handleTakePhoto = async () => {
    try {
      // 请求相机权限
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          TICKET_SCAN.CAMERA_PERMISSION,
          '请在设置中开启相机权限',
          [
            { text: TICKET_SCAN.CANCEL, style: 'cancel' },
            { text: TICKET_SCAN.OPEN_SETTINGS, onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      // 拍照
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setStatus('idle');
        setError(null);
      }
    } catch (err) {
      console.error('拍照失败:', err);
      setError('拍照失败，请重试');
    }
  };

  // 识别图片
  const handleRecognize = async () => {
    if (!imageUri) {
      setError('请先选择或拍摄机票图片');
      return;
    }

    try {
      setStatus('recognizing');
      setError(null);

      const ticketInfo = await recognizeTicket(imageUri);

      // 识别成功后重置状态
      resetState();
      onRecognized(ticketInfo);
    } catch (err: any) {
      console.error('识别失败:', err);
      setStatus('failed');
      setError(err.message || TICKET_SCAN.SCAN_FAILED);
    }
  };

  return (
    <CommonModal
      visible={visible}
      title={TICKET_SCAN.SCAN}
      onCancel={handleCancel}
      onSave={handleRecognize}
      saveText={TICKET_SCAN.RECOGNIZE}
      saveDisabled={!imageUri || status === 'recognizing'}
    >
      <View style={styles.container}>
        {/* 支持类型提示 */}
        <View style={styles.supportedContainer}>
          <Text style={styles.supportedText}>{TICKET_SCAN.SUPPORTED_TYPES}</Text>
          <Text style={styles.supportedHint}>{TICKET_SCAN.SUPPORTED_HINT}</Text>
        </View>

        {/* 图片预览区域 */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={imageUri ? undefined : handleShowImageSource}
          activeOpacity={imageUri ? 1 : 0.7}
          disabled={status === 'recognizing'}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="cloud-upload-outline" size={48} color={Colors.muted} />
              <Text style={styles.placeholderText}>{TICKET_SCAN.HINT}</Text>
            </View>
          )}

          {/* 加载遮罩 */}
          {status === 'recognizing' && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>{TICKET_SCAN.SCANNING}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 错误提示 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </CommonModal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  supportedContainer: {
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.bgDeep,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  supportedText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  supportedHint: {
    fontSize: Typography.xs,
    color: Colors.muted,
    lineHeight: 18,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
  },
  placeholderText: {
    fontSize: Typography.sm,
    color: Colors.muted,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.surface,
    fontSize: Typography.sm,
    marginTop: Spacing.sm,
  },
  errorContainer: {
    width: '100%',
    padding: Spacing.md,
    backgroundColor: '#FFF0F0',
    borderRadius: Radius.sm,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sm,
    color: '#D32F2F',
    textAlign: 'center',
  },
});
