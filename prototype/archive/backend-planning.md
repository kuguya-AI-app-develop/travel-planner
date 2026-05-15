# 旅行策划网站 — 后端与数据管理规划

## 一、现状分析

### 当前技术栈
- 前端：React 19 + Vite 8 + TypeScript
- 数据：前端 state + localStorage 持久化
- 无后端、无数据库

### 新增需求
1. **Login 画面** — 用户输入账号密码登录，区分普通用户 / 管理员
2. **Admin 画面** — 管理员发行、删除、编辑所有用户账号
3. **数据隔离** — 每个用户的旅行计划数据独立存储
4. **会话持久化** — 下次登录继续上次操作

---

## 二、是否需要单独后端项目？

**结论：需要，而且强烈建议单独建立后端项目。**

### 原因

| 需求 | 为什么前端无法独立实现 |
|------|------------------------|
| 用户认证 | 密码必须在服务端验证，前端无法安全存储 |
| 权限控制 | 普通用户/管理员路由守卫需要后端签发 token |
| 数据隔离 | 每个用户的数据需要服务端按 user_id 分开存储 |
| 账号管理 | 管理员增删改查用户需要服务端 API |
| 防作弊 | 前端 localStorage 数据用户可随意篡改 |

### 项目结构建议

```
travel-planner-website/          ← 现有前端项目（保持不变）
├── src/
├── prototype/
└── ...

travel-planner-backend/          ← 新建后端项目（独立仓库）
├── server.py                    ← 主入口
├── database.py                  ← 数据库操作
├── auth.py                      ← 认证逻辑
├── models/                      ← 数据模型
├── requirements.txt             ← Python 依赖
└── data/                        ← SQLite 数据库文件存放
    └── travel_planner.db
```

---

## 三、后端技术栈推荐

### 推荐方案：Python + FastAPI + SQLite

| 组件 | 选择 | 理由 |
|------|------|------|
| 语言 | **Python** | AI agent 最熟悉的语言，代码简洁易读，维护成本最低 |
| 框架 | **FastAPI** | 自动生成 API 文档，类型提示友好，AI agent 理解和修改最容易 |
| 数据库 | **SQLite** | 零配置，单文件存储，备份只需复制文件，无需额外服务 |
| 认证 | **JWT (PyJWT)** | 无状态 token，前后端分离友好 |

### 为什么选这个组合？

**对 AI agent 维护最友好：**

1. **Python 是 AI agent 最擅长的语言**
   - 几乎所有 AI 编程工具都对 Python 支持最好
   - 代码可读性高，像在读英语
   
2. **FastAPI 自动生成交互式文档**
   - 访问 `/docs` 就能看到所有 API 端点
   - AI agent 可以直接阅读文档理解接口
   
3. **SQLite 无需运维**
   - 不需要安装数据库服务
   - 数据库就是一个 `.db` 文件，备份/迁移极其简单
   - 适合个人项目的数据量

4. **依赖少、启动快**
   - `pip install fastapi uvicorn pyjwt` 即可
   - `python server.py` 一行启动

### 不推荐的方案

| 方案 | 不推荐原因 |
|------|-----------|
| Node.js + Express | JS 生态碎片化，依赖管理复杂，AI agent 维护成本略高 |
| Supabase/Firebase | 需要外部服务，有免费额度限制，配置和调试对非技术用户不友好 |
| Django | 对这个项目来说太重了，文件结构复杂 |
| MySQL/PostgreSQL | 需要额外安装和配置数据库服务，个人项目杀鸡用牛刀 |

---

## 四、数据模型设计

### 用户表 (users)

```sql
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT UNIQUE NOT NULL,      -- 登录用户名
    password    TEXT NOT NULL,             -- 哈希后的密码（bcrypt）
    role        TEXT DEFAULT 'user',       -- 'user' 或 'admin'
    status      TEXT DEFAULT 'active',     -- 'active', 'disabled', 'expired'
    expire_date TEXT,                      -- 到期时间（可选）
    note        TEXT,                      -- 备注
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 旅行计划表 (plans)

```sql
CREATE TABLE plans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,          -- 关联用户
    name        TEXT NOT NULL,             -- 计划名称
    status      TEXT DEFAULT 'draft',      -- 'draft', 'planning', 'booked', 'completed'
    start_date  TEXT,
    end_date    TEXT,
    data        TEXT,                      -- JSON 格式的完整计划数据
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 设计说明

- **data 字段用 JSON 存储完整计划**：保持灵活性，前端数据结构变化时不需要改数据库
- **每个 plan 关联 user_id**：实现数据隔离
- **密码用 bcrypt 哈希**：即使数据库泄露也无法还原明文

---

## 五、API 接口规划

### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录，返回 JWT token |
| POST | `/api/auth/logout` | 登出（可选） |
| GET  | `/api/auth/me` | 获取当前用户信息 |

### 用户管理（管理员）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/admin/users` | 获取所有用户列表 |
| POST   | `/api/admin/users` | 创建新用户 |
| PUT    | `/api/admin/users/{id}` | 更新用户信息 |
| DELETE | `/api/admin/users/{id}` | 删除用户 |
| PUT    | `/api/admin/users/{id}/status` | 启用/停用用户 |
| PUT    | `/api/admin/users/{id}/password` | 重置密码 |
| POST   | `/api/admin/users/import` | 批量导入用户（CSV） |

### 旅行计划（普通用户）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/plans` | 获取当前用户的所有计划 |
| POST   | `/api/plans` | 创建新计划 |
| PUT    | `/api/plans/{id}` | 更新计划 |
| DELETE | `/api/plans/{id}` | 删除计划 |

---

## 六、前端改造要点

### 路由结构

```
/login          → Login 页面（未登录时重定向到这里）
/               → 旅行计划主页面（需要登录，普通用户）
/admin          → 管理后台（需要登录，管理员权限）
```

### 关键改动

1. **添加路由守卫**
   - 未登录 → 重定向到 `/login`
   - 普通用户访问 `/admin` → 重定向到 `/`
   
2. **API 请求封装**
   - 统一的 fetch wrapper，自动带上 JWT token
   - 401 时自动跳转登录页

3. **数据来源切换**
   - 从 localStorage 改为从后端 API 获取/保存
   - 保持前端组件结构基本不变

---

## 七、部署方案

### 最简方案（适合个人项目）

1. **前端**：部署到 Vercel / Netlify（免费）
2. **后端**：部署到 Railway / Render（有免费额度）
3. **数据库**：SQLite 文件随服务端一起运行

### 本地开发

```bash
# 后端
cd travel-planner-backend
pip install -r requirements.txt
python server.py
# 服务运行在 http://localhost:8000

# 前端（修改 vite.config.ts 的 proxy 指向后端）
cd travel-planner-website
npm run dev
# 服务运行在 http://localhost:5173
```

---

## 八、安全注意事项

1. **密码存储**：必须用 bcrypt 哈希，不能存明文
2. **JWT Token**：设置合理过期时间（如 24 小时）
3. **CORS 配置**：只允许前端域名访问
4. **管理员保护**：至少保留一个管理员账号，不能全部删除
5. **输入验证**：所有 API 端点都要验证输入参数

---

## 九、总结

| 项目 | 建议 |
|------|------|
| 是否需要后端 | **是**，必须单独建立后端项目 |
| 后端语言 | **Python** |
| 后端框架 | **FastAPI** |
| 数据库 | **SQLite** |
| 认证方式 | **JWT** |
| 对 AI 维护友好度 | ★★★★★ |

这个方案的优势：
- 代码简洁，AI agent 可以轻松理解和修改
- 依赖少，启动快，不需要复杂配置
- SQLite 零运维，备份就是复制一个文件
- FastAPI 自带 API 文档，调试方便

---

*规划日期：2026-05-15*
*项目路径：/Users/lantianyi/个人项目/travel-planner-website/*
