# Next.js 全栈迁移计划

## 目标
将现有 Vite + React 项目迁移到 Next.js 15 全栈架构，实现：
- 用户登录/注册
- 管理员后台
- 数据库持久化
- 数据隔离

## 执行步骤

### Phase 1: 项目初始化
- [ ] 创建 Next.js 15 项目
- [ ] 配置 TypeScript + Tailwind CSS（可选，保持现有 CSS 也行）
- [ ] 设置 Prisma + SQLite

### Phase 2: 数据库设计
- [ ] 创建 User 模型
- [ ] 创建 Plan 模型
- [ ] 生成并运行迁移

### Phase 3: 认证系统
- [ ] 实现 JWT 工具函数
- [ ] 创建登录 API (/api/auth/login)
- [ ] 创建注册 API (/api/auth/register)（管理员用）
- [ ] 创建用户信息 API (/api/auth/me)
- [ ] 创建 middleware 做路由守卫

### Phase 4: 前端页面迁移
- [ ] 迁移登录页面
- [ ] 迁移主页面（旅行计划）
- [ ] 迁移管理员页面
- [ ] 添加路由守卫逻辑

### Phase 5: API Routes
- [ ] 实现 /api/plans (CRUD)
- [ ] 实现 /api/admin/users (CRUD)
- [ ] 实现数据隔离（每个用户只能访问自己的 plans）

### Phase 6: 测试与调试
- [ ] 测试登录流程
- [ ] 测试管理员功能
- [ ] 测试数据隔离
- [ ] 修复 bug

## 技术栈
- Next.js 15 (App Router)
- TypeScript
- Prisma + SQLite
- JWT (jsonwebtoken + bcryptjs)
- 现有 CSS 样式体系

## 预计时间
- opencode 执行：30-60 分钟
- 测试调试：15-30 分钟

---
创建时间：2026-05-15 17:10
