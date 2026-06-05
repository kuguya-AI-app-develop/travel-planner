import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { PlanSwitcher } from '../../src/components/PlanSwitcher';
import { SummaryCard } from '../../src/components/SummaryCard';
import { ToolCard } from '../../src/components/ToolCard';
import { ChatFAB } from '../../src/components/ChatFAB';
import { ChatPanel } from '../../src/components/ChatPanel';
import { Toast } from '../../src/components/Toast';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useToast } from '../../src/hooks/useToast';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const router = useRouter();
  const plan = getActivePlan();
  const [chatOpen, setChatOpen] = useState(false);

  // 计算预算
  const selectedFlights = state.flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);
  const selectedHotels = state.hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + h.priceNum, 0);
  const selectedExpenses = state.expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);
  const total = flightTotal + hotelTotal + expenseTotal;

  // 计算待办完成
  const doneCount = state.checklistItems.filter(i => i.done).length;
  const totalCount = state.checklistItems.length;
  const donePercent = Math.round(doneCount / totalCount * 100);

  const handlePlanSelect = (planId: string) => {
    dispatch({ type: 'SELECT_PLAN', payload: planId });
    showToast('已切换到：' + state.plans[planId].name);
  };

  const handleCreatePlan = () => {
    const id = 'plan-' + (Object.keys(state.plans).length + 1);
    dispatch({
      type: 'CREATE_PLAN',
      payload: { id, name: '新计划 ' + (Object.keys(state.plans).length + 1) },
    });
    showToast('已创建新计划');
  };

  const tools = [
    {
      icon: 'calendar' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      name: '行程日历',
      desc: `${plan.trips.length} 个行程`,
      count: plan.trips.length,
      onPress: () => router.push('/calendar'),
    },
    {
      icon: 'airplane' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      name: '机票对比',
      desc: `${state.flights.length} 个航班`,
      count: state.flights.length,
      onPress: () => router.push('/(tabs)/(subscreens)/flights'),
    },
    {
      icon: 'location' as const,
      iconColor: Colors.coral,
      iconBg: Colors.coral + '15',
      name: '目的地',
      desc: `${state.destinations.length} 个目的地`,
      count: state.destinations.length,
      onPress: () => router.push('/(tabs)/(subscreens)/destinations'),
    },
    {
      icon: 'bed' as const,
      iconColor: Colors.purple,
      iconBg: Colors.purple + '15',
      name: '酒店评分',
      desc: `${state.hotels.length} 家酒店`,
      count: state.hotels.length,
      onPress: () => router.push('/(tabs)/(subscreens)/hotels'),
    },
    {
      icon: 'wallet' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      name: '其他消费',
      desc: `${state.expenses.length} 项消费`,
      count: state.expenses.length,
      onPress: () => router.push('/(tabs)/(subscreens)/expenses'),
    },
    {
      icon: 'list' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      name: '每日行程',
      desc: `${plan.itineraryItems.length} 项活动`,
      count: plan.itineraryItems.length,
      onPress: () => router.push('/(tabs)/(subscreens)/itinerary'),
    },
    {
      icon: 'checkbox' as const,
      iconColor: Colors.success,
      iconBg: Colors.success + '15',
      name: '行李清单',
      desc: `${plan.packingItems.filter(i => i.packed).length}/${plan.packingItems.length} 已打包`,
      onPress: () => router.push('/(tabs)/(subscreens)/packing'),
    },
    {
      icon: 'document' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      name: '证件管理',
      desc: `${plan.documents.length} 个证件`,
      count: plan.documents.length,
      onPress: () => router.push('/(tabs)/(subscreens)/documents'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="旅行策划"
          subtitle="管理你的旅行计划"
        />

        <PlanSwitcher
          onPlanSelect={handlePlanSelect}
          onCreatePlan={handleCreatePlan}
        />

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="总预算"
            value={`¥${total.toLocaleString()}`}
            note="机票+酒店+消费"
            color="accent"
          />
          <SummaryCard
            label="待办完成"
            value={`${doneCount}/${totalCount}`}
            note={`${donePercent}% 已完成`}
            color="success"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>功能模块</Text>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 聊天FAB */}
      <ChatFAB onPress={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />

      {/* 聊天面板 - 使用Modal实现点击外部关闭 */}
      <Modal
        visible={chatOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setChatOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setChatOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.chatContainer}>
                <ChatPanel visible={true} onClose={() => setChatOpen(false)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Toast visible={visible} message={message} onHide={hideToast} />
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
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    width: '90%',
    height: '70%',
    maxHeight: 500,
  },
});
