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
import { Trip } from '../types';

const PRESET_COLORS = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB',
  '#007AFF', '#5F27CD', '#34C759', '#FF6B9D',
  '#576574', '#222F3E',
];

interface TripModalProps {
  visible: boolean;
  trip?: Trip | null;
  defaultDate?: string;
  saving?: boolean;
  onSave: (trip: Omit<Trip, 'id'> & { id?: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function TripModal({ visible, trip, defaultDate, saving, onSave, onDelete, onClose }: TripModalProps) {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[4]);

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setStart(trip.start);
      setEnd(trip.end);
      setColor(trip.color);
    } else {
      setName('');
      setStart(defaultDate || '');
      setEnd(defaultDate || '');
      setColor(PRESET_COLORS[4]);
    }
  }, [trip, defaultDate, visible]);

  const isEdit = !!trip;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入行程名称');
      return;
    }
    if (!start || !end) {
      Alert.alert('提示', '请选择起止日期');
      return;
    }
    if (start > end) {
      Alert.alert('提示', '结束日期不能早于开始日期');
      return;
    }

    onSave({
      ...(isEdit ? { id: trip!.id } : {}),
      name: name.trim(),
      start,
      end,
      color,
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个行程吗？', [
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

            <Text style={styles.label}>行程名称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：东京之旅"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>开始日期</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={start}
              onChangeText={setStart}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>结束日期</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={end}
              onChangeText={setEnd}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>颜色</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    color === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>

              {isEdit && onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteText}>删除</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveText}>{saving ? '保存中...' : '保存'}</Text>
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
    maxHeight: '80%',
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
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
