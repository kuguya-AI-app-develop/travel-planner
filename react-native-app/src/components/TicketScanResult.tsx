import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { CommonModal, FormField, FormInput } from './CommonModal';
import { TicketInfo, validateTicketInfo } from '../utils/ticketOcr';
import { TICKET_SCAN } from '../constants/strings';
import { Flight, TransportType } from '../store/types';

interface TicketScanResultProps {
  visible: boolean;
  ticketInfo: TicketInfo | null;
  onCancel: () => void;
  onConfirm: (flight: Omit<Flight, 'id' | 'selected' | 'status' | 'notes'>) => void;
}

export function TicketScanResult({
  visible,
  ticketInfo,
  onCancel,
  onConfirm,
}: TicketScanResultProps) {
  const [airline, setAirline] = useState('');
  const [code, setCode] = useState('');
  const [route, setRoute] = useState('');
  const [dep, setDep] = useState('');
  const [arr, setArr] = useState('');
  const [price, setPrice] = useState('');
  const [cls, setCls] = useState('');

  // 当ticketInfo变化时，更新表单状态
  useEffect(() => {
    if (ticketInfo) {
      setAirline(ticketInfo.airline);
      setCode(ticketInfo.code);
      setRoute(ticketInfo.route);
      setDep(ticketInfo.dep);
      setArr(ticketInfo.arr);
      setPrice(ticketInfo.price > 0 ? String(ticketInfo.price) : '');
      setCls(ticketInfo.cls);
    }
  }, [ticketInfo]);

  // 获取识别到的交通方式类型
  const detectedType = ticketInfo?.type || 'plane';

  // 验证时间格式
  const isValidTime = (time: string): boolean => {
    if (!time) return true; // 空值是允许的
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  // 验证表单
  const isFormValid = (): boolean => {
    if (dep && !isValidTime(dep)) return false;
    if (arr && !isValidTime(arr)) return false;
    return true;
  };

  // 处理确认
  const handleConfirm = () => {
    if (!isFormValid()) return;

    onConfirm({
      type: detectedType,
      airline: airline.trim() || '未知',
      code: code.trim() || 'XX000',
      route: route.trim() || '未知',
      dep: dep.trim() || '00:00',
      arr: arr.trim() || '00:00',
      price: Number(price) || 0,
      cls: cls.trim() || '经济舱',
    });
  };

  // 获取验证状态
  const validation = ticketInfo ? validateTicketInfo(ticketInfo) : { isValid: false, missingFields: [] };

  return (
    <CommonModal
      visible={visible}
      title={TICKET_SCAN.EDIT_RESULT}
      onCancel={onCancel}
      onSave={handleConfirm}
      saveText={TICKET_SCAN.ADD_SUCCESS}
      saveDisabled={!isFormValid()}
    >
      <View style={styles.container}>
        {/* 提示信息 */}
        {!validation.isValid && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {TICKET_SCAN.PARTIAL_RESULT}
            </Text>
            <Text style={styles.missingText}>
              缺少：{validation.missingFields.join('、')}
            </Text>
          </View>
        )}

        {/* 表单字段 */}
        <FormField label={TICKET_SCAN.AIRLINE}>
          <FormInput
            value={airline}
            onChangeText={setAirline}
            placeholder={TICKET_SCAN.AIRLINE}
          />
        </FormField>

        <FormField label={TICKET_SCAN.CODE}>
          <FormInput
            value={code}
            onChangeText={setCode}
            placeholder="CA1234"
          />
        </FormField>

        <FormField label={TICKET_SCAN.ROUTE}>
          <FormInput
            value={route}
            onChangeText={setRoute}
            placeholder="北京→上海"
          />
        </FormField>

        <FormField label={TICKET_SCAN.DEP_TIME}>
          <FormInput
            value={dep}
            onChangeText={setDep}
            placeholder="08:30"
          />
        </FormField>

        <FormField label={TICKET_SCAN.ARR_TIME}>
          <FormInput
            value={arr}
            onChangeText={setArr}
            placeholder="11:30"
          />
        </FormField>

        <FormField label={TICKET_SCAN.PRICE}>
          <FormInput
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="numeric"
          />
        </FormField>

        <FormField label={TICKET_SCAN.CLASS}>
          <FormInput
            value={cls}
            onChangeText={setCls}
            placeholder="经济舱"
          />
        </FormField>
      </View>
    </CommonModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  hintContainer: {
    padding: Spacing.md,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  hintText: {
    fontSize: Typography.sm,
    color: '#F57F17',
    marginBottom: Spacing.xs,
  },
  missingText: {
    fontSize: Typography.xs,
    color: '#FF8F00',
  },
});
