import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
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
import { PLAN, BUDGET, COMMON } from '../../src/constants/strings';

export default function HomeScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const router = useRouter();
  const plan = getActivePlan();
  const [chatOpen, setChatOpen] = useState(false);

  // 防御性兜底：旧数据可能缺少新字段
  const flights = plan.flights || [];
  const destinations = plan.destinations || [];
  const hotels = plan.hotels || [];
  const expenses = plan.expenses || [];
  const checklistItems = plan.checklistItems || [];

  // 计算预算
  const selectedFlights = flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);
  const selectedHotels = hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + h.priceNum, 0);
  const selectedExpenses = expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);
  const total = flightTotal + hotelTotal + expenseTotal;

  // 计算待办完成
  const doneCount = checklistItems.filter(i => i.done).length;
  const totalCount = checklistItems.length;
  const donePercent = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0;

  const handlePlanSelect = (planId: string) => {
    dispatch({ type: 'SELECT_PLAN', payload: planId });
    showToast(PLAN.SWITCH_SUCCESS.replace('{name}', state.plans[planId].name));
  };

  const handleCreatePlan = () => {
    const id = 'plan-' + (Object.keys(state.plans).length + 1);
    dispatch({
      type: 'CREATE_PLAN',
      payload: { id, name: PLAN.NEW_PLAN.replace('{count}', String(Object.keys(state.plans).length + 1)) },
    });
    showToast(PLAN.CREATE_SUCCESS);
  };

  const tools = [
    {
      icon: 'calendar' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      name: '行程日历',
      desc: `${plan.trips.length} 个行程`,
      count: plan.trips.length,
      onPress: () => router.navigate('/calendar'),
    },
    {
      icon: 'airplane' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      name: '机票对比',
      desc: `${flights.length} 个航班`,
      count: flights.length,
      onPress: () => router.navigate('/(tabs)/(subscreens)/flights'),
    },
    {
      icon: 'location' as const,
      iconColor: Colors.coral,
      iconBg: Colors.coral + '15',
      name: '目的地',
      desc: `${destinations.length} 个目的地`,
      count: destinations.length,
      onPress: () => router.navigate('/(tabs)/(subscreens)/destinations'),
    },
    {
      icon: 'bed' as const,
      iconColor: Colors.purple,
      iconBg: Colors.purple + '15',
      name: '酒店评分',
      desc: `${hotels.length} 家酒店`,
      count: hotels.length,
      onPress: () => router.navigate('/(tabs)/(subscreens)/hotels'),
    },
    {
      icon: 'wallet' as const,
      iconColor: Colors.warn,
      iconBg: Colors.warn + '15',
      name: '其他消费',
      desc: `${expenses.length} 项消费`,
      count: expenses.length,
      onPress: () => router.navigate('/(tabs)/(subscreens)/expenses'),
    },
    {
      icon: 'list' as const,
      iconColor: Colors.accent,
      iconBg: Colors.accent + '15',
      name: '每日行程',
      desc: `${plan.itineraryItems.length} 项活动`,
      count: plan.itineraryItems.length,
      onPress: () => router.navigate('/(tabs)/(subscreens)/itinerary'),
    },
    {
      icon: 'checkbox' as const,
      iconColor: Colors.success,
      iconBg: Colors.success + '15',
      name: '行李清单',
      desc: `${plan.packingItems.filter(i => i.packed).length}/${plan.packingItems.length} 已打包`,
      onPress: () => router.navigate('/(tabs)/(subscreens)/packing'),
    },
    {
      icon: 'document' as const,
      iconColor: Colors.teal,
      iconBg: Colors.teal + '15',
      name: '证件管理',
      desc: `${plan.documents.length} 个证件`,
      count: plan.documents.length,
      onPress: () => router.navigate('/(tabs)/(subscreens)/documents'),
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
            label={BUDGET.TOTAL}
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
        animationType="slide"
        onRequestClose={() => setChatOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setChatOpen(false)}>
          <Pressable style={styles.chatContainer} onPress={() => {}}>
            <ChatPanel visible={true} onClose={() => setChatOpen(false)} />
          </Pressable>
        </Pressable>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chatContainer: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});
