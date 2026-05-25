import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Trip } from '../types';

interface CalendarViewProps {
  trips: Trip[];
  onAddTrip: (date: string) => void;
  onEditTrip: (trip: Trip) => void;
}

export default function CalendarView({ trips, onAddTrip, onEditTrip }: CalendarViewProps) {
  const markedDates = useMemo(() => {
    const marks: Record<string, { startingDay?: boolean; endingDay?: boolean; color: string; textColor: string }> = {};

    for (const trip of trips) {
      const start = new Date(trip.start);
      const end = new Date(trip.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const isStart = dateStr === trip.start;
        const isEnd = dateStr === trip.end;

        if (marks[dateStr]) {
          // Merge with existing mark — keep the existing one (first trip wins)
          // but store trip reference for click handling
        }

        marks[dateStr] = {
          startingDay: isStart,
          endingDay: isEnd,
          color: trip.color,
          textColor: '#fff',
        };

        current.setDate(current.getDate() + 1);
      }
    }

    return marks;
  }, [trips]);

  // Build a lookup from date string to trips that cover that date
  const dateTripMap = useMemo(() => {
    const map: Record<string, Trip[]> = {};
    for (const trip of trips) {
      const start = new Date(trip.start);
      const end = new Date(trip.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(trip);
        current.setDate(current.getDate() + 1);
      }
    }
    return map;
  }, [trips]);

  const handleDayPress = (day: DateData) => {
    const tripsOnDate = dateTripMap[day.dateString];
    if (tripsOnDate && tripsOnDate.length > 0) {
      onEditTrip(tripsOnDate[0]);
    } else {
      onAddTrip(day.dateString);
    }
  };

  return (
    <Calendar
      style={styles.calendar}
      markingType="period"
      markedDates={markedDates}
      onDayPress={handleDayPress}
      theme={{
        todayTextColor: '#007AFF',
        arrowColor: '#007AFF',
        textDayFontSize: 15,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 13,
      }}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
