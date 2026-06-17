import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_STORAGE_KEY = '@travel_planner_chats';

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// 获取所有会话
export async function loadConversations(): Promise<Conversation[]> {
  try {
    const data = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
    if (data) {
      const conversations: Conversation[] = JSON.parse(data);
      return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return [];
  } catch {
    return [];
  }
}

// 保存所有会话
export async function saveConversations(conversations: Conversation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // 静默失败
  }
}

// 保存单个会话
export async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    const conversations = await loadConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    await saveConversations(conversations);
  } catch {
    // 静默失败
  }
}

// 删除会话
export async function deleteConversation(id: string): Promise<void> {
  try {
    const conversations = await loadConversations();
    await saveConversations(conversations.filter(c => c.id !== id));
  } catch {
    // 静默失败
  }
}

// 生成会话 ID
export function generateConversationId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// 根据首条用户消息生成会话标题
export function generateConversationTitle(firstUserMessage: string): string {
  const cleaned = firstUserMessage.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 20) return cleaned;
  return cleaned.substring(0, 20) + '...';
}
