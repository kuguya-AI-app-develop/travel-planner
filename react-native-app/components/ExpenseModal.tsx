import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Expense } from '../types';

const CATEGORIES = ['交通', '住宿', '餐饮', '门票', '购物', '其他'];

const STATUS_OPTIONS: { key: Expense['status']; label: string; color: string }[] = [
  { key: 'paid', label: '已支付', color: '#34C759' },
  { key: 'booked', label: '已预订', color: '#FF9500' },
  { key: 'planned', label: '计划中', color: '#007AFF' },
];

interface ExpenseModalProps {
  visible: boolean;
  expense?: Expense | null;
  onSave: (data: Omit<Expense, 'id'> & { id?: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function ExpenseModal({ visible, expense, onSave, onDelete, onClose }: ExpenseModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('其他');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Expense['status']>('planned');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setCategory(expense.category);
      setAmount(String(expense.amount));
      setStatus(expense.status);
      setNote(expense.note);
    } else {
      setName('');
      setCategory('其他');
      setAmount('');
      setStatus('planned');
      setNote('');
    }
  }, [expense, visible]);

  const isEdit = !!expense;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入费用名称');
      return;
    }
    onSave({
      ...(isEdit ? { id: expense!.id } : {}),
      name: name.trim(),
      category,
      amount: amount ? parseFloat(amount) || 0 : 0,
      status,
      note: note.trim(),
      selected: expense?.selected ?? false,
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这笔费用吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{isEdit ? '编辑费用' : '添加费用'}</Text>

            <Text style={styles.label}>名称</Text>
            <TextInput style={styles.input} placeholder="例如：机票" value={name} onChangeText={setName} />

            <Text style={styles.label}>分类</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>金额 (元)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.label}>状态</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.statusBtn,
                    { borderColor: opt.color },
                    status === opt.key && { backgroundColor: opt.color },
                  ]}
                  onPress={() => setStatus(opt.key)}
                >
                  <Text style={[styles.statusBtnText, status === opt.key && { color: '#fff' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>备注</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="可选备注"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>

              {isEdit && onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteText}>删除</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '88%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
  },
  categoryBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  categoryBtnText: {
    fontSize: 14,
    color: '#666',
  },
  categoryBtnTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statusBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  deleteButton: {
    padding: 10,
  },
  deleteText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
