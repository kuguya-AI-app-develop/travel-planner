import { useState, useEffect } from 'react'

interface ApiKeyModalProps {
  show: boolean
  onClose: () => void
  onSaved: () => void
  onToast: (msg: string) => void
}

/**
 * 校验 Base URL 格式（客户端侧校验，与服务端 SSRF 防护配合）
 */
function isValidBaseUrl(url: string): boolean {
  if (!url) return true // 空值使用默认
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const hostname = parsed.hostname.toLowerCase()
    if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) return false
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) return false
    return true
  } catch {
    return false
  }
}

interface ApiConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

interface Provider {
  id: string
  name: string
  defaultBaseUrl: string
  models: string[]
  defaultModel: string
  placeholder: string
}

const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    placeholder: 'sk-...'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    placeholder: 'sk-...'
  },
  {
    id: 'qwen',
    name: '通义千问',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long'],
    defaultModel: 'qwen-plus',
    placeholder: 'sk-...'
  },
  {
    id: 'moonshot',
    name: '月之暗面',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultModel: 'moonshot-v1-8k',
    placeholder: 'sk-...'
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-plus', 'glm-4', 'glm-4-flash', 'glm-4-long'],
    defaultModel: 'glm-4-flash',
    placeholder: ''
  },
  {
    id: 'baichuan',
    name: '百川智能',
    defaultBaseUrl: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4', 'Baichuan3-Turbo', 'Baichuan2-Turbo'],
    defaultModel: 'Baichuan4',
    placeholder: 'sk-...'
  },
  {
    id: 'custom',
    name: '自定义',
    defaultBaseUrl: '',
    models: [],
    defaultModel: '',
    placeholder: '输入 API Key'
  }
]

const CUSTOM_MODEL = '__custom__'

const STORAGE_KEY = 'tp-ai-config'

function loadConfig(): ApiConfig {
  if (typeof window === 'undefined') {
    return { provider: 'openai', apiKey: '', baseUrl: '', model: '' }
  }
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        provider: parsed.provider || 'openai',
        apiKey: parsed.apiKey || '',
        baseUrl: parsed.baseUrl || '',
        model: parsed.model || ''
      }
    }
  } catch { /* ignore */ }
  return { provider: 'openai', apiKey: '', baseUrl: '', model: '' }
}

function saveConfig(config: ApiConfig) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getStoredApiConfig(): ApiConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.apiKey) return parsed
    }
  } catch { /* ignore */ }
  return null
}

export default function ApiKeyModal({ show, onClose, onSaved, onToast }: ApiKeyModalProps) {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const currentProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0]
  const isCustomProvider = provider === 'custom'

  useEffect(() => {
    if (show) {
      const config = loadConfig()
      setProvider(config.provider)
      setApiKey(config.apiKey)
      setBaseUrl(config.baseUrl)
      setShowAdvanced(false)
      setTestResult(null)

      // 判断 model 是否在预设列表中
      const prov = PROVIDERS.find(p => p.id === config.provider)
      if (prov && config.model) {
        if (prov.models.includes(config.model)) {
          setModel(config.model)
          setUseCustomModel(false)
          setCustomModel('')
        } else {
          setModel(CUSTOM_MODEL)
          setUseCustomModel(true)
          setCustomModel(config.model)
        }
      } else {
        setModel(prov?.defaultModel || '')
        setUseCustomModel(false)
        setCustomModel('')
      }
    }
  }, [show])

  const effectiveBaseUrl = isCustomProvider
    ? baseUrl
    : (baseUrl || currentProvider.defaultBaseUrl)

  const effectiveModel = isCustomProvider
    ? (customModel || model)
    : useCustomModel
      ? customModel
      : model

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    const p = PROVIDERS.find(pr => pr.id === newProvider)
    if (p) {
      setModel(p.defaultModel)
      setCustomModel('')
      setUseCustomModel(false)
      if (newProvider !== 'custom') {
        setBaseUrl('')
      }
    }
    setTestResult(null)
  }

  const handleModelChange = (value: string) => {
    if (value === CUSTOM_MODEL) {
      setUseCustomModel(true)
      setModel(CUSTOM_MODEL)
    } else {
      setUseCustomModel(false)
      setModel(value)
      setCustomModel('')
    }
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      onToast('请先输入 API Key')
      return
    }
    if (effectiveBaseUrl && !isValidBaseUrl(effectiveBaseUrl)) {
      onToast('Base URL 格式无效或不允许访问内部地址')
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey.trim(),
          'X-Api-Base-Url': effectiveBaseUrl,
          'X-Model': effectiveModel
        }
      })
      if (res.ok) {
        setTestResult('success')
      } else {
        const data = await res.json().catch(() => ({}))
        onToast(data.error || '验证失败，请检查配置')
        setTestResult('error')
      }
    } catch {
      onToast('网络错误，请重试')
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      onToast('请输入 API Key')
      return
    }
    if (!effectiveModel) {
      onToast('请选择或输入模型名称')
      return
    }
    if (effectiveBaseUrl && !isValidBaseUrl(effectiveBaseUrl)) {
      onToast('Base URL 格式无效或不允许访问内部地址')
      return
    }
    saveConfig({
      provider,
      apiKey: apiKey.trim(),
      baseUrl: effectiveBaseUrl,
      model: effectiveModel
    })
    onToast('API 配置已保存')
    onSaved()
    onClose()
  }

  const handleClear = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setApiKey('')
    setBaseUrl('')
    setModel('')
    setCustomModel('')
    setUseCustomModel(false)
    setTestResult(null)
    onToast('API 配置已清除')
  }

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="8" width="16" height="10" rx="3" stroke="var(--accent)" strokeWidth="1.3"/>
            <path d="M6 8V5.5a4 4 0 018 0V8" stroke="var(--accent)" strokeWidth="1.3" fill="none"/>
            <circle cx="10" cy="13" r="1.5" fill="var(--accent)"/>
          </svg>
          AI 设置
        </h3>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -12, marginBottom: 18, lineHeight: 1.6 }}>
          配置你的 LLM API Key，用于 AI 策划功能。Key 仅存储在当前标签页中，关闭后自动清除。
        </p>

        {/* 提供商选择 */}
        <label>API 提供商</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              className={`btn ${provider === p.id ? 'btn-primary' : ''}`}
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => handleProviderChange(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* API Key */}
        <label>API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setTestResult(null) }}
          placeholder={currentProvider.placeholder || '输入 API Key'}
          autoFocus
        />

        {/* 模型选择 */}
        <label>模型</label>
        {isCustomProvider ? (
          <input
            value={customModel}
            onChange={e => { setCustomModel(e.target.value); setTestResult(null) }}
            placeholder="输入模型名称"
          />
        ) : (
          <>
            <select
              value={useCustomModel ? CUSTOM_MODEL : model}
              onChange={e => handleModelChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                outline: 'none',
                background: 'var(--surface)',
                cursor: 'pointer'
              }}
            >
              {currentProvider.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value={CUSTOM_MODEL}>自定义模型名称...</option>
            </select>
            {useCustomModel && (
              <input
                value={customModel}
                onChange={e => { setCustomModel(e.target.value); setTestResult(null) }}
                placeholder="输入自定义模型名称"
                style={{ marginTop: 6 }}
              />
            )}
          </>
        )}

        {/* 高级设置（折叠） */}
        <div
          style={{
            marginTop: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--muted)',
            userSelect: 'none'
          }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .15s' }}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          高级设置
        </div>

        {showAdvanced && (
          <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--sidebar)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
            <label style={{ marginTop: 0 }}>Base URL</label>
            <input
              value={baseUrl}
              onChange={e => { setBaseUrl(e.target.value); setTestResult(null) }}
              placeholder={isCustomProvider ? 'https://api.example.com/v1' : currentProvider.defaultBaseUrl}
            />
            <p style={{ fontSize: 11, color: 'var(--muted-light)', marginTop: 4 }}>
              {isCustomProvider
                ? 'OpenAI 兼容格式的 API 地址'
                : `默认: ${currentProvider.defaultBaseUrl}（使用代理/中转服务时可修改）`
              }
            </p>
          </div>
        )}

        {/* 验证 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <button
            className="btn"
            onClick={handleTest}
            disabled={testing || !apiKey.trim()}
            style={{ fontSize: 12 }}
          >
            {testing ? '验证中...' : '验证连接'}
          </button>
          {testResult === 'success' && (
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>
              连接成功
            </span>
          )}
          {testResult === 'error' && (
            <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>
              连接失败
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="modal-actions">
          <button className="modal-delete-link" onClick={handleClear}>
            清除配置
          </button>
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
