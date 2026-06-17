import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { loadAISettings } from '../utils/secureStorage';
import {
  Conversation,
  ChatMessage,
  loadConversations,
  saveConversation,
  deleteConversation,
  generateConversationId,
  generateConversationTitle,
} from '../utils/chatStorage';

const chatbotAvatar = require('../../assets/chatbot-avatar.jpg');

const SYSTEM_PROMPT = `你是一只可爱的柯基旅游助手，名叫"茶糕"。你的性格活泼开朗，喜欢用轻松愉快的语气和用户交流。
你擅长旅行规划，可以帮助用户解答关于目的地、签证、预算、美食、交通等各种旅行相关的问题。
回答时要简洁明了，适当使用一些可爱的语气词，但不要过度。你是一只专业又可爱的柯基！
回答时可以使用 Markdown 格式，包括标题、列表、加粗等，让内容更清晰。`;

const QUICK_REPLIES = ['推荐景点', '预算规划', '签证问题', '美食推荐', '交通攻略'];

const WELCOME_MESSAGE: ChatMessage = {
  role: 'bot',
  text: '汪！你好呀！茶糕是你的柯基旅游助手，有什么旅行问题可以问我哦~',
  time: '09:00',
};

interface ChatPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function ChatPanel({ visible, onClose }: ChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<'history' | 'chat'>('history');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentConversation = conversations.find(c => c.id === currentId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    if (scrollViewRef.current && view === 'chat') {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages, isTyping, currentId, view]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const [loadedConversations, settings] = await Promise.all([
      loadConversations(),
      loadAISettings(),
    ]);
    setConversations(loadedConversations);
    setApiKey(settings.apiKey);
  };

  // 新建会话
  const handleNewChat = () => {
    const newId = generateConversationId();
    const now = Date.now();
    const newConversation: Conversation = {
      id: newId,
      title: '新对话',
      messages: [{ ...WELCOME_MESSAGE, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }],
      createdAt: now,
      updatedAt: now,
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentId(newId);
    setView('chat');
    saveConversation(newConversation);
  };

  // 打开历史会话
  const handleOpenConversation = (id: string) => {
    setCurrentId(id);
    setView('chat');
  };

  // 删除会话
  const handleDeleteConversation = (id: string) => {
    Alert.alert('删除对话', '确定要删除这个对话吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteConversation(id);
          setConversations(prev => prev.filter(c => c.id !== id));
          if (currentId === id) {
            setCurrentId(null);
            setView('history');
          }
        },
      },
    ]);
  };

  // 返回历史列表
  const handleBackToHistory = () => {
    setView('history');
    setCurrentId(null);
  };

  // 调用AI API
  const callAI = async (chatMessages: ChatMessage[]): Promise<string> => {
    try {
      const settings = await loadAISettings();

      if (!settings.apiKey) {
        return '汪...茶糕还没有配置API Key呢，请先在AI设置中配置哦~';
      }

      if (!settings.baseUrl) {
        return '汪...还没有配置 API Base URL 呢，请先在 AI 设置中保存配置哦~';
      }

      const model = settings.model || 'gpt-4o';
      const baseUrl = settings.baseUrl;

      const requestBody = {
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatMessages.slice(-10).map(m => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.text,
          })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        if (response.status === 401) return '汪...API Key无效，请在AI设置中检查并更新。';
        if (response.status === 429) return '汪...请求太频繁了，请稍后再试~';
        return `汪...遇到了一个问题：${errorMessage}`;
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      return '汪...茶糕没有收到回复，请再试一次~';
    } catch (error: any) {
      if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        return '汪...网络好像断了，请检查网络连接后再试~';
      }
      return '汪...遇到了一些问题，请稍后再试~';
    }
  };

  // 发送消息
  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !currentId) return;

    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { role: 'user', text: messageText, time };

    // 更新会话
    setConversations(prev => prev.map(c => {
      if (c.id !== currentId) return c;
      const newMessages = [...c.messages, userMsg];
      const isFirstUserMsg = c.messages.filter(m => m.role === 'user').length === 0;
      return {
        ...c,
        title: isFirstUserMsg ? generateConversationTitle(messageText) : c.title,
        messages: newMessages,
        updatedAt: Date.now(),
      };
    }));
    setInput('');
    setIsTyping(true);

    // 获取最新的会话消息用于API调用
    const updatedConv = conversations.find(c => c.id === currentId);
    const allMessages = updatedConv ? [...updatedConv.messages, userMsg] : [userMsg];

    const reply = await callAI(allMessages);
    const replyTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const botMsg: ChatMessage = { role: 'bot', text: reply, time: replyTime };

    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== currentId) return c;
        return { ...c, messages: [...c.messages, userMsg, botMsg], updatedAt: Date.now() };
      });
      // 持久化
      const conv = updated.find(c => c.id === currentId);
      if (conv) saveConversation(conv);
      return updated;
    });
    setIsTyping(false);
  };

  if (!visible) return null;

  // 历史记录列表视图
  if (view === 'history') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={chatbotAvatar} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>柯基旅游助手</Text>
            <Text style={styles.headerStatus}>历史对话</Text>
          </View>
          <TouchableOpacity style={styles.headerAction} onPress={handleNewChat} activeOpacity={0.7}>
            <Ionicons name="add" size={20} color={Colors.surface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="remove" size={20} color={Colors.surface} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} bounces={false}>
          {conversations.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.mutedLight} />
              <Text style={styles.historyEmptyText}>暂无对话记录</Text>
              <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat} activeOpacity={0.7}>
                <Text style={styles.newChatButtonText}>开始新对话</Text>
              </TouchableOpacity>
            </View>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.historyItem}
                onPress={() => handleOpenConversation(conv.id)}
                onLongPress={() => handleDeleteConversation(conv.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={18} color={Colors.gold} />
                <View style={styles.historyItemInfo}>
                  <Text style={styles.historyItemTitle} numberOfLines={1}>{conv.title}</Text>
                  <Text style={styles.historyItemMeta}>
                    {conv.messages.length} 条消息 · {new Date(conv.updatedAt).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={Colors.mutedLight} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // 聊天视图
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHistory} activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.surface} />
        </TouchableOpacity>
        <Image source={chatbotAvatar} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{currentConversation?.title || '对话'}</Text>
          <Text style={styles.headerStatus}>在线 · 茶糕随时帮你规划</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={handleNewChat} activeOpacity={0.7}>
          <Ionicons name="add" size={20} color={Colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="remove" size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={false}
        scrollEventThrottle={16}
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
                {msg.role === 'user' ? (
                  <Text style={styles.bubbleTextUser}>{msg.text}</Text>
                ) : (
                  <Markdown style={markdownStyles}>{msg.text}</Markdown>
                )}
              </View>
              <Text style={[styles.time, msg.role === 'user' && styles.timeUser]}>
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

      <View style={styles.quickReplies}>
        {QUICK_REPLIES.map((reply) => (
          <TouchableOpacity
            key={reply}
            style={[styles.quickButton, !apiKey && styles.quickButtonDisabled]}
            onPress={() => handleSend(reply)}
            activeOpacity={0.7}
            disabled={!apiKey || isTyping}
          >
            <Text style={[styles.quickButtonText, !apiKey && styles.quickButtonTextDisabled]}>
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={apiKey ? "问茶糕任何旅行问题..." : "请先在AI设置中配置API Key"}
          placeholderTextColor={Colors.mutedLight}
          onSubmitEditing={() => handleSend()}
          editable={!!apiKey && !isTyping}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!apiKey || isTyping) && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          activeOpacity={0.7}
          disabled={!apiKey || isTyping}
        >
          <Ionicons name="send" size={14} color={Colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Markdown 样式
const markdownStyles = {
  body: {
    fontSize: Typography.sm,
    lineHeight: 20,
    color: Colors.fg,
  },
  heading1: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold as any,
    color: Colors.fg,
    marginBottom: Spacing.sm,
  },
  heading2: {
    fontSize: Typography.md,
    fontWeight: Typography.bold as any,
    color: Colors.fg,
    marginBottom: Spacing.xs,
  },
  heading3: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold as any,
    color: Colors.fg,
    marginBottom: Spacing.xs,
  },
  bold: {
    fontWeight: Typography.bold as any,
  },
  link: {
    color: Colors.accent,
  },
  list_item: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  bullet_list: {
    marginBottom: Spacing.sm,
  },
  ordered_list: {
    marginBottom: Spacing.sm,
  },
  code_inline: {
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: Typography.xs,
    fontFamily: Typography.mono,
    color: Colors.accent,
  },
  code_block: {
    backgroundColor: Colors.surfaceRaised,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    fontFamily: Typography.mono,
    fontSize: Typography.xs,
    color: Colors.fg,
  },
  fence: {
    backgroundColor: Colors.surfaceRaised,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    fontFamily: Typography.mono,
    fontSize: Typography.xs,
    color: Colors.fg,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    paddingLeft: Spacing.md,
    marginBottom: Spacing.sm,
    color: Colors.muted,
  },
};

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
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
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
  headerAction: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 历史记录样式
  historyContainer: {
    flex: 1,
    backgroundColor: Colors.corgiCream,
    padding: Spacing.md,
  },
  historyEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  historyEmptyText: {
    fontSize: Typography.base,
    color: Colors.muted,
  },
  newChatButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  newChatButtonText: {
    color: Colors.surface,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.fg,
  },
  historyItemMeta: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  // 聊天样式
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
  bubbleTextUser: {
    fontSize: Typography.sm,
    lineHeight: 20,
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
