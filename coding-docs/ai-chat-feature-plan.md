# AI旅行助手聊天功能 - 实现规划

## 项目概述
在旅行规划网站的右下角添加一个浮动的AI聊天助手气泡，用户点击后可打开对话框，与名为"茶糕"的AI助手进行交互。AI助手可以根据用户的语言指令直接修改旅行计划。

**AI助手信息：**
- 名称：茶糕
- 头像：用户提供（狗狗照片）

---

## 技术栈分析
- **前端框架**：Next.js 16.2.6 + React 19 + TypeScript
- **数据库**：Prisma (PostgreSQL)
- **认证**：JWT + bcryptjs

---

## 任务分解

### 阶段一：UI/UX设计（交由OpenDesign完成）

#### 设计任务清单：

1. **聊天气泡按钮设计**
   - 位置：页面右下角固定定位
   - 样式：圆形按钮，显示狗狗头像
   - 状态：默认态、悬停态、点击态
   - 提示：新消息时可添加小红点或脉冲动画

2. **聊天窗口设计**
   - 尺寸：宽度约360-400px，高度约500-600px
   - 位置：从气泡按钮向上展开
   - 头部：显示"茶糕"名称和狗狗头像
   - 消息区域：支持用户消息和AI回复的区分显示
   - 输入区域：文本输入框 + 发送按钮
   - 关闭按钮

3. **消息气泡样式**
   - 用户消息：右侧，主色调
   - AI消息：左侧，浅色背景
   - 支持Markdown渲染（用于行程建议等）

4. **响应式设计**
   - 移动端：全屏或接近全屏的聊天界面
   - 平板端：适当调整尺寸

5. **设计规范输出**
   - 色彩变量定义
   - 组件尺寸规范
   - 动画/过渡效果说明
   - 切图/图标资源

---

### 阶段二：后端API开发（Claude Code完成）

#### 需要创建的API端点：

1. **POST /api/chat**
   - 功能：发送用户消息，获取AI回复
   - 请求体：
     ```json
     {
       "message": "用户消息内容",
       "planId": "当前旅行计划ID（可选）",
       "conversationId": "对话ID（用于多轮对话）"
     }
     ```
   - 响应：
     ```json
     {
       "reply": "AI回复内容",
       "conversationId": "对话ID",
       "planModified": true/false,
       "modifications": {
         "type": "itinerary/hotel/flight/etc",
         "description": "修改描述"
       }
     }
     ```

2. **GET /api/chat/history**
   - 功能：获取对话历史
   - 参数：conversationId, planId

3. **POST /api/chat/confirm-modification**
   - 功能：用户确认AI建议的修改
   - 用于AI建议修改计划后，用户确认执行

#### AI集成方案：

**方案A：调用外部AI API（推荐）**
- 使用OpenAI/Claude/Gemini等API
- 后端作为中间层，处理上下文和计划数据
- 优点：实现快，智能程度高
- 缺点：依赖外部服务，有API成本

**方案B：本地模型**
- 使用Ollama等本地模型
- 优点：隐私性好，无API成本
- 缺点：智能程度可能较低，需要服务器资源

**推荐：方案A**，使用Claude API或OpenAI API

#### System Prompt设计：
```
你是"茶糕"，一个专业的旅行规划AI助手。你的职责是：
1. 理解用户的旅行需求和偏好
2. 根据用户的指令修改旅行计划（行程、酒店、航班等）
3. 提供旅行建议和推荐
4. 回答旅行相关问题

当前旅行计划数据：
{planData}

修改计划时，请返回结构化的修改指令，格式如下：
{
  "action": "modify",
  "target": "itinerary/hotel/flight/...",
  "changes": {具体的修改内容}
}
```

---

### 阶段三：前端组件开发（Claude Code完成）

#### 组件结构：

```
src/components/ChatAssistant/
├── ChatAssistant.tsx        # 主组件（控制显隐）
├── ChatBubble.tsx           # 浮动气泡按钮
├── ChatWindow.tsx           # 聊天窗口容器
├── ChatMessage.tsx          # 单条消息组件
├── ChatInput.tsx            # 输入框组件
├── useChat.ts               # 聊天逻辑Hook
└── chat.module.css          # 样式文件
```

#### 核心功能实现：

1. **ChatAssistant.tsx**
   - 管理聊天窗口的显隐状态
   - 提供全局的聊天上下文（如果需要）

2. **ChatBubble.tsx**
   - 固定定位在右下角
   - 显示狗狗头像
   - 点击切换聊天窗口显隐

3. **ChatWindow.tsx**
   - 消息列表渲染
   - 自动滚动到最新消息
   - 加载状态显示

4. **ChatMessage.tsx**
   - 区分用户/AI消息样式
   - Markdown渲染支持
   - 显示修改建议卡片（如果AI建议了计划修改）

5. **ChatInput.tsx**
   - 文本输入
   - 发送按钮
   - Enter发送支持
   - 输入状态禁用

6. **useChat.ts**
   - 消息发送逻辑
   - 对话历史管理
   - API调用封装
   - 流式响应支持（如果AI API支持）

#### 与旅行计划的集成：

```typescript
// 当AI返回修改建议时，显示确认卡片
interface PlanModification {
  type: 'itinerary' | 'hotel' | 'flight' | 'expense' | 'packing';
  description: string;
  preview: any; // 修改预览
}

// 用户确认后，调用现有的plan修改API
const confirmModification = async (modification: PlanModification) => {
  // 调用对应的API修改计划
};
```

---

### 阶段四：集成与测试（八千代协调）

1. **集成检查点**
   - 设计稿交付后确认
   - API开发完成后测试
   - 前端组件完成后联调
   - 整体功能测试

2. **测试场景**
   - 基础对话功能
   - 修改行程请求
   - 修改酒店请求
   - 多轮对话上下文保持
   - 移动端适配
   - 错误处理

---

## 文件变更清单

### 新增文件：
```
src/components/ChatAssistant/
├── ChatAssistant.tsx
├── ChatBubble.tsx
├── ChatWindow.tsx
├── ChatMessage.tsx
├── ChatInput.tsx
├── useChat.ts
└── chat.module.css

src/app/api/chat/
├── route.ts              # 主聊天API
├── history/route.ts      # 历史记录API
└── confirm/route.ts      # 确认修改API

public/images/
└── chatbot-avatar.png    # 茶糕头像
```

### 修改文件：
```
src/app/layout.tsx        # 添加ChatAssistant组件
src/types.ts              # 添加聊天相关类型
```

---

## 开发顺序建议

1. **第一步：设计**（OpenDesign）
   - 完成UI设计稿
   - 输出设计规范

2. **第二步：后端API**（Claude Code）
   - 实现基础聊天API
   - 集成AI服务
   - 测试API功能

3. **第三步：前端组件**（Claude Code）
   - 实现UI组件
   - 集成API
   - 实现计划修改功能

4. **第四步：集成测试**（八千代协调）
   - 联调测试
   - Bug修复
   - 优化完善

---

## 注意事项

1. **API密钥安全**
   - AI服务的API密钥应存储在环境变量中
   - 不要暴露在前端代码中

2. **对话上下文管理**
   - 考虑使用数据库存储对话历史
   - 或使用Redis等缓存服务

3. **流式响应**
   - 如果AI API支持，建议实现流式响应
   - 提升用户体验，减少等待感

4. **错误处理**
   - 网络错误
   - AI服务不可用
   - 用户未登录等情况

5. **性能优化**
   - 消息列表虚拟滚动（如果消息很多）
   - 图片懒加载
   - 组件按需加载

---

## 时间估算

- 设计阶段：2-3天
- 后端API：1-2天
- 前端组件：2-3天
- 集成测试：1天
- **总计：约6-9天**

---

## 下一步行动

1. 茶糕确认此规划
2. 将设计任务提交给OpenDesign
3. 等待设计稿完成后，将编码任务提交给Claude Code
4. 八千代负责协调进度和质量把控
