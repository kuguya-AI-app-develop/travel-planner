# 小改动：Chatbot图标 + 助手自称 + Header间距

## 目标
完成3个小改动：
1. AI chatbot的icon替换为柯基图片，右上角小圆点改为"汪"
2. AI小助手的自称修改为"茶糕"
3. 各页面title增加顶部间距

## 详细任务

### 1. 修改 ChatFAB.tsx
**文件位置：** `src/components/ChatFAB.tsx`

**修改内容：**
- 导入 Image 组件和 chatbot-avatar.jpg 图片
- 将 FAB 按钮的 icon 替换为图片
- 将右上角的 badge 小圆点替换为"汪"文字

**修改后代码：**
```typescript
import React from 'react';
import { TouchableOpacity, StyleSheet, View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../theme';

// 导入图片
const chatbotAvatar = require('../../assets/chatbot-avatar.jpg');

interface ChatFABProps {
  onPress: () => void;
  isOpen: boolean;
}

export function ChatFAB({ onPress, isOpen }: ChatFABProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isOpen ? (
        <Ionicons name="close" size={20} color={Colors.surface} />
      ) : (
        <Image source={chatbotAvatar} style={styles.avatarImage} />
      )}
      {!isOpen && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>汪</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    overflow: 'hidden',
    ...Shadows.md,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.surface,
  },
});
```

---

### 2. 修改 ChatPanel.tsx
**文件位置：** `src/components/ChatPanel.tsx`

**修改内容：**
- 导入 Image 组件和 chatbot-avatar.jpg 图片
- 将消息气泡中的 bot avatar 替换为图片
- 将助手的自称从"我"改为"茶糕"

**修改后代码（关键部分）：**

**导入部分：**
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

// 导入图片
const chatbotAvatar = require('../../assets/chatbot-avatar.jpg');
```

**初始消息（第35-37行）：**
```typescript
const [messages, setMessages] = useState<Message[]>([
  { role: 'bot', text: '你好！茶糕是你的旅行助手，有什么可以帮你的？', time: '09:00' },
]);
```

**回复映射（第21-27行）：**
```typescript
const REPLY_MAP: Record<string, string> = {
  '推荐景点': '茶糕推荐你去东京：浅草寺、秋叶原、迪士尼、涩谷十字路口、明治神宫。京都推荐：伏见稻荷大社、金阁寺、岚山竹林。',
  '预算规划': '茶糕建议你这样分配：机票30%、住宿30%、餐饮20%、门票购物20%。你目前预算约 ¥15,000，足够5天东京深度游。',
  '签证问题': '茶糕来帮你解答：日本单次旅游签证需要护照原件、2寸白底照片、在职证明、银行流水。一般7-10个工作日出签。',
  '美食推荐': '茶糕推荐东京必吃：寿司之神（需提前预约）、一兰拉面、筑地海鲜丼、秋叶原女仆咖啡、新宿烧鸟。',
  '交通攻略': '茶糕建议你购买西瓜卡（Suica），覆盖地铁/公交/便利店。东京地铁24小时券 ¥600 适合密集出行。',
};
```

**默认回复（第61-62行）：**
```typescript
const reply = REPLY_MAP[messageText] ||
  `关于"${messageText}"，茶糕觉得这是一个很好的问题！建议你参考行程日历中的安排，或者使用 AI 策划功能生成详细方案。`;
```

**消息气泡中的 avatar（第102-105行）：**
```typescript
{msg.role === 'bot' && (
  <Image source={chatbotAvatar} style={styles.avatarImage} />
)}
```

**样式部分添加：**
```typescript
avatarImage: {
  width: 24,
  height: 24,
  borderRadius: 12,
  marginTop: 2,
},
```

**删除原有的 avatar 样式（第240-248行）：**
```typescript
// 删除这个样式
avatar: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: Colors.gold,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 2,
},
```

---

### 3. 修改各页面 Header 间距
**需要修改的文件：**
- `app/(tabs)/index.tsx`
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/tools.tsx`
- `app/(tabs)/ai.tsx`
- `app/(tabs)/budget.tsx`

**修改内容：**
在每个页面的 header 样式中，增加 `paddingTop` 来增加顶部间距。

**修改前：**
```typescript
header: {
  padding: Spacing.lg,
  paddingBottom: Spacing.xl,
},
```

**修改后：**
```typescript
header: {
  paddingTop: Spacing['2xl'] + 20, // 24 + 20 = 44，增加顶部间距
  paddingHorizontal: Spacing.lg,
  paddingBottom: Spacing.xl,
},
```

或者使用更安全的方式，考虑到不同设备的状态栏高度：

```typescript
header: {
  paddingTop: 60, // 固定值，确保在刘海屏等设备上有足够间距
  paddingHorizontal: Spacing.lg,
  paddingBottom: Spacing.xl,
},
```

---

## 验证标准
1. FAB 按钮显示柯基图片（chatbot-avatar.jpg）
2. FAB 按钮右上角显示红色"汪"文字
3. 聊天面板消息气泡中的 bot avatar 显示柯基图片
4. 助手的回复中自称"茶糕"而不是"我"
5. 各页面的标题与顶部有足够间距，不紧贴边缘

## 注意事项
- 确保图片路径正确：`../../assets/chatbot-avatar.jpg`
- 确保 Image 组件已正确导入
- 如果图片不显示，检查图片文件是否存在
- Header 间距可以根据实际效果微调数值
