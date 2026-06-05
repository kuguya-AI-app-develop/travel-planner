import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { ListItem } from '../../src/components/ListItem';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useRouter } from 'expo-router';

export default function AIScreen() {
  const router = useRouter();

  const aiTools = [
    {
      icon: 'sparkles' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      title: 'AI 智能策划',
      desc: '输入需求，AI 自动生成旅行计划',
      onPress: () => router.push('/ai-plan'),
    },
    {
      icon: 'settings' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      title: 'AI 设置',
      desc: '配置 AI 服务商、模型和 API Key',
      onPress: () => router.push('/ai-settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="AI 助手"
          subtitle="智能旅行策划与设置"
        />

        <View style={styles.listContainer}>
          {aiTools.map((tool, index) => (
            <ListItem key={index} {...tool} />
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>使用说明</Text>
          <Text style={styles.infoText}>
            1. 先在 AI 设置中配置你的 API Key{'\n'}
            2. 进入 AI 智能策划，输入旅行需求{'\n'}
            3. AI 会根据你的偏好生成详细行程{'\n'}
            4. 生成结果可以直接应用到当前计划
          </Text>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  header: {
    paddingTop: 60, // 固定值，确保在刘海屏等设备上有足够间距
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
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
  listContainer: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    marginHorizontal: Spacing.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.sm,
    color: Colors.fg2,
    lineHeight: 20,
  },
});
