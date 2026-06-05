import * as SecureStore from 'expo-secure-store';

// 存储键名
const STORAGE_KEYS = {
  API_KEY: 'ai-api-key',
  PROVIDER: 'ai-provider',
  MODEL: 'ai-model',
  BASE_URL: 'ai-base-url',
} as const;

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
    await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, settings.apiKey);
    await SecureStore.setItemAsync(STORAGE_KEYS.PROVIDER, settings.provider);
    await SecureStore.setItemAsync(STORAGE_KEYS.MODEL, settings.model);
    if (settings.baseUrl) {
      await SecureStore.setItemAsync(STORAGE_KEYS.BASE_URL, settings.baseUrl);
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
