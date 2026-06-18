import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Trip } from '../store/types';

interface CalendarProps {
  trips: Trip[];
  onDateSelect?: (date: string) => void;
  onAddTrip?: () => void;
  onEditTrip?: (trip: Trip) => void;
  onDeleteTrip?: (tripId: number) => void;
  onShowMoreTrips?: (trips: Trip[], date: string) => void;
}

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function Calendar({ trips, onDateSelect, onAddTrip, onEditTrip, onDeleteTrip, onShowMoreTrips }: CalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const isValidDate = (dateStr: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const getTripsForDate = (dateStr: string): Trip[] => {
    return trips.filter(trip => {
      if (!isValidDate(trip.start) || !isValidDate(trip.end)) return false;
      return dateStr >= trip.start && dateStr <= trip.end;
    });
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <View key={`prev-${i}`} style={[styles.dayCell, styles.otherMonth]}>
          <Text style={styles.dayText}>{day}</Text>
        </View>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = currentYear === today.getFullYear() &&
                      currentMonth === today.getMonth() &&
                      day === today.getDate();
      const dayTrips = getTripsForDate(dateStr);
      const hasMultipleTrips = dayTrips.length > 1;

      // 如果有多个行程，点击日期区域打开列表；否则点击日期区域触发日期选择
      const handleDayPress = () => {
        if (hasMultipleTrips) {
          onShowMoreTrips?.(dayTrips, dateStr);
        } else {
          onDateSelect?.(dateStr);
        }
      };

      days.push(
        <TouchableOpacity
          key={`current-${day}`}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={handleDayPress}
          activeOpacity={0.7}
        >
          <View style={[styles.dateContainer, isToday && styles.todayContainer]}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {day}
            </Text>
          </View>
          {dayTrips.length === 1 && (
            <TouchableOpacity
              style={[styles.tripLabel, { backgroundColor: dayTrips[0].color }]}
              onPress={() => onEditTrip?.(dayTrips[0])}
              activeOpacity={0.7}
            >
              <Text style={styles.tripLabelText} numberOfLines={1}>
                {dayTrips[0].name}
              </Text>
              {onDeleteTrip && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDeleteTrip(dayTrips[0].id)}
                >
                  <Ionicons name="close" size={8} color="#FFF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          {hasMultipleTrips && (
            <TouchableOpacity
              style={styles.tripsIndicator}
              onPress={() => onShowMoreTrips?.(dayTrips, dateStr)}
              activeOpacity={0.7}
            >
              <Text style={styles.tripsIndicatorText}>
                {dayTrips.length} 个行程
              </Text>
              <Ionicons name="chevron-down" size={10} color={Colors.accent} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    }

    const totalCells = firstDayOfMonth + daysInMonth;
    const remaining = (7 - totalCells % 7) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push(
        <View key={`next-${i}`} style={[styles.dayCell, styles.otherMonth]}>
          <Text style={styles.dayText}>{i}</Text>
        </View>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth(-1)}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {currentYear}年{MONTH_NAMES[currentMonth]}
        </Text>
        {onAddTrip && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddTrip}
          >
            <Ionicons name="add" size={20} color={Colors.accent} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth(1)}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: Typography.lg,
    color: Colors.fg2,
  },
  monthLabel: {
    fontFamily: Typography.display,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  weekDayCell: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.muted,
    letterSpacing: 0.04,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 56, // 从48增加到56
    padding: Spacing.xs,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.borderLight,
    borderBottomColor: Colors.borderLight,
  },
  otherMonth: {
    opacity: 0.3,
  },
  todayCell: {
    backgroundColor: Colors.accent + '10',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayContainer: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    width: 22,
    height: 22,
  },
  dayText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
  todayText: {
    color: Colors.surface,
    fontWeight: Typography.bold,
  },
  tripLabel: {
    marginTop: 2,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripLabelText: {
    fontSize: 7,
    fontWeight: Typography.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  tripsContainer: {
    flex: 1,
  },
  deleteBtn: {
    padding: 1,
  },
  tripsIndicator: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: Colors.accent + '15',
    borderRadius: 4,
  },
  tripsIndicatorText: {
    fontSize: 8,
    fontWeight: Typography.semibold,
    color: Colors.accent,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripActions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 4,
  },
});
