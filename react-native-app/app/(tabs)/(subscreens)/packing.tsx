import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { ProgressBar } from '../../../src/components/ProgressBar';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

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
      showToast('请输入物品名称');
      return;
    }
    if (editId !== null) {
      dispatch({ type: 'UPDATE_PACK', payload: { id: editId, name: inputName.trim(), category: inputCategory.trim() || '其他' } });
      showToast('行李项已更新');
    } else {
      dispatch({ type: 'ADD_PACK', payload: { name: inputName.trim(), category: inputCategory.trim() || '其他' } });
      showToast('已添加行李项');
    }
    setShowAdd(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除行李项', '确定要删除这个行李项吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        dispatch({ type: 'DELETE_PACK', payload: id });
        showToast('行李项已删除');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="行李清单" />

        <Text style={styles.hint}>
          点击编辑行李项，长按删除
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

        <AddButton label="添加行李项" onPress={handleOpenAdd} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* 添加/编辑弹窗 */}
      <Modal visible={showAdd} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editId !== null ? '编辑行李项' : '添加行李项'}</Text>

            <Text style={styles.modalLabel}>物品名称</Text>
            <TextInput
              style={styles.modalInput}
              value={inputName}
              onChangeText={setInputName}
              placeholder="例如：护照"
              placeholderTextColor={Colors.mutedLight}
            />

            <Text style={styles.modalLabel}>分类</Text>
            <TextInput
              style={styles.modalInput}
              value={inputCategory}
              onChangeText={setInputCategory}
              placeholder="例如：证件、衣物、电子设备"
              placeholderTextColor={Colors.mutedLight}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAdd(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
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
