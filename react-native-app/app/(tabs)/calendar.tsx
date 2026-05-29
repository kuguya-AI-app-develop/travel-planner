import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';
import { Calendar } from '../../src/components/Calendar';
import { Timeline } from '../../src/components/Timeline';
import { ScreenHeader } from '../../src/components/ScreenHeader';

export default function CalendarScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();

  const handleAddTrip = () => {
    // 这里可以添加新增行程的逻辑
    Alert.alert('新增行程', '此功能正在开发中');
  };

  const handleEditTrip = (tripId: number) => {
    Alert.alert('编辑行程', `编辑行程 ID: ${tripId}`);
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
          onPress: () => dispatch({ type: 'DELETE_TRIP', payload: tripId })
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="行程日历"
          subtitle="查看行程时间安排"
        />

        <Calendar
          trips={plan.trips}
          onAddTrip={handleAddTrip}
          onEditTrip={handleEditTrip}
          onDeleteTrip={handleDeleteTrip}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>时间轴</Text>
        </View>

        <Timeline trips={plan.trips} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
});
