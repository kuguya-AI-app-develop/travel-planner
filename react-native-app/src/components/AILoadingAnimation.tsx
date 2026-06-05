import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { Colors, Typography, Spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AILoadingAnimationProps {
  currentStep: number; // 0: analyzing, 1: planning, 2: optimizing
  onCancel?: () => void;
  useVideo?: boolean;
}

const STEPS = [
  { key: 'analyzing', label: '分析需求中...', icon: 'search' as const },
  { key: 'planning', label: '规划行程中...', icon: 'map' as const },
  { key: 'optimizing', label: '优化方案中...', icon: 'flash' as const },
];

export function AILoadingAnimation({ currentStep, onCancel, useVideo = false }: AILoadingAnimationProps) {
  // 轨道旋转动画
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const rotate3 = useRef(new Animated.Value(0)).current;

  // 爪印跳动动画
  const pawScale = useRef(new Animated.Value(1)).current;

  // 光晕脉冲动画
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  // 视频引用
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // 轨道旋转
    const spin1 = Animated.loop(
      Animated.timing(rotate1, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    const spin2 = Animated.loop(
      Animated.timing(rotate2, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    );
    const spin3 = Animated.loop(
      Animated.timing(rotate3, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // 爪印跳动
    const pawBounce = Animated.loop(
      Animated.sequence([
        Animated.timing(pawScale, {
          toValue: 1.15,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pawScale, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );

    // 光晕脉冲
    const glowPulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    spin1.start();
    spin2.start();
    spin3.start();
    pawBounce.start();
    glowPulse.start();

    return () => {
      spin1.stop();
      spin2.stop();
      spin3.stop();
      pawBounce.stop();
      glowPulse.stop();
    };
  }, []);

  const spin1 = rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spin2 = rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const spin3 = rotate3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {useVideo ? (
        // 视频加载动画
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={require('../../assets/ai-plan-loading.mp4')}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay
            useNativeControls={false}
          />
        </View>
      ) : (
        // CSS 动画加载
        <>
          {/* 光晕背景 */}
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* 轨道动画 */}
          <View style={styles.orbitContainer}>
            {/* 外圈 */}
            <Animated.View
              style={[
                styles.orbitRing,
                styles.orbitRing1,
                { transform: [{ rotate: spin1 }] },
              ]}
            >
              <View style={[styles.orbitDot, { backgroundColor: Colors.accent }]} />
            </Animated.View>

            {/* 中圈 */}
            <Animated.View
              style={[
                styles.orbitRing,
                styles.orbitRing2,
                { transform: [{ rotate: spin2 }] },
              ]}
            >
              <View style={[styles.orbitDot, { backgroundColor: '#A855F7' }]} />
            </Animated.View>

            {/* 内圈 */}
            <Animated.View
              style={[
                styles.orbitRing,
                styles.orbitRing3,
                { transform: [{ rotate: spin3 }] },
              ]}
            >
              <View style={[styles.orbitDot, { backgroundColor: '#EC4899' }]} />
            </Animated.View>

            {/* 中心爪印 */}
            <Animated.View
              style={[
                styles.pawContainer,
                { transform: [{ scale: pawScale }] },
              ]}
            >
              <Ionicons name="paw" size={48} color={Colors.accent} />
            </Animated.View>
          </View>
        </>
      )}

      {/* 标题 */}
      <Text style={styles.title}>AI 正在为你策划旅行</Text>
      <Text style={styles.subtitle}>博美策划师正在精心规划你的完美旅程</Text>

      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* 步骤列表 */}
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => (
          <View
            key={step.key}
            style={[
              styles.stepItem,
              index === currentStep && styles.stepItemActive,
              index < currentStep && styles.stepItemDone,
            ]}
          >
            <View style={styles.stepIcon}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={10} color="#fff" />
              ) : index === currentStep ? (
                <Ionicons name={step.icon} size={10} color="#fff" />
              ) : (
                <View style={styles.stepDot} />
              )}
            </View>
            <Text style={styles.stepText}>{step.label}</Text>
          </View>
        ))}
      </View>

      {/* 取消按钮 */}
      {onCancel && (
        <View style={styles.cancelContainer}>
          <Text style={styles.cancelText} onPress={onCancel}>
            取消
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    position: 'relative',
    overflow: 'hidden',
  },
  videoContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
    borderRadius: 100,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.accent + '20',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -140 }, { translateY: -200 }],
  },
  orbitContainer: {
    width: 120,
    height: 120,
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 999,
    borderColor: Colors.border,
  },
  orbitRing1: {
    inset: 0,
  },
  orbitRing2: {
    inset: 12,
    borderColor: '#A855F730',
  },
  orbitRing3: {
    inset: 24,
    borderColor: '#EC489930',
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -4,
  },
  pawContainer: {
    position: 'absolute',
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.bold,
    color: Colors.fg,
    marginBottom: Spacing.sm,
    fontFamily: Typography.display,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    width: 200,
    marginBottom: 24,
  },
  progressBackground: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  stepsContainer: {
    width: 220,
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepItemActive: {},
  stepItemDone: {},
  stepIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  stepText: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  cancelContainer: {
    marginTop: Spacing.xl,
  },
  cancelText: {
    fontSize: Typography.sm,
    color: Colors.muted,
    textDecorationLine: 'underline',
  },
});
