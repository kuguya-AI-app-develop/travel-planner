import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Flight } from '../../../src/store/types';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { FLIGHT, EMPTY_STATE } from '../../../src/constants/strings';

export default function FlightsScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();
  const [editItem, setEditItem] = useState<Flight | null>(null);
  const [editAirline, setEditAirline] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editRoute, setEditRoute] = useState('');
  const [editDep, setEditDep] = useState('');
  const [editArr, setEditArr] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCls, setEditCls] = useState('');

  const isValidTime = (time: string): boolean => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

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
    showToast(FLIGHT.ADD_SUCCESS);
  };

  const handleOpenEdit = (flight: Flight) => {
    setEditItem(flight);
    setEditAirline(flight.airline);
    setEditCode(flight.code);
    setEditRoute(flight.route);
    setEditDep(flight.dep);
    setEditArr(flight.arr);
    setEditPrice(String(flight.price));
    setEditCls(flight.cls);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    if (editDep && !isValidTime(editDep)) {
      showToast(FLIGHT.INVALID_TIME);
      return;
    }
    if (editArr && !isValidTime(editArr)) {
      showToast(FLIGHT.INVALID_TIME);
      return;
    }
    dispatch({
      type: 'UPDATE_FLIGHT',
      payload: {
        ...editItem,
        airline: editAirline,
        code: editCode,
        route: editRoute,
        dep: editDep,
        arr: editArr,
        price: Number(editPrice) || 0,
        cls: editCls,
      },
    });
    setEditItem(null);
    showToast(FLIGHT.EDIT_SUCCESS);
  };

  const handleDelete = (id: number) => {
    Alert.alert(FLIGHT.DELETE_CONFIRM.split('？')[0], FLIGHT.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_FLIGHT', payload: id });
        showToast(FLIGHT.DELETE_SUCCESS);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="机票对比" />

        <Text style={styles.hint}>
          {FLIGHT.HINT}
        </Text>

        {plan.flights.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{EMPTY_STATE.FLIGHT.TEXT}</Text>
            <Text style={styles.emptyHint}>{EMPTY_STATE.FLIGHT.HINT}</Text>
          </View>
        ) : (
          plan.flights.map((flight) => (
          <TouchableOpacity
            key={flight.id}
            style={styles.card}
            onPress={() => handleOpenEdit(flight)}
            onLongPress={() => handleDelete(flight.id)}
            activeOpacity={0.7}
          >
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
              {FLIGHT.CRITERIA.map((criteria, index) => (
                <Text key={criteria} style={styles.criteriaItem}>
                  {criteria}: {flight.notes[index] || '—'}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))
        )}

        <AddButton label={FLIGHT.ADD} onPress={handleAddFlight} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={!!editItem}
        title={FLIGHT.EDIT}
        onCancel={() => setEditItem(null)}
        onSave={handleSaveEdit}
      >
        <FormField label={FLIGHT.AIRLINE}>
          <FormInput
            value={editAirline}
            onChangeText={setEditAirline}
            placeholder={FLIGHT.AIRLINE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={FLIGHT.CODE}>
          <FormInput
            value={editCode}
            onChangeText={setEditCode}
            placeholder={FLIGHT.CODE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={FLIGHT.ROUTE}>
          <FormInput
            value={editRoute}
            onChangeText={setEditRoute}
            placeholder={FLIGHT.ROUTE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={FLIGHT.DEP_TIME}>
          <FormInput
            value={editDep}
            onChangeText={setEditDep}
            placeholder={FLIGHT.DEP_PLACEHOLDER}
          />
        </FormField>

        <FormField label={FLIGHT.ARR_TIME}>
          <FormInput
            value={editArr}
            onChangeText={setEditArr}
            placeholder={FLIGHT.ARR_PLACEHOLDER}
          />
        </FormField>

        <FormField label={FLIGHT.PRICE}>
          <FormInput
            value={editPrice}
            onChangeText={setEditPrice}
            placeholder={FLIGHT.PRICE_PLACEHOLDER}
            keyboardType="numeric"
          />
        </FormField>

        <FormField label={FLIGHT.CLASS}>
          <FormInput
            value={editCls}
            onChangeText={setEditCls}
            placeholder={FLIGHT.CLASS_PLACEHOLDER}
          />
        </FormField>
      </CommonModal>

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
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: Typography.sm,
    color: Colors.mutedLight,
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
