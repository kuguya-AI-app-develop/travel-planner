import React from 'react';
import { TouchableOpacity, StyleSheet, View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../theme';

// 导入图片
const chatbotAvatar = require('../../assets/chatbot-avatar.jpg');

interface ChatFABProps {
  onPress: () => void;
  isOpen: boolean;
}

export function ChatFAB({ onPress, isOpen }: ChatFABProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isOpen ? (
        <Ionicons name="close" size={20} color={Colors.surface} />
      ) : (
        <Image source={chatbotAvatar} style={styles.avatarImage} />
      )}
      {!isOpen && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>汪</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    // 删除 overflow: 'hidden'
    ...Shadows.md,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  badge: {
    position: 'absolute',
    top: -2,  // 从-4改为-2
    right: -2,  // 从-4改为-2
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: '#FFFFFF', // 纯白色文字
  },
});
