/**
 * AI 旅行计划生成 - Prompt 模板
 */

export interface AiPlanRequest {
  destination: string          // 目的地（必填）
  startDate: string           // 出发日期 YYYY-MM-DD
  endDate: string             // 返回日期 YYYY-MM-DD
  departureCity?: string      // 出发城市
  budget?: string             // 预算范围，如 "5000-10000"
  preferences?: string[]      // 旅行偏好：美食/购物/文化/自然/冒险/亲子 等
  specialRequests?: string    // 特殊要求（自由文本）
}

export function buildSystemPrompt(): string {
  return `你是一个专业的旅行规划助手。用户会给你旅行需求，你需要生成一个完整的旅行计划。

输出要求：
1. 只输出纯 JSON，不要任何 markdown 格式、代码块标记、解释文字
2. JSON 必须严格符合下面的结构
3. 所有 id 字段从 1 开始递增
4. 日期格式统一为 YYYY-MM-DD
5. 价格为数字（人民币），要合理真实
6. 行程安排要合理，每天不要太满也不要太空
7. 航班信息尽量使用真实存在的航线（航空公司+航班号格式如 NH919、CA921）
8. 酒店信息要基于目的地实际情况推荐
9. 费用估算要包含机票、酒店、餐饮、门票、交通等各项

Plan JSON 结构：
{
  "name": "计划名称（简短有吸引力，如'东京5日深度游'）",
  "status": "draft",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "trips": [
    {
      "id": 1,
      "name": "行程名称",
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD",
      "color": "oklch(56% 0.2 265)"
    }
  ],
  "flights": [
    {
      "id": 1,
      "airline": "航空公司",
      "code": "航班号",
      "route": "出发地 → 目的地",
      "dep": "HH:MM",
      "arr": "HH:MM",
      "price": 数字,
      "cls": "经济舱/商务舱",
      "status": "pending",
      "selected": false,
      "notes": { "0": "备注1", "1": "备注2" }
    }
  ],
  "destinations": [
    {
      "id": 1,
      "name": "目的地名称",
      "country": "国家",
      "notes": "简短描述",
      "scores": [景色, 文化, 美食, 交通便利, 安全性, 性价比],
      "selected": true
    }
  ],
  "hotels": [
    {
      "id": 1,
      "name": "酒店名称",
      "location": "位置",
      "price": "¥XXX/晚",
      "priceNum": 数字,
      "scores": [性价比, 位置, 卫生, 设施, 服务],
      "selected": false
    }
  ],
  "expenses": [
    {
      "id": 1,
      "name": "费用名称",
      "category": "分类（机票/酒店/餐饮/门票/交通/购物/其他）",
      "amount": 数字,
      "status": "planned",
      "note": "备注",
      "selected": true
    }
  ],
  "checklist": [
    {
      "id": 1,
      "text": "待办事项",
      "done": false
    }
  ],
  "itinerary": [
    {
      "id": 1,
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "type": "sight/food/transport/hotel/other",
      "title": "活动标题",
      "meta": "简短描述或地点",
      "order": 1
    }
  ],
  "packingCategories": [
    {
      "id": 1,
      "name": "分类名称",
      "items": [
        { "id": 1, "text": "物品名称", "done": false }
      ]
    }
  ],
  "documents": []
}

注意：
- flights 中 status 用 "pending"，selected 用 false
- hotels 中 selected 第一个用 true，其余 false
- expenses 中 status 用 "planned"
- checklist 的 done 都用 false
- scores 数组中的数字范围 1-5
- color 字段用 oklch 格式，可以随机选择不同颜色
- itinerary 的 order 按时间顺序从 1 开始
- 至少生成 2 个航班（往返）、2 个酒店选项、5 个以上费用项、每天 3-5 个行程安排
- packingCategories 至少包含：证件、衣物、电子产品、日用品
- documents 生成空数组 []`
}

export function buildUserPrompt(req: AiPlanRequest): string {
  const parts: string[] = []

  parts.push(`目的地：${req.destination}`)
  parts.push(`出发日期：${req.startDate}`)
  parts.push(`返回日期：${req.endDate}`)

  if (req.departureCity) {
    parts.push(`出发城市：${req.departureCity}`)
  }
  if (req.budget) {
    parts.push(`预算范围：${req.budget} 元人民币`)
  }
  if (req.preferences && req.preferences.length > 0) {
    parts.push(`旅行偏好：${req.preferences.join('、')}`)
  }
  if (req.specialRequests) {
    parts.push(`特殊要求：${req.specialRequests}`)
  }

  parts.push('')
  parts.push('请根据以上需求生成完整的旅行计划 JSON。')

  return parts.join('\n')
}
