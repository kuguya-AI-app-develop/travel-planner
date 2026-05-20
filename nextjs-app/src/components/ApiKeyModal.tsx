import { useState, useEffect } from 'react'

interface ApiKeyModalProps {
  show: boolean
  onClose: () => void
  onSaved: () => void
  onToast: (msg: string) => void
}

interface ApiConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    placeholder: 'sk-...'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    placeholder: 'sk-...'
  },
  {
    id: 'qwen',
    name: '通义千问',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    placeholder: 'sk-...'
  },
  {
    id: 'custom',
    name: '自定义',
    defaultBaseUrl: '',
    defaultModel: '',
    placeholder: '输入 API Key'
  }
]

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
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  useEffect(() => {
    if (show) {
      const config = loadConfig()
      setProvider(config.provider)
      setApiKey(config.apiKey)
      setBaseUrl(config.baseUrl)
      setModel(config.model)
      setTestResult(null)
    }
  }, [show])

  const currentProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0]

  const effectiveBaseUrl = baseUrl || currentProvider.defaultBaseUrl
  const effectiveModel = model || currentProvider.defaultModel

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    const p = PROVIDERS.find(pr => pr.id === newProvider)
    if (p) {
      setBaseUrl(p.defaultBaseUrl)
      setModel(p.defaultModel)
    }
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      onToast('请先输入 API Key')
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
    setTestResult(null)
    onToast('API 配置已清除')
  }

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 440 }}>
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

        <label>API 提供商</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              className={`btn ${provider === p.id ? 'btn-primary' : ''}`}
              style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => handleProviderChange(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <label>API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setTestResult(null) }}
          placeholder={currentProvider.placeholder}
          autoFocus
        />

        {provider === 'custom' && (
          <>
            <label>Base URL</label>
            <input
              value={baseUrl}
              onChange={e => { setBaseUrl(e.target.value); setTestResult(null) }}
              placeholder="https://api.example.com/v1"
            />
          </>
        )}

        <label>
          模型名称
          {provider !== 'custom' && (
            <span style={{ fontWeight: 400, color: 'var(--muted-light)', marginLeft: 8 }}>
              默认: {currentProvider.defaultModel}
            </span>
          )}
        </label>
        <input
          value={model}
          onChange={e => { setModel(e.target.value); setTestResult(null) }}
          placeholder={currentProvider.defaultModel || '模型名称'}
        />

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
