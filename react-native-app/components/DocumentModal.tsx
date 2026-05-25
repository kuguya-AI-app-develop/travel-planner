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
import { Document, DocStatus } from '../types';

const DOC_TYPES = ['护照', '签证', '身份证', '驾照', '其他'];

const STATUS_OPTIONS: { key: DocStatus; label: string; color: string }[] = [
  { key: 'valid', label: '有效', color: '#34C759' },
  { key: 'expiring', label: '即将过期', color: '#FF9500' },
  { key: 'expired', label: '已过期', color: '#FF3B30' },
  { key: 'processing', label: '办理中', color: '#007AFF' },
  { key: 'none', label: '无', color: '#8E8E93' },
];

interface DocumentModalProps {
  visible: boolean;
  document?: Document | null;
  onSave: (data: Omit<Document, 'id'> & { id?: number }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function DocumentModal({ visible, document, onSave, onDelete, onClose }: DocumentModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('护照');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [status, setStatus] = useState<DocStatus>('none');

  useEffect(() => {
    if (document) {
      setName(document.name);
      setType(document.type);
      setNumber(document.number);
      setExpiry(document.expiry);
      setStatus(document.status);
    } else {
      setName('');
      setType('护照');
      setNumber('');
      setExpiry('');
      setStatus('none');
    }
  }, [document, visible]);

  const isEdit = !!document;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入证件名称');
      return;
    }
    onSave({
      ...(isEdit ? { id: document!.id } : {}),
      name: name.trim(),
      type,
      number: number.trim(),
      expiry: expiry.trim(),
      status,
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个证件吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{isEdit ? '编辑证件' : '添加证件'}</Text>

            <Text style={styles.label}>名称</Text>
            <TextInput style={styles.input} placeholder="例如：护照" value={name} onChangeText={setName} />

            <Text style={styles.label}>类型</Text>
            <View style={styles.typeRow}>
              {DOC_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>号码</Text>
            <TextInput style={styles.input} placeholder="证件号码" value={number} onChangeText={setNumber} />

            <Text style={styles.label}>到期日期</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={expiry}
              onChangeText={setExpiry}
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
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
  },
  typeBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  typeBtnText: {
    fontSize: 14,
    color: '#666',
  },
  typeBtnTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBtnText: {
    fontSize: 13,
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
