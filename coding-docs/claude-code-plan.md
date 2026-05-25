# Travel Planner - Claude Code 执行计划

## 前置信息
- 项目路径: ~/个人项目/travel-planner-website/nextjs-app
- 当前分支: feature/ai-plan-generator
- 执行工具: Claude Code CLI

---

## Task 1: 修复 Prisma 配置 + .env

**目标**: 让项目能正常 build

**具体步骤**:
1. 修改 `prisma/schema.prisma`:
   - 将 `provider = "postgresql"` 改为 `provider = "sqlite"`
   - 将 `url = env("DATABASE_URL")` 改为 `url = "file:./dev.db"`
2. 创建 `.env` 文件（如需要 DATABASE_URL 环境变量）
3. 运行 `npx prisma db push` 确认数据库正常
4. 运行 `npx prisma db seed` 初始化默认用户（admin/admin123, demo/demo123）

**验证**: `npm run build` 成功，无 Prisma 报错

---

## Task 2: 修复 TypeScript 编译错误

**目标**: 消除所有 TS 错误

**具体步骤**:
1. 运行 `npx tsc --noEmit` 查看所有错误
2. 修复组件 import 路径（相对路径 -> @/ 别名）
3. 确认 bcryptjs 和 jsonwebtoken 的类型定义已安装
4. 修复其他 TS 类型错误

**验证**: `npx tsc --noEmit` 无错误

---

## Task 3: 功能测试 + Bug 修复

**目标**: 核心流程跑通

**具体步骤**:
1. 启动 `npm run dev`
2. 测试登录流程（admin/admin123）
3. 测试旅行计划 CRUD
4. 测试 AI 计划生成（需要配置 API Key）
5. 测试管理员功能
6. 测试数据隔离（不同用户只能看到自己的计划）
7. 修复发现的 bug

**验证**: 手动走完 login -> 创建计划 -> 查看计划 -> 管理员操作 全流程

---

## Task 4: 代码清理 + 合并准备

**目标**: 准备合并到 master

**具体步骤**:
1. 检查是否有 console.log 等调试代码残留
2. 更新 README（技术栈说明已过时，写的是 PostgreSQL）
3. 确认 .gitignore 包含 .env、dev.db、node_modules
4. 运行 `npm run build` 确认生产构建正常

**验证**: build 成功，无警告

---

## 执行顺序

Task 1 -> Task 2 -> Task 3 -> Task 4

每个 Task 用 Claude Code 单独执行，完成后再进下一个。
