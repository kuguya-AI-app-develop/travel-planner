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
import { Flight } from '../types';

const STATUS_OPTIONS: { key: Flight['status']; label: string; color: string }[] = [
  { key: 'booked', label: '已预订', color: '#34C759' },
  { key: 'pending', label: '待定', color: '#FF9500' },
  { key: 'compare', label: '对比中', color: '#007AFF' },
];

interface FlightModalProps {
  visible: boolean;
  flight?: Flight | null;
  criteria: string[];
  onSave: (flight: Omit<Flight, 'id'> & { id?: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function FlightModal({ visible, flight, criteria, onSave, onDelete, onClose }: FlightModalProps) {
  const [airline, setAirline] = useState('');
  const [code, setCode] = useState('');
  const [route, setRoute] = useState('');
  const [dep, setDep] = useState('');
  const [arr, setArr] = useState('');
  const [price, setPrice] = useState('');
  const [cls, setCls] = useState('经济舱');
  const [status, setStatus] = useState<Flight['status']>('compare');
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (flight) {
      setAirline(flight.airline);
      setCode(flight.code);
      setRoute(flight.route);
      setDep(flight.dep);
      setArr(flight.arr);
      setPrice(String(flight.price));
      setCls(flight.cls);
      setStatus(flight.status);
      setNotes({ ...flight.notes });
    } else {
      setAirline('');
      setCode('');
      setRoute('');
      setDep('');
      setArr('');
      setPrice('');
      setCls('经济舱');
      setStatus('compare');
      setNotes({});
    }
  }, [flight, visible]);

  const isEdit = !!flight;

  const handleSave = () => {
    if (!airline.trim()) {
      Alert.alert('提示', '请输入航空公司');
      return;
    }
    onSave({
      ...(isEdit ? { id: flight!.id } : {}),
      airline: airline.trim(),
      code: code.trim(),
      route: route.trim(),
      dep: dep.trim(),
      arr: arr.trim(),
      price: price ? parseInt(price, 10) || 0 : 0,
      cls: cls.trim(),
      status,
      selected: flight?.selected ?? false,
      notes,
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个航班吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  const updateNote = (index: number, value: string) => {
    const num = Math.min(10, Math.max(0, parseInt(value, 10) || 0));
    setNotes((prev) => ({ ...prev, [index]: String(num) }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{isEdit ? '编辑航班' : '添加航班'}</Text>

            <Text style={styles.label}>航空公司</Text>
            <TextInput style={styles.input} placeholder="例如：中国国航" value={airline} onChangeText={setAirline} />

            <Text style={styles.label}>航班号</Text>
            <TextInput style={styles.input} placeholder="例如：CA1234" value={code} onChangeText={setCode} />

            <Text style={styles.label}>路线</Text>
            <TextInput style={styles.input} placeholder="例如：北京 → 东京" value={route} onChangeText={setRoute} />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>出发时间</Text>
                <TextInput style={styles.input} placeholder="MM-DD HH:mm" value={dep} onChangeText={setDep} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>到达时间</Text>
                <TextInput style={styles.input} placeholder="MM-DD HH:mm" value={arr} onChangeText={setArr} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>价格 (元)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>舱位</Text>
                <TextInput style={styles.input} placeholder="经济舱" value={cls} onChangeText={setCls} />
              </View>
            </View>

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

            {criteria.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>评分维度</Text>
                {criteria.map((name, idx) => (
                  <View key={idx} style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>{name}</Text>
                    <TextInput
                      style={styles.scoreInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={notes[idx] ?? ''}
                      onChangeText={(v) => updateNote(idx, v)}
                    />
                    <Text style={styles.scoreUnit}>/ 10</Text>
                  </View>
                ))}
              </>
            )}

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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 4,
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#333',
    width: 80,
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
