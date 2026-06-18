import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { Calendar } from '../../src/components/Calendar';
import { Timeline } from '../../src/components/Timeline';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Toast } from '../../src/components/Toast';
import { useToast } from '../../src/hooks/useToast';
import { Trip } from '../../src/store/types';
import { DatePickerModal } from '../../src/components/DatePickerModal';

export default function CalendarScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();
  const { visible, message, showToast, hideToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editColor, setEditColor] = useState('#D4A853');

  // 日期选择器状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');

  // 用于显示某一天所有行程的弹窗
  const [showDayTripsModal, setShowDayTripsModal] = useState(false);
  const [selectedDayTrips, setSelectedDayTrips] = useState<Trip[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState('');

  const isValidDate = (dateStr: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // 过滤掉无效日期的行程
  const validTrips = plan.trips.filter(trip => {
    return isValidDate(trip.start) && isValidDate(trip.end) && trip.start <= trip.end;
  });

  // 统计脏数据数量
  const dirtyTripsCount = plan.trips.length - validTrips.length;

  // 清理脏数据
  const handleCleanDirtyData = () => {
    if (dirtyTripsCount === 0) {
      showToast('没有需要清理的数据');
      return;
    }
    Alert.alert(
      '清理脏数据',
      `确定要删除 ${dirtyTripsCount} 条无效日期的行程吗？此操作不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            // 删除所有无效的行程
            const invalidTrips = plan.trips.filter(trip => {
              return !isValidDate(trip.start) || !isValidDate(trip.end) || trip.start > trip.end;
            });
            invalidTrips.forEach(trip => {
              dispatch({ type: 'DELETE_TRIP', payload: trip.id });
            });
            showToast(`已清理 ${invalidTrips.length} 条无效数据`);
          }
        },
      ]
    );
  };

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const parseDate = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(d.getTime()) ? null : d;
  };

  const startDateObj = parseDate(editStart);
  const endDateObj = parseDate(editEnd);

  const datePickerValue = datePickerTarget === 'start'
    ? (startDateObj ?? new Date())
    : (endDateObj ?? startDateObj ?? new Date());

  const pickerMinDate = datePickerTarget === 'end' ? startDateObj ?? undefined : undefined;
  const pickerMaxDate = datePickerTarget === 'start' ? endDateObj ?? undefined : undefined;

  const handleAddTrip = () => {
    setEditTrip(null);
    setEditName('');
    setEditStart(getTodayStr());
    setEditEnd(getTodayStr());
    setEditColor('#D4A853');
    setShowModal(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditTrip(trip);
    setEditName(trip.name);
    setEditStart(trip.start);
    setEditEnd(trip.end);
    setEditColor(trip.color);
    setShowModal(true);
  };

  const openDatePicker = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    if (datePickerTarget === 'start') {
      setEditStart(formatted);
      // 如果结束日期早于开始日期，自动调整结束日期
      if (editEnd && formatted > editEnd) {
        setEditEnd(formatted);
      }
    } else {
      // 如果结束日期早于开始日期，自动调整开始日期
      if (editStart && formatted < editStart) {
        setEditStart(formatted);
      }
      setEditEnd(formatted);
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleSaveTrip = () => {
    if (!editName.trim()) {
      showToast('请输入行程名称');
      return;
    }
    if (!editStart || !editEnd) {
      showToast('请选择行程日期');
      return;
    }
    if (editTrip) {
      dispatch({
        type: 'UPDATE_TRIP',
        payload: {
          ...editTrip,
          name: editName.trim(),
          start: editStart,
          end: editEnd,
          color: editColor,
        },
      });
      showToast('行程已更新');
    } else {
      dispatch({
        type: 'ADD_TRIP',
        payload: {
          id: Date.now(),
          name: editName.trim(),
          start: editStart,
          end: editEnd,
          color: editColor,
        },
      });
      showToast('已添加行程');
    }
    setShowModal(false);
  };

  const handleDeleteTrip = (tripId: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个行程吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_TRIP', payload: tripId });
            showToast('行程已删除');
          }
        },
      ]
    );
  };

  const handleShowMoreTrips = (trips: Trip[], date: string) => {
    setSelectedDayTrips(trips);
    setSelectedDayDate(date);
    setShowDayTripsModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="行程日历"
          subtitle="查看行程时间安排"
        />

        <Calendar
          trips={validTrips}
          onAddTrip={handleAddTrip}
          onEditTrip={handleEditTrip}
          onDeleteTrip={handleDeleteTrip}
          onShowMoreTrips={handleShowMoreTrips}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>时间轴</Text>
        </View>

        <Timeline trips={validTrips} />

        {/* 清理脏数据按钮 */}
        {dirtyTripsCount > 0 && (
          <TouchableOpacity style={styles.cleanButton} onPress={handleCleanDirtyData}>
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            <Text style={styles.cleanButtonText}>清理 {dirtyTripsCount} 条无效数据</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 添加/编辑行程弹窗 */}
      <Modal visible={showModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editTrip ? '编辑行程' : '添加行程'}</Text>

            <Text style={styles.modalLabel}>行程名称</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="例如：东京·北海道之旅"
              placeholderTextColor={Colors.mutedLight}
            />

            <Text style={styles.modalLabel}>开始日期</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker('start')}>
              <Text style={[styles.dateText, !editStart && styles.datePlaceholder]}>
                {editStart || getTodayStr()}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
            </TouchableOpacity>

            <Text style={styles.modalLabel}>结束日期</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker('end')}>
              <Text style={[styles.dateText, !editEnd && styles.datePlaceholder]}>
                {editEnd || getTodayStr()}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
            </TouchableOpacity>

            <Text style={styles.modalLabel}>颜色</Text>
            <View style={styles.colorGroup}>
              {['#D4A853', '#E85D4A', '#5AA85A', '#4A90E8', '#B8903A'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: color },
                    editColor === color && styles.colorBtnSelected,
                  ]}
                  onPress={() => setEditColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveTrip}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 显示某一天所有行程的弹窗 */}
      <Modal visible={showDayTripsModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDayTripsModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>{selectedDayDate} 的行程</Text>

            <ScrollView style={styles.tripsList} showsVerticalScrollIndicator={false}>
              {selectedDayTrips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripItem}
                  onPress={() => {
                    setShowDayTripsModal(false);
                    handleEditTrip(trip);
                  }}
                >
                  <View style={[styles.tripColorIndicator, { backgroundColor: trip.color }]} />
                  <View style={styles.tripItemContent}>
                    <Text style={styles.tripItemName}>{trip.name}</Text>
                    <Text style={styles.tripItemDate}>{trip.start} ~ {trip.end}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowDayTripsModal(false)}>
                <Text style={styles.modalCancelText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        value={datePickerValue}
        minimumDate={pickerMinDate}
        maximumDate={pickerMaxDate}
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
      />

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
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
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.fg,
  },
  datePlaceholder: {
    color: Colors.mutedLight,
  },
  colorGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnSelected: {
    borderColor: Colors.fg,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.base,
    color: Colors.fg,
  },
  modalSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: Typography.base,
    color: Colors.surface,
    fontWeight: Typography.semibold,
  },
  cleanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.danger + '10',
    borderWidth: 1,
    borderColor: Colors.danger + '30',
    borderRadius: 8,
  },
  cleanButtonText: {
    fontSize: Typography.sm,
    color: Colors.danger,
    fontWeight: Typography.semibold,
  },
  tripsList: {
    maxHeight: 300,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tripColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  tripItemContent: {
    flex: 1,
  },
  tripItemName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.fg,
  },
  tripItemDate: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
});
