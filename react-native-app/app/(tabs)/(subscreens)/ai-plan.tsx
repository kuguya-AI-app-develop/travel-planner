import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { BackHeader } from '../../../src/components/BackHeader';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';
import { loadAISettings, isSecureStoreAvailable } from '../../../src/utils/secureStorage';
import { useApp } from '../../../src/store/AppContext';
import { DatePickerModal } from '../../../src/components/DatePickerModal';
import * as Clipboard from 'expo-clipboard';
import { AILoadingAnimation } from '../../../src/components/AILoadingAnimation';
import { AIResultView } from '../../../src/components/AIResultView';

const pomeranianImage = require('../../../assets/pomeranian-planner.jpg');

type ScreenState = 'form' | 'loading' | 'result';

interface ItineraryItem {
  time: string;
  content: string;
  location?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  items: ItineraryItem[];
}

interface AIPlanResult {
  title: string;
  days: number;
  spots: number;
  budget: string;
  itinerary: ItineraryDay[];
  tips?: string[];
}

const PLANNER_SYSTEM_PROMPT = `你是一位专业的旅行策划师，名叫"博美策划师"。用户会给你旅行需求，你需要生成一份详细的旅行计划。
要求：
- 按天安排行程，每天列出具体时间点和活动
- 包含交通、住宿、餐饮、景点等建议
- 考虑用户的预算和偏好
- 使用 Markdown 格式输出，结构清晰
- 语言简洁实用，不需要过多寒暄`;

const HOTEL_BUDGET_OPTIONS = [
  { value: 'any', label: '不限' },
  { value: '200-500', label: '200-500/晚' },
  { value: '500-1000', label: '500-1000/晚' },
  { value: '1000-2000', label: '1000-2000/晚' },
  { value: '2000+', label: '2000+/晚' },
];

const FLIGHT_BUDGET_OPTIONS = [
  { value: 'any', label: '不限' },
  { value: '1k-2k', label: '1k-2k' },
  { value: '2k-4k', label: '2k-4k' },
  { value: '4k-8k', label: '4k-8k' },
  { value: '8k+', label: '8k+' },
];

const TRAVEL_PREFERENCES = [
  { value: 'food', label: '美食' },
  { value: 'shopping', label: '购物' },
  { value: 'culture', label: '文化古迹' },
  { value: 'nature', label: '自然风光' },
  { value: 'adventure', label: '冒险体验' },
  { value: 'family', label: '亲子游玩' },
  { value: 'relax', label: '休闲度假' },
  { value: 'photo', label: '摄影打卡' },
];

export default function AIPlanScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();
  const [screenState, setScreenState] = useState<ScreenState>('form');
  const [loadingStep, setLoadingStep] = useState(0);
  const [resultData, setResultData] = useState<AIPlanResult | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  // 从 context 读取表单数据
  const { aiPlanForm } = state;
  const { destinations, startDate, endDate, departCity, returnCity, hotelBudget, flightBudget, preferences, special } = aiPlanForm;

  // 更新表单字段的便捷函数
  const updateForm = (fields: Record<string, any>) => {
    dispatch({ type: 'UPDATE_AI_PLAN_FORM', payload: fields });
  };

  // 日期选择器状态（UI 临时状态，不需要持久化）
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');

  const parseDate = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(d.getTime()) ? null : d;
  };

  const startDateObj = parseDate(startDate);
  const endDateObj = parseDate(endDate);

  const datePickerValue = datePickerTarget === 'start'
    ? (startDateObj ?? new Date())
    : (endDateObj ?? startDateObj ?? new Date());

  const pickerMinDate = datePickerTarget === 'end' ? startDateObj ?? undefined : undefined;
  const pickerMaxDate = datePickerTarget === 'start' ? endDateObj ?? undefined : undefined;

  const addDestination = () => {
    updateForm({ destinations: [...destinations, ''] });
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    updateForm({ destinations: newDestinations });
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      updateForm({ destinations: destinations.filter((_, i) => i !== index) });
    }
  };

  const togglePreference = (value: string) => {
    const newPrefs = preferences.includes(value)
      ? preferences.filter(p => p !== value)
      : [...preferences, value];
    updateForm({ preferences: newPrefs });
  };

  const openDatePicker = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}/${month}/${day}`;
    if (datePickerTarget === 'start') {
      updateForm({ startDate: formatted });
      if (endDate && formatted > endDate) {
        updateForm({ startDate: formatted, endDate: getTodayStr() });
      }
    } else {
      updateForm({ endDate: formatted });
      if (startDate && formatted < startDate) {
        updateForm({ endDate: formatted, startDate: getTodayStr() });
      }
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleGenerate = async () => {
    const validDestinations = destinations.filter(d => d.trim());
    if (validDestinations.length === 0) {
      showToast('请至少输入一个目的地');
      return;
    }

    if (!startDate || !endDate) {
      showToast('请选择出发和返回日期');
      return;
    }

    // 检查安全存储是否可用
    const storeAvailable = await isSecureStoreAvailable();
    if (!storeAvailable) {
      Alert.alert(
        '存储不可用',
        '安全存储服务不可用，无法读取 API Key。请检查系统设置或重启应用后重试。',
        [{ text: '确定' }]
      );
      return;
    }

    // 检查 API Key 是否已配置
    const settings = await loadAISettings();
    if (!settings.apiKey) {
      Alert.alert(
        '未配置 API Key',
        '请先在 AI 设置中配置 API Key，才能使用智能策划功能。\n\n提示：清除应用数据后需要重新配置。',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => router.navigate('/ai-settings') },
        ]
      );
      return;
    }

    if (!settings.baseUrl) {
      Alert.alert(
        '未配置 Base URL',
        '请先在 AI 设置中保存 API Base URL，才能使用智能策划功能。',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => router.navigate('/ai-settings') },
        ]
      );
      return;
    }

    // 切换到加载页面
    setScreenState('loading');
    setLoadingStep(0);

    // 模拟步骤进度
    let timer1: ReturnType<typeof setTimeout> | null = null;
    let timer2: ReturnType<typeof setTimeout> | null = null;

    try {
      timer1 = setTimeout(() => setLoadingStep(1), 1500);
      timer2 = setTimeout(() => setLoadingStep(2), 3000);
      loadingTimerRef.current = timer1;

      const provider = settings.provider || 'openai';
      const model = settings.model || 'gpt-4o';
      const baseUrl = settings.baseUrl as string;

      // 构建用户需求 prompt
      const destStr = validDestinations.join('、');
      const hotelLabel = HOTEL_BUDGET_OPTIONS.find(o => o.value === hotelBudget)?.label || '不限';
      const flightLabel = FLIGHT_BUDGET_OPTIONS.find(o => o.value === flightBudget)?.label || '不限';
      const prefLabels = preferences.map(p => TRAVEL_PREFERENCES.find(tp => tp.value === p)?.label).filter(Boolean);

      let userPrompt = `请帮我规划一次旅行：
- 目的地：${destStr}
- 出发日期：${startDate}
- 返回日期：${endDate}`;
      if (departCity) userPrompt += `\n- 出发城市：${departCity}`;
      if (returnCity) userPrompt += `\n- 返回城市：${returnCity}`;
      if (hotelBudget !== 'any') userPrompt += `\n- 酒店预算：${hotelLabel}`;
      if (flightBudget !== 'any') userPrompt += `\n- 机票预算：${flightLabel}`;
      if (prefLabels.length > 0) userPrompt += `\n- 旅行偏好：${prefLabels.join('、')}`;
      if (special.trim()) userPrompt += `\n- 特殊要求：${special.trim()}`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: PLANNER_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        if (response.status === 401) {
          Alert.alert('API Key 无效', '请在 AI 设置中检查并更新 API Key。', [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => router.navigate('/ai-settings') },
          ]);
        } else {
          showToast(`请求失败：${errorMsg}`);
        }
        setScreenState('form');
        return;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        // 解析 AI 返回的内容，构建结构化数据
        const parsedResult = parseAIResponse(content);
        setResultData(parsedResult);
        setResultText(content);
        // 切换到结果页面
        setScreenState('result');
      } else {
        showToast('AI 未返回有效内容，请重试');
        setScreenState('form');
      }
    } catch (error: any) {
      if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        Alert.alert(
          '网络连接失败',
          `无法连接到 API 服务。\n\n服务商：${settings.provider}\n地址：${settings.baseUrl}\n\n请检查网络和 API 设置。`,
          [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => router.navigate('/ai-settings') },
          ]
        );
      } else if (error.message?.includes('timeout')) {
        showToast('请求超时，请稍后重试');
      } else {
        showToast('生成失败，请稍后重试');
      }
      setScreenState('form');
    } finally {
      // 清除定时器
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
  };

  const parseAIResponse = (content: string): AIPlanResult => {
    // 简单的解析逻辑，提取关键信息
    const lines = content.split('\n');
    let title = '旅行计划';
    let days = 0;
    let spots = 0;
    let budget = '未知';
    const itinerary: ItineraryDay[] = [];
    const tips: string[] = [];
    let currentDay: ItineraryDay | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 跳过空行、分隔线、markdown 标记
      if (!trimmedLine || trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
        continue;
      }

      // 提取标题（仅一级标题）
      if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
        title = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      }

      // 提取天数
      const dayMatch = trimmedLine.match(/(\d+)\s*天/);
      if (dayMatch && days === 0) {
        days = parseInt(dayMatch[1]);
      }

      // 提取景点数
      const spotMatch = trimmedLine.match(/(\d+)\s*(?:个|处|个景点)/);
      if (spotMatch && spots === 0) {
        spots = parseInt(spotMatch[1]);
      }

      // 提取预算
      const budgetMatch = trimmedLine.match(/预算[：:]\s*(.+)/);
      if (budgetMatch) {
        budget = budgetMatch[1].replace(/\*\*/g, '');
      }

      // 识别每日行程标题
      const dayTitleMatch = trimmedLine.match(/^#{1,3}\s*(?:第\s*\d+\s*天|Day\s*\d+|第.*天)/i);
      if (dayTitleMatch) {
        if (currentDay) {
          itinerary.push(currentDay);
        }
        currentDay = {
          day: itinerary.length + 1,
          title: trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, ''),
          items: [],
        };
      }

      // 识别时间点和活动（必须有 currentDay 且匹配 HH:MM 格式）
      if (currentDay) {
        const timeMatch = trimmedLine.match(/^(\d{1,2}[:：]\d{2})\s*[-—–:：]\s*(.+)/);
        if (timeMatch) {
          const content = timeMatch[2].replace(/\*\*/g, '').replace(/^[-—–]\s*/, '');
          if (content.trim()) {
            currentDay.items.push({
              time: timeMatch[1],
              content: content.trim(),
            });
          }
        }
      }

      // 识别贴士（- 开头的列表项，且不在日程中）
      if (!currentDay && trimmedLine.startsWith('- ')) {
        const tipText = trimmedLine.substring(2).replace(/\*\*/g, '').trim();
        if (tipText) {
          tips.push(tipText);
        }
      }
    }

    // 添加最后一天
    if (currentDay) {
      itinerary.push(currentDay);
    }

    // 如果没有解析到天数，使用行程天数
    if (days === 0 && itinerary.length > 0) {
      days = itinerary.length;
    }

    // 如果没有解析到足够的信息，使用默认值
    if (itinerary.length === 0) {
      // 过滤掉 markdown 标记行，只保留有意义的内容
      const contentLines = content.split('\n')
        .map(l => l.trim())
        .filter(l => l
          && l !== '---' && l !== '***' && l !== '___'
          && !l.startsWith('# ')
          && !l.startsWith('## ')
          && !l.startsWith('### ')
          && !l.startsWith('**')
          && !l.startsWith('- ')
          && !l.match(/^\*\*/)
        )
        .map(l => l.replace(/\*\*/g, '').trim())
        .filter(l => l.length > 2);

      const items: ItineraryItem[] = contentLines.slice(0, 5).map((line, index) => ({
        time: `${9 + index}:00`,
        content: line,
      }));

      if (items.length > 0) {
        itinerary.push({
          day: 1,
          title: '旅行行程',
          items,
        });
        days = 1;
      }
    }

    return {
      title,
      days: days || 1,
      spots: spots || 0,
      budget,
      itinerary,
      tips: tips.length > 0 ? tips : undefined,
    };
  };

  const handleClear = () => {
    dispatch({ type: 'RESET_AI_PLAN_FORM' });
    setResultData(null);
    setResultText(null);
    setShowDatePicker(false);
  };

  const handleApply = (result: AIPlanResult) => {
    // 将 AI 结果的日期范围基于表单输入
    const startDateStr = startDate.replace(/\//g, '-');
    const endDateStr = endDate.replace(/\//g, '-');

    // 将 AI 的 itinerary 转换为 Plan 的 ItineraryItem 格式
    const itineraryItems: Array<{
      id: number;
      date: string;
      time: string;
      title: string;
      location: string;
      type: 'sight' | 'food' | 'transport' | 'hotel' | 'other';
      duration: number;
      notes: string;
    }> = [];

    let itemId = 1;
    for (const day of result.itinerary) {
      // 根据 day number 计算日期
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + day.day - 1);
      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;

      for (const item of day.items) {
        // 简单推断类型
        let type: 'sight' | 'food' | 'transport' | 'hotel' | 'other' = 'other';
        const contentLower = item.content.toLowerCase();
        if (contentLower.includes('餐') || contentLower.includes('食') || contentLower.includes('吃') || contentLower.includes('饭') || contentLower.includes('料理') || contentLower.includes('寿司')) {
          type = 'food';
        } else if (contentLower.includes('酒店') || contentLower.includes('入住') || contentLower.includes('旅馆') || contentLower.includes('温泉')) {
          type = 'hotel';
        } else if (contentLower.includes('机场') || contentLower.includes('飞机') || contentLower.includes('高铁') || contentLower.includes('地铁') || contentLower.includes('火车') || contentLower.includes('出发') || contentLower.includes('抵达')) {
          type = 'transport';
        } else if (contentLower.includes('寺') || contentLower.includes('神社') || contentLower.includes('公园') || contentLower.includes('博物馆') || contentLower.includes('景点') || contentLower.includes('游') || contentLower.includes('逛')) {
          type = 'sight';
        }

        // 清理 markdown 语法残留
        const cleanTitle = item.content
          .replace(/\*\*(.+?)\*\*/g, '$1')   // **加粗** → 加粗
          .replace(/__(.+?)__/g, '$1')         // __加粗__ → 加粗
          .replace(/\*(.+?)\*/g, '$1')         // *斜体* → 斜体
          .replace(/^#+\s*/, '')               // ## 标题 → 标题
          .replace(/^[-—–]\s*/, '')            // - 内容 → 内容
          .trim();

        if (!cleanTitle) continue;

        itineraryItems.push({
          id: itemId++,
          date: dateStr,
          time: item.time,
          title: cleanTitle,
          location: (item.location || '').replace(/\*\*/g, ''),
          type,
          duration: 60,
          notes: '',
        });
      }
    }

    const destStr = destinations.filter(d => d.trim()).join('、');
    const tripName = `${destStr}旅行`;
    const trip = {
      name: tripName,
      start: startDateStr,
      end: endDateStr,
      color: '#D4A853',
    };

    dispatch({ type: 'APPLY_AI_PLAN', payload: { itineraryItems, trip } });
    showToast('已应用到当前计划');
    router.back();
  };

  const handleCopy = async () => {
    if (resultText) {
      try {
        await Clipboard.setStringAsync(resultText);
        showToast('已复制到剪贴板');
      } catch (error) {
        showToast('复制失败，请重试');
      }
    }
  };

  const handleBackToForm = () => {
    setScreenState('form');
  };

  // 根据状态渲染不同页面
  if (screenState === 'loading') {
    return (
      <View style={styles.container}>
        <AILoadingAnimation
          currentStep={loadingStep}
          onCancel={() => setScreenState('form')}
        />
        <Toast visible={visible} message={message} onHide={hideToast} />
      </View>
    );
  }

  if (screenState === 'result' && resultData) {
    return (
      <View style={styles.container}>
        <AIResultView
          result={resultData}
          rawText={resultText || ''}
          onApply={handleApply}
          onCopy={handleCopy}
          onBack={handleBackToForm}
        />
        <Toast visible={visible} message={message} onHide={hideToast} />
      </View>
    );
  }

  // 默认表单页面
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="AI 智能策划" />

        {/* 博美策划师形象 */}
        <View style={styles.plannerHeader}>
          <Image source={pomeranianImage} style={styles.plannerImage} />
          <View style={styles.plannerInfo}>
            <Text style={styles.plannerTitle}>博美策划师</Text>
            <Text style={styles.plannerSubtitle}>告诉我你的旅行需求，我会为你生成一份完整的旅行计划。</Text>
          </View>
        </View>

        {/* 表单卡片 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={Colors.accent} />
            <Text style={styles.cardTitle}>旅行需求</Text>
          </View>

          <View style={styles.form}>
            {/* 目的地 */}
            <View style={styles.field}>
              <Text style={styles.label}>
                目的地 <Text style={styles.required}>*</Text>
              </Text>
              {destinations.map((dest, index) => (
                <View key={index} style={styles.destinationRow}>
                  <TextInput
                    style={[styles.input, styles.destinationInput]}
                    value={dest}
                    onChangeText={(value) => updateDestination(index, value)}
                    placeholder={index === 0 ? "第一站，例如：东京" : `第${index + 1}站`}
                    placeholderTextColor={Colors.mutedLight}
                  />
                  {destinations.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeDestination(index)}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addDestination}>
                <Ionicons name="add-circle-outline" size={16} color={Colors.accent} />
                <Text style={styles.addButtonText}>添加目的地</Text>
              </TouchableOpacity>
            </View>

            {/* 日期 */}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>
                  出发日期 <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker('start')}>
                  <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                    {startDate || getTodayStr()}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
                </TouchableOpacity>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>
                  返回日期 <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker('end')}>
                  <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                    {endDate || getTodayStr()}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 出发/返回城市 */}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>出发城市</Text>
                <TextInput
                  style={styles.input}
                  value={departCity}
                  onChangeText={(v) => updateForm({ departCity: v })}
                  placeholder="例如：上海"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>返回城市</Text>
                <TextInput
                  style={styles.input}
                  value={returnCity}
                  onChangeText={(v) => updateForm({ returnCity: v })}
                  placeholder="例如：上海（可选）"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
            </View>

            {/* 酒店预算 */}
            <View style={styles.field}>
              <Text style={styles.label}>酒店预算（每晚）</Text>
              <View style={styles.optionGroup}>
                {HOTEL_BUDGET_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      hotelBudget === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => updateForm({ hotelBudget: option.value })}
                  >
                    <Text style={[
                      styles.optionText,
                      hotelBudget === option.value && styles.optionTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 机票预算 */}
            <View style={styles.field}>
              <Text style={styles.label}>机票预算（单程）</Text>
              <View style={styles.optionGroup}>
                {FLIGHT_BUDGET_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      flightBudget === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => updateForm({ flightBudget: option.value })}
                  >
                    <Text style={[
                      styles.optionText,
                      flightBudget === option.value && styles.optionTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 旅行偏好 */}
            <View style={styles.field}>
              <Text style={styles.label}>旅行偏好</Text>
              <View style={styles.preferenceGroup}>
                {TRAVEL_PREFERENCES.map((pref) => (
                  <TouchableOpacity
                    key={pref.value}
                    style={[
                      styles.preferenceButton,
                      preferences.includes(pref.value) && styles.preferenceButtonActive,
                    ]}
                    onPress={() => togglePreference(pref.value)}
                  >
                    <Text style={[
                      styles.preferenceText,
                      preferences.includes(pref.value) && styles.preferenceTextActive,
                    ]}>
                      {pref.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 特殊要求 */}
            <View style={styles.field}>
              <Text style={styles.label}>特殊要求</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={special}
                onChangeText={(v) => updateForm({ special: v })}
                placeholder="例如：带老人出行需要轻松行程、想去迪士尼乐园、不吃辣..."
                placeholderTextColor={Colors.mutedLight}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* 操作按钮 */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGenerate}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>生成旅行计划</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.ghostButtonText}>清空</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        value={datePickerValue}
        minimumDate={pickerMinDate}
        maximumDate={pickerMaxDate}
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
      />

      <Toast visible={visible} message={message} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  plannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  plannerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.lg,
  },
  plannerInfo: {
    flex: 1,
  },
  plannerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.fg,
    marginBottom: Spacing.xs,
  },
  plannerSubtitle: {
    fontSize: Typography.sm,
    color: Colors.muted,
    lineHeight: 18,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
  form: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  field: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    fontSize: Typography.base,
    color: Colors.fg,
    backgroundColor: Colors.surface,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  destinationInput: {
    flex: 1,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  dateText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.fg,
  },
  datePlaceholder: {
    color: Colors.mutedLight,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  optionButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  optionText: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  optionTextActive: {
    color: Colors.surface,
    fontWeight: Typography.semibold,
  },
  preferenceGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  preferenceButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  preferenceButtonActive: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
  },
  preferenceText: {
    fontSize: Typography.sm,
    color: Colors.fg,
  },
  preferenceTextActive: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  ghostButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  ghostButtonText: {
    color: Colors.fg2,
    fontSize: Typography.base,
  },
});
