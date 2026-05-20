/**
 * AI 生成 Plan 的输出校验
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePlanJson(data: unknown): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['输出不是有效的 JSON 对象'] }
  }

  const obj = data as Record<string, unknown>

  // 基础字段
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    errors.push('缺少或无效的计划名称 (name)')
  }

  if (typeof obj.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obj.startDate)) {
    errors.push('缺少或无效的开始日期 (startDate)，格式应为 YYYY-MM-DD')
  }

  if (typeof obj.endDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obj.endDate)) {
    errors.push('缺少或无效的结束日期 (endDate)，格式应为 YYYY-MM-DD')
  }

  // trips
  if (!Array.isArray(obj.trips)) {
    errors.push('缺少行程数组 (trips)')
  } else {
    obj.trips.forEach((trip: unknown, i: number) => {
      const t = trip as Record<string, unknown>
      if (typeof t.name !== 'string') errors.push(`trips[${i}]: 缺少 name`)
      if (typeof t.start !== 'string') errors.push(`trips[${i}]: 缺少 start`)
      if (typeof t.end !== 'string') errors.push(`trips[${i}]: 缺少 end`)
    })
  }

  // flights
  if (!Array.isArray(obj.flights)) {
    errors.push('缺少航班数组 (flights)')
  } else {
    obj.flights.forEach((flight: unknown, i: number) => {
      const f = flight as Record<string, unknown>
      if (typeof f.airline !== 'string') errors.push(`flights[${i}]: 缺少 airline`)
      if (typeof f.code !== 'string') errors.push(`flights[${i}]: 缺少 code`)
      if (typeof f.route !== 'string') errors.push(`flights[${i}]: 缺少 route`)
      if (typeof f.dep !== 'string') errors.push(`flights[${i}]: 缺少 dep`)
      if (typeof f.arr !== 'string') errors.push(`flights[${i}]: 缺少 arr`)
      if (typeof f.price !== 'number' || f.price <= 0) errors.push(`flights[${i}]: 无效的 price`)
    })
  }

  // destinations
  if (!Array.isArray(obj.destinations)) {
    errors.push('缺少目的地数组 (destinations)')
  } else {
    obj.destinations.forEach((dest: unknown, i: number) => {
      const d = dest as Record<string, unknown>
      if (typeof d.name !== 'string') errors.push(`destinations[${i}]: 缺少 name`)
      if (!Array.isArray(d.scores) || d.scores.length < 4) {
        errors.push(`destinations[${i}]: scores 数组不完整`)
      }
    })
  }

  // hotels
  if (!Array.isArray(obj.hotels)) {
    errors.push('缺少酒店数组 (hotels)')
  } else {
    obj.hotels.forEach((hotel: unknown, i: number) => {
      const h = hotel as Record<string, unknown>
      if (typeof h.name !== 'string') errors.push(`hotels[${i}]: 缺少 name`)
      if (typeof h.priceNum !== 'number' || h.priceNum <= 0) errors.push(`hotels[${i}]: 无效的 priceNum`)
    })
  }

  // expenses
  if (!Array.isArray(obj.expenses)) {
    errors.push('缺少费用数组 (expenses)')
  } else {
    obj.expenses.forEach((expense: unknown, i: number) => {
      const e = expense as Record<string, unknown>
      if (typeof e.name !== 'string') errors.push(`expenses[${i}]: 缺少 name`)
      if (typeof e.amount !== 'number' || e.amount < 0) errors.push(`expenses[${i}]: 无效的 amount`)
    })
  }

  // checklist
  if (!Array.isArray(obj.checklist)) {
    errors.push('缺少待办数组 (checklist)')
  }

  // itinerary
  if (!Array.isArray(obj.itinerary)) {
    errors.push('缺少行程安排数组 (itinerary)')
  } else {
    obj.itinerary.forEach((item: unknown, i: number) => {
      const it = item as Record<string, unknown>
      if (typeof it.date !== 'string') errors.push(`itinerary[${i}]: 缺少 date`)
      if (typeof it.title !== 'string') errors.push(`itinerary[${i}]: 缺少 title`)
      const validTypes = ['sight', 'food', 'transport', 'hotel', 'other']
      if (!validTypes.includes(it.type as string)) {
        errors.push(`itinerary[${i}]: 无效的 type，应为 ${validTypes.join('/')}`)
      }
    })
  }

  // packingCategories
  if (!Array.isArray(obj.packingCategories)) {
    errors.push('缺少行李分类数组 (packingCategories)')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 清理和补全 AI 生成的数据，确保符合前端期望的格式
 */
export function sanitizePlanData(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    status: 'draft',
    id: 0, // 由数据库分配
    trips: Array.isArray(data.trips) ? data.trips.map((t: unknown, i: number) => {
      const trip = t as Record<string, unknown>
      return {
        id: trip.id ?? i + 1,
        name: trip.name,
        start: trip.start,
        end: trip.end,
        color: trip.color || `oklch(${50 + Math.random() * 20}% ${0.15 + Math.random() * 0.1} ${Math.random() * 360})`
      }
    }) : [],
    flights: Array.isArray(data.flights) ? data.flights.map((f: unknown, i: number) => {
      const flight = f as Record<string, unknown>
      return {
        id: flight.id ?? i + 1,
        airline: flight.airline,
        code: flight.code,
        route: flight.route,
        dep: flight.dep,
        arr: flight.arr,
        price: flight.price,
        cls: flight.cls || '经济舱',
        status: 'pending',
        selected: false,
        notes: flight.notes || {}
      }
    }) : [],
    destinations: Array.isArray(data.destinations) ? data.destinations.map((d: unknown, i: number) => {
      const dest = d as Record<string, unknown>
      return {
        id: dest.id ?? i + 1,
        name: dest.name,
        country: dest.country || '',
        notes: dest.notes || '',
        scores: Array.isArray(dest.scores) ? dest.scores : [3, 3, 3, 3, 3, 3],
        selected: dest.selected ?? (i === 0)
      }
    }) : [],
    hotels: Array.isArray(data.hotels) ? data.hotels.map((h: unknown, i: number) => {
      const hotel = h as Record<string, unknown>
      return {
        id: hotel.id ?? i + 1,
        name: hotel.name,
        location: hotel.location || '',
        price: hotel.price || `¥${hotel.priceNum}/晚`,
        priceNum: hotel.priceNum,
        scores: Array.isArray(hotel.scores) ? hotel.scores : [3, 3, 3, 3, 3],
        selected: hotel.selected ?? (i === 0)
      }
    }) : [],
    expenses: Array.isArray(data.expenses) ? data.expenses.map((e: unknown, i: number) => {
      const exp = e as Record<string, unknown>
      return {
        id: exp.id ?? i + 1,
        name: exp.name,
        category: exp.category || '其他',
        amount: exp.amount,
        status: 'planned',
        note: exp.note || '',
        selected: exp.selected ?? true
      }
    }) : [],
    checklist: Array.isArray(data.checklist) ? data.checklist.map((c: unknown, i: number) => {
      const item = c as Record<string, unknown>
      return {
        id: item.id ?? i + 1,
        text: item.text,
        done: false
      }
    }) : [],
    itinerary: Array.isArray(data.itinerary) ? data.itinerary.map((it: unknown, i: number) => {
      const item = it as Record<string, unknown>
      return {
        id: item.id ?? i + 1,
        date: item.date,
        time: item.time || '09:00',
        type: item.type || 'other',
        title: item.title,
        meta: item.meta || '',
        order: item.order ?? i + 1
      }
    }) : [],
    packingCategories: Array.isArray(data.packingCategories) ? data.packingCategories.map((cat: unknown, i: number) => {
      const c = cat as Record<string, unknown>
      return {
        id: c.id ?? i + 1,
        name: c.name,
        items: Array.isArray(c.items) ? c.items.map((item: unknown, j: number) => {
          const p = item as Record<string, unknown>
          return {
            id: p.id ?? j + 1,
            text: p.text,
            done: false
          }
        }) : []
      }
    }) : [],
    documents: Array.isArray(data.documents) ? data.documents : []
  }
}
