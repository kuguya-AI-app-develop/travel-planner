import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveAISettings, loadAISettings } from '../../../src/utils/secureStorage';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { BackHeader } from '../../../src/components/BackHeader';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'zhipu', label: '智谱 (GLM)' },
  { value: 'moonshot', label: 'Moonshot (Kimi)' },
  { value: 'qwen', label: '通义千问' },
  { value: 'custom-openai', label: '自定义 (OpenAI 兼容)' },
  { value: 'custom-anthropic', label: '自定义 (Anthropic 兼容)' },
];

const MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001', 'claude-opus-4-20250514'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  zhipu: ['glm-4', 'glm-4-flash'],
  moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
};

// 需要自定义模型输入的 provider
const CUSTOM_PROVIDERS = ['custom-openai', 'custom-anthropic'];

// API Key格式验证
const validateApiKey = (key: string): boolean => {
  // 基本验证：至少10个字符
  if (key.length < 10) {
    return false;
  }
  // 可以添加更多验证规则
  return true;
};

export default function AISettingsScreen() {
  const { visible, message, showToast, hideToast } = useToast();
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [showProviderPicker, setShowProviderPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const isCustomProvider = CUSTOM_PROVIDERS.includes(provider);

  // 加载已保存的设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await loadAISettings();

      if (settings.provider) setProvider(settings.provider);
      if (settings.model) {
        setModel(settings.model);
        if (settings.provider && CUSTOM_PROVIDERS.includes(settings.provider)) {
          setCustomModel(settings.model);
        }
      }
      if (settings.apiKey) setApiKey(settings.apiKey);
      if (settings.baseUrl) setBaseUrl(settings.baseUrl);
    } catch (e) {
      console.log('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    if (CUSTOM_PROVIDERS.includes(newProvider)) {
      setModel(customModel || '');
    } else {
      const models = MODELS[newProvider] || [];
      setModel(models[0] || '');
    }
  };

  const handleSave = async () => {
    const finalModel = isCustomProvider ? customModel : model;

    if (!finalModel) {
      Alert.alert('提示', '请输入或选择模型名称。', [{ text: '确定' }]);
      return;
    }

    // 验证API Key
    if (apiKey && !validateApiKey(apiKey)) {
      Alert.alert(
        '验证失败',
        'API Key格式不正确，请检查后重试。',
        [{ text: '确定' }]
      );
      return;
    }

    try {
      await saveAISettings({
        apiKey,
        provider,
        model: finalModel,
        baseUrl,
      });
      showToast('设置已保存');
    } catch (e) {
      console.log('Failed to save settings:', e);
      Alert.alert(
        '保存失败',
        '无法保存设置，请重试。',
        [{ text: '确定' }]
      );
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey) {
      Alert.alert(
        '提示',
        '请先输入API Key再测试连接。',
        [{ text: '确定' }]
      );
      return;
    }

    if (!validateApiKey(apiKey)) {
      Alert.alert(
        '验证失败',
        'API Key格式不正确，请检查后重试。',
        [{ text: '确定' }]
      );
      return;
    }

    setTestStatus('testing');

    try {
      // 构建测试请求
      const testBaseUrl = baseUrl || 'https://api.openai.com/v1';
      const response = await fetch(`${testBaseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        setTestStatus('success');
        showToast('连接成功！API Key有效。');
      } else {
        const data = await response.json();
        setTestStatus('error');
        Alert.alert(
          '连接失败',
          data.error?.message || 'API Key无效或网络错误。',
          [{ text: '确定' }]
        );
      }
    } catch (e) {
      setTestStatus('error');
      Alert.alert(
        '连接失败',
        '无法连接到AI服务，请检查网络和API设置。',
        [{ text: '确定' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="AI 设置" />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document" size={20} color={Colors.accent} />
            <Text style={styles.cardTitle}>模型配置</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>AI 服务商</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowProviderPicker(true)}
            >
              <Text style={styles.pickerText}>
                {PROVIDERS.find(p => p.value === provider)?.label || '选择服务商'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={Colors.muted} />
            </TouchableOpacity>

            <Text style={styles.label}>模型名称</Text>
            {isCustomProvider ? (
              <TextInput
                style={styles.input}
                value={customModel}
                onChangeText={(text) => {
                  setCustomModel(text);
                  setModel(text);
                }}
                placeholder="输入模型名称，例如 claude-sonnet-4-20250514"
                placeholderTextColor={Colors.mutedLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : (
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() => setShowModelPicker(true)}
              >
                <Text style={styles.pickerText}>{model}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.muted} />
              </TouchableOpacity>
            )}

            <Text style={styles.label}>API Key</Text>
            <View style={styles.keyContainer}>
              <TextInput
                style={styles.keyInput}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showKey}
                placeholder="sk-..."
                placeholderTextColor={Colors.mutedLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.keyToggle}
                onPress={() => setShowKey(!showKey)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showKey ? 'eye-off' : 'eye'}
                  size={16}
                  color={Colors.muted}
                />
              </TouchableOpacity>
            </View>
            {apiKey && !validateApiKey(apiKey) && (
              <Text style={styles.errorText}>API Key格式不正确</Text>
            )}

            <Text style={styles.label}>API Base URL（可选）</Text>
            <TextInput
              style={styles.input}
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder="https://api.openai.com/v1"
              placeholderTextColor={Colors.mutedLight}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>保存设置</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ghostButton,
                  testStatus === 'testing' && styles.ghostButtonDisabled,
                ]}
                onPress={handleTestConnection}
                activeOpacity={0.7}
                disabled={testStatus === 'testing'}
              >
                <Text style={styles.ghostButtonText}>
                  {testStatus === 'testing' ? '测试中...' : '测试连接'}
                </Text>
              </TouchableOpacity>
            </View>

            {testStatus === 'success' && (
              <View style={styles.statusSuccess}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.statusTextSuccess}>连接成功！API Key有效。</Text>
              </View>
            )}

            {testStatus === 'error' && (
              <View style={styles.statusError}>
                <Ionicons name="close-circle" size={16} color={Colors.danger} />
                <Text style={styles.statusTextError}>连接失败，请检查设置。</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.accent} />
            <Text style={styles.infoTitle}>安全提示</Text>
          </View>
          <Text style={styles.infoText}>
            • API Key将存储在设备本地{'\n'}
            • 请勿将API Key分享给他人{'\n'}
            • 建议定期更换API Key{'\n'}
            • 如有异常使用请立即重置
          </Text>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <Toast visible={visible} message={message} onHide={hideToast} />

      {/* 服务商选择弹窗 */}
      <Modal visible={showProviderPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowProviderPicker(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>选择服务商</Text>
            <FlatList
              data={PROVIDERS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    provider === item.value && styles.pickerOptionActive,
                  ]}
                  onPress={() => {
                    handleProviderChange(item.value);
                    setShowProviderPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    provider === item.value && styles.pickerOptionTextActive,
                  ]}>
                    {item.label}
                  </Text>
                  {provider === item.value && (
                    <Ionicons name="checkmark" size={18} color={Colors.accent} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* 模型选择弹窗 */}
      <Modal visible={showModelPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowModelPicker(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>选择模型</Text>
            <FlatList
              data={MODELS[provider] || []}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    model === item && styles.pickerOptionActive,
                  ]}
                  onPress={() => {
                    setModel(item);
                    setShowModelPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    model === item && styles.pickerOptionTextActive,
                  ]}>
                    {item}
                  </Text>
                  {model === item && (
                    <Ionicons name="checkmark" size={18} color={Colors.accent} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgDeep,
  },
  loadingText: {
    fontSize: Typography.base,
    color: Colors.muted,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  form: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  pickerText: {
    fontSize: Typography.base,
    color: Colors.fg,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  keyInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.fg,
  },
  keyToggle: {
    padding: Spacing.md,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  ghostButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  ghostButtonDisabled: {
    opacity: 0.5,
  },
  ghostButtonText: {
    color: Colors.fg2,
    fontSize: Typography.base,
  },
  statusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.sm,
  },
  statusTextSuccess: {
    fontSize: Typography.sm,
    color: Colors.success,
  },
  statusError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.danger + '15',
    borderRadius: Radius.sm,
  },
  statusTextError: {
    fontSize: Typography.sm,
    color: Colors.danger,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  infoText: {
    fontSize: Typography.sm,
    color: Colors.muted,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  pickerModalTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.fg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  pickerOptionActive: {
    backgroundColor: Colors.accent + '10',
  },
  pickerOptionText: {
    fontSize: Typography.base,
    color: Colors.fg,
  },
  pickerOptionTextActive: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
});
