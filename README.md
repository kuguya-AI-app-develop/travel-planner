# Travel Planner - 旅行规划助手

一款帮助用户规划旅行的全栈应用，包含 Web 端和移动端。

## 项目概览

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| `nextjs-app/` | Next.js 16 + React 19 + Prisma + PostgreSQL | Web端应用 |
| `react-native-app/` | Expo + React Native + TypeScript | 移动端应用（iOS/Android） |

## 功能特性

### 核心功能
- 📅 **行程管理** - 创建和管理多旅行计划，支持日历视图
- ✈️ **交通方式对比** - 支持机票、高铁、火车、打车等多种交通方式对比
- 🏨 **酒店评分** - 多维度评分系统，支持酒店对比
- 📍 **目的地管理** - 目的地信息记录与评分
- 💰 **预算管理** - 费用记录与统计

### 智能功能
- 🤖 **AI旅行规划** - 智能生成旅行方案
- 📷 **票据扫描识别** - OCR识别机票、高铁票、火车票信息
  - 支持各大航空公司App截图
  - 支持12306、携程、飞猪等平台
  - 自动提取航班号/车次、时间、价格、出发地目的地

### 辅助功能
- 📋 **待办清单** - 旅行准备事项管理
- 🧳 **行李清单** - 分类管理行李物品
- 📄 **证件管理** - 护照、签证等证件记录
- 💬 **AI助手对话** - 智能问答

## 技术栈

### Web端 (nextjs-app)
- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: bcryptjs + JWT

### 移动端 (react-native-app)
- **框架**: Expo + React Native
- **语言**: TypeScript
- **导航**: Expo Router
- **OCR**: @react-native-ml-kit/text-recognition
- **存储**: AsyncStorage + SecureStore

## 快速开始

### Web端

```bash
cd nextjs-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env  # 编辑 DATABASE_URL 等配置

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 移动端

```bash
cd react-native-app

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在模拟器或真机上运行
npm run android  # Android
npm run ios      # iOS
```

## 项目结构

```
travel-planner/
├── nextjs-app/              # Next.js Web应用
│   ├── prisma/              # 数据库模型定义
│   ├── src/
│   │   ├── app/             # 页面路由
│   │   ├── components/      # React 组件
│   │   └── lib/             # 工具函数
│   └── package.json
│
├── react-native-app/        # React Native 移动应用
│   ├── app/                 # Expo Router 页面
│   │   └── (tabs)/          # Tab导航页面
│   ├── src/
│   │   ├── components/      # UI组件
│   │   ├── constants/       # 常量定义
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── store/           # 状态管理
│   │   ├── theme/           # 主题配置
│   │   └── utils/           # 工具函数（含OCR识别）
│   └── package.json
│
└── README.md
```

## 票据扫描识别支持

### 支持的交通方式
| 类型 | 车次/航班号格式 | 示例 |
|------|----------------|------|
| ✈️ 机票 | 2位字母+数字 | CA1234, MU5678, 3U8765 |
| 🚄 高铁 | G+数字 | G1234, G5678 |
| 🚄 动车 | D/C+数字 | D1234, C5678 |
| 🚂 火车 | K/T/Z+数字 | K1234, T5678, Z123 |

### 支持的App截图
- 携程、飞猪、去哪儿、航旅纵横
- 各航空公司官方App
- 12306火车票
- 微信机票订单

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |

## License

MIT
