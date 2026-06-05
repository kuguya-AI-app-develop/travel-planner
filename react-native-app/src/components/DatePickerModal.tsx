import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

export function DatePickerModal({
  visible,
  value,
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
}: DatePickerModalProps) {
  const [currentYear, setCurrentYear] = useState(value.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(value.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(value);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const isDateDisabled = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    if (minimumDate) {
      const min = new Date(minimumDate);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }
    if (maximumDate) {
      const max = new Date(maximumDate);
      max.setHours(0, 0, 0, 0);
      if (date > max) return true;
    }
    return false;
  };

  const isSelected = (year: number, month: number, day: number): boolean => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (year: number, month: number, day: number): boolean => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleDayPress = (year: number, month: number, day: number) => {
    if (isDateDisabled(year, month, day)) return;
    setSelectedDate(new Date(year, month, day));
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const renderDays = () => {
    const days: React.ReactNode[] = [];

    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const disabled = isDateDisabled(prevYear, prevMonth, day);
      days.push(
        <TouchableOpacity
          key={`prev-${i}`}
          style={[styles.dayCell, disabled && styles.dayDisabled]}
          onPress={() => handleDayPress(prevYear, prevMonth, day)}
          disabled={disabled}
          activeOpacity={0.6}
        >
          <Text style={[styles.dayText, styles.dayTextOther, disabled && styles.dayTextDisabled]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(currentYear, currentMonth, day);
      const selected = isSelected(currentYear, currentMonth, day);
      const todayFlag = isToday(currentYear, currentMonth, day);
      days.push(
        <TouchableOpacity
          key={`current-${day}`}
          style={[
            styles.dayCell,
            disabled && styles.dayDisabled,
            selected && styles.daySelected,
            todayFlag && !selected && styles.dayToday,
          ]}
          onPress={() => handleDayPress(currentYear, currentMonth, day)}
          disabled={disabled}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.dayText,
              disabled && styles.dayTextDisabled,
              selected && styles.dayTextSelected,
              todayFlag && !selected && styles.dayTextToday,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Next month leading days
    const totalCells = firstDayOfMonth + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const disabled = isDateDisabled(nextYear, nextMonth, i);
      days.push(
        <TouchableOpacity
          key={`next-${i}`}
          style={[styles.dayCell, disabled && styles.dayDisabled]}
          onPress={() => handleDayPress(nextYear, nextMonth, i)}
          disabled={disabled}
          activeOpacity={0.6}
        >
          <Text style={[styles.dayText, styles.dayTextOther, disabled && styles.dayTextDisabled]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const formatSelectedDate = (): string => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][selectedDate.getDay()];
    return `${y}年${m}月${d}日 ${weekDay}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerYear}>{selectedDate.getFullYear()}</Text>
            <Text style={styles.headerDate}>{formatSelectedDate()}</Text>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn} activeOpacity={0.6}>
              <Ionicons name="chevron-back" size={20} color={Colors.fg2} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {currentYear}年 {MONTH_NAMES[currentMonth]}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn} activeOpacity={0.6}>
              <Ionicons name="chevron-forward" size={20} color={Colors.fg2} />
            </TouchableOpacity>
          </View>

          {/* Week Headers */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((d) => (
              <View key={d} style={styles.weekCell}>
                <Text style={styles.weekText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>{renderDays()}</View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.7}>
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  header: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerYear: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  headerDate: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: '#FFFFFF',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.fg,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDisabled: {
    opacity: 0.3,
  },
  daySelected: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: Radius.full,
  },
  dayText: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.fg,
  },
  dayTextOther: {
    color: Colors.mutedLight,
  },
  dayTextDisabled: {
    color: Colors.mutedLight,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.semibold,
  },
  dayTextToday: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.md,
    color: Colors.muted,
  },
  confirmBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
  },
  confirmText: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#FFFFFF',
  },
});
