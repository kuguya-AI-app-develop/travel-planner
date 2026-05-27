import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StarRating } from '../../../src/components/StarRating';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const HOTEL_CRITERIA = ['性价比', '位置', '卫生', '设施', '服务'];

export default function HotelsScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleHotel = (id: number) => {
    dispatch({ type: 'TOGGLE_HOTEL', payload: id });
  };

  const handleRateHotel = (hotelId: number, critIdx: number, value: number) => {
    dispatch({
      type: 'RATE_HOTEL',
      payload: { hotelId, critIdx, value },
    });
  };

  const handleAddHotel = () => {
    const newHotel = {
      id: Date.now(),
      name: '新酒店',
      location: '位置',
      price: '¥0/晚',
      priceNum: 0,
      scores: HOTEL_CRITERIA.map(() => 3),
      selected: false,
      status: 'pending' as const,
    };
    dispatch({ type: 'ADD_HOTEL', payload: newHotel });
    showToast('已添加酒店');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="酒店评分" />

        <Text style={styles.hint}>
          勾选最终酒店，点击星星评分
        </Text>

        {state.hotels.map((hotel) => {
          const avg = (hotel.scores.reduce((a, b) => a + b, 0) / hotel.scores.length).toFixed(1);

          return (
            <View key={hotel.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => handleToggleHotel(hotel.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    hotel.selected && styles.checkboxSelected,
                  ]}>
                    {hotel.selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <Text style={styles.hotelLoc}>{hotel.location}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{hotel.price}</Text>
                  <StatusBadge status={hotel.status} />
                </View>
              </View>

              <View style={styles.ratings}>
                {HOTEL_CRITERIA.map((criteria, index) => (
                  <View key={criteria} style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>{criteria}</Text>
                    <StarRating
                      rating={hotel.scores[index]}
                      onRate={(value) => handleRateHotel(hotel.id, index, value)}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.overall}>
                <Text style={styles.overallLabel}>综合评分</Text>
                <Text style={styles.overallScore}>{avg}</Text>
              </View>
            </View>
          );
        })}

        <AddButton label="添加酒店" onPress={handleAddHotel} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  hotelLoc: {
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
  ratings: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingLabel: {
    minWidth: 24,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.muted,
  },
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  overallLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  overallScore: {
    fontFamily: Typography.mono,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gold,
  },
});
