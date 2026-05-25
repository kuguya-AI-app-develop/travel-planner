# AI 策划功能 - 开发规划

## 概述

为旅行规划网站新增 AI 策划功能：用户输入旅行需求，AI 自动生成完整的旅行 Plan，用户可以直接查看并修改。

## 技术方案

- **LLM 调用**: 后端 Route Handler，BYOK 模式（用户提供 API Key）
- **Key 存储**: sessionStorage（关闭标签页自动清除）
- **输出格式**: 结构化 JSON，匹配现有 Plan 数据类型
- **UI 生成**: OpenDesign
- **代码实现**: 八千代直接搭建 / OpenCode

---

## 开发阶段

### Phase 1: 后端 AI API 路由

**目标**: 搭建 `/api/ai/generate-plan` 接口

**任务清单**:
1. 创建 `/src/app/api/ai/generate-plan/route.ts`
2. 从请求头 `X-Api-Key` 读取用户的 API Key
3. 从请求体读取用户需求（目的地、天数、预算、偏好等）
4. 构造系统 Prompt，要求 LLM 输出符合 Plan 类型的 JSON
5. 调用 LLM API（先支持 OpenAI 兼容格式，覆盖 DeepSeek/通义千问等）
6. 解析 LLM 返回的 JSON，做 schema 校验
7. 调用现有的 `/api/plans` POST 逻辑创建新 Plan
8. 返回创建的 Plan 数据

**Prompt 设计要点**:
- 系统 Prompt 中嵌入 Plan 类型的 JSON Schema
- 要求 LLM 只返回纯 JSON，不要 markdown 包裹
- 用户需求作为变量传入，不拼接为系统指令（防注入）
- 对输出做合理性校验（日期格式、价格范围等）

**文件变更**:
- 新增: `src/app/api/ai/generate-plan/route.ts`
- 新增: `src/lib/ai/prompt.ts`（Prompt 模板）
- 新增: `src/lib/ai/schema.ts`（输出校验 schema）

---

### Phase 2: 前端 - API Key 管理

**目标**: 让用户输入和管理自己的 API Key

**任务清单**:
1. 创建 `ApiKeyModal` 组件（设置 API Key 的弹窗）
2. Key 存入 sessionStorage，页面加载时读取
3. 在 Sidebar 底部或设置区域添加"AI 设置"入口
4. 支持选择 API 提供商（OpenAI / DeepSeek / 自定义）
5. 提供 Key 验证功能（调用一个轻量级测试接口）

**交互流程**:
```
用户点击"AI 设置" 
  -> 弹出设置弹窗
  -> 选择提供商 + 输入 API Key + 输入 Base URL（可选）
  -> 点击"验证" -> 后端测试调用 -> 显示成功/失败
  -> 保存到 sessionStorage
```

**文件变更**:
- 新增: `src/components/ApiKeyModal.tsx`
- 修改: `src/components/Sidebar.tsx`（添加 AI 设置入口）

---

### Phase 3: 前端 - AI 策划 UI

**目标**: 需求收集表单 + 生成过程展示 + 结果预览

**任务清单**:
1. 创建 `AiPlanModal` 组件（需求收集 + 生成 + 预览的多步弹窗）
2. 设计需求表单（由 OpenDesign 生成 UI）:
   - 目的地（必填）
   - 出发日期 + 返回日期（必填）
   - 出发城市
   - 预算范围（可选）
   - 旅行偏好（多选：美食/购物/文化/自然/冒险/亲子 等）
   - 特殊要求（自由文本）
3. 生成中的 loading 状态（可考虑 streaming 展示）
4. 生成结果预览页（展示 AI 生成的 Plan 概要）
5. 用户确认后保存为新 Plan，跳转到编辑模式

**交互流程**:
```
用户点击"AI 策划"按钮
  -> 检查 sessionStorage 是否有 API Key
     -> 没有: 提示先设置 API Key
     -> 有: 进入需求表单
  -> 填写需求 -> 点击"开始生成"
  -> 调用 /api/ai/generate-plan（传需求 + API Key via header）
  -> 显示 loading/streaming
  -> 返回结果 -> 预览页展示 Plan 概要
  -> 用户点击"使用此方案" -> 保存为新 Plan -> 跳转编辑
```

**文件变更**:
- 新增: `src/components/AiPlanModal.tsx`
- 修改: `src/components/Sidebar.tsx` 或 `src/components/PlanSelector.tsx`（添加 AI 策划入口）

---

### Phase 4: Prompt 优化与测试

**目标**: 确保 AI 生成的 Plan 质量可靠

**任务清单**:
1. 用不同需求测试 Prompt 效果
2. 调整 Prompt 中的约束条件:
   - 行程时间分配是否合理
   - 酒店/航班信息是否真实可用
   - 费用估算是否在合理范围
   - 目的地描述是否准确
3. 处理边界情况:
   - LLM 返回格式异常的重试逻辑
   - 超时处理
   - Token 超限处理
4. 添加 AI 生成标记（Plan 中标记 aiGenerated: true）

---

### Phase 5: 收尾与增强

**任务清单**:
1. 错误处理完善（网络错误、API 限流、Key 无效等）
2. 移动端适配
3. 可选: 流式输出（SSE），提升用户体验
4. 可选: AI 生成后支持"微调"（对话式修改 Plan）
5. 可选: 多 LLM 提供商支持（Anthropic、Gemini 等）

---

## 文件结构预览

```
nextjs-app/src/
├── app/api/ai/
│   └── generate-plan/
│       └── route.ts          # AI 生成 Plan 的 API
├── lib/ai/
│   ├── prompt.ts             # Prompt 模板
│   └── schema.ts             # 输出校验
├── components/
│   ├── ApiKeyModal.tsx        # API Key 设置弹窗
│   └── AiPlanModal.tsx       # AI 策划主弹窗（需求表单 + 结果预览）
```

---

## 执行顺序建议

1. **Phase 1** (后端 API) - 八千代直接搭建，核心逻辑
2. **Phase 2** (Key 管理 UI) - OpenDesign 生成 UI，八千代集成
3. **Phase 3** (AI 策划 UI) - OpenDesign 生成 UI，八千代集成
4. **Phase 4** (测试优化) - 八千代调试 Prompt
5. **Phase 5** (收尾增强) - 按需推进

---

## 注意事项

- API Key 不落库、不写日志，只在请求内存中使用
- 用户输入与系统 Prompt 严格分离，防 Prompt 注入
- AI 生成的 Plan 自动标记，提示用户核实关键信息
- 后端对 LLM 输出做 schema 校验，不合法则返回错误
