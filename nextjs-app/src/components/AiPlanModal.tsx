import { useState } from 'react'
import { getStoredApiConfig } from './ApiKeyModal'

interface AiPlanModalProps {
  show: boolean
  onClose: () => void
  onPlanCreated: (planId: number) => void
  onToast: (msg: string) => void
  onOpenApiSettings: () => void
}

type Step = 'form' | 'generating' | 'preview'

interface PlanFormData {
  destinations: string[]
  startDate: string
  endDate: string
  departureCity: string
  returnCity: string
  hotelBudget: string
  flightBudget: string
  preferences: string[]
  specialRequests: string
}

interface GeneratedPlanPreview {
  id: number
  name: string
  startDate: string
  endDate: string
  data: Record<string, unknown>
}

const PREFERENCE_OPTIONS = [
  { id: 'food', label: '美食' },
  { id: 'shopping', label: '购物' },
  { id: 'culture', label: '文化古迹' },
  { id: 'nature', label: '自然风光' },
  { id: 'adventure', label: '冒险体验' },
  { id: 'family', label: '亲子游乐' },
  { id: 'relaxation', label: '休闲度假' },
  { id: 'photography', label: '摄影打卡' },
]

const HOTEL_BUDGET_OPTIONS = [
  { value: '', label: '不限' },
  { value: '200-500', label: '200-500/晚' },
  { value: '500-1000', label: '500-1000/晚' },
  { value: '1000-2000', label: '1000-2000/晚' },
  { value: '2000+', label: '2000+/晚' },
]

const FLIGHT_BUDGET_OPTIONS = [
  { value: '', label: '不限' },
  { value: '1000-2000', label: '1k-2k' },
  { value: '2000-4000', label: '2k-4k' },
  { value: '4000-8000', label: '4k-8k' },
  { value: '8000+', label: '8k+' },
]

function getDefaultDates() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() + 14)
  const end = new Date(start)
  end.setDate(end.getDate() + 4)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

function getPlanSummary(data: Record<string, unknown>) {
  const trips = Array.isArray(data.trips) ? data.trips.length : 0
  const flights = Array.isArray(data.flights) ? data.flights.length : 0
  const hotels = Array.isArray(data.hotels) ? data.hotels.length : 0
  const itinerary = Array.isArray(data.itinerary) ? data.itinerary.length : 0
  const expenses = Array.isArray(data.expenses) ? data.expenses as Array<Record<string, unknown>> : []
  const totalBudget = expenses.reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : 0), 0)

  return { trips, flights, hotels, itinerary, totalBudget }
}

export default function AiPlanModal({ show, onClose, onPlanCreated, onToast, onOpenApiSettings }: AiPlanModalProps) {
  const defaultDates = getDefaultDates()
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<PlanFormData>({
    destinations: [''],
    startDate: defaultDates.start,
    endDate: defaultDates.end,
    departureCity: '',
    returnCity: '',
    hotelBudget: '',
    flightBudget: '',
    preferences: [],
    specialRequests: ''
  })
  const [preview, setPreview] = useState<GeneratedPlanPreview | null>(null)
  const [error, setError] = useState('')

  const resetModal = () => {
    setStep('form')
    const dates = getDefaultDates()
    setForm({
      destinations: [''],
      startDate: dates.start,
      endDate: dates.end,
      departureCity: '',
      returnCity: '',
      hotelBudget: '',
      flightBudget: '',
      preferences: [],
      specialRequests: ''
    })
    setPreview(null)
    setError('')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const togglePreference = (id: string) => {
    setForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(id)
        ? prev.preferences.filter(p => p !== id)
        : [...prev.preferences, id]
    }))
  }

  const handleGenerate = async () => {
    const validDestinations = form.destinations.filter(d => d.trim())
    if (validDestinations.length === 0) {
      onToast('请至少输入一个目的地')
      return
    }
    if (!form.startDate || !form.endDate) {
      onToast('请选择出行日期')
      return
    }
    if (form.startDate >= form.endDate) {
      onToast('返回日期必须晚于出发日期')
      return
    }

    const config = getStoredApiConfig()
    if (!config || !config.apiKey) {
      onToast('请先配置 API Key')
      onOpenApiSettings()
      return
    }

    // 前端输入校验
    for (const dest of validDestinations) {
      if (dest.length > 200) {
        onToast('目的地名称过长（最多 200 字）')
        return
      }
    }
    if (form.specialRequests.length > 2000) {
      onToast('特殊要求过长（最多 2000 字）')
      return
    }
    if (form.departureCity.length > 50 || form.returnCity.length > 50) {
      onToast('城市名称过长（最多 50 字）')
      return
    }

    setStep('generating')
    setError('')

    try {
      const prefLabels = form.preferences.map(id => {
        const opt = PREFERENCE_OPTIONS.find(o => o.id === id)
        return opt?.label || id
      })

      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': config.apiKey,
          'X-Api-Base-Url': config.baseUrl,
          'X-Model': config.model
        },
        body: JSON.stringify({
          destinations: validDestinations,
          startDate: form.startDate,
          endDate: form.endDate,
          departureCity: form.departureCity.trim() || undefined,
          returnCity: form.returnCity.trim() || undefined,
          hotelBudget: form.hotelBudget || undefined,
          flightBudget: form.flightBudget || undefined,
          preferences: prefLabels.length > 0 ? prefLabels : undefined,
          specialRequests: form.specialRequests.trim() || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '生成失败')
      }

      setPreview(data.plan)
      setStep('preview')
    } catch (err) {
      setStep('form')
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    }
  }

  const handleConfirm = async () => {
    if (!preview) return
    onPlanCreated(preview.id)
    onToast('AI 计划已创建')
    handleClose()
  }

  const summary = preview ? getPlanSummary(preview.data) : null

  if (!show) return null

  return (
    <div className="modal-overlay show" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '85vh', overflow: 'auto' }}>

        {/* === Step 1: 需求表单 === */}
        {step === 'form' && (
          <>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="var(--accent)" strokeWidth="1.3"/>
                <path d="M10 6v4l2.5 2.5" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5 3l1 1M17 5.5l-1 1" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" opacity=".5"/>
              </svg>
              AI 智能策划
            </h3>

            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -12, marginBottom: 20, lineHeight: 1.6 }}>
              告诉我你的旅行需求，AI 会为你生成一份完整的旅行计划。
            </p>

            {/* 目的地（多选） */}
            <label>目的地 <span style={{ color: 'var(--danger)' }}>*</span></label>
            {form.destinations.map((dest, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: index < form.destinations.length - 1 ? 6 : 0 }}>
                <input
                  value={dest}
                  onChange={e => {
                    const newDests = [...form.destinations]
                    newDests[index] = e.target.value
                    setForm(prev => ({ ...prev, destinations: newDests }))
                  }}
                  placeholder={index === 0 ? '第一站，例如：东京' : `第${index + 1}站`}
                  autoFocus={index === 0}
                  maxLength={200}
                  style={{ flex: 1 }}
                />
                {form.destinations.length > 1 && (
                  <button
                    className="btn"
                    style={{ padding: '6px 10px', fontSize: 14, lineHeight: 1, color: 'var(--danger)', flexShrink: 0 }}
                    onClick={() => {
                      const newDests = form.destinations.filter((_, i) => i !== index)
                      setForm(prev => ({ ...prev, destinations: newDests }))
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              className="btn"
              style={{ fontSize: 12, padding: '5px 12px', marginTop: 4, color: 'var(--accent)' }}
              onClick={() => setForm(prev => ({ ...prev, destinations: [...prev.destinations, ''] }))}
            >
              + 添加目的地
            </button>

            {/* 日期 */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label>出发日期 <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={e => {
                    const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement | null
                    if (input) { input.focus(); input.showPicker?.() }
                  }}
                >
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ cursor: 'pointer', width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label>返回日期 <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={e => {
                    const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement | null
                    if (input) { input.focus(); input.showPicker?.() }
                  }}
                >
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ cursor: 'pointer', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* 出发城市 & 返回城市 */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label>出发城市</label>
                <input
                  value={form.departureCity}
                  onChange={e => setForm(prev => ({ ...prev, departureCity: e.target.value }))}
                  placeholder="例如：上海"
                  maxLength={50}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>返回城市</label>
                <input
                  value={form.returnCity}
                  onChange={e => setForm(prev => ({ ...prev, returnCity: e.target.value }))}
                  placeholder="例如：上海（可选）"
                  maxLength={50}
                />
              </div>
            </div>

            {/* 预算 */}
            <div style={{ marginTop: 16 }}>
              <label>酒店预算（每晚）</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {HOTEL_BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`btn ${form.hotelBudget === opt.value ? 'btn-primary' : ''}`}
                    style={{ fontSize: 12, padding: '5px 12px' }}
                    onClick={() => setForm(prev => ({ ...prev, hotelBudget: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label>机票预算（单程）</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {FLIGHT_BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`btn ${form.flightBudget === opt.value ? 'btn-primary' : ''}`}
                    style={{ fontSize: 12, padding: '5px 12px' }}
                    onClick={() => setForm(prev => ({ ...prev, flightBudget: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 旅行偏好 */}
            <label>旅行偏好</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {PREFERENCE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`btn ${form.preferences.includes(opt.id) ? 'btn-primary' : ''}`}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => togglePreference(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 特殊要求 */}
            <label>特殊要求</label>
            <textarea
              value={form.specialRequests}
              onChange={e => setForm(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="例如：带老人出行需要轻松行程、想去迪士尼乐园、不吃辣..."
              rows={3}
              maxLength={2000}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                outline: 'none',
                resize: 'vertical',
                background: 'var(--surface)',
                boxSizing: 'border-box'
              }}
            />

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--danger-subtle)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--danger)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn" onClick={handleClose}>取消</button>
              <button className="btn btn-primary" onClick={handleGenerate}>
                开始生成
              </button>
            </div>
          </>
        )}

        {/* === Step 2: 生成中 === */}
        {step === 'generating' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>正在为你生成旅行计划</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              AI 正在根据你的需求规划行程、航班、酒店和预算...<br/>
              这可能需要 30 秒到 1 分钟，请稍候。
            </p>
          </div>
        )}

        {/* === Step 3: 结果预览 === */}
        {step === 'preview' && preview && summary && (
          <>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="var(--success)" strokeWidth="1.3"/>
                <path d="M7 10l2 2 4-4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              旅行计划已生成
            </h3>

            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -12, marginBottom: 20 }}>
              以下是 AI 为你生成的计划概要，确认后将创建为新计划。
            </p>

            {/* 计划名称 */}
            <div style={{ padding: '16px 18px', background: 'var(--accent-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: 16, border: '1px solid oklch(56% 0.2 265 / 15%)' }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                {(preview.data.name as string) || preview.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {preview.startDate} ~ {preview.endDate}
              </div>
            </div>

            {/* 概要数据 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{summary.trips}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>行程</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{summary.flights}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>航班</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{summary.hotels}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>酒店</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{summary.itinerary}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>行程安排</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                  ¥{summary.totalBudget.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>预估费用</div>
              </div>
            </div>

            <p style={{ fontSize: 11, color: 'var(--muted-light)', lineHeight: 1.6, marginBottom: 8 }}>
              AI 生成的内容仅供参考，建议核实航班、酒店等关键信息后再确认。
            </p>

            <div className="modal-actions">
              <button className="btn" onClick={() => { setStep('form'); setError('') }}>
                重新生成
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                使用此方案
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
