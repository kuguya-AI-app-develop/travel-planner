import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { ProgressBar } from '../../../src/components/ProgressBar';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { CommonModal, FormField, FormInput } from '../../../src/components/CommonModal';
import { PACKING } from '../../../src/constants/strings';

export default function PackingScreen() {
  const { getActivePlan, dispatch } = useApp();
  const plan = getActivePlan();
  const { visible, message, showToast, hideToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputCategory, setInputCategory] = useState('');

  const grouped = plan.packingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof plan.packingItems>);

  const total = plan.packingItems.length;
  const done = plan.packingItems.filter(i => i.packed).length;

  const handleTogglePack = (id: number) => {
    dispatch({ type: 'TOGGLE_PACK', payload: id });
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setInputName('');
    setInputCategory('');
    setShowAdd(true);
  };

  const handleOpenEdit = (item: { id: number; name: string; category: string }) => {
    setEditId(item.id);
    setInputName(item.name);
    setInputCategory(item.category);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!inputName.trim()) {
      showToast(PACKING.NAME_REQUIRED);
      return;
    }
    if (editId !== null) {
      dispatch({ type: 'UPDATE_PACK', payload: { id: editId, name: inputName.trim(), category: inputCategory.trim() || '其他' } });
      showToast(PACKING.EDIT_SUCCESS);
    } else {
      dispatch({ type: 'ADD_PACK', payload: { name: inputName.trim(), category: inputCategory.trim() || '其他' } });
      showToast(PACKING.ADD_SUCCESS);
    }
    setShowAdd(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert(PACKING.DELETE_CONFIRM.split('？')[0], PACKING.DELETE_CONFIRM, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_PACK', payload: id });
        showToast(PACKING.DELETE_SUCCESS);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="行李清单" />

        <Text style={styles.hint}>
          {PACKING.HINT}
        </Text>

        <ProgressBar current={done} total={total} />

        {Object.entries(grouped).map(([category, items]) => {
          const catDone = items.filter(i => i.packed).length;

          return (
            <View key={category} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>
                  {catDone}/{items.length}
                </Text>
              </View>

              {items.map((item) => (
                <View key={item.id} style={[styles.item, item.packed && styles.itemDone]}>
                  <TouchableOpacity
                    onPress={() => handleTogglePack(item.id)}
                    activeOpacity={0.7}
                    style={styles.itemCheck}
                  >
                    <Ionicons
                      name={item.packed ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={item.packed ? Colors.accent : Colors.muted}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.itemTextWrap}
                    onPress={() => handleOpenEdit(item)}
                    onLongPress={() => handleDelete(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.itemText, item.packed && styles.itemTextDone]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        <AddButton label={PACKING.ADD} onPress={handleOpenAdd} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 添加/编辑弹窗 - 使用公共Modal组件 */}
      <CommonModal
        visible={showAdd}
        title={editId !== null ? PACKING.EDIT : PACKING.ADD}
        onCancel={() => setShowAdd(false)}
        onSave={handleSave}
      >
        <FormField label={PACKING.NAME} required>
          <FormInput
            value={inputName}
            onChangeText={setInputName}
            placeholder={PACKING.NAME_PLACEHOLDER}
          />
        </FormField>

        <FormField label={PACKING.CATEGORY}>
          <FormInput
            value={inputCategory}
            onChangeText={setInputCategory}
            placeholder={PACKING.CATEGORY_PLACEHOLDER}
          />
        </FormField>
      </CommonModal>

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
  categoryContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  categoryCount: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemDone: {
    opacity: 0.6,
  },
  itemCheck: {
    padding: Spacing.xs,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemText: {
    fontSize: Typography.base,
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.mutedLight,
  },
});
