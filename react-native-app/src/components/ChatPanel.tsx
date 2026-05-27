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
import { loadAISettings, hasApiKey } from '../utils/secureStorage';

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
      const settings = await loadAISettings();
      setApiKey(settings.apiKey);
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
      const settings = await loadAISettings();
      const provider = settings.provider || 'openai';
      const model = settings.model || 'gpt-4o';
      const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';

      // 构建请求
      const requestBody = {
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
      };

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;

        // 根据状态码返回友好提示
        if (response.status === 401) {
          return '汪...API Key无效，请在AI设置中检查并更新。';
        } else if (response.status === 429) {
          return '汪...请求太频繁了，请稍后再试~';
        } else if (response.status === 500) {
          return '汪...AI服务暂时不可用，请稍后再试~';
        } else {
          return `汪...遇到了一个问题：${errorMessage}`;
        }
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        return '汪...茶糕没有收到回复，请再试一次~';
      }
    } catch (error: any) {
      console.error('AI API error:', error);

      // 网络错误
      if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        return '汪...网络好像断了，请检查网络连接后再试~';
      }

      // 超时错误
      if (error.message?.includes('timeout')) {
        return '汪...请求超时了，请稍后再试~';
      }

      // 其他错误
      return '汪...遇到了一些问题，请稍后再试~';
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
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
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
