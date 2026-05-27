# 方案A：expo-secure-store 加密存储API Key

## 目标
使用expo-secure-store替代AsyncStorage，实现API Key的加密存储。

## 原理
- iOS：使用系统Keychain存储
- Android：使用系统Keystore存储
- 系统级加密，即使设备被root也很难获取

## 前置条件
- 安装expo-secure-store：`npx expo install expo-secure-store`

## 详细任务

### 1. 安装依赖
```bash
npx expo install expo-secure-store
```

### 2. 创建安全存储工具函数
**新建文件：** `src/utils/secureStorage.ts`

```typescript
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
```

### 3. 修改 ai-settings.tsx
**文件位置：** `app/(tabs)/(subscreens)/ai-settings.tsx`

**修改内容：**
- 导入新的安全存储工具
- 使用 `saveAISettings` 和 `loadAISettings` 替代 AsyncStorage
- 删除 AsyncStorage 相关代码

**关键修改点：**

```typescript
// 删除这行
// import AsyncStorage from '@react-native-async-storage/async-storage';

// 添加这行
import { saveAISettings, loadAISettings } from '../../../src/utils/secureStorage';

// 修改 loadSettings 函数
const loadSettings = async () => {
  try {
    const settings = await loadAISettings();
    
    if (settings.provider) setProvider(settings.provider);
    if (settings.model) setModel(settings.model);
    if (settings.apiKey) setApiKey(settings.apiKey);
    if (settings.baseUrl) setBaseUrl(settings.baseUrl);
  } catch (e) {
    console.log('Failed to load settings:', e);
  } finally {
    setIsLoading(false);
  }
};

// 修改 handleSave 函数
const handleSave = async () => {
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
      model,
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
```

### 4. 修改 ChatPanel.tsx
**文件位置：** `src/components/ChatPanel.tsx`

**修改内容：**
- 导入新的安全存储工具
- 使用 `loadAISettings` 替代 AsyncStorage
- 删除 AsyncStorage 相关代码

**关键修改点：**

```typescript
// 删除这行
// import AsyncStorage from '@react-native-async-storage/async-storage';

// 添加这行
import { loadAISettings, hasApiKey } from '../utils/secureStorage';

// 修改 loadAPISettings 函数
const loadAPISettings = async () => {
  try {
    const settings = await loadAISettings();
    setApiKey(settings.apiKey);
  } catch (e) {
    console.log('Failed to load API settings');
  }
};

// 修改 callAI 函数中的设置读取
const callAI = async (userMessage: string): Promise<string> => {
  if (!apiKey) {
    return '汪...茶糕还没有配置API Key呢，请先在AI设置中配置哦~';
  }

  try {
    const settings = await loadAISettings();
    const provider = settings.provider || 'openai';
    const model = settings.model || 'gpt-4o';
    const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';

    // ... 其余代码不变
  }
};
```

### 5. 更新 ai-plan.tsx（如果使用了AsyncStorage）
**文件位置：** `app/(tabs)/(subscreens)/ai-plan.tsx`

**检查是否使用了AsyncStorage，如果有，同样修改为安全存储。**

---

## 完整修改后的文件列表

1. **新建：** `src/utils/secureStorage.ts`
2. **修改：** `app/(tabs)/(subscreens)/ai-settings.tsx`
3. **修改：** `src/components/ChatPanel.tsx`
4. **检查：** `app/(tabs)/(subscreens)/ai-plan.tsx`（如需要）

---

## 验证标准
1. 安装 expo-secure-store 成功
2. AI设置页面能正确加载已保存的设置
3. 保存设置后，重启App设置仍然存在
4. API Key在设备上以加密形式存储（无法直接读取明文）
5. 聊天功能正常工作
6. 测试连接功能正常工作

## 安全说明
- expo-secure-store 使用 iOS Keychain 和 Android Keystore
- 即使设备被root/jailbreak，也很难获取存储的内容
- 数据在设备本地，不会上传到任何服务器
- 如果用户卸载App，存储的数据会被删除

## 注意事项
- expo-secure-store 不支持在Expo Go中使用，需要使用开发构建
- 如果从AsyncStorage迁移，旧数据不会自动迁移
- 可以在首次启动时检测并提示用户重新设置

## 后续优化建议
1. 添加数据迁移逻辑（从AsyncStorage迁移到SecureStore）
2. 添加"清除所有设置"功能
3. 添加API Key格式验证的更详细规则
4. 添加设置导出/导入功能（方便用户备份）
