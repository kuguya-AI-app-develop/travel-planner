import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { api } from '../lib/api';

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

interface UserModalProps {
  visible: boolean;
  user: AdminUser | null; // null = create mode, non-null = edit mode
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function UserModal({ visible, user, onClose, onSaved, onDeleted }: UserModalProps) {
  const isEditMode = !!user;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (user) {
        setUsername(user.username);
        setPassword('');
        setRole(user.role as 'admin' | 'user');
      } else {
        setUsername('');
        setPassword('');
        setRole('user');
      }
    }
  }, [visible, user]);

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert('提示', '请输入用户名');
      return;
    }
    if (!isEditMode && !password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        const body: Record<string, unknown> = {
          id: user!.id,
          username: username.trim(),
          role,
        };
        if (password) {
          body.password = password;
        }
        await api.put('/api/admin/users', body);
      } else {
        await api.post('/api/admin/users', {
          username: username.trim(),
          password,
          role,
        });
      }
      onSaved();
      onClose();
    } catch (e: any) {
      Alert.alert('错误', e?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert('确认删除', `确定要删除用户 "${user!.username}" 吗？此操作不可撤销。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/api/admin/users?id=${user!.id}`);
            onDeleted();
            onClose();
          } catch (e: any) {
            Alert.alert('错误', e?.message || '删除失败');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{isEditMode ? '编辑用户' : '添加用户'}</Text>

            <Text style={styles.label}>用户名</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="输入用户名"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>密码{isEditMode ? '（留空则不修改）' : ''}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={isEditMode ? '留空则不修改' : '输入密码'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>角色</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'user' && styles.roleBtnUser]}
                onPress={() => setRole('user')}
              >
                <Text style={[styles.roleBtnText, role === 'user' && styles.roleBtnTextActive]}>
                  普通用户
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'admin' && styles.roleBtnAdmin]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleBtnText, role === 'admin' && styles.roleBtnTextAdminActive]}>
                  管理员
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            {isEditMode ? (
              <TouchableOpacity onPress={handleDelete} disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <Text style={styles.deleteText}>删除用户</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <View style={styles.actionsRight}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>保存</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  roleBtnUser: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  roleBtnAdmin: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9500',
  },
  roleBtnText: {
    fontSize: 14,
    color: '#666',
  },
  roleBtnTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  roleBtnTextAdminActive: {
    color: '#FF9500',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deleteText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#666',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
