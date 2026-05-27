import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/theme';
import { ListItem } from '../../src/components/ListItem';
import { useRouter } from 'expo-router';

export default function ToolsScreen() {
  const router = useRouter();

  const tools = [
    {
      icon: 'airplane' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      title: '机票对比',
      desc: '对比航班价格与服务',
      onPress: () => router.push('/flights'),
    },
    {
      icon: 'location' as const,
      iconColor: Colors.coral,
      iconBg: Colors.coral + '15',
      title: '目的地选择',
      desc: '评估各目的地综合评分',
      onPress: () => router.push('/destinations'),
    },
    {
      icon: 'bed' as const,
      iconColor: Colors.purple,
      iconBg: Colors.purple + '15',
      title: '酒店评分',
      desc: '对比酒店价格与服务',
      onPress: () => router.push('/hotels'),
    },
    {
      icon: 'wallet' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      title: '其他消费',
      desc: '记录门票、餐饮等消费',
      onPress: () => router.push('/expenses'),
    },
    {
      icon: 'list' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      title: '每日行程',
      desc: '规划每天的具体安排',
      onPress: () => router.push('/itinerary'),
    },
    {
      icon: 'checkbox' as const,
      iconColor: Colors.success,
      iconBg: Colors.success + '15',
      title: '行李清单',
      desc: '逐项检查已打包物品',
      onPress: () => router.push('/packing'),
    },
    {
      icon: 'document' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      title: '证件管理',
      desc: '护照、签证、保险有效期',
      onPress: () => router.push('/documents'),
    },
    {
      icon: 'sparkles' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      title: 'AI 智能策划',
      desc: 'AI 根据需求自动生成行程',
      onPress: () => router.push('/ai-plan'),
    },
    {
      icon: 'settings' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      title: 'AI 设置',
      desc: '配置 AI 服务商与 API Key',
      onPress: () => router.push('/ai-settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>工具箱</Text>
          <Text style={styles.subtitle}>旅行规划全部功能</Text>
        </View>

        <View style={styles.listContainer}>
          {tools.map((tool, index) => (
            <ListItem key={index} {...tool} />
          ))}
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
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
});
