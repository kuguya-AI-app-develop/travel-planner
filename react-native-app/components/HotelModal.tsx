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
import { Hotel } from '../types';

const DEFAULT_DIMENSIONS = ['性价比', '位置', '卫生', '设施', '服务'];

interface HotelModalProps {
  visible: boolean;
  hotel?: Hotel | null;
  onSave: (data: Omit<Hotel, 'id'> & { id?: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function HotelModal({ visible, hotel, onSave, onDelete, onClose }: HotelModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [scores, setScores] = useState<number[]>(Array(DEFAULT_DIMENSIONS.length).fill(0));

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setLocation(hotel.location);
      setPrice(hotel.price);
      setScores([...hotel.scores]);
    } else {
      setName('');
      setLocation('');
      setPrice('');
      setScores(Array(DEFAULT_DIMENSIONS.length).fill(0));
    }
  }, [hotel, visible]);

  const isEdit = !!hotel;

  const updateScore = (index: number, value: string) => {
    const num = Math.min(10, Math.max(0, parseInt(value, 10) || 0));
    setScores((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入酒店名称');
      return;
    }
    onSave({
      ...(isEdit ? { id: hotel!.id } : {}),
      name: name.trim(),
      location: location.trim(),
      price: price.trim(),
      priceNum: parseInt(price, 10) || 0,
      scores,
      selected: hotel?.selected ?? false,
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个酒店吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{isEdit ? '编辑酒店' : '添加酒店'}</Text>

            <Text style={styles.label}>名称</Text>
            <TextInput style={styles.input} placeholder="例如：东京帝国酒店" value={name} onChangeText={setName} />

            <Text style={styles.label}>位置</Text>
            <TextInput style={styles.input} placeholder="例如：新宿区" value={location} onChangeText={setLocation} />

            <Text style={styles.label}>价格</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：800元/晚"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.sectionTitle}>评分维度</Text>
            {DEFAULT_DIMENSIONS.map((dim, idx) => (
              <View key={idx} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{dim}</Text>
                <TextInput
                  style={styles.scoreInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={scores[idx] > 0 ? String(scores[idx]) : ''}
                  onChangeText={(v) => updateScore(idx, v)}
                />
                <Text style={styles.scoreUnit}>/ 10</Text>
              </View>
            ))}

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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#333',
    width: 70,
  },
  scoreInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scoreUnit: {
    fontSize: 13,
    color: '#999',
    width: 30,
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
