import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const FLIGHT_CRITERIA = ['中转', '行李额度', '准点率', '舒适度'];

export default function FlightsScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleFlight = (id: number) => {
    dispatch({ type: 'TOGGLE_FLIGHT', payload: id });
  };

  const handleAddFlight = () => {
    const newFlight = {
      id: Date.now(),
      airline: '新航班',
      code: 'XX000',
      route: '出发→到达',
      dep: '00:00',
      arr: '00:00',
      price: 0,
      cls: '经济舱',
      status: 'compare' as const,
      selected: false,
      notes: {},
    };
    dispatch({ type: 'ADD_FLIGHT', payload: newFlight });
    showToast('已添加航班');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="机票对比" />

        <Text style={styles.hint}>
          勾选已确定的航班，价格将计入预算
        </Text>

        {state.flights.map((flight) => (
          <View key={flight.id} style={styles.card}>
            <View style={styles.cardTop}>
              <TouchableOpacity
                onPress={() => handleToggleFlight(flight.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  flight.selected && styles.checkboxSelected,
                ]}>
                  {flight.selected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.flightInfo}>
                <Text style={styles.airline}>
                  {flight.airline}{' '}
                  <Text style={styles.flightCode}>{flight.code}</Text>
                </Text>
                <Text style={styles.route}>
                  {flight.route} · {flight.dep}-{flight.arr} · {flight.cls}
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>¥{flight.price.toLocaleString()}</Text>
                <StatusBadge status={flight.status} />
              </View>
            </View>

            <View style={styles.criteria}>
              {FLIGHT_CRITERIA.map((criteria, index) => (
                <Text key={criteria} style={styles.criteriaItem}>
                  {criteria}: {flight.notes[index] || '—'}
                </Text>
              ))}
            </View>
          </View>
        ))}

        <AddButton label="添加航班" onPress={handleAddFlight} />

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
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  flightInfo: {
    flex: 1,
  },
  airline: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  flightCode: {
    fontSize: Typography.sm,
    color: Colors.muted,
    fontWeight: Typography.regular,
  },
  route: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  price: {
    fontFamily: Typography.mono,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  criteria: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  criteriaItem: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
});
