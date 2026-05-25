/**
 * AI 功能安全校验工具
 */

// ============================================================
// 1. SSRF 防护 — Base URL 校验
// ============================================================

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
  // IPv6 mapped IPv4 点分十进制形式（如 ::ffff:127.0.0.1）
  /^::ffff:(127|10|172\.(1[6-9]|2\d|3[01])|192\.168|169\.254)\./i,
  /^0:0:0:0:0:ffff:(127|10|172\.(1[6-9]|2\d|3[01])|192\.168|169\.254)\./i,
]

// Node.js URL 会将 IPv6 mapped IPv4 转为十六进制形式
// 如 ::ffff:127.0.0.1 → ::ffff:7f00:1
const IPV6_MAPPED_PRIVATE_HEX = [
  /^::ffff:7f/i,                    // 127.0.0.0/8  → 7f00:0 - 7fff:ffff
  /^::ffff:a00:/i,                  // 10.0.0.0/8   → a00:0 - aff:ffff（单字节）
  /^::ffff:a[0-9a-f]{2}:/i,        // 10.0.0.0/8   → aXX:（兼容两位十六进制）
  /^::ffff:ac(1[0-9a-f]|2[0-9a-f]):/i, // 172.16.0.0/12
  /^::ffff:c0a8:/i,                 // 192.168.0.0/16
  /^::ffff:a9fe:/i,                 // 169.254.0.0/16
]

const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal', 'instance-data', '0.0.0.0']

/**
 * 校验 Base URL 是否安全（防 SSRF）
 * - 必须是 http/https 协议
 * - 禁止私有 IP、localhost、链路本地地址
 */
export function validateBaseUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true } // 空值走默认

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, error: 'Base URL 格式无效' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Base URL 必须使用 http 或 https 协议' }
  }

  // 取出 hostname，去除 IPv6 方括号后统一校验
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '')

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { valid: false, error: '不允许访问内部地址' }
  }

  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: '不允许访问私有网络地址' }
    }
  }

  // 检查十六进制形式的 IPv6 mapped IPv4
  for (const pattern of IPV6_MAPPED_PRIVATE_HEX) {
    if (pattern.test(hostname)) {
      return { valid: false, error: '不允许访问私有网络地址' }
    }
  }

  return { valid: true }
}

// ============================================================
// 2. 速率限制（内存级，per-user）
// ============================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// 每 5 分钟清理过期条目，防止内存泄漏
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * 检查速率限制
 * @param key  限制维度（如 userId）
 * @param limit  窗口内最大请求数
 * @param windowMs  时间窗口（毫秒）
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true }
}

// ============================================================
// 3. 模型名称校验
// ============================================================

const MODEL_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9\-_.\/:]*$/
const MODEL_NAME_MAX_LENGTH = 128

export function validateModelName(model: string): { valid: boolean; error?: string } {
  if (!model) return { valid: true } // 空值走默认

  if (model.length > MODEL_NAME_MAX_LENGTH) {
    return { valid: false, error: `模型名称过长（最多 ${MODEL_NAME_MAX_LENGTH} 字符）` }
  }

  if (!MODEL_NAME_PATTERN.test(model)) {
    return { valid: false, error: '模型名称包含非法字符' }
  }

  return { valid: true }
}

// ============================================================
// 4. JSON 安全解析（防原型污染）
// ============================================================

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype', '__defineGetter__', '__defineSetter__'])

/**
 * 递归过滤危险键名，防止原型污染
 */
function stripDangerousKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripDangerousKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    const clean: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (!DANGEROUS_KEYS.has(key)) {
        clean[key] = stripDangerousKeys(value)
      }
    }
    return clean
  }
  return obj
}

/**
 * 安全地解析 JSON 字符串，过滤原型污染键
 */
export function safeJsonParse(json: string): unknown {
  const parsed = JSON.parse(json)
  return stripDangerousKeys(parsed)
}

// ============================================================
// 5. 字符串清理（用于 AI 输出的文本字段）
// ============================================================

/**
 * 清理字符串中的潜在危险内容
 * - 去除 HTML 标签
 * - 去除控制字符
 * - 限制最大长度
 */
export function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''

  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 去除控制字符（保留 \t \n \r）
    .replace(/<[^>]*>/g, '') // 去除 HTML 标签
    .trim()
    .slice(0, maxLength)
}
