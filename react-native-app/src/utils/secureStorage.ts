import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 存储键名
const STORAGE_KEYS = {
  API_KEY: 'ai-api-key',
  PROVIDER: 'ai-provider',
  MODEL: 'ai-model',
  BASE_URL: 'ai-base-url',
} as const;

// iOS Keychain 存取控制：仅在设备解锁时可访问，且不随备份迁移
// Android: EncryptedSharedPreferences 已默认加密，无需额外设置
const SECURE_OPTIONS = Platform.OS === 'ios'
  ? { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
  : undefined;

/**
 * 保存AI设置到安全存储
 */
export async function saveAISettings(settings: {
  apiKey: string;
  provider: string;
  model: string;
  baseUrl?: string;
}): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, settings.apiKey, SECURE_OPTIONS);
    await SecureStore.setItemAsync(STORAGE_KEYS.PROVIDER, settings.provider, SECURE_OPTIONS);
    await SecureStore.setItemAsync(STORAGE_KEYS.MODEL, settings.model, SECURE_OPTIONS);
    if (settings.baseUrl) {
      await SecureStore.setItemAsync(STORAGE_KEYS.BASE_URL, settings.baseUrl, SECURE_OPTIONS);
    }
  } catch (error) {
    console.error('Failed to save AI settings:', error);
    throw new Error('保存设置失败');
  }
}

/**
 * 从安全存储读取AI设置
 */
export async function loadAISettings(): Promise<{
  apiKey: string | null;
  provider: string | null;
  model: string | null;
  baseUrl: string | null;
}> {
  try {
    const apiKey = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
    const provider = await SecureStore.getItemAsync(STORAGE_KEYS.PROVIDER);
    const model = await SecureStore.getItemAsync(STORAGE_KEYS.MODEL);
    const baseUrl = await SecureStore.getItemAsync(STORAGE_KEYS.BASE_URL);

    return { apiKey, provider, model, baseUrl };
  } catch (error) {
    console.error('Failed to load AI settings:', error);
    return { apiKey: null, provider: null, model: null, baseUrl: null };
  }
}

/**
 * 删除所有AI设置
 */
export async function clearAISettings(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.API_KEY);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.PROVIDER);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.MODEL);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.BASE_URL);
  } catch (error) {
    console.error('Failed to clear AI settings:', error);
    throw new Error('清除设置失败');
  }
}

/**
 * 检查是否已配置API Key
 */
export async function hasApiKey(): Promise<boolean> {
  try {
    const apiKey = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
    return !!apiKey;
  } catch {
    return false;
  }
}

/**
 * 检查安全存储是否可用
 * 用于检测用户是否清除了应用数据导致存储不可用
 */
export async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * 验证已保存的设置是否完整可用
 * 返回缺失的字段列表，空数组表示一切正常
 */
export async function validateStoredSettings(): Promise<{
  valid: boolean;
  missingFields: string[];
}> {
  const missingFields: string[] = [];
  try {
    const apiKey = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
    if (!apiKey) missingFields.push('apiKey');

    const provider = await SecureStore.getItemAsync(STORAGE_KEYS.PROVIDER);
    if (!provider) missingFields.push('provider');

    const model = await SecureStore.getItemAsync(STORAGE_KEYS.MODEL);
    if (!model) missingFields.push('model');

    return { valid: missingFields.length === 0, missingFields };
  } catch {
    return { valid: false, missingFields: ['all'] };
  }
}
