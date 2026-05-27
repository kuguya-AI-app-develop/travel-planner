import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { SummaryCard } from '../../src/components/SummaryCard';
import { Checklist } from '../../src/components/Checklist';
import { Toast } from '../../src/components/Toast';
import { useToast } from '../../src/hooks/useToast';

export default function BudgetScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();

  const selectedFlights = state.flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);
  const selectedHotels = state.hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + h.priceNum, 0);
  const selectedExpenses = state.expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);
  const total = flightTotal + hotelTotal + expenseTotal;

  const selectedDests = state.destinations.filter(d => d.selected);

  const handleToggleCheck = (id: number) => {
    dispatch({ type: 'TOGGLE_CHECK', payload: id });
  };

  const handleAddCheck = () => {
    const newItem = {
      id: Date.now(),
      text: '新待办事项',
      done: false,
    };
    dispatch({ type: 'ADD_CHECK', payload: newItem });
    showToast('已添加待办事项');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>预算总结</Text>
          <Text style={styles.subtitle}>汇总所有已勾选项目费用</Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="总费用"
            value={`¥${total.toLocaleString()}`}
            color="accent"
          />
          <SummaryCard
            label="机票"
            value={`¥${flightTotal.toLocaleString()}`}
            note={`${selectedFlights.length} 个航班`}
            color="success"
          />
          <SummaryCard
            label="酒店"
            value={`¥${hotelTotal.toLocaleString()}`}
            note={`${selectedHotels.length} 家酒店`}
            color="warn"
          />
          <SummaryCard
            label="其他消费"
            value={`¥${expenseTotal.toLocaleString()}`}
            note={`${selectedExpenses.length} 项`}
            color="coral"
          />
        </View>

        {selectedDests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>已选目的地</Text>
            </View>
            {selectedDests.map((dest) => (
              <View key={dest.id} style={styles.destItem}>
                <Text style={styles.destName}>
                  {dest.name}，{dest.country}
                </Text>
                <Text style={styles.destNotes}>{dest.notes}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>待办清单</Text>
          </View>
          <Checklist
            items={state.checklistItems}
            onToggle={handleToggleCheck}
            onAdd={handleAddCheck}
          />
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

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
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
  },
  destItem: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  destName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  destNotes: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
});
