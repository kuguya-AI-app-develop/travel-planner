import TextRecognition from '@react-native-ml-kit/text-recognition';

// 航班信息提取结果
export interface TicketInfo {
  airline: string;
  code: string;
  route: string;
  dep: string;
  arr: string;
  price: number;
  cls: string;
  rawText: string;
}

// 识别状态
export type RecognitionStatus = 'idle' | 'recognizing' | 'success' | 'failed' | 'partial';

// 正则表达式常量
const REGEX_PATTERNS = {
  // 航班号识别：2个大写字母 + 1-4位数字（如CA1234, MU5678）
  flightCode: /\b([A-Z]{2})\s*(\d{1,4})\b/g,

  // 时间识别：HH:MM格式
  time: /\b([01]\d|2[0-3]):([0-5]\d)\b/g,

  // 日期识别：多种格式
  date: /\b(\d{1,2})[月/\-](\d{1,2})[日]?\b/g,

  // 机场代码识别：3位大写字母
  airportCode: /\b([A-Z]{3})\b/g,

  // 价格识别：人民币或美元符号
  price: /[¥$￥]\s*(\d[\d,]*)/,

  // 舱位识别：中英文
  class: /(经济舱|商务舱|头等舱|Economy|Business|First)/i,

  // 航空公司识别
  airline: /(中国国航|东方航空|南方航空|海南航空|厦门航空|四川航空|深圳航空|山东航空|春秋航空|吉祥航空|中国国航|Air China|China Eastern|China Southern|Hainan Airlines|XiamenAir|Sichuan Airlines|Shenzhen Airlines|Shandong Airlines|Spring Airlines|Juneyao Airlines)/i,

  // 出发地/目的地识别
  route: /([^\s→\-]+)\s*[→\-]\s*([^\s→\-]+)/,
};

// 常见机场代码到城市映射
const AIRPORT_CITY_MAP: Record<string, string> = {
  PEK: '北京首都',
  PKX: '北京大兴',
  PVG: '上海浦东',
  SHA: '上海虹桥',
  CAN: '广州',
  SZX: '深圳',
  CTU: '成都',
  CKG: '重庆',
  KMG: '昆明',
  XIY: '西安',
  HGH: '杭州',
  NKG: '南京',
  WUH: '武汉',
  CSX: '长沙',
  TSN: '天津',
  DLC: '大连',
  SHE: '沈阳',
  HRB: '哈尔滨',
  TAO: '青岛',
  JHG: '西双版纳',
  LJG: '丽江',
  SYX: '三亚',
  HAK: '海口',
  XMN: '厦门',
  FOC: '福州',
  TPE: '台北',
  HKG: '香港',
  MFM: '澳门',
  NRT: '东京成田',
  HND: '东京羽田',
  KIX: '大阪',
  ICN: '首尔',
  SIN: '新加坡',
  BKK: '曼谷',
  KUL: '吉隆坡',
  DPS: '巴厘岛',
  LHR: '伦敦',
  CDG: '巴黎',
  FRA: '法兰克福',
  JFK: '纽约',
  LAX: '洛杉矶',
  SFO: '旧金山',
  SEA: '西雅图',
  SYD: '悉尼',
  AKL: '奥克兰',
};

/**
 * 从图片中识别航班信息
 * @param imageUri 图片URI
 * @returns 识别结果
 */
export async function recognizeTicket(imageUri: string): Promise<TicketInfo> {
  try {
    // 调用ML Kit进行文本识别
    const result = await TextRecognition.recognize(imageUri);
    const rawText = result.text;

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('未识别到文字内容');
    }

    // 提取航班信息
    const ticketInfo = extractTicketInfo(rawText);

    return {
      ...ticketInfo,
      rawText,
    };
  } catch (error) {
    console.error('OCR识别失败:', error);
    throw error;
  }
}

/**
 * 从识别文本中提取航班信息
 */
function extractTicketInfo(rawText: string): Omit<TicketInfo, 'rawText'> {
  const text = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ');

  // 提取航班号
  const code = extractFlightCode(text);

  // 提取航空公司
  const airline = extractAirline(text, code);

  // 提取航线
  const route = extractRoute(text);

  // 提取时间
  const times = extractTimes(text);
  const dep = times[0] || '';
  const arr = times[1] || '';

  // 提取价格
  const price = extractPrice(text);

  // 提取舱位
  const cls = extractClass(text);

  return {
    airline,
    code,
    route,
    dep,
    arr,
    price,
    cls,
  };
}

/**
 * 提取航班号
 */
function extractFlightCode(text: string): string {
  const matches = text.match(REGEX_PATTERNS.flightCode);
  if (matches && matches.length > 0) {
    // 返回第一个匹配的航班号
    const match = matches[0];
    const codeMatch = match.match(/([A-Z]{2})\s*(\d{1,4})/);
    if (codeMatch) {
      return `${codeMatch[1]}${codeMatch[2]}`;
    }
  }
  return '';
}

/**
 * 提取航空公司
 */
function extractAirline(text: string, flightCode: string): string {
  // 先尝试直接匹配航空公司名称
  const airlineMatch = text.match(REGEX_PATTERNS.airline);
  if (airlineMatch) {
    return airlineMatch[1];
  }

  // 根据航班号前缀推断航空公司
  const airlinePrefix: Record<string, string> = {
    CA: '中国国航',
    MU: '东方航空',
    CZ: '南方航空',
    HU: '海南航空',
    MF: '厦门航空',
    '3U': '四川航空',
    ZH: '深圳航空',
    SC: '山东航空',
    '9C': '春秋航空',
    HO: '吉祥航空',
  };

  const prefix = flightCode.substring(0, 2);
  return airlinePrefix[prefix] || '';
}

/**
 * 提取航线
 */
function extractRoute(text: string): string {
  // 尝试匹配 "出发→到达" 格式
  const routeMatch = text.match(REGEX_PATTERNS.route);
  if (routeMatch) {
    const from = resolveAirport(routeMatch[1]);
    const to = resolveAirport(routeMatch[2]);
    return `${from}→${to}`;
  }

  // 尝试匹配两个连续的机场代码
  const airportMatches = text.match(REGEX_PATTERNS.airportCode);
  if (airportMatches && airportMatches.length >= 2) {
    // 过滤掉可能不是机场代码的匹配（如航班号中的字母）
    const airports = airportMatches.filter(code => AIRPORT_CITY_MAP[code]);
    if (airports.length >= 2) {
      const from = resolveAirport(airports[0]);
      const to = resolveAirport(airports[1]);
      return `${from}→${to}`;
    }
  }

  return '';
}

/**
 * 解析机场代码为城市名
 */
function resolveAirport(code: string): string {
  // 如果是3位大写字母，尝试查找城市映射
  if (/^[A-Z]{3}$/.test(code)) {
    return AIRPORT_CITY_MAP[code] || code;
  }
  // 否则直接返回原值
  return code;
}

/**
 * 提取时间
 */
function extractTimes(text: string): string[] {
  const times: string[] = [];
  const matches = text.match(REGEX_PATTERNS.time);

  if (matches) {
    for (const match of matches) {
      const timeMatch = match.match(/([01]\d|2[0-3]):([0-5]\d)/);
      if (timeMatch) {
        times.push(`${timeMatch[1]}:${timeMatch[2]}`);
      }
    }
  }

  return times;
}

/**
 * 提取价格
 */
function extractPrice(text: string): number {
  const match = text.match(REGEX_PATTERNS.price);
  if (match) {
    // 移除逗号并转换为数字
    const priceStr = match[1].replace(/,/g, '');
    const price = parseInt(priceStr, 10);
    if (!isNaN(price)) {
      return price;
    }
  }
  return 0;
}

/**
 * 提取舱位
 */
function extractClass(text: string): string {
  const match = text.match(REGEX_PATTERNS.class);
  if (match) {
    const cls = match[1].toLowerCase();
    if (cls === '经济舱' || cls === 'economy') {
      return '经济舱';
    } else if (cls === '商务舱' || cls === 'business') {
      return '商务舱';
    } else if (cls === '头等舱' || cls === 'first') {
      return '头等舱';
    }
  }
  return '经济舱'; // 默认经济舱
}

/**
 * 验证识别结果的有效性
 */
export function validateTicketInfo(info: Omit<TicketInfo, 'rawText'>): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!info.code) {
    missingFields.push('航班号');
  }
  if (!info.route) {
    missingFields.push('航线');
  }
  if (!info.dep) {
    missingFields.push('起飞时间');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * 清理和格式化识别结果
 */
export function formatTicketInfo(info: TicketInfo): TicketInfo {
  return {
    airline: info.airline.trim(),
    code: info.code.toUpperCase().replace(/\s/g, ''),
    route: info.route.trim(),
    dep: info.dep.trim(),
    arr: info.arr.trim(),
    price: info.price,
    cls: info.cls.trim() || '经济舱',
    rawText: info.rawText,
  };
}
