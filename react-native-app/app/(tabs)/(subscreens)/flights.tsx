import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Flight, TransportType, TRANSPORT_TYPES } from '../../../src/store/types';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { TRANSPORT, EMPTY_STATE, TICKET_SCAN } from '../../../src/constants/strings';
import { TicketImagePicker } from '../../../src/components/TicketImagePicker';
import { TicketScanResult } from '../../../src/components/TicketScanResult';
import { TicketInfo } from '../../../src/utils/ticketOcr';

export default function FlightsScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();
  const [editItem, setEditItem] = useState<Flight | null>(null);
  const [editType, setEditType] = useState<TransportType>('plane');
  const [editCompany, setEditCompany] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editRoute, setEditRoute] = useState('');
  const [editDep, setEditDep] = useState('');
  const [editArr, setEditArr] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCls, setEditCls] = useState('');

  // 扫描相关状态
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scannedTicketInfo, setScannedTicketInfo] = useState<TicketInfo | null>(null);

  const isValidTime = (time: string): boolean => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  const handleToggleFlight = (id: number) => {
    dispatch({ type: 'TOGGLE_FLIGHT', payload: id });
  };

  const handleAddFlight = () => {
    const newFlight: Flight = {
      id: Date.now(),
      type: 'plane',
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
    showToast(TRANSPORT.ADD_SUCCESS);
  };

  const handleOpenEdit = (flight: Flight) => {
    setEditItem(flight);
    setEditType(flight.type || 'plane');
    setEditCompany(flight.airline);
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
      showToast(TRANSPORT.INVALID_TIME);
      return;
    }
    if (editArr && !isValidTime(editArr)) {
      showToast(TRANSPORT.INVALID_TIME);
      return;
    }
    dispatch({
      type: 'UPDATE_FLIGHT',
      payload: {
        ...editItem,
        type: editType,
        airline: editCompany,
        code: editCode,
        route: editRoute,
        dep: editDep,
        arr: editArr,
        price: Number(editPrice) || 0,
        cls: editCls,
      },
    });
    setEditItem(null);
    showToast(TRANSPORT.EDIT_SUCCESS);
  };

  const handleDelete = (id: number) => {
    Alert.alert(TRANSPORT.DELETE_CONFIRM.split('？')[0], TRANSPORT.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_FLIGHT', payload: id });
        showToast(TRANSPORT.DELETE_SUCCESS);
      }},
    ]);
  };

  // 扫描相关处理函数
  const handleOpenScanner = () => {
    setShowImagePicker(true);
  };

  const handleImagePickerCancel = () => {
    setShowImagePicker(false);
  };

  const handleRecognized = (ticketInfo: TicketInfo) => {
    setShowImagePicker(false);
    setScannedTicketInfo(ticketInfo);
    setShowScanResult(true);
  };

  const handleScanResultCancel = () => {
    setShowScanResult(false);
    setScannedTicketInfo(null);
  };

  const handleScanResultConfirm = (flightData: Omit<Flight, 'id' | 'selected' | 'status' | 'notes'>) => {
    const newFlight: Flight = {
      id: Date.now(),
      ...flightData,
      status: 'compare' as const,
      selected: false,
      notes: {},
    };
    dispatch({ type: 'ADD_FLIGHT', payload: newFlight });
    setShowScanResult(false);
    setScannedTicketInfo(null);
    showToast(TICKET_SCAN.ADD_SUCCESS);
  };

  const getTransportLabel = (type: TransportType) => {
    return TRANSPORT_TYPES[type]?.icon || '🚗';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="交通方式对比" />

        <Text style={styles.hint}>
          {TRANSPORT.HINT}
        </Text>

        {plan.flights.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{TRANSPORT.NO_DATA}</Text>
            <Text style={styles.emptyHint}>{TRANSPORT.NO_DATA_HINT}</Text>
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

              <Text style={styles.transportIcon}>{getTransportLabel(flight.type || 'plane')}</Text>

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
              {TRANSPORT.CRITERIA.map((criteria, index) => (
                <Text key={criteria} style={styles.criteriaItem}>
                  {criteria}: {flight.notes[index] || '—'}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))
        )}

        <AddButton label={TRANSPORT.ADD} onPress={handleAddFlight} />

        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleOpenScanner}
          activeOpacity={0.7}
        >
          <Text style={styles.scanButtonText}>{TICKET_SCAN.SCAN}</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={!!editItem}
        title={TRANSPORT.EDIT}
        onCancel={() => setEditItem(null)}
        onSave={handleSaveEdit}
      >
        {/* 交通方式选择 */}
        <FormField label={TRANSPORT.TYPE}>
          <View style={styles.transportSelector}>
            {(Object.keys(TRANSPORT_TYPES) as TransportType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.transportOption,
                  editType === type && styles.transportOptionSelected,
                ]}
                onPress={() => setEditType(type)}
                activeOpacity={0.7}
              >
                <Text style={styles.transportOptionIcon}>{TRANSPORT_TYPES[type].icon}</Text>
                <Text style={[
                  styles.transportOptionText,
                  editType === type && styles.transportOptionTextSelected,
                ]}>
                  {TRANSPORT_TYPES[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        <FormField label={TRANSPORT.COMPANY}>
          <FormInput
            value={editCompany}
            onChangeText={setEditCompany}
            placeholder={TRANSPORT.COMPANY_PLACEHOLDER}
          />
        </FormField>

        <FormField label={TRANSPORT.CODE}>
          <FormInput
            value={editCode}
            onChangeText={setEditCode}
            placeholder={TRANSPORT.CODE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={TRANSPORT.ROUTE}>
          <FormInput
            value={editRoute}
            onChangeText={setEditRoute}
            placeholder={TRANSPORT.ROUTE_PLACEHOLDER}
          />
        </FormField>

        <FormField label={TRANSPORT.DEP_TIME}>
          <FormInput
            value={editDep}
            onChangeText={setEditDep}
            placeholder={TRANSPORT.DEP_PLACEHOLDER}
          />
        </FormField>

        <FormField label={TRANSPORT.ARR_TIME}>
          <FormInput
            value={editArr}
            onChangeText={setEditArr}
            placeholder={TRANSPORT.ARR_PLACEHOLDER}
          />
        </FormField>

        <FormField label={TRANSPORT.PRICE}>
          <FormInput
            value={editPrice}
            onChangeText={setEditPrice}
            placeholder={TRANSPORT.PRICE_PLACEHOLDER}
            keyboardType="numeric"
          />
        </FormField>

        <FormField label={TRANSPORT.CLASS}>
          <FormInput
            value={editCls}
            onChangeText={setEditCls}
            placeholder={TRANSPORT.CLASS_PLACEHOLDER}
          />
        </FormField>
      </CommonModal>

      <Toast visible={visible} message={message} onHide={hideToast} />

      {/* 图片选择器 */}
      <TicketImagePicker
        visible={showImagePicker}
        onCancel={handleImagePickerCancel}
        onRecognized={handleRecognized}
      />

      {/* 扫描结果预览 */}
      <TicketScanResult
        visible={showScanResult}
        ticketInfo={scannedTicketInfo}
        onCancel={handleScanResultCancel}
        onConfirm={handleScanResultConfirm}
      />
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
  transportIcon: {
    fontSize: 24,
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
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  scanButtonText: {
    fontSize: Typography.base,
    color: Colors.fg2,
  },
  transportSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  transportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  transportOptionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  transportOptionIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  transportOptionText: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  transportOptionTextSelected: {
    color: Colors.surface,
  },
});
