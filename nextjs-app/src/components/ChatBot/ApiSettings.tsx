'use client'

import { useState, useCallback } from 'react'
import type { ApiConfig } from '@/types/chat'

interface ApiSettingsProps {
  config: ApiConfig | null
  onSave: (config: ApiConfig) => void
  onClose: () => void
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
  { value: 'custom', label: '自定义', models: [] }
]

export default function ApiSettings({ config, onSave, onClose }: ApiSettingsProps) {
  const [provider, setProvider] = useState<ApiConfig['provider']>(config?.provider || 'openai')
  const [model, setModel] = useState(config?.model || '')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentProvider = PROVIDERS.find(p => p.value === provider)

  const handleSave = useCallback(() => {
    if (!model.trim() || !apiKey.trim()) {
      setError('请填写模型名称和 API Key')
      return
    }
    setError(null)

    onSave({
      provider,
      model: model.trim(),
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined
    })
  }, [provider, model, apiKey, baseUrl, onSave])

  return (
    <div className="api-settings">
      <div className="api-settings-header">
        <h4 className="api-settings-title">API 设置</h4>
        <button className="api-settings-close" onClick={onClose}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="api-settings-body">
        {/* 提供商选择 */}
        <div className="api-settings-field">
          <label className="api-settings-label">AI 提供商</label>
          <select
            className="api-settings-select"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as ApiConfig['provider'])
              setModel('')
            }}
          >
            {PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* 模型选择 */}
        <div className="api-settings-field">
          <label className="api-settings-label">模型</label>
          {currentProvider && currentProvider.models.length > 0 ? (
            <select
              className="api-settings-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">请选择模型</option>
              {currentProvider.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="api-settings-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="输入模型名称"
            />
          )}
        </div>

        {/* API Key */}
        <div className="api-settings-field">
          <label className="api-settings-label">API Key</label>
          <div className="api-settings-key-wrapper">
            <input
              type={showApiKey ? 'text' : 'password'}
              className="api-settings-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入你的 API Key"
            />
            <button
              className="api-settings-key-toggle"
              onClick={() => setShowApiKey(!showApiKey)}
              type="button"
            >
              {showApiKey ? (
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <path d="M10 4C4 4 1 10 1 10s3 6 9 6 9-6 9-6-3-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <path d="M10 4C4 4 1 10 1 10s3 6 9 6 9-6 9-6-3-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 17L17 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
          <p className="api-settings-hint">
            API Key 仅在当前会话中临时保存，关闭页面后不会保留
          </p>
        </div>

        {/* Base URL (可选) */}
        <div className="api-settings-field">
          <label className="api-settings-label">
            Base URL <span className="api-settings-optional">(可选)</span>
          </label>
          <input
            type="text"
            className="api-settings-input"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={provider === 'openai' ? 'https://api.openai.com/v1' : provider === 'anthropic' ? 'https://api.anthropic.com' : '输入 API 地址'}
          />
        </div>

        {/* 安全提示 */}
        <div className="api-settings-notice">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 6v5M10 13v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>API Key 通过后端代理转发请求，不会暴露在前端代码中。Key 仅在当前会话中临时保存，关闭页面后自动清除。</span>
        </div>

        {error && (
          <div className="api-settings-error">{error}</div>
        )}
      </div>

      <div className="api-settings-footer">
        <button className="api-settings-cancel" onClick={onClose}>
          取消
        </button>
        <button className="api-settings-save" onClick={handleSave}>
          保存设置
        </button>
      </div>

      <style jsx>{`
        .api-settings {
          background: #FFFFFF;
          border-bottom: 1px solid #F0E6D6;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .api-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #FFF5E6;
          border-bottom: 1px solid #F0E6D6;
        }

        .api-settings-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333333;
        }

        .api-settings-close {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666666;
          transition: background 0.2s;
        }

        .api-settings-close:hover {
          background: #F0E6D6;
        }

        .api-settings-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 300px;
          overflow-y: auto;
        }

        .api-settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .api-settings-label {
          font-size: 13px;
          font-weight: 600;
          color: #333333;
        }

        .api-settings-optional {
          font-weight: 400;
          color: #999999;
        }

        .api-settings-select,
        .api-settings-input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #F0E6D6;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        .api-settings-select:focus,
        .api-settings-input:focus {
          border-color: #F5A623;
        }

        .api-settings-key-wrapper {
          position: relative;
        }

        .api-settings-key-wrapper .api-settings-input {
          padding-right: 40px;
        }

        .api-settings-key-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999999;
          transition: color 0.2s;
        }

        .api-settings-key-toggle:hover {
          color: #666666;
        }

        .api-settings-hint {
          margin: 0;
          font-size: 11px;
          color: #999999;
        }

        .api-settings-notice {
          display: flex;
          gap: 8px;
          padding: 10px 12px;
          background: #FFF9F0;
          border-radius: 10px;
          border: 1px solid #F0E6D6;
          font-size: 12px;
          color: #666666;
          line-height: 1.5;
        }

        .api-settings-notice svg {
          flex-shrink: 0;
          color: #F5A623;
          margin-top: 2px;
        }

        .api-settings-error {
          padding: 8px 12px;
          background: #FFF0F0;
          border: 1px solid #FFD6D6;
          border-radius: 8px;
          font-size: 12px;
          color: #CC3333;
        }

        .api-settings-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 16px;
          background: #FFF9F0;
          border-top: 1px solid #F0E6D6;
        }

        .api-settings-cancel,
        .api-settings-save {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .api-settings-cancel {
          background: #FFFFFF;
          border: 1px solid #F0E6D6;
          color: #666666;
        }

        .api-settings-cancel:hover {
          background: #F5F5F5;
        }

        .api-settings-save {
          background: linear-gradient(135deg, #F5A623 0%, #F7C948 100%);
          border: none;
          color: #333333;
        }

        .api-settings-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(245, 166, 35, 0.3);
        }
      `}</style>
    </div>
  )
}
