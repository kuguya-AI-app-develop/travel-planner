/**
 * 票据OCR识别综合测试
 * 覆盖不同app、不同交通方式的测试用例
 */

const TEST_CASES = [
  // 机票类
  { category: '机票', app: '携程App', name: '标准机票', text: '中国国航 CA1234 上海浦东机场(PVG) → 首都国际机场(PEK) 2026年12月25日 08:30 出发 2026年12月25日 11:45 到达 经济舱 ¥3,280', expected: { type: 'plane', code: 'CA1234', dep: '08:30', arr: '11:45', price: 3280 } },
  { category: '机票', app: '飞猪App', name: '简约机票', text: '东方航空 MU5678 北京-上海 12月25日 08:30-12:45 经济舱 ¥2180', expected: { type: 'plane', code: 'MU5678', dep: '08:30', arr: '12:45', price: 2180 } },
  { category: '机票', app: '去哪儿App', name: '带标签', text: '航班号: CZ3456 南方航空 出发: 08:30 到达: 12:45 广州 深圳 经济舱 价格:1580', expected: { type: 'plane', code: 'CZ3456', dep: '08:30', arr: '12:45', price: 1580 } },
  { category: '机票', app: '航旅纵横', name: '机场代码', text: 'HU7890 海南航空 PEK CAN 08:30 11:30 经济舱 ¥2,680', expected: { type: 'plane', code: 'HU7890', dep: '08:30', arr: '11:30', price: 2680 } },
  { category: '机票', app: '微信机票', name: '横杠航班号', text: '厦门航空 MF1234 杭州→成都 2026-01-15 09:00-12:30 商务舱 ¥4,580', expected: { type: 'plane', code: 'MF1234', dep: '09:00', arr: '12:30', price: 4580 } },
  { category: '机票', app: '春秋航空', name: '低成本航空', text: '春秋航空 9C6215 上海虹桥→札幌 19:00-21:30 经济舱 ¥1,899', expected: { type: 'plane', code: '9C6215', dep: '19:00', arr: '21:30', price: 1899 } },
  { category: '机票', app: '四川航空', name: '数字开头', text: '四川航空 3U8765 昆明 → 丽江 15:30 16:40 经济舱 ¥680', expected: { type: 'plane', code: '3U8765', dep: '15:30', arr: '16:40', price: 680 } },
  { category: '机票', app: '国际机票', name: '英文格式', text: 'Air China CA987 Beijing PEK to Tokyo NRT Dec 25 2026 08:30 Economy $450', expected: { type: 'plane', code: 'CA987', dep: '08:30', price: 450 } },

  // 高铁类
  { category: '高铁', app: '12306App', name: '标准高铁', text: 'G1234次列车 北京南站 → 上海虹桥站 08:30开 13:40到 二等座 ¥553', expected: { type: 'highspeed', code: 'G1234', dep: '08:30', arr: '13:40', price: 553 } },
  { category: '高铁', app: '12306App', name: '复兴号', text: 'G5678次 北京南-上海虹桥 2026年12月25日 09:00开 一等座 ¥933', expected: { type: 'highspeed', code: 'G5678', dep: '09:00', price: 933 } },
  { category: '高铁', app: '携程高铁', name: '动车票', text: 'D1234次 广州南 → 深圳北 08:30-09:15 二等座 ¥74.5', expected: { type: 'train', code: 'D1234', dep: '08:30', arr: '09:15', price: 74 } },
  { category: '高铁', app: '智行火车票', name: '高铁带座位', text: '车次 G8888 上海虹桥 → 杭州东 发车 10:30 到达 11:23 票价 二等座 ¥73.0', expected: { type: 'highspeed', code: 'G8888', dep: '10:30', arr: '11:23', price: 73 } },

  // 火车类
  { category: '火车', app: '12306App', name: '快速列车(K)', text: 'K1234次列车 北京站 → 上海站 18:30开 次日08:30到 硬卧 ¥328', expected: { type: 'train', code: 'K1234', dep: '18:30', price: 328 } },
  { category: '火车', app: '12306App', name: '特快列车(T)', text: 'T5678次 广州站 → 成都站 20:26开 第三日05:30到 硬卧 ¥456', expected: { type: 'train', code: 'T5678', dep: '20:26', price: 456 } },
  { category: '火车', app: '12306App', name: '直达列车(Z)', text: 'Z123次 北京-上海 2026年12月25日 19:34开 软卧 ¥652', expected: { type: 'train', code: 'Z123', dep: '19:34', price: 652 } },

  // 特殊格式
  { category: '特殊', app: '模糊OCR', name: '带空格', text: '四川航空 3U 8765 昆明 → 丽江 15:30 16:40 经济舱 ¥680', expected: { type: 'plane', code: '3U8765', dep: '15:30', arr: '16:40', price: 680 } },
  { category: '特殊', app: '短信格式', name: '简洁短信', text: '【国航】CA1888 12月25日 上海08:30-北京11:00 经济舱 ¥2180', expected: { type: 'plane', code: 'CA1888', dep: '08:30', arr: '11:00', price: 2180 } },
];

// 提取函数（与ticketOcr.ts逻辑一致）
function extractInfo(text) {
  const p = text.replace(/\s+/g, ' ');
  const airlinePrefixes = ['CA','MU','CZ','HU','MF','3U','ZH','SC','9C','HO','JD','GS','EU','8L','G5','QW','9D','NH','KE','OZ'];
  const trainPrefixes = ['G','D','C','K','T','Z'];

  let code = '';
  let type = 'plane';

  // 高铁/火车车次 (G/D/C/K/T/Z + 数字)
  const trainRegex = /\b([GDZKLCGT])\s*(\d{1,4})\b/gi;
  let m;
  while ((m = trainRegex.exec(p)) !== null) {
    const prefix = m[1].toUpperCase();
    if (trainPrefixes.includes(prefix)) {
      code = prefix + m[2];
      if (prefix === 'G') type = 'highspeed';
      else type = 'train';
      break;
    }
  }

  // 航班号 (2位字母)
  if (!code) {
    const flightRegex = /\b([A-Z]{2})\s*(\d{1,4})\b/g;
    while ((m = flightRegex.exec(p)) !== null) {
      if (airlinePrefixes.includes(m[1])) { code = m[1]+m[2]; type = 'plane'; break; }
    }
  }

  // 数字开头航司
  if (!code) {
    const numFlightRegex = /\b(\d[A-Z])\s*(\d{1,4})\b/g;
    while ((m = numFlightRegex.exec(p)) !== null) {
      if (airlinePrefixes.includes(m[1])) { code = m[1]+m[2]; type = 'plane'; break; }
    }
  }

  // 时间
  let cp = p;
  cp = cp.replace(/\d{4}[年\-\.\/]\d{1,2}[年\-\.\/]\d{1,2}[日]?/g, ' ');
  cp = cp.replace(/\d{4}年\d{1,2}月\d{1,2}日/g, ' ');
  cp = cp.replace(/\d{1,2}[月\/]\d{1,2}[日]?/g, ' ');
  cp = cp.replace(/\b(19|20)\d{2}\b/g, ' ');

  const times = [];
  const timeRegex = /([01]\d|2[0-3])[:\.]([0-5]\d)/g;
  while ((m = timeRegex.exec(cp)) !== null) { const t = m[1]+':'+m[2]; if (!times.includes(t)) times.push(t); }

  // 价格
  let price = 0;
  const pr1 = /[¥$￥€£]\s*(\d[\d,]*\.?\d*)/g;
  while ((m = pr1.exec(p)) !== null) { const v = parseInt(m[1].replace(/,/g,''),10); if (v>0) { price=v; break; } }
  if (!price) { const pr2 = /(\d[\d,]*\.?\d*)\s*元/g; while ((m = pr2.exec(p)) !== null) { const v = parseInt(m[1].replace(/,/g,''),10); if (v>0) { price=v; break; } } }
  if (!price) { const pr3 = /(?:价格|票价|费用)[:\s:]*(\d[\d,]+)/gi; while ((m = pr3.exec(p)) !== null) { const v = parseInt(m[1].replace(/,/g,''),10); if (v>0) { price=v; break; } } }

  return { type, code, times, price };
}

// 运行测试
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           票据OCR识别综合测试                               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let totalPassed = 0, totalFailed = 0;
const categories = ['机票', '高铁', '火车', '特殊'];

for (const category of categories) {
  const cases = TEST_CASES.filter(tc => tc.category === category);
  console.log(`━━━ ${category}类 (${cases.length}个测试用例) ━━━`);

  for (const tc of cases) {
    const r = extractInfo(tc.text);
    const passed = r.code===tc.expected.code && r.times[0]===tc.expected.dep &&
                   (tc.expected.arr ? r.times[1]===tc.expected.arr : true) &&
                   r.price===tc.expected.price && r.type===tc.expected.type;

    if (passed) {
      totalPassed++;
      console.log(`  ✅ [${tc.app}] ${tc.name}`);
    } else {
      totalFailed++;
      console.log(`  ❌ [${tc.app}] ${tc.name}`);
      if (r.type !== tc.expected.type) console.log(`     类型: ${r.type} (期望: ${tc.expected.type})`);
      if (r.code !== tc.expected.code) console.log(`     车次: ${r.code||'未识别'} (期望: ${tc.expected.code})`);
      if (r.times[0] !== tc.expected.dep) console.log(`     出发: ${r.times[0]||'未识别'} (期望: ${tc.expected.dep})`);
      if (tc.expected.arr && r.times[1] !== tc.expected.arr) console.log(`     到达: ${r.times[1]||'未识别'} (期望: ${tc.expected.arr})`);
      if (r.price !== tc.expected.price) console.log(`     价格: ¥${r.price} (期望: ¥${tc.expected.price})`);
    }
  }
  console.log('');
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                       测试总结                             ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║  总测试用例: ${TEST_CASES.length}`);
console.log(`║  通过: ${totalPassed}`);
console.log(`║  失败: ${totalFailed}`);
console.log(`║  通过率: ${((totalPassed/TEST_CASES.length)*100).toFixed(1)}%`);
console.log('╚════════════════════════════════════════════════════════════╝');
