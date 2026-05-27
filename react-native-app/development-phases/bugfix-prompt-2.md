# 额外修改：Badge样式 + Quick Replies + 窗口大小 + AI Prompt + 新建计划

## 目标
完成5个额外修改：
1. Badge"汪"带底色，不透明
2. Quick Replies改为请求AI回答（需API Key）
3. 聊天窗口加大
4. 给AI机器人增加柯基旅游助手prompt
5. 新建计划初始为空

## 详细任务

### 1. 修改 ChatFAB.tsx - Badge带底色
**文件位置：** `src/components/ChatFAB.tsx`

**修改badge样式，确保有底色且不透明：**
```typescript
badge: {
  position: 'absolute',
  top: -4,
  right: -4,
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#FF4444', // 明确的红色底色，不使用透明度
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: Colors.bg,
  paddingHorizontal: 4,
},
badgeText: {
  fontSize: 10,
  fontWeight: Typography.bold,
  color: '#FFFFFF', // 纯白色文字
},
```

---

### 2. 修改 ChatPanel.tsx - Quick Replies请求AI + 窗口加大 + AI Prompt
**文件位置：** `src/components/ChatPanel.tsx`

**完整修改后代码：**
```typescript
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入图片
const chatbotAvatar = require('../../assets/chatbot-avatar.jpg');

interface Message {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

// 柯基旅游助手的系统prompt
const SYSTEM_PROMPT = `你是一只可爱的柯基旅游助手，名叫"茶糕"。你的性格活泼开朗，喜欢用轻松愉快的语气和用户交流。
你擅长旅行规划，可以帮助用户解答关于目的地、签证、预算、美食、交通等各种旅行相关的问题。
回答时要简洁明了，适当使用一些可爱的语气词，但不要过度。你是一只专业又可爱的柯基！`;

const QUICK_REPLIES = ['推荐景点', '预算规划', '签证问题', '美食推荐', '交通攻略'];

interface ChatPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function ChatPanel({ visible, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '汪！你好呀！茶糕是你的柯基旅游助手，有什么旅行问题可以问我哦~', time: '09:00' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  // 加载API设置
  useEffect(() => {
    loadAPISettings();
  }, []);

  const loadAPISettings = async () => {
    try {
      const key = await AsyncStorage.getItem('ai-api-key');
      setApiKey(key);
    } catch (e) {
      console.log('Failed to load API settings');
    }
  };

  // 调用AI API
  const callAI = async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      return '汪...茶糕还没有配置API Key呢，请先在AI设置中配置哦~';
    }

    try {
      const provider = await AsyncStorage.getItem('ai-provider') || 'openai';
      const model = await AsyncStorage.getItem('ai-model') || 'gpt-4o';
      const baseUrl = await AsyncStorage.getItem('ai-base-url') || 'https://api.openai.com/v1';

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-10).map(m => ({
              role: m.role === 'bot' ? 'assistant' : 'user',
              content: m.text,
            })),
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      } else {
        return '汪...茶糕遇到了一些问题，请稍后再试~';
      }
    } catch (error) {
      console.error('AI API error:', error);
      return '汪...网络好像有点问题，请检查网络连接后再试~';
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setMessages(prev => [...prev, { role: 'user', text: messageText, time }]);
    setInput('');
    setIsTyping(true);

    // 调用AI获取回复
    const reply = await callAI(messageText);
    
    const replyTime = new Date();
    const replyTimeStr = `${replyTime.getHours()}:${String(replyTime.getMinutes()).padStart(2, '0')}`;
    
    setMessages(prev => [...prev, { role: 'bot', text: reply, time: replyTimeStr }]);
    setIsTyping(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={chatbotAvatar} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>柯基旅游助手</Text>
          <Text style={styles.headerStatus}>在线 · 茶糕随时帮你规划</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot,
            ]}
          >
            {msg.role === 'bot' && (
              <Image source={chatbotAvatar} style={styles.avatarImage} />
            )}
            <View style={styles.messageContent}>
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                ]}
              >
                <Text style={[
                  styles.bubbleText,
                  msg.role === 'user' && styles.bubbleTextUser,
                ]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[
                styles.time,
                msg.role === 'user' && styles.timeUser,
              ]}>
                {msg.time}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <Image source={chatbotAvatar} style={styles.avatarImage} />
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={Colors.muted} />
              <Text style={styles.typingText}>茶糕正在思考...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <View style={styles.quickReplies}>
        {QUICK_REPLIES.map((reply) => (
          <TouchableOpacity
            key={reply}
            style={[
              styles.quickButton,
              !apiKey && styles.quickButtonDisabled,
            ]}
            onPress={() => handleSend(reply)}
            activeOpacity={0.7}
            disabled={!apiKey}
          >
            <Text style={[
              styles.quickButtonText,
              !apiKey && styles.quickButtonTextDisabled,
            ]}>
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={apiKey ? "问茶糕任何旅行问题..." : "请先在AI设置中配置API Key"}
          placeholderTextColor={Colors.mutedLight}
          onSubmitEditing={() => handleSend()}
          editable={!!apiKey}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !apiKey && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          activeOpacity={0.7}
          disabled={!apiKey}
        >
          <Ionicons name="send" size={14} color={Colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 8,
    left: 8,
    top: 100, // 增加高度，从顶部100px开始
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    ...Shadows.md,
    zIndex: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.gold,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.surface,
    fontWeight: Typography.bold,
    fontSize: Typography.base,
  },
  headerStatus: {
    color: Colors.surface,
    opacity: 0.8,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.corgiCream,
  },
  messageRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageRowBot: {
    alignSelf: 'flex-start',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginTop: 2,
  },
  messageContent: {
    flex: 1,
  },
  bubble: {
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
  },
  bubbleBot: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.gold,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: Typography.sm,
    lineHeight: 20,
    color: Colors.fg,
  },
  bubbleTextUser: {
    color: Colors.surface,
  },
  time: {
    fontSize: 9,
    color: Colors.mutedLight,
    marginTop: 4,
  },
  timeUser: {
    textAlign: 'right',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingText: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.corgiCream,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  quickButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  quickButtonDisabled: {
    opacity: 0.5,
  },
  quickButtonText: {
    fontSize: Typography.xs,
    color: Colors.fg2,
  },
  quickButtonTextDisabled: {
    color: Colors.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    fontSize: Typography.sm,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.muted,
  },
});
```

---

### 3. 修改 AppContext.tsx - 新建计划初始为空
**文件位置：** `src/store/AppContext.tsx`

**检查CREATE_PLAN reducer（第136-151行）：**

当前代码已经是正确的，新建计划时所有数组都初始化为空：
```typescript
case 'CREATE_PLAN':
  return {
    ...state,
    plans: {
      ...state.plans,
      [action.payload.id]: {
        id: action.payload.id,
        name: action.payload.name,
        status: 'draft',
        itineraryItems: [],  // 空
        packingItems: [],    // 空
        documents: [],       // 空
        trips: [],           // 空
      },
    },
    activePlanId: action.payload.id,
  };
```

**这个已经是正确的，无需修改。**

---

### 4. 需要安装 AsyncStorage
如果项目还没有安装AsyncStorage，需要先安装：

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## 验证标准
1. FAB按钮右上角的"汪"显示为红色底色+白色文字，不透明
2. Quick Replies点击后会调用AI API获取回复
3. 如果未配置API Key，Quick Replies按钮禁用，输入框提示配置
4. 聊天窗口明显加大（从顶部100px到底部100px）
5. 聊天头部显示柯基头像和"柯基旅游助手"标题
6. AI回复时显示"茶糕正在思考..."的加载状态
7. AI使用柯基旅游助手的persona回复（活泼可爱的语气）
8. 新建计划时初始为空状态

## 注意事项
- 确保AsyncStorage已正确安装
- 确保API设置页面的保存逻辑使用AsyncStorage存储设置
- 如果AI调用失败，显示友好的错误提示
- 聊天窗口大小可以根据实际效果微调
