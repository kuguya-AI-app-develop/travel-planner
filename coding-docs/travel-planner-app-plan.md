# Travel Planner App - React Native 开发规划

## 项目概览

- **项目名称**: travel-planner-app
- **技术栈**: React Native (Expo) + TypeScript
- **项目路径**: ~/个人项目/travel-planner-website/
- **开发分支**: feature/react-native-app
- **执行工具**: Claude Code CLI
- **后端API**: 直接复用现有 Next.js 项目的 API 路由

## 架构设计

```
travel-planner-website/
├── nextjs-app/          # 现有网站（保持不变）
└── react-native-app/    # 新建 App 目录（独立前端）
    ├── app/             # Expo Router 页面
    ├── components/      # 复用组件
    ├── lib/             # API 客户端、工具函数
    ├── types/           # 类型定义（与网站共享）
    └── assets/          # 图片、字体等
```

## 功能清单（与网站 100% 对应）

| 模块 | 网站组件 | App 对应 |
|------|---------|----------|
| 认证系统 | /login, /api/auth/* | 登录页 + Auth Context |
| 日历视图 | CalendarView | CalendarScreen |
| 航班管理 | FlightsView | FlightsScreen |
| 目的地管理 | DestinationsView | DestinationsScreen |
| 酒店管理 | HotelsView | HotelsScreen |
| 费用管理 | ExpensesView | ExpensesScreen |
| 行程安排 | ItineraryView | ItineraryScreen |
| 打包清单 | PackingView | PackingScreen |
| 文档管理 | DocumentsView | DocumentsScreen |
| 计划概览 | PlanOverviewView | PlanOverviewScreen |
| 总结视图 | SummaryView | SummaryScreen |
| AI 计划生成 | AiPlanModal | AiPlanScreen |
| 聊天机器人 | ChatBot | ChatScreen |
| 侧边栏导航 | Sidebar | Drawer Navigator |
| 管理员功能 | /admin | AdminScreen |

---

## Phase 1: 项目初始化 + 认证系统

**目标**: 搭建 React Native 项目骨架，实现登录/登出功能

**具体任务**:
1. 使用 Expo 创建 React Native 项目
2. 配置 TypeScript、ESLint
3. 安装核心依赖（expo-router, async-storage 等）
4. 创建 API 客户端封装（fetch wrapper with auth token）
5. 实现登录页面
6. 实现 Auth Context（用户状态管理）
7. 实现路由守卫（未登录跳转登录页）
8. 测试登录流程

**验证**: App 启动 → 显示登录页 → 输入账号密码 → 登录成功 → 进入主页

```
claude -p '
任务：在 ~/个人项目/travel-planner-website/ 目录下创建 React Native App 项目

要求：
1. 使用 Expo 创建项目，目录名为 react-native-app
2. 配置 TypeScript
3. 安装以下依赖：
   - expo-router（文件路由）
   - @react-native-async-storage/async-storage（本地存储）
   - expo-secure-store（安全存储 token）
4. 创建以下文件结构：
   - lib/api.ts：API 客户端封装，支持 GET/POST/PUT/DELETE，自动携带 auth token
   - lib/auth.tsx：Auth Context，提供 login/logout/user 状态
   - app/_layout.tsx：根布局，集成 Auth Provider
   - app/login.tsx：登录页面，调用 POST /api/auth/login
   - app/(tabs)/_layout.tsx：Tab 导航布局
   - app/(tabs)/index.tsx：首页占位
5. API 基础地址配置为环境变量 EXPO_PUBLIC_API_URL
6. 登录成功后将 token 存入 SecureStore，后续请求自动带上
7. 未登录时自动跳转到 /login

参考现有网站的登录 API：
- POST /api/auth/login body: { username, password }
- 返回: { user: { id, username, role } }
- POST /api/auth/logout
- GET /api/auth/me

完成后运行 npx expo start 确认项目能正常启动。
' --max-turns 30
```

---

## Phase 2: 计划管理 + 类型定义

**目标**: 实现旅行计划的 CRUD 和核心类型

**具体任务**:
1. 从网站项目复制类型定义（types.ts）
2. 实现计划列表页面
3. 实现计划创建/重命名/删除功能
4. 实现计划状态管理（draft/active/confirmed/traveling/done）
5. 创建 Tab 导航结构（对应网站的各个视图）
6. 实现 API 调用：GET/POST/PUT/DELETE /api/plans

**验证**: 能看到计划列表 → 创建新计划 → 切换计划 → 删除计划

```
claude -p '
任务：实现旅行计划管理功能

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 复制网站的类型定义到 types/index.ts：
   - Plan, Trip, Flight, Destination, Hotel, Expense
   - ChecklistItem, ItineraryItem, PackingCategory, Document
   - PlanStatus, TabType, DocStatus

2. 创建 hooks/usePlans.ts：
   - 获取计划列表 GET /api/plans
   - 创建计划 POST /api/plans
   - 更新计划 PUT /api/plans
   - 删除计划 DELETE /api/plans?id=xxx

3. 更新 app/(tabs)/_layout.tsx，添加以下 Tab：
   - 日历 (calendar)
   - 航班 (flights)
   - 目的地 (destinations)
   - 更多 (more) → 展开显示：酒店、费用、行程、打包、文档、概览、总结

4. 创建 app/(tabs)/index.tsx：
   - 显示当前计划列表
   - 支持切换当前计划
   - 显示计划状态徽章

5. 创建 components/PlanCard.tsx：
   - 显示计划名称、日期范围、状态
   - 点击进入计划详情

6. 创建 app/plan/[id]/_layout.tsx：
   - 计划详情的 Tab 布局

参考 API：
- GET /api/plans 返回 { plans: [{ id, name, status, startDate, endDate, data }] }
- POST /api/plans body: { name, data }
- PUT /api/plans body: { id, name?, status?, startDate?, endDate?, data? }
- DELETE /api/plans?id=xxx

完成后确认 TypeScript 编译无错误。
' --max-turns 30
```

---

## Phase 3: 日历视图 + 行程管理

**目标**: 实现日历显示和行程 CRUD

**具体任务**:
1. 安装日历依赖（react-native-calendars）
2. 实现月视图日历
3. 实现行程的添加/编辑/删除
4. 行程以彩色条形式显示在日历上
5. 实现 TripModal（行程编辑弹窗）

**验证**: 日历显示行程色条 → 点击日期添加行程 → 编辑行程 → 删除行程

```
claude -p '
任务：实现日历视图和行程管理

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 安装 react-native-calendars

2. 创建 components/CalendarView.tsx：
   - 使用 react-native-calendars 的 Calendar 组件
   - 显示当前月份
   - 行程以标记形式显示在日期上（使用 period 标记）
   - 点击日期触发 onAddTrip
   - 点击已有行程触发 onEditTrip

3. 创建 components/TripModal.tsx：
   - Modal 弹窗，用于添加/编辑行程
   - 字段：名称、开始日期、结束日期、颜色
   - 预设颜色选择器
   - 保存/删除按钮

4. 创建 app/(tabs)/calendar.tsx：
   - 集成 CalendarView
   - 管理行程状态
   - 调用 API 保存行程数据

5. 行程数据结构：
   interface Trip {
     id: number;
     name: string;
     start: string;  // YYYY-MM-DD
     end: string;    // YYYY-MM-DD
     color: string;  // oklch 格式
   }

6. 行程数据保存在 Plan.data.trips 数组中，通过 PUT /api/plans 整体更新

完成后确认日历能正常显示和交互。
' --max-turns 25
```

---

## Phase 4: 航班管理

**目标**: 实现航班列表和评分功能

**具体任务**:
1. 实现航班列表页面
2. 实现航班的添加/编辑/删除
3. 实现多维度评分系统
4. 实现航班状态管理（booked/pending/compare）
5. 实现航班选择功能

**验证**: 查看航班列表 → 添加航班 → 评分 → 选择航班

```
claude -p '
任务：实现航班管理功能

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 components/FlightsView.tsx：
   - 航班列表，每个航班卡片显示：
     - 航空公司、航班号
     - 路线（出发地 → 目的地）
     - 出发/到达时间
     - 价格
     - 舱位
     - 状态标签（已预订/待定/对比中）
   - 支持选择/取消选择航班
   - 多维度评分显示（雷达图或进度条）

2. 创建 components/FlightModal.tsx：
   - 添加/编辑航班的表单
   - 字段：航空公司、航班号、路线、时间、价格、舱位
   - 评分滑块（默认维度：中转、行李额度、准点率、舒适度）

3. 创建 app/(tabs)/flights.tsx：
   - 集成 FlightsView
   - 管理航班状态
   - 支持添加自定义评分维度

4. 航班数据结构：
   interface Flight {
     id: number;
     airline: string;
     code: string;
     route: string;
     dep: string;
     arr: string;
     price: number;
     cls: string;
     status: "booked" | "pending" | "compare";
     selected: boolean;
     notes: Record<number, string>;
   }

5. 数据保存在 Plan.data.flights 数组中

完成后确认航班列表显示正常。
' --max-turns 25
```

---

## Phase 5: 目的地 + 酒店管理

**目标**: 实现目的地和酒店的列表与评分

**具体任务**:
1. 实现目的地列表页面
2. 实现目的地评分系统（默认6维度）
3. 实现酒店列表页面
4. 实现酒店评分系统（默认5维度）
5. 实现选择功能

**验证**: 目的地列表 → 评分 → 选择 → 酒店列表 → 评分 → 选择

```
claude -p '
任务：实现目的地和酒店管理

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 components/DestinationsView.tsx：
   - 目的地卡片列表
   - 显示：名称、国家、备注
   - 多维度评分（默认：景色、文化、美食、交通便利、安全性、性价比）
   - 支持选择/取消选择
   - 支持添加自定义评分维度

2. 创建 components/HotelsView.tsx：
   - 酒店卡片列表
   - 显示：名称、位置、价格
   - 多维度评分（默认：性价比、位置、卫生、设施、服务）
   - 支持选择/取消选择
   - 支持添加自定义评分维度

3. 创建 app/(tabs)/destinations.tsx 和 hotels.tsx

4. 数据结构：
   interface Destination {
     id: number;
     name: string;
     country: string;
     notes: string;
     scores: number[];
     selected: boolean;
   }
   
   interface Hotel {
     id: number;
     name: string;
     location: string;
     price: string;
     priceNum: number;
     scores: number[];
     selected: boolean;
   }

5. 评分维度用 CriteriaModal 管理

完成后确认两个页面显示正常。
' --max-turns 25
```

---

## Phase 6: 费用 + 打包 + 文档

**目标**: 实现费用追踪、打包清单和文档管理

**具体任务**:
1. 实现费用列表和分类统计
2. 实现打包清单（分组+勾选）
3. 实现文档管理（证件信息）

**验证**: 添加费用 → 查看统计 → 打包清单勾选 → 添加文档

```
claude -p '
任务：实现费用、打包清单和文档管理

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 components/ExpensesView.tsx：
   - 费用列表，显示：名称、分类、金额、状态
   - 状态：planned/booked/paid
   - 底部显示总费用统计
   - 支持添加/编辑/删除费用

2. 创建 components/PackingView.tsx：
   - 分组显示打包清单
   - 每组可折叠
   - 每项可勾选
   - 显示完成进度
   - 支持添加/删除组和项目

3. 创建 components/DocumentsView.tsx：
   - 证件列表
   - 显示：名称、类型、号码、到期日期、状态
   - 状态：valid/expiring/expired/processing/none
   - 支持添加/编辑/删除

4. 创建对应的 Tab 页面

5. 数据结构：
   interface Expense { id, name, category, amount, status, note, selected }
   interface PackingCategory { id, name, items: PackingItem[] }
   interface PackingItem { id, text, done }
   interface Document { id, name, type, number, expiry, status }

完成后确认三个页面显示正常。
' --max-turns 25
```

---

## Phase 7: 行程安排 + 总结视图

**目标**: 实现详细行程安排和旅行总结

**具体任务**:
1. 实现行程安排列表（按日期分组）
2. 实现行程项目的添加/编辑/删除
3. 实现总结视图（汇总所有信息）

**验证**: 添加行程 → 按日期查看 → 总结页面显示完整信息

```
claude -p '
任务：实现行程安排和总结视图

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 components/ItineraryView.tsx：
   - 按日期分组显示行程
   - 每个项目显示：时间、类型、标题、备注
   - 类型图标：sight(景点)、food(美食)、transport(交通)、hotel(住宿)、other(其他)
   - 支持添加/编辑/删除/排序

2. 创建 components/SummaryView.tsx：
   - 汇总显示：
     - 行程概要（Trip 列表）
     - 已选航班
     - 已选酒店
     - 已选目的地
     - 费用统计
     - 待办清单（checklist）
   - 清单项可勾选

3. 创建 app/(tabs)/itinerary.tsx 和 summary.tsx

4. 数据结构：
   interface ItineraryItem {
     id: number;
     date: string;
     time: string;
     type: "sight" | "food" | "transport" | "hotel" | "other";
     title: string;
     meta: string;
     order: number;
   }

完成后确认两个页面显示正常。
' --max-turns 25
```

---

## Phase 8: AI 功能 + 聊天

**目标**: 实现 AI 计划生成和聊天机器人

**具体任务**:
1. 实现 AI 计划生成界面
2. 实现聊天机器人界面
3. 配置 API Key 管理
4. 实现流式响应显示

**验证**: 输入需求 → AI 生成计划 → 聊天对话

```
claude -p '
任务：实现 AI 计划生成和聊天功能

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 app/ai-plan.tsx：
   - 输入旅行需求（目的地、日期、人数、预算等）
   - 调用 POST /api/ai/generate-plan
   - 显示生成的计划
   - 支持保存为新计划

2. 创建 app/chat.tsx：
   - 聊天界面
   - 消息列表（用户/AI 区分）
   - 输入框
   - 调用 POST /api/chat
   - 支持流式响应（SSE）

3. 创建 components/ApiKeyModal.tsx：
   - API Key 配置弹窗
   - 保存到服务器

4. 在侧边栏/设置中添加 AI 功能入口

5. API 参考：
   - POST /api/ai/generate-plan body: { prompt, startDate, endDate, ... }
   - POST /api/chat body: { message, conversationId? }
   - POST /api/ai/test-key body: { apiKey }

完成后确认 AI 功能可用。
' --max-turns 25
```

---

## Phase 9: 管理员功能

**目标**: 实现管理员用户管理

**具体任务**:
1. 实现管理员页面
2. 实现用户列表查看
3. 实现用户管理功能

**验证**: 管理员登录 → 查看用户列表 → 管理用户

```
claude -p '
任务：实现管理员功能

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 app/admin.tsx：
   - 用户列表
   - 显示：用户名、角色、创建时间
   - 支持添加/编辑/删除用户

2. 在 Auth Context 中添加角色判断：
   - admin 角色显示管理入口
   - 普通用户不显示

3. API 参考：
   - GET /api/admin/users
   - POST /api/admin/users body: { username, password, role }
   - DELETE /api/admin/users?id=xxx

4. 管理员登录后默认跳转到管理页面

完成后确认管理员功能可用。
' --max-turns 20
```

---

## Phase 10: UI 打磨 + 测试

**目标**: 完善 UI 细节，进行全面测试

**具体任务**:
1. 统一视觉风格（颜色、字体、间距）
2. 添加 Loading 状态
3. 添加错误处理和 Toast 提示
4. 适配深色模式
5. 适配不同屏幕尺寸
6. 全流程测试

**验证**: 完整走一遍所有功能，无明显 bug

```
claude -p '
任务：UI 打磨和测试

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 创建 lib/theme.ts：
   - 定义统一的颜色方案
   - 定义字体大小
   - 定义间距规范

2. 创建 components/Toast.tsx：
   - 成功/错误/提示三种类型
   - 自动消失

3. 创建 components/LoadingScreen.tsx：
   - 全屏加载动画

4. 为所有 API 调用添加：
   - Loading 状态显示
   - 错误捕获和提示
   - 空状态显示

5. 测试以下流程：
   - 登录 → 创建计划 → 添加行程 → 添加航班 → 添加酒店 → 查看总结
   - AI 生成计划 → 保存 → 查看
   - 管理员 → 用户管理

6. 修复发现的问题

完成后确认所有功能正常。
' --max-turns 30
```

---

## Phase 11: 构建 + 发布准备

**目标**: 准备 App 发布

**具体任务**:
1. 配置 App 图标和启动画面
2. 配置 app.json（应用名称、版本等）
3. 构建 iOS/Android 包
4. 编写 README

**验证**: 成功构建安装包

```
claude -p '
任务：构建和发布准备

项目路径：~/个人项目/travel-planner-website/react-native-app/

要求：
1. 更新 app.json：
   - name: "旅行规划师"
   - slug: "travel-planner"
   - version: "1.0.0"
   - orientation: "portrait"
   - icon: "./assets/icon.png"
   - splash: "./assets/splash.png"

2. 创建 assets/：
   - icon.png (1024x1024)
   - splash.png (1284x2778)
   - adaptive-icon.png (Android)

3. 配置 eas.json（如使用 EAS Build）

4. 编写 README.md：
   - 项目简介
   - 技术栈
   - 安装和运行方式
   - 环境变量配置

5. 运行 npx expo build 确认构建成功

完成后提供构建产物路径。
' --max-turns 20
```

---

## 执行计划

| Phase | 内容 | 预计时间 | 依赖 |
|-------|------|---------|------|
| 1 | 项目初始化 + 认证 | 30min | 无 |
| 2 | 计划管理 + 类型 | 30min | Phase 1 |
| 3 | 日历 + 行程 | 25min | Phase 2 |
| 4 | 航班管理 | 25min | Phase 2 |
| 5 | 目的地 + 酒店 | 25min | Phase 2 |
| 6 | 费用 + 打包 + 文档 | 25min | Phase 2 |
| 7 | 行程安排 + 总结 | 25min | Phase 2 |
| 8 | AI + 聊天 | 25min | Phase 2 |
| 9 | 管理员功能 | 20min | Phase 2 |
| 10 | UI 打磨 + 测试 | 30min | Phase 3-9 |
| 11 | 构建准备 | 20min | Phase 10 |

**总计**: 约 4-5 小时

## 注意事项

1. **分支管理**: 每个 Phase 完成后建议 commit，方便回滚
2. **API 兼容**: 确保 App 的 API 调用与网站完全一致
3. **数据格式**: Plan.data 字段是 JSON 字符串，需要序列化/反序列化
4. **Token 管理**: 使用 SecureStore 存储，过期后自动跳转登录
5. **错误处理**: 所有 API 调用都需要 try-catch
