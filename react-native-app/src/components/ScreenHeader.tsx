import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

const psyduckImage = require('../../assets/psyduck.png');

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showImage?: boolean;
}

export function ScreenHeader({ title, subtitle, showImage = true }: ScreenHeaderProps) {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showImage && (
        <Image source={psyduckImage} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    overflow: 'visible',
    minHeight: 140, // 确保有足够的空间显示图片
  },
  container: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  textContainer: {
    // title区域，不受图片影响
  },
  title: {
    fontFamily: Typography.display,
    fontSize: Typography['4xl'],
    fontWeight: Typography.extrabold,
    letterSpacing: -0.03,
    color: Colors.fg,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
  image: {
    position: 'absolute',
    right: -20, // 向右偏移，可以超出边界
    top: 10, // 向上偏移，可以超出header
    width: 180,
    height: 180,
    resizeMode: 'contain',
    zIndex: -1, // 放在文字后面，避免遮挡
    opacity: 0.8, // 稍微透明，避免太抢眼
  },
});
