import TextRecognition from '@react-native-ml-kit/text-recognition';
import { TransportType } from '../store/types';

// 票据信息提取结果
export interface TicketInfo {
  type: TransportType;
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

/**
 * 根据车次/航班号判断交通方式类型
 */
function getTransportType(code: string): TransportType {
  if (!code) return 'plane';

  const prefix = code.substring(0, 1).toUpperCase();

  // 高铁车次
  if (prefix === 'G') return 'highspeed';

  // 动车车次
  if (prefix === 'D' || prefix === 'C') return 'train';

  // 普通火车
  if (prefix === 'K' || prefix === 'T' || prefix === 'Z') return 'train';

  // 其他情况默认为飞机
  return 'plane';
}

// 正则表达式常量 - 增强兼容性
const REGEX_PATTERNS = {
  // 航班号识别：多种格式支持
  // 1. 标准格式: CA1234, MU5678
  // 2. 带空格: CA 1234, MU 5678
  // 3. 带横杠: CA-1234, MU-5678
  // 4. 两位字母+1-4位数字
  flightCode: /\b([A-Z]{2})[\s\-]*(\d{1,4})\b/g,

  // 时间识别：多种格式 - 排除日期上下文
  // 1. HH:MM 格式（如 08:30）
  // 2. HH.MM 格式（如 08.30）
  // 3. HHMM 格式（如0830）- 但排除4位连续数字（可能是日期）
  time: /(?:^|[^\d])([01]\d|2[0-3])[:\.]([0-5]\d)(?:[^\d]|$)|(?:出发|到达|departs|arrives|从|到)[:\s]*(?:^|[^\d])([01]\d|2[0-3])([0-5]\d)(?:[^\d]|$)/g,

  // 日期识别：多种格式
  // 1. 月/日: 12/25, 1-15
  // 2. 年-月-日: 2024-12-25
  // 3. 月日: 12月25日
  date: /(\d{4})[年\-\/]?(\d{1,2})[月\-\/](\d{1,2})[日]?|(\d{1,2})[月/\-](\d{1,2})[日]?/g,

  // 机场代码识别：3位大写字母（排除常见非机场代码）
  airportCode: /\b([A-Z]{3})\b/g,

  // 价格识别：多种格式
  // 1. ¥3,280 或 $450 或 ￥2,680
  // 2. 1580元
  // 3. 1340CNY 或 CNY1580
  // 4. 价格:1580 或 票价 1580
  price: /[¥$￥€£]\s*(\d[\d,]*\.?\d*)|(\d[\d,]*\.?\d*)\s*(?:元|¥|CNY)|CNY\s*(\d[\d,]*\.?\d*)|(?:价格|票价|费用|含税票价|参考金额|price|amount)[:\s]*(?:¥)?(\d[\d,]*\.?\d*)/i,

  // 舱位识别：中英文扩展
  class: /(经济舱|商务舱|头等舱|超级经济舱|Economy|Business|First|Premium\s*Economy)/i,

  // 航空公司识别 - 扩展更多航司
  airline: /(成都航空|中国国航|东方航空|南方航空|海南航空|厦门航空|四川航空|深圳航空|山东航空|春秋航空|吉祥航空|首都航空|天津航空|西部航空|祥鹏航空|长龙航空|华夏航空|瑞丽航空|九元航空|Air China|China Eastern|China Southern|Hainan Airlines|XiamenAir|Sichuan Airlines|Shenzhen Airlines|Shandong Airlines|Spring Airlines|Juneyao Airlines|Capital Airlines|Tianjin Airlines|West Air|Lucky Air|Loong Air|China Express)/i,

  // 出发地/目的地识别 - 支持多种分隔符
  route: /([^\s→\-\-→]+)\s*[→\-\-→]\s*([^\s→\-\-→]+)/,

  // 高铁车次识别
  trainCode: /\b([GDZKLCd]\d{1,4})\b/g,

  // 出租车/网约车
  taxiIndicator: /(出租车|网约车|滴滴|打车|taxi|uber)/i,
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

// 常见中文城市名到机场代码映射（包括机场简称）
const CITY_AIRPORT_MAP: Record<string, string> = {
  '北京': 'PEK',
  '上海': 'PVG',
  '广州': 'CAN',
  '深圳': 'SZX',
  '成都': 'CTU',
  '天府': 'CTU',
  '重庆': 'CKG',
  '昆明': 'KMG',
  '西安': 'XIY',
  '杭州': 'HGH',
  '南京': 'NKG',
  '武汉': 'WUH',
  '长沙': 'CSX',
  '天津': 'TSN',
  '大连': 'DLC',
  '沈阳': 'SHE',
  '哈尔滨': 'HRB',
  '青岛': 'TAO',
  '厦门': 'XMN',
  '福州': 'FOC',
  '三亚': 'SYX',
  '海口': 'HAK',
  '香港': 'HKG',
  '澳门': 'MFM',
  '新加坡': 'SIN',
  '曼谷': 'BKK',
  '吉隆坡': 'KUL',
  '科莫多': 'KOM',
};

/**
 * 预处理文本，提高识别准确率
 */
function preprocessText(text: string): string {
  // 替换常见OCR错误
  let processed = text
    // 替换相似字符
    .replace(/[oO](?=\d)/g, '0')  // O在数字前替换为0
    .replace(/[lI](?=[A-Z]{2})/g, '1')  // l/I在大写字母前可能是1
    .replace(/(?<=\d)[oO]/g, '0')  // 数字后的O替换为0
    // 统一全角字符
    .replace(/[：]/g, ':')
    .replace(/[－]/g, '-')
    .replace(/[→]/g, '→')
    // 移除多余空白
    .replace(/\s+/g, ' ')
    .trim();

  return processed;
}

/**
 * 从图片中识别航班信息
 * @param imageUri 图片URI
 * @returns 识别结果
 */
export async function recognizeTicket(imageUri: string): Promise<TicketInfo> {
  try {
    // 调用ML Kit进行文本识别
    const result = await TextRecognition.recognize(imageUri);
    let rawText = result.text;

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('未识别到文字内容');
    }

    // 预处理文本
    rawText = preprocessText(rawText);

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

  // 提取车次/航班号
  const code = extractFlightCode(text);

  // 根据车次/航班号判断交通方式类型
  const type = getTransportType(code);

  // 提取航空公司/运营商
  const airline = extractAirline(text, code);

  // 提取路线
  const route = extractRoute(text);

  // 提取时间
  const times = extractTimes(text);
  const dep = times[0] || '';
  const arr = times[1] || '';

  // 提取价格
  const price = extractPrice(text);

  // 提取舱位/座位类型
  const cls = extractClass(text);

  return {
    type,
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
 * 提取车次/航班号 - 增强兼容性
 */
function extractFlightCode(text: string): string {
  // 有效的航空公司代码前缀
  const validPrefixes = ['CA', 'MU', 'CZ', 'HU', 'MF', '3U', 'ZH', 'SC', '9C', 'HO', 'JD', 'GS', 'EU', '8L', 'G5', 'QW', '9D', 'NH', 'KE', 'OZ'];

  // 有效的高铁/火车车次前缀
  const trainPrefixes = ['G', 'D', 'C', 'K', 'T', 'Z'];

  // 1. 首先尝试高铁/火车车次（G/D/C/K/T/Z + 数字）
  const trainRegex = /\b([GDZKLC])\s*(\d{1,4})\b/gi;
  let trainMatch;
  while ((trainMatch = trainRegex.exec(text)) !== null) {
    const prefix = trainMatch[1].toUpperCase();
    if (trainPrefixes.includes(prefix)) {
      return `${prefix}${trainMatch[2]}`;
    }
  }

  // 2. 尝试标准航班号格式（2位字母+数字）
  const matches = text.match(REGEX_PATTERNS.flightCode);
  if (matches && matches.length > 0) {
    for (const match of matches) {
      const codeMatch = match.match(/([A-Z]{2})[\s\-]*(\d{1,4})/);
      if (codeMatch) {
        const code = `${codeMatch[1]}${codeMatch[2]}`;
        if (validPrefixes.includes(code.substring(0, 2))) {
          return code;
        }
      }
    }
  }

  // 3. 备用方案1：查找数字开头的航司代码（如3U, 9C）
  const numPrefixRegex = /\b(\d[A-Z])[\s\-]*(\d{1,4})\b/g;
  let numMatch;
  while ((numMatch = numPrefixRegex.exec(text)) !== null) {
    const code = `${numMatch[1]}${numMatch[2]}`;
    if (validPrefixes.includes(code.substring(0, 2))) {
      return code;
    }
  }

  // 4. 备用方案2：查找"航班号"或"车次"附近的文本
  const labelMatch = text.match(/(?:航班|车次|flight|Flight)[:\s]*([A-Z0-9]{2}[\s\-]*\d{1,4})/i);
  if (labelMatch) {
    const code = labelMatch[1].replace(/[\s\-]/g, '');
    if (validPrefixes.includes(code.substring(0, 2)) || trainPrefixes.includes(code.substring(0, 1).toUpperCase())) {
      return code;
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
    EU: '成都航空',
  };

  const prefix = flightCode.substring(0, 2);
  return airlinePrefix[prefix] || '';
}

/**
 * 提取航线 - 增强兼容性
 */
function extractRoute(text: string): string {
  // 尝试匹配 "出发→到达" 格式
  const routeMatch = text.match(REGEX_PATTERNS.route);
  if (routeMatch) {
    const from = resolveAirport(routeMatch[1]);
    const to = resolveAirport(routeMatch[2]);
    if (from !== routeMatch[1] || to !== routeMatch[2]) {
      return `${from}→${to}`;
    }
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

  // 备用方案：查找"出发"、"到达"、"from"、"to"附近的文本
  const fromToMatch = text.match(/(?:出发|from|FROM)[:\s]*([^\s,，]+).*?(?:到达|to|TO)[:\s]*([^\s,，]+)/i);
  if (fromToMatch) {
    const from = resolveAirport(fromToMatch[1]);
    const to = resolveAirport(fromToMatch[2]);
    return `${from}→${to}`;
  }

  // 查找城市名模式（如"北京-上海"，"北京至上海"，"厦门-成都"）
  const cityPairMatch = text.match(/([一-龥]{2,4})[\s\-\至到→]+([一-龥]{2,4})/);
  if (cityPairMatch) {
    const fromCity = cityPairMatch[1];
    const toCity = cityPairMatch[2];
    // 检查是否是有效的城市名
    if (CITY_AIRPORT_MAP[fromCity] || CITY_AIRPORT_MAP[toCity]) {
      return `${fromCity}→${toCity}`;
    }
  }

  // 尝试匹配带航站楼的格式（如"成都双流T2-深圳宝安T3"）
  // 使用已知城市名来提取
  const knownCities = Object.keys(CITY_AIRPORT_MAP);
  for (const city of knownCities) {
    const idx = text.indexOf(city);
    if (idx >= 0) {
      // 在城市名后面查找分隔符和另一个城市名
      const afterCity = text.substring(idx + city.length);
      // 优先匹配2个中文字符的城市名
      const match2 = afterCity.match(/[\-\-→]\s*([一-龥]{2})/);
      if (match2 && CITY_AIRPORT_MAP[match2[1]]) {
        return `${city}→${match2[1]}`;
      }
      // 如果没有匹配到2个字符，尝试3个字符
      const match3 = afterCity.match(/[\-\-→]\s*([一-龥]{3})/);
      if (match3 && CITY_AIRPORT_MAP[match3[1]]) {
        return `${city}→${match3[1]}`;
      }
    }
  }
  if (cityPairMatch) {
    return `${cityPairMatch[1]}→${cityPairMatch[2]}`;
  }

  return '';
}

/**
 * 解析机场代码或城市别名为标准城市名
 */
function resolveAirport(code: string): string {
  // 如果是3位大写字母，尝试查找机场代码映射
  if (/^[A-Z]{3}$/.test(code)) {
    return AIRPORT_CITY_MAP[code] || code;
  }
  // 如果是中文，尝试查找城市别名映射（如"天府"→"成都"）
  if (CITY_AIRPORT_MAP[code]) {
    // 返回对应的城市名（对于机场别名，需要找到实际城市名）
    const airportCode = CITY_AIRPORT_MAP[code];
    const cityName = AIRPORT_CITY_MAP[airportCode];
    return cityName ? cityName.replace(/首都|大兴|浦东|虹桥/g, '') : code;
  }
  // 否则直接返回原值
  return code;
}

/**
 * 提取时间 - 增强兼容性
 */
function extractTimes(text: string): string[] {
  const times: string[] = [];

  // 首先移除日期相关的数字（避免年份被误识别为时间）
  let cleanText = text;
  cleanText = cleanText.replace(/\d{4}[年\-\.\/]\d{1,2}[月\-\.\/]\d{1,2}[日]?/g, ' ');
  cleanText = cleanText.replace(/\d{4}年\d{1,2}月\d{1,2}日/g, ' ');
  cleanText = cleanText.replace(/\d{1,2}[月/\-]\d{1,2}[日]?/g, ' ');
  cleanText = cleanText.replace(/\b(19|20)\d{2}\b/g, ' ');

  // 按文本顺序提取所有时间
  // 支持格式: HH:MM, HH.MM, HHMM, HH-MM
  const timeRegex = /([01]\d|2[0-3])[:\.]([0-5]\d)/g;
  let match;
  while ((match = timeRegex.exec(cleanText)) !== null) {
    const time = `${match[1]}:${match[2]}`;
    if (!times.includes(time)) {
      times.push(time);
    }
  }

  // 如果没有找到 HH:MM 格式，尝试 HHMM 格式（如 0830）
  if (times.length === 0) {
    const hhmmRegex = /([01]\d|2[0-3])([0-5]\d)/g;
    while ((match = hhmmRegex.exec(cleanText)) !== null) {
      const time = `${match[1]}:${match[2]}`;
      if (!times.includes(time)) {
        times.push(time);
      }
    }
  }

  return times;
}

/**
 * 提取价格 - 增强兼容性
 */
function extractPrice(text: string): number {
  // 尝试多种价格格式
  // 1. ¥3,280 或 $450 或 ￥2,680
  const currencyRegex = /[¥$￥€£]\s*(\d[\d,]*\.?\d*)/g;
  let match;
  while ((match = currencyRegex.exec(text)) !== null) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      return Math.round(price);
    }
  }

  // 2. 1580元 或 2,680元
  const yuanRegex = /(\d[\d,]*\.?\d*)\s*元/g;
  while ((match = yuanRegex.exec(text)) !== null) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      return Math.round(price);
    }
  }

  // 3. 价格:1580 或 票价 1580 或 费用: 2680
  const labelRegex = /(?:价格|票价|费用|price|amount|fare)[:\s]*(\d[\d,]*\.?\d*)/gi;
  while ((match = labelRegex.exec(text)) !== null) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      return Math.round(price);
    }
  }

  // 4. 查找类似 价格:1580 的格式（冒号后直接跟数字）
  const colonPriceRegex = /(?:价格|票价|费用)[:\s:]*(\d[\d,]+)/gi;
  while ((match = colonPriceRegex.exec(text)) !== null) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      return Math.round(price);
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
    type: info.type,
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
