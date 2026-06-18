// 通用字符串
export const COMMON = {
  CANCEL: '取消',
  SAVE: '保存',
  DELETE: '删除',
  CONFIRM: '确定',
  EDIT: '编辑',
  ADD: '添加',
  CLOSE: '关闭',
  TODAY: '今天',
  REQUIRED_FIELD: '此项为必填项',
  NO_DATA: '暂无数据',
  LOADING: '加载中...',
  SAVING: '保存中...',
  DELETING: '删除中...',
} as const;

// 行程相关
export const TRIP = {
  ADD: '添加行程',
  EDIT: '编辑行程',
  DELETE_CONFIRM: '确定要删除这个行程吗？',
  ADD_SUCCESS: '已添加行程',
  EDIT_SUCCESS: '行程已更新',
  DELETE_SUCCESS: '行程已删除',
  NAME: '行程名称',
  NAME_PLACEHOLDER: '例如：东京·北海道之旅',
  START_DATE: '开始日期',
  END_DATE: '结束日期',
  COLOR: '颜色',
  NAME_REQUIRED: '请输入行程名称',
  DATE_REQUIRED: '请选择行程日期',
  MULTIPLE_TRIPS: '{count} 个行程',
  DAY_TRIPS: '{date} 的行程',
  NO_TRIPS: '暂无行程安排',
  CLEAN_DIRTY_DATA: '清理 {count} 条无效数据',
  CLEAN_CONFIRM: '确定要删除 {count} 条无效日期的行程吗？此操作不可恢复。',
  CLEAN_SUCCESS: '已清理 {count} 条无效数据',
  NO_DATA_TO_CLEAN: '没有需要清理的数据',
} as const;

// 目的地相关
export const DESTINATION = {
  ADD: '添加目的地',
  EDIT: '编辑目的地',
  DELETE_CONFIRM: '确定要删除这个目的地吗？',
  ADD_SUCCESS: '已添加目的地',
  EDIT_SUCCESS: '目的地已更新',
  DELETE_SUCCESS: '目的地已删除',
  NAME: '名称',
  COUNTRY: '国家',
  NOTES: '备注',
  NAME_PLACEHOLDER: '输入目的地名称',
  COUNTRY_PLACEHOLDER: '输入国家名称',
  NOTES_PLACEHOLDER: '选填',
  NO_DATA: '暂无目的地',
  NO_DATA_HINT: '点击下方按钮添加目的地',
  CRITERIA: ['景色', '文化', '美食', '交通便利', '安全性', '性价比'],
  OVERALL_SCORE: '综合评分',
} as const;

// 酒店相关
export const HOTEL = {
  ADD: '添加酒店',
  EDIT: '编辑酒店',
  DELETE_CONFIRM: '确定要删除这个酒店吗？',
  ADD_SUCCESS: '已添加酒店',
  EDIT_SUCCESS: '酒店已更新',
  DELETE_SUCCESS: '酒店已删除',
  NAME: '酒店名称',
  LOCATION: '位置',
  PRICE: '价格（每晚）',
  NAME_PLACEHOLDER: '输入酒店名称',
  LOCATION_PLACEHOLDER: '输入位置',
  PRICE_PLACEHOLDER: '0',
  NO_DATA: '暂无酒店',
  NO_DATA_HINT: '点击下方按钮添加酒店',
  CRITERIA: ['性价比', '位置', '卫生', '设施', '服务'],
  OVERALL_SCORE: '综合评分',
  HINT: '点击酒店名称编辑，长按删除，点击星星评分',
} as const;

// 航班相关
export const FLIGHT = {
  ADD: '添加航班',
  EDIT: '编辑航班',
  DELETE_CONFIRM: '确定要删除这个航班吗？',
  ADD_SUCCESS: '已添加航班',
  EDIT_SUCCESS: '航班已更新',
  DELETE_SUCCESS: '航班已删除',
  AIRLINE: '航空公司',
  CODE: '航班号',
  ROUTE: '航线',
  DEP_TIME: '起飞时间',
  ARR_TIME: '到达时间',
  PRICE: '价格',
  CLASS: '舱位',
  AIRLINE_PLACEHOLDER: '输入航空公司',
  CODE_PLACEHOLDER: 'XX000',
  ROUTE_PLACEHOLDER: '出发→到达',
  DEP_PLACEHOLDER: '08:30',
  ARR_PLACEHOLDER: '12:45',
  PRICE_PLACEHOLDER: '0',
  CLASS_PLACEHOLDER: '经济舱',
  NO_DATA: '暂无航班',
  NO_DATA_HINT: '点击下方按钮添加航班',
  CRITERIA: ['中转', '行李额度', '准点率', '舒适度'],
  INVALID_TIME: '时间格式无效，请使用 HH:MM 格式',
  HINT: '点击编辑航班，长按删除',
} as const;

// 消费相关
export const EXPENSE = {
  ADD: '添加消费',
  EDIT: '编辑消费',
  DELETE_CONFIRM: '确定要删除这项消费吗？',
  ADD_SUCCESS: '已添加消费',
  EDIT_SUCCESS: '消费已更新',
  DELETE_SUCCESS: '消费已删除',
  NAME: '名称',
  CATEGORY: '分类',
  AMOUNT: '金额',
  NOTE: '备注',
  NAME_PLACEHOLDER: '输入消费名称',
  CATEGORY_PLACEHOLDER: '门票、餐饮...',
  AMOUNT_PLACEHOLDER: '0',
  NOTE_PLACEHOLDER: '备注信息',
  NO_DATA: '暂无消费记录',
  NO_DATA_HINT: '点击下方按钮添加消费',
  HINT: '点击编辑消费，长按删除',
} as const;

// 行程项相关
export const ITINERARY = {
  ADD: '添加行程',
  EDIT: '编辑行程',
  DELETE_CONFIRM: '确定要删除这个行程项吗？',
  ADD_SUCCESS: '已添加行程',
  EDIT_SUCCESS: '行程已更新',
  DELETE_SUCCESS: '行程已删除',
  DATE: '日期',
  TIME: '时间',
  TITLE: '活动名称',
  LOCATION: '地点',
  TYPE: '类型',
  NOTES: '备注',
  DATE_PLACEHOLDER: '2026-05-18',
  TIME_PLACEHOLDER: '09:00',
  TITLE_PLACEHOLDER: '例如：浅草寺',
  LOCATION_PLACEHOLDER: '选填',
  NOTES_PLACEHOLDER: '选填',
  TITLE_REQUIRED: '请输入活动名称',
  NO_DATA: '暂无行程安排',
  HINT: '点击行程项编辑，长按删除',
  TYPES: {
    sight: '景点',
    food: '餐饮',
    transport: '交通',
    hotel: '住宿',
    other: '其他',
  },
} as const;

// 证件相关
export const DOCUMENT = {
  ADD: '添加证件',
  EDIT: '编辑证件',
  DELETE_CONFIRM: '确定要删除这个证件吗？',
  ADD_SUCCESS: '已添加证件',
  EDIT_SUCCESS: '证件已更新',
  DELETE_SUCCESS: '证件已删除',
  NAME: '证件名称',
  NUMBER: '证件号码',
  EXPIRY: '有效期',
  STATUS: '状态',
  NOTES: '备注',
  NAME_PLACEHOLDER: '输入证件名称',
  NUMBER_PLACEHOLDER: '选填',
  EXPIRY_PLACEHOLDER: '2028-03-15',
  NOTES_PLACEHOLDER: '选填',
  NO_DATA: '暂无证件记录',
  HINT: '点击编辑证件，长按删除',
  STATUS_MAP: {
    valid: '有效',
    expiring: '即将过期',
    expired: '已过期',
    processing: '办理中',
    none: '未办理',
  },
} as const;

// 行李相关
export const PACKING = {
  ADD: '添加行李项',
  EDIT: '编辑行李项',
  DELETE_CONFIRM: '确定要删除这个行李项吗？',
  ADD_SUCCESS: '已添加行李项',
  EDIT_SUCCESS: '行李项已更新',
  DELETE_SUCCESS: '行李项已删除',
  NAME: '物品名称',
  CATEGORY: '分类',
  NAME_PLACEHOLDER: '例如：护照',
  CATEGORY_PLACEHOLDER: '例如：证件、衣物、电子设备',
  NAME_REQUIRED: '请输入物品名称',
  HINT: '点击编辑行李项，长按删除',
} as const;

// 计划相关
export const PLAN = {
  CREATE_SUCCESS: '已创建新计划',
  DELETE_CONFIRM: '确定要删除"{name}"吗？此操作不可撤销。',
  SWITCH_SUCCESS: '已切换到：{name}',
  NAME_PLACEHOLDER: '输入计划名称',
  NAME_REQUIRED: '请输入计划名称',
  NEW_PLAN: '新计划 {count}',
} as const;

// AI相关
export const AI = {
  GENERATE: '生成旅行计划',
  LOADING: '正在生成旅行计划...',
  DESTINATION_REQUIRED: '请至少输入一个目的地',
  DATE_REQUIRED: '请选择出发和返回日期',
  API_KEY_REQUIRED: '未配置 API Key',
  API_KEY_HINT: '请先在 AI 设置中配置 API Key，才能使用智能策划功能。\n\n提示：清除应用数据后需要重新配置。',
  BASE_URL_REQUIRED: '未配置 Base URL',
  BASE_URL_HINT: '请先在 AI 设置中保存 API Base URL，才能使用智能策划功能。',
  APPLY_SUCCESS: '已应用到当前计划',
  COPY_SUCCESS: '已复制到剪贴板',
  COPY_FAILED: '复制失败，请重试',
  TIMEOUT: '请求超时，请稍后重试',
  NETWORK_ERROR: '网络连接失败',
  NETWORK_HINT: '无法连接到 API 服务。\n\n服务商：{provider}\n地址：{baseUrl}\n\n请检查网络和 API 设置。',
  GENERATE_FAILED: '生成失败，请稍后重试',
  NO_CONTENT: 'AI 未返回有效内容，请重试',
  API_KEY_INVALID: 'API Key 无效',
  API_KEY_INVALID_HINT: '请在 AI 设置中检查并更新 API Key。',
  RATE_LIMIT: '请求太频繁了，请稍后再试',
  CLEAR: '清空',
} as const;

// 聊天相关
export const CHAT = {
  WELCOME: '汪！你好呀！茶糕是你的柯基旅游助手，有什么旅行问题可以问我哦~',
  TYPING: '茶糕正在思考...',
  NO_HISTORY: '暂无对话记录',
  NEW_CHAT: '开始新对话',
  NEW_CONVERSATION: '新对话',
  DELETE_CONFIRM: '确定要删除这个对话吗？',
  INPUT_PLACEHOLDER: '问茶糕任何旅行问题...',
  API_KEY_PLACEHOLDER: '请先在AI设置中配置API Key',
  QUICK_REPLIES: ['推荐景点', '预算规划', '签证问题', '美食推荐', '交通攻略'],
} as const;

// 预算相关
export const BUDGET = {
  TOTAL: '总费用',
  FLIGHT: '机票',
  HOTEL: '酒店',
  EXPENSE: '其他消费',
  SELECTED_DEST: '已选目的地',
  CHECKLIST: '待办清单',
} as const;

// 空状态相关
export const EMPTY_STATE = {
  DESTINATION: {
    TEXT: '暂无目的地',
    HINT: '点击下方按钮添加目的地',
  },
  FLIGHT: {
    TEXT: '暂无航班',
    HINT: '点击下方按钮添加航班',
  },
  HOTEL: {
    TEXT: '暂无酒店',
    HINT: '点击下方按钮添加酒店',
  },
  EXPENSE: {
    TEXT: '暂无消费记录',
    HINT: '点击下方按钮添加消费',
  },
  ITINERARY: {
    TEXT: '暂无行程安排',
  },
  DOCUMENT: {
    TEXT: '暂无证件记录',
  },
  PACKING: {
    TEXT: '暂无行李项',
  },
} as const;
