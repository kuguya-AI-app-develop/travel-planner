import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface Provider {
  id: string;
  name: string;
  defaultBaseUrl: string;
  models: string[];
  defaultModel: string;
  placeholder: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    placeholder: 'sk-...',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    placeholder: 'sk-...',
  },
  {
    id: 'qwen',
    name: '通义千问',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long'],
    defaultModel: 'qwen-plus',
    placeholder: 'sk-...',
  },
  {
    id: 'moonshot',
    name: '月之暗面',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultModel: 'moonshot-v1-8k',
    placeholder: 'sk-...',
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-plus', 'glm-4', 'glm-4-flash', 'glm-4-long'],
    defaultModel: 'glm-4-flash',
    placeholder: '',
  },
  {
    id: 'baichuan',
    name: '百川智能',
    defaultBaseUrl: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4', 'Baichuan3-Turbo', 'Baichuan2-Turbo'],
    defaultModel: 'Baichuan4',
    placeholder: 'sk-...',
  },
  {
    id: 'custom',
    name: '自定义',
    defaultBaseUrl: '',
    models: [],
    defaultModel: '',
    placeholder: '输入 API Key',
  },
];

const CUSTOM_MODEL = '__custom__';
const STORAGE_KEY = 'ai_config';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 4) return key;
  return '****' + key.slice(-4);
}

interface ApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ApiKeyModal({ visible, onClose, onSaved }: ApiKeyModalProps) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];
  const isCustomProvider = provider === 'custom';

  const effectiveBaseUrl = isCustomProvider
    ? baseUrl
    : baseUrl || currentProvider.defaultBaseUrl;

  const effectiveModel = isCustomProvider
    ? customModel || model
    : useCustomModel
      ? customModel
      : model;

  useEffect(() => {
    if (visible) {
      loadConfig();
    }
  }, [visible]);

  async function loadConfig() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config: ApiConfig = JSON.parse(saved);
        setProvider(config.provider || 'openai');
        setApiKey(config.apiKey || '');
        setBaseUrl(config.baseUrl || '');

        const prov = PROVIDERS.find((p) => p.id === config.provider);
        if (prov && config.model) {
          if (prov.models.includes(config.model)) {
            setModel(config.model);
            setUseCustomModel(false);
            setCustomModel('');
          } else {
            setModel(CUSTOM_MODEL);
            setUseCustomModel(true);
            setCustomModel(config.model);
          }
        } else {
          setModel(prov?.defaultModel || 'gpt-4o-mini');
          setUseCustomModel(false);
          setCustomModel('');
        }
      } else {
        resetForm();
      }
    } catch {
      resetForm();
    }
    setTestResult(null);
    setIsEditing(false);
    setShowAdvanced(false);
  }

  function resetForm() {
    setProvider('openai');
    setApiKey('');
    setBaseUrl('');
    setModel('gpt-4o-mini');
    setCustomModel('');
    setUseCustomModel(false);
  }

  function handleProviderChange(newProvider: string) {
    setProvider(newProvider);
    const p = PROVIDERS.find((pr) => pr.id === newProvider);
    if (p) {
      setModel(p.defaultModel);
      setCustomModel('');
      setUseCustomModel(false);
      if (newProvider !== 'custom') {
        setBaseUrl('');
      }
    }
    setTestResult(null);
  }

  function handleModelChange(value: string) {
    if (value === CUSTOM_MODEL) {
      setUseCustomModel(true);
      setModel(CUSTOM_MODEL);
    } else {
      setUseCustomModel(false);
      setModel(value);
      setCustomModel('');
    }
    setTestResult(null);
  }

  async function handleTest() {
    if (!apiKey.trim()) {
      Alert.alert('提示', '请先输入 API Key');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/test-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          baseUrl: effectiveBaseUrl,
          model: effectiveModel,
        }),
      });
      if (res.ok) {
        setTestResult('success');
      } else {
        const data = await res.json().catch(() => ({}));
        Alert.alert('验证失败', data.error || '请检查配置');
        setTestResult('error');
      }
    } catch {
      Alert.alert('网络错误', '请重试');
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      Alert.alert('提示', '请输入 API Key');
      return;
    }
    if (!effectiveModel) {
      Alert.alert('提示', '请选择或输入模型名称');
      return;
    }
    const config: ApiConfig = {
      provider,
      apiKey: apiKey.trim(),
      baseUrl: effectiveBaseUrl,
      model: effectiveModel,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    onSaved();
    onClose();
  }

  async function handleClear() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    resetForm();
    setTestResult(null);
    setIsEditing(false);
    Alert.alert('提示', 'API 配置已清除');
  }

  const displayedKey = apiKey ? maskKey(apiKey) : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>AI 设置</Text>
            <Text style={styles.subtitle}>
              配置你的 LLM API Key，用于 AI 策划和聊天功能。Key 仅存储在本地。
            </Text>

            {/* 提供商选择 */}
            <Text style={styles.label}>API 提供商</Text>
            <View style={styles.providerRow}>
              {PROVIDERS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.providerBtn,
                    provider === p.id && styles.providerBtnActive,
                  ]}
                  onPress={() => handleProviderChange(p.id)}
                >
                  <Text
                    style={[
                      styles.providerBtnText,
                      provider === p.id && styles.providerBtnTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* API Key */}
            <Text style={styles.label}>API Key</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={(t) => {
                  setApiKey(t);
                  setTestResult(null);
                }}
                placeholder={currentProvider.placeholder || '输入 API Key'}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                style={styles.keyDisplay}
                onPress={() => {
                  setIsEditing(true);
                  setApiKey(apiKey);
                }}
              >
                <Text style={apiKey ? styles.keyText : styles.keyPlaceholder}>
                  {apiKey ? displayedKey : '点击输入 API Key'}
                </Text>
                <Text style={styles.editHint}>编辑</Text>
              </TouchableOpacity>
            )}

            {/* 模型选择 */}
            <Text style={styles.label}>模型</Text>
            {isCustomProvider ? (
              <TextInput
                style={styles.input}
                value={customModel}
                onChangeText={(t) => {
                  setCustomModel(t);
                  setTestResult(null);
                }}
                placeholder="输入模型名称"
              />
            ) : (
              <>
                <View style={styles.modelRow}>
                  {currentProvider.models.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.modelBtn,
                        (useCustomModel ? false : model === m) && styles.modelBtnActive,
                      ]}
                      onPress={() => handleModelChange(m)}
                    >
                      <Text
                        style={[
                          styles.modelBtnText,
                          (useCustomModel ? false : model === m) && styles.modelBtnTextActive,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.modelBtn, useCustomModel && styles.modelBtnActive]}
                    onPress={() => handleModelChange(CUSTOM_MODEL)}
                  >
                    <Text
                      style={[styles.modelBtnText, useCustomModel && styles.modelBtnTextActive]}
                    >
                      自定义
                    </Text>
                  </TouchableOpacity>
                </View>
                {useCustomModel && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={customModel}
                    onChangeText={(t) => {
                      setCustomModel(t);
                      setTestResult(null);
                    }}
                    placeholder="输入自定义模型名称"
                  />
                )}
              </>
            )}

            {/* 高级设置 */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvanced ? '▼' : '▶'} 高级设置
              </Text>
            </TouchableOpacity>

            {showAdvanced && (
              <View style={styles.advancedBox}>
                <Text style={styles.label}>Base URL</Text>
                <TextInput
                  style={styles.input}
                  value={baseUrl}
                  onChangeText={(t) => {
                    setBaseUrl(t);
                    setTestResult(null);
                  }}
                  placeholder={
                    isCustomProvider
                      ? 'https://api.example.com/v1'
                      : currentProvider.defaultBaseUrl
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.hint}>
                  {isCustomProvider
                    ? 'OpenAI 兼容格式的 API 地址'
                    : `默认: ${currentProvider.defaultBaseUrl}`}
                </Text>
              </View>
            )}

            {/* 验证结果 */}
            <View style={styles.testRow}>
              <TouchableOpacity
                style={[styles.testBtn, testing && styles.testBtnDisabled]}
                onPress={handleTest}
                disabled={testing || !apiKey.trim()}
              >
                {testing ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.testBtnText}>验证连接</Text>
                )}
              </TouchableOpacity>
              {testResult === 'success' && (
                <Text style={styles.testSuccess}>连接成功</Text>
              )}
              {testResult === 'error' && (
                <Text style={styles.testError}>连接失败</Text>
              )}
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>清除配置</Text>
            </TouchableOpacity>
            <View style={styles.actionsRight}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>保存</Text>
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
    maxWidth: 460,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  providerBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  providerBtnText: {
    fontSize: 13,
    color: '#333',
  },
  providerBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  keyDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  keyText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  keyPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  editHint: {
    fontSize: 13,
    color: '#007AFF',
  },
  modelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  modelBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  modelBtnText: {
    fontSize: 12,
    color: '#555',
  },
  modelBtnTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  advancedToggle: {
    marginTop: 16,
    paddingVertical: 4,
  },
  advancedToggleText: {
    fontSize: 13,
    color: '#888',
  },
  advancedBox: {
    marginTop: 8,
    padding: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  hint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  testBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  testBtnDisabled: {
    opacity: 0.5,
  },
  testBtnText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  testSuccess: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
  },
  testError: {
    fontSize: 13,
    color: '#FF3B30',
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
  clearText: {
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
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
