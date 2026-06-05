import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Trip } from '../store/types';

interface CalendarProps {
  trips: Trip[];
  onDateSelect?: (date: string) => void;
  onAddTrip?: () => void;
  onEditTrip?: (tripId: number) => void;
  onDeleteTrip?: (tripId: number) => void;
}

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function Calendar({ trips, onDateSelect, onAddTrip, onEditTrip, onDeleteTrip }: CalendarProps) {
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

  const getTripForDate = (dateStr: string): Trip | null => {
    for (const trip of trips) {
      if (dateStr >= trip.start && dateStr <= trip.end) {
        return trip;
      }
    }
    return null;
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
      const trip = getTripForDate(dateStr);

      days.push(
        <TouchableOpacity
          key={`current-${day}`}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={() => onDateSelect?.(dateStr)}
          activeOpacity={0.7}
        >
          <View style={[styles.dateContainer, isToday && styles.todayContainer]}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {day}
            </Text>
          </View>
          {trip && (
            <View style={[styles.tripLabel, { backgroundColor: trip.color }]}>
              <Text style={styles.tripLabelText} numberOfLines={1}>
                {trip.name}
              </Text>
              <View style={styles.tripActions}>
                {onEditTrip && (
                  <TouchableOpacity onPress={() => onEditTrip(trip.id)}>
                    <Ionicons name="create-outline" size={10} color="#FFF" />
                  </TouchableOpacity>
                )}
                {onDeleteTrip && (
                  <TouchableOpacity onPress={() => onDeleteTrip(trip.id)}>
                    <Ionicons name="close" size={10} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
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
    fontSize: 8,
    fontWeight: Typography.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
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
