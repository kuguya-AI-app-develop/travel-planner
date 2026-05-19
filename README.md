# Travel Planner Website

旅行计划管理网站，支持多用户、多计划管理。

## 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: bcryptjs + JWT

## 项目结构

```
travel-planner-website/
├── nextjs-app/          # Next.js 主应用
│   ├── prisma/          # 数据库模型定义
│   ├── src/
│   │   ├── app/         # 页面路由
│   │   ├── components/  # React 组件
│   │   └── lib/         # 工具函数（认证、Prisma 客户端）
│   └── package.json
└── prototype/           # 早期 HTML 原型（存档）
```

## 功能

- 用户登录/登出
- 旅行计划创建与管理
- 行程、航班、酒店、费用、行李等模块
- 管理员后台

## 快速开始

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

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本（含 Prisma 生成） |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |
