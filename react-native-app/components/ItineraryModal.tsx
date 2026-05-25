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
import { ItineraryItem } from '../types';

const TYPES: { key: ItineraryItem['type']; label: string; icon: string; color: string }[] = [
  { key: 'sight', label: '景点', icon: '👁', color: '#007AFF' },
  { key: 'food', label: '美食', icon: '🍴', color: '#FF9500' },
  { key: 'transport', label: '交通', icon: '🚗', color: '#5856D6' },
  { key: 'hotel', label: '住宿', icon: '🛏', color: '#34C759' },
  { key: 'other', label: '其他', icon: '⭐', color: '#FF2D55' },
];

interface ItineraryModalProps {
  visible: boolean;
  item?: ItineraryItem | null;
  defaultDate?: string;
  onSave: (data: Omit<ItineraryItem, 'id'> & { id?: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function ItineraryModal({ visible, item, defaultDate, onSave, onDelete, onClose }: ItineraryModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<ItineraryItem['type']>('sight');
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');

  useEffect(() => {
    if (item) {
      setDate(item.date);
      setTime(item.time);
      setType(item.type);
      setTitle(item.title);
      setMeta(item.meta);
    } else {
      setDate(defaultDate ?? '');
      setTime('');
      setType('sight');
      setTitle('');
      setMeta('');
    }
  }, [item, visible, defaultDate]);

  const isEdit = !!item;

  const handleSave = () => {
    if (!date.trim()) {
      Alert.alert('提示', '请输入日期');
      return;
    }
    if (!title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }
    onSave({
      ...(isEdit ? { id: item!.id } : {}),
      date: date.trim(),
      time: time.trim() || '00:00',
      type,
      title: title.trim(),
      meta: meta.trim(),
      order: item?.order ?? 0,
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个行程项目吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{isEdit ? '编辑行程' : '添加行程'}</Text>

            <Text style={styles.label}>日期</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.label}>时间</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={time}
              onChangeText={setTime}
            />

            <Text style={styles.label}>类型</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.typeBtn,
                    { borderColor: t.color },
                    type === t.key && { backgroundColor: t.color },
                  ]}
                  onPress={() => setType(t.key)}
                >
                  <Text style={styles.typeIcon}>{t.icon}</Text>
                  <Text style={[styles.typeText, type === t.key && { color: '#fff' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>标题</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：浅草寺参观"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>备注</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="可选备注"
              value={meta}
              onChangeText={setMeta}
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
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    gap: 4,
  },
  typeIcon: {
    fontSize: 14,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
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
