import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiKeyModal from '../components/ApiKeyModal';

const STORAGE_KEY = 'ai_config';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

let msgIdCounter = 0;
function nextId(): string {
  return `msg_${Date.now()}_${++msgIdCounter}`;
}

export default function ChatScreen() {
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadConfig = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function scrollToBottom() {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    if (!config?.apiKey) {
      setShowApiModal(true);
      return;
    }

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setSending(true);
    scrollToBottom();

    // Create a placeholder for streaming response
    const assistantId = nextId();
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantMsg]);

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          model: config.model,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        // SSE streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) {
                  accumulated += delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: accumulated } : m
                    )
                  );
                  scrollToBottom();
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      } else {
        // JSON response
        const data = await response.json();
        const reply = data.reply || data.content || '（无回复）';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: reply } : m
          )
        );
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : '发送失败';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `错误: ${errorMsg}` }
            : m
        )
      );
    } finally {
      setSending(false);
      scrollToBottom();
    }
  }

  function renderMarkdown(text: string): string {
    // Simple markdown: bold and lists
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '  • ');
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {isUser ? item.content : renderMarkdown(item.content)}
        </Text>
      </View>
    );
  }

  function renderTypingIndicator() {
    if (!sending) return null;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.content) return null;
    return (
      <View style={styles.typingRow}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.typingText}>AI 思考中...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'AI 聊天', headerShown: true }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* 配置提示 */}
        {!config?.apiKey && (
          <TouchableOpacity style={styles.configBanner} onPress={() => setShowApiModal(true)}>
            <Text style={styles.configBannerText}>⚠️ 未配置 API Key，点击设置</Text>
          </TouchableOpacity>
        )}

        {config?.apiKey && (
          <TouchableOpacity style={styles.configInfo} onPress={() => setShowApiModal(true)}>
            <Text style={styles.configInfoText}>
              🔑 {config.provider.toUpperCase()} · {config.model}
            </Text>
            <Text style={styles.configEditText}>修改</Text>
          </TouchableOpacity>
        )}

        {/* 消息列表 */}
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>开始对话</Text>
            <Text style={styles.emptySubtitle}>输入你的问题，AI 会为你解答旅行相关的问题</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={scrollToBottom}
            ListFooterComponent={renderTypingIndicator}
          />
        )}

        {/* 输入区域 */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="输入消息..."
            multiline
            maxLength={4000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendBtnText}>发送</Text>
          </TouchableOpacity>
        </View>

        <ApiKeyModal
          visible={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSaved={() => loadConfig()}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  configBanner: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFB74D',
  },
  configBannerText: { fontSize: 13, color: '#E65100', textAlign: 'center' },
  configInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  configInfoText: { fontSize: 12, color: '#1565C0' },
  configEditText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center' },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#1a1a1a',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  typingText: {
    fontSize: 13,
    color: '#888',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1a1a1a',
  },
  sendBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
