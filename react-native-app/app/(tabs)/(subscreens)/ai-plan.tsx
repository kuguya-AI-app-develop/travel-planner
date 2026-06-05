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
import { loadAISettings } from '../../../src/utils/secureStorage';
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
  const { visible, message, showToast, hideToast } = useToast();
  const [screenState, setScreenState] = useState<ScreenState>('form');
  const [loadingStep, setLoadingStep] = useState(0);
  const [resultData, setResultData] = useState<AIPlanResult | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [destinations, setDestinations] = useState(['']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departCity, setDepartCity] = useState('');
  const [returnCity, setReturnCity] = useState('');
  const [hotelBudget, setHotelBudget] = useState('any');
  const [flightBudget, setFlightBudget] = useState('any');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [special, setSpecial] = useState('');

  // 日期选择器状态
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
    setDestinations([...destinations, '']);
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const togglePreference = (value: string) => {
    setPreferences(prev =>
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
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
      setStartDate(formatted);
      if (endDate && formatted > endDate) {
        setEndDate('');
      }
    } else {
      setEndDate(formatted);
      if (startDate && formatted < startDate) {
        setStartDate('');
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

    // 检查 API Key 是否已配置
    const settings = await loadAISettings();
    if (!settings.apiKey) {
      Alert.alert(
        '未配置 API Key',
        '请先在 AI 设置中配置 API Key，才能使用智能策划功能。',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => router.push('/ai-settings') },
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
      const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';

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
            { text: '去设置', onPress: () => router.push('/ai-settings') },
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
        showToast('网络连接失败，请检查网络');
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

      // 提取标题
      if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ')) {
        title = trimmedLine.replace(/^#+\s*/, '');
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
        budget = budgetMatch[1];
      }

      // 识别每日行程
      const dayTitleMatch = trimmedLine.match(/^#+\s*(?:第\d+天|Day\s*\d+)/i);
      if (dayTitleMatch) {
        if (currentDay) {
          itinerary.push(currentDay);
        }
        currentDay = {
          day: itinerary.length + 1,
          title: trimmedLine.replace(/^#+\s*/, ''),
          items: [],
        };
      }

      // 识别时间点和活动
      if (currentDay) {
        const timeMatch = trimmedLine.match(/^(\d{1,2}[:：]\d{2})\s*(.+)/);
        if (timeMatch) {
          currentDay.items.push({
            time: timeMatch[1],
            content: timeMatch[2],
          });
        }
      }

      // 识别贴士
      if (trimmedLine.startsWith('- ') && !currentDay) {
        tips.push(trimmedLine.substring(2));
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
      // 创建一个默认的行程
      const contentLines = content.split('\n').filter(l => l.trim());
      const items: ItineraryItem[] = contentLines.slice(0, 5).map((line, index) => ({
        time: `${9 + index}:00`,
        content: line.trim(),
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
    setDestinations(['']);
    setStartDate('');
    setEndDate('');
    setDepartCity('');
    setReturnCity('');
    setHotelBudget('any');
    setFlightBudget('any');
    setPreferences([]);
    setSpecial('');
    setResultData(null);
    setResultText(null);
    setShowDatePicker(false);
  };

  const handleApply = () => {
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
                    {startDate || '2026/06/09'}
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
                    {endDate || '2026/06/13'}
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
                  onChangeText={setDepartCity}
                  placeholder="例如：上海"
                  placeholderTextColor={Colors.mutedLight}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>返回城市</Text>
                <TextInput
                  style={styles.input}
                  value={returnCity}
                  onChangeText={setReturnCity}
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
                    onPress={() => setHotelBudget(option.value)}
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
                    onPress={() => setFlightBudget(option.value)}
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
                onChangeText={setSpecial}
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
