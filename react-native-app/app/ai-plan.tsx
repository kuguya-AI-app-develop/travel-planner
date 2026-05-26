import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import { usePlans } from '../hooks/usePlans';
import { Plan } from '../types';
import ApiKeyModal from '../components/ApiKeyModal';

const STORAGE_KEY = 'ai_config';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const PREFERENCES = ['美食', '购物', '文化', '自然', '冒险', '亲子'];

interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: string;
}

interface GeneratedPlan {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  data?: Partial<Plan>;
}

export default function AiPlanScreen() {
  const router = useRouter();
  const { createPlan } = usePlans();

  const [config, setConfig] = useState<AiConfig | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);

  const [destinations, setDestinations] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [hotelBudget, setHotelBudget] = useState('');
  const [flightBudget, setFlightBudget] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [planPreview, setPlanPreview] = useState('');

  const loadConfig = useCallback(async () => {
    try {
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function togglePreference(pref: string) {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  async function handleGenerate() {
    if (!config?.apiKey) {
      setShowApiModal(true);
      return;
    }
    if (!destinations.trim()) {
      Alert.alert('提示', '请输入目的地');
      return;
    }
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert('提示', '请输入出发日期和返回日期');
      return;
    }

    const destList = destinations.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    if (destList.length === 0) {
      Alert.alert('提示', '请输入至少一个目的地');
      return;
    }

    setGenerating(true);
    setGeneratedPlan(null);
    setPlanPreview('');

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': config.apiKey,
          'X-Api-Base-Url': config.baseUrl,
          'X-Model': config.model,
        },
        body: JSON.stringify({
          destinations: destList,
          startDate: startDate.trim(),
          endDate: endDate.trim(),
          departureCity: departureCity.trim() || undefined,
          hotelBudget: hotelBudget.trim() || undefined,
          flightBudget: flightBudget.trim() || undefined,
          preferences: preferences.length > 0 ? preferences : undefined,
          specialRequests: specialRequests.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }

      const data = await res.json();
      const plan = data.plan as GeneratedPlan;
      setGeneratedPlan(plan);
      setPlanPreview(formatPlanPreview(plan));
    } catch (e: unknown) {
      Alert.alert('生成失败', e instanceof Error ? e.message : '请重试');
    } finally {
      setGenerating(false);
    }
  }

  function formatPlanPreview(plan: GeneratedPlan): string {
    const parts: string[] = [`📋 ${plan.name}`, `📅 ${plan.startDate} → ${plan.endDate}`];
    const d = plan.data;
    if (d?.destinations?.length) {
      parts.push(`\n📍 目的地: ${d.destinations.map((dest) => dest.name).join(', ')}`);
    }
    if (d?.itinerary?.length) {
      parts.push(`\n🗓 行程 (${d.itinerary.length} 项):`);
      const grouped: Record<string, typeof d.itinerary> = {};
      for (const item of d.itinerary) {
        const date = item.date;
        if (!grouped[date]) grouped[date] = [];
        grouped[date]!.push(item);
      }
      for (const [date, items] of Object.entries(grouped)) {
        parts.push(`  ${date}:`);
        for (const item of items) {
          const icon = item.type === 'food' ? '🍽' : item.type === 'sight' ? '🏛' : item.type === 'transport' ? '🚗' : '📌';
          parts.push(`    ${icon} ${item.time} ${item.title}`);
        }
      }
    }
    if (d?.hotels?.length) {
      parts.push(`\n🏨 推荐酒店: ${d.hotels.length} 家`);
    }
    if (d?.flights?.length) {
      parts.push(`\n✈️ 航班信息: ${d.flights.length} 条`);
    }
    if (d?.packing?.length) {
      const totalItems = d.packing.reduce((sum, cat) => sum + cat.items.length, 0);
      parts.push(`\n🎒 打包清单: ${d.packing.length} 类, ${totalItems} 项`);
    }
    if (d?.expenses?.length) {
      const total = d.expenses.reduce((sum, e) => sum + e.amount, 0);
      parts.push(`\n💰 预算: ¥${total.toLocaleString()}`);
    }
    return parts.join('\n');
  }

  async function handleSavePlan() {
    if (!generatedPlan) return;
    try {
      await createPlan(generatedPlan.name, generatedPlan.data);
      Alert.alert('成功', '计划已保存', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('保存失败', e instanceof Error ? e.message : '请重试');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'AI 策划', headerShown: true }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* API 配置提示 */}
          {!config?.apiKey && (
            <TouchableOpacity style={styles.configBanner} onPress={() => setShowApiModal(true)}>
              <Text style={styles.configBannerText}>⚠️ 未配置 API Key，点击设置</Text>
            </TouchableOpacity>
          )}

          {config?.apiKey && (
            <TouchableOpacity style={styles.configInfo} onPress={() => setShowApiModal(true)}>
              <Text style={styles.configInfoText}>
                🔑 {config.provider.toUpperCase()} · {config.model} · 已配置
              </Text>
              <Text style={styles.configEditText}>修改</Text>
            </TouchableOpacity>
          )}

          {/* 表单 */}
          <Text style={styles.label}>目的地 *</Text>
          <TextInput
            style={styles.input}
            value={destinations}
            onChangeText={setDestinations}
            placeholder="多个用逗号分隔，如：东京, 大阪, 京都"
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>出发日期 *</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>返回日期 *</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.label}>出发城市（可选）</Text>
          <TextInput
            style={styles.input}
            value={departureCity}
            onChangeText={setDepartureCity}
            placeholder="如：上海"
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>酒店预算（可选）</Text>
              <TextInput
                style={styles.input}
                value={hotelBudget}
                onChangeText={setHotelBudget}
                placeholder="如：500-1000"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>机票预算（可选）</Text>
              <TextInput
                style={styles.input}
                value={flightBudget}
                onChangeText={setFlightBudget}
                placeholder="如：2000-5000"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.label}>旅行偏好</Text>
          <View style={styles.prefRow}>
            {PREFERENCES.map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[styles.prefBtn, preferences.includes(pref) && styles.prefBtnActive]}
                onPress={() => togglePreference(pref)}
              >
                <Text
                  style={[styles.prefBtnText, preferences.includes(pref) && styles.prefBtnTextActive]}
                >
                  {pref}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>特殊要求（可选）</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="如：需要轮椅无障碍、带小孩、素食等"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* 生成按钮 */}
          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <View style={styles.generatingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateBtnText}>生成中...</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText}>生成计划</Text>
            )}
          </TouchableOpacity>

          {/* 计划预览 */}
          {generatedPlan && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>生成结果</Text>
              <Text style={styles.previewContent}>{planPreview}</Text>
              <TouchableOpacity style={styles.savePlanBtn} onPress={handleSavePlan}>
                <Text style={styles.savePlanBtnText}>保存为新计划</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <ApiKeyModal
          visible={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSaved={() => loadConfig()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  configBanner: {
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  configBannerText: { fontSize: 14, color: '#E65100', textAlign: 'center' },
  configInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  configInfoText: { fontSize: 13, color: '#1565C0' },
  configEditText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  prefRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  prefBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  prefBtnText: {
    fontSize: 14,
    color: '#555',
  },
  prefBtnTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  generateBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  previewContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  savePlanBtn: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  savePlanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
