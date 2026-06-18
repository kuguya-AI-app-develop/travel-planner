import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { SummaryCard } from '../../src/components/SummaryCard';
import { Checklist } from '../../src/components/Checklist';
import { Toast } from '../../src/components/Toast';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useToast } from '../../src/hooks/useToast';
import { BUDGET, COMMON } from '../../src/constants/strings';

export default function BudgetScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();

  const selectedFlights = plan.flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);
  const selectedHotels = plan.hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + h.priceNum, 0);
  const selectedExpenses = plan.expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);
  const total = flightTotal + hotelTotal + expenseTotal;

  const selectedDests = plan.destinations.filter(d => d.selected);

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
    showToast(COMMON.ADD + '待办事项');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="预算总结"
          subtitle="汇总所有已勾选项目费用"
        />

        <View style={styles.summaryGrid}>
          <SummaryCard
            label={BUDGET.TOTAL}
            value={`¥${total.toLocaleString()}`}
            color="accent"
          />
          <SummaryCard
            label={BUDGET.FLIGHT}
            value={`¥${flightTotal.toLocaleString()}`}
            note={`${selectedFlights.length} 个航班`}
            color="success"
          />
          <SummaryCard
            label={BUDGET.HOTEL}
            value={`¥${hotelTotal.toLocaleString()}`}
            note={`${selectedHotels.length} 家酒店`}
            color="warn"
          />
          <SummaryCard
            label={BUDGET.EXPENSE}
            value={`¥${expenseTotal.toLocaleString()}`}
            note={`${selectedExpenses.length} 项`}
            color="coral"
          />
        </View>

        {selectedDests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{BUDGET.SELECTED_DEST}</Text>
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
            <Text style={styles.sectionTitle}>{BUDGET.CHECKLIST}</Text>
          </View>
          <Checklist
            items={plan.checklistItems}
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
