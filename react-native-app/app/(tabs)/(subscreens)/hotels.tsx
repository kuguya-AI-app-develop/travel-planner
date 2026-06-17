import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { StarRating } from '../../../src/components/StarRating';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { Hotel } from '../../../src/store/types';

const HOTEL_CRITERIA = ['性价比', '位置', '卫生', '设施', '服务'];

export default function HotelsScreen() {
  const { state, dispatch, getActivePlan } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const plan = getActivePlan();
  const [editItem, setEditItem] = useState<Hotel | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPrice, setEditPrice] = useState('');

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

  const handleOpenEdit = (hotel: Hotel) => {
    setEditItem(hotel);
    setEditName(hotel.name);
    setEditLocation(hotel.location);
    setEditPrice(String(hotel.priceNum));
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    const priceNum = Number(editPrice) || 0;
    dispatch({
      type: 'UPDATE_HOTEL',
      payload: {
        ...editItem,
        name: editName,
        location: editLocation,
        price: `¥${priceNum}/晚`,
        priceNum,
      },
    });
    setEditItem(null);
    showToast('酒店已更新');
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除酒店', '确定要删除这个酒店吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_HOTEL', payload: id });
        showToast('酒店已删除');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="酒店评分" />

        <Text style={styles.hint}>
          点击酒店名称编辑，长按删除，点击星星评分
        </Text>

        {plan.hotels.map((hotel) => {
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

                <TouchableOpacity
                  style={styles.hotelInfo}
                  onPress={() => handleOpenEdit(hotel)}
                  onLongPress={() => handleDelete(hotel.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <Text style={styles.hotelLoc}>{hotel.location}</Text>
                </TouchableOpacity>

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

      {/* 编辑弹窗 */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditItem(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>编辑酒店</Text>

            <Text style={styles.modalLabel}>酒店名称</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.modalLabel}>位置</Text>
            <TextInput style={styles.modalInput} value={editLocation} onChangeText={setEditLocation} />

            <Text style={styles.modalLabel}>价格（每晚）</Text>
            <TextInput style={styles.modalInput} value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.mutedLight} />

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
