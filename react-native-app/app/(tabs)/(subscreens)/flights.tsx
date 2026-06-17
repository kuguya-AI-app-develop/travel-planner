import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Flight } from '../../../src/store/types';

const FLIGHT_CRITERIA = ['中转', '行李额度', '准点率', '舒适度'];

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
    showToast('航班已更新');
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除航班', '确定要删除这个航班吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_FLIGHT', payload: id });
        showToast('航班已删除');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="机票对比" />

        <Text style={styles.hint}>
          点击编辑航班，长按删除
        </Text>

        {plan.flights.map((flight) => (
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
              {FLIGHT_CRITERIA.map((criteria, index) => (
                <Text key={criteria} style={styles.criteriaItem}>
                  {criteria}: {flight.notes[index] || '—'}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        <AddButton label="添加航班" onPress={handleAddFlight} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditItem(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>编辑航班</Text>

            <Text style={styles.modalLabel}>航空公司</Text>
            <TextInput style={styles.modalInput} value={editAirline} onChangeText={setEditAirline} />

            <Text style={styles.modalLabel}>航班号</Text>
            <TextInput style={styles.modalInput} value={editCode} onChangeText={setEditCode} />

            <Text style={styles.modalLabel}>航线</Text>
            <TextInput style={styles.modalInput} value={editRoute} onChangeText={setEditRoute} placeholder="出发→到达" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>起飞时间</Text>
            <TextInput style={styles.modalInput} value={editDep} onChangeText={setEditDep} placeholder="08:30" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>到达时间</Text>
            <TextInput style={styles.modalInput} value={editArr} onChangeText={setEditArr} placeholder="12:45" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>价格</Text>
            <TextInput style={styles.modalInput} value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.mutedLight} />

            <Text style={styles.modalLabel}>舱位</Text>
            <TextInput style={styles.modalInput} value={editCls} onChangeText={setEditCls} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditItem(null)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.base,
    color: Colors.fg2,
  },
  modalSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: Typography.base,
    color: Colors.surface,
    fontWeight: Typography.semibold,
  },
});
