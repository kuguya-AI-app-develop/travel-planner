'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ChatMessage, ApiConfig, ChatStatus, ChatApiResponse } from '@/types/chat'
import ApiSettings from './ApiSettings'
import ChatMessageComponent from './ChatMessage'

const COCORI_NAME = '柯基小助手'

export default function ChatBot({ avatarUrl = '/chatbot-avatar.jpg' }: { avatarUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 从SessionStorage加载API配置
  useEffect(() => {
    const saved = sessionStorage.getItem('chatbot-api-config')
    if (saved) {
      try {
        setApiConfig(JSON.parse(saved))
      } catch { /* ignore */ }
    }
  }, [])

  // 保存API配置到SessionStorage
  const handleSaveApiConfig = useCallback((config: ApiConfig) => {
    setApiConfig(config)
    sessionStorage.setItem('chatbot-api-config', JSON.stringify(config))
    setShowSettings(false)
  }, [])

  // 生成唯一ID
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  // 通过后端代理调用AI API（消息作为参数传入，避免闭包 stale）
  const callAiApi = useCallback(async (
    currentMessages: ChatMessage[],
    userMessage: string,
    config: ApiConfig
  ): Promise<string> => {
    const apiMessages = currentMessages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      .concat([{ role: 'user' as const, content: userMessage }])

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        messages: apiMessages
      })
    })

    const data: ChatApiResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `请求失败: ${response.status}`)
    }

    return data.text || '抱歉，我没能理解你的问题。'
  }, [])

  // 发送消息
  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || status === 'loading' || !apiConfig) return

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    }

    // 用函数式更新拿到最新 messages，直接传入 API 调用，避免闭包 stale
    let latestMessages: ChatMessage[] = []
    setMessages(prev => {
      latestMessages = prev
      return [...prev, userMessage]
    })
    setInputValue('')
    setStatus('loading')
    setError(null)

    try {
      const aiResponse = await callAiApi(latestMessages, text, apiConfig)

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])
      setStatus('idle')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误'
      setError(errorMsg)
      setStatus('error')
    }
  }, [inputValue, status, apiConfig, callAiApi])

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // 清空对话
  const handleClear = useCallback(() => {
    setMessages([])
    setStatus('idle')
  }, [])

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        className="corgi-chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? '关闭聊天' : '打开聊天'}
      >
        <img src={avatarUrl} alt={COCORI_NAME} className="corgi-chatbot-fab-avatar" />
        {!isOpen && <span className="corgi-chatbot-fab-badge">汪!</span>}
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="corgi-chatbot-window">
          {/* 头部 */}
          <div className="corgi-chatbot-header">
            <div className="corgi-chatbot-header-info">
              <img src={avatarUrl} alt={COCORI_NAME} className="corgi-chatbot-header-avatar" />
              <div>
                <h3 className="corgi-chatbot-header-name">{COCORI_NAME}</h3>
                <span className="corgi-chatbot-header-status">
                  {status === 'loading' ? '正在思考...' : '在线'}
                </span>
              </div>
            </div>
            <div className="corgi-chatbot-header-actions">
              <button
                className="corgi-chatbot-header-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="API设置"
              >
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                  <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M3.5 16.5l2-2M14.5 5.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <button
                className="corgi-chatbot-header-btn"
                onClick={handleClear}
                title="清空对话"
              >
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                  <path d="M4 6h12M8 6V4h4v2M6 6v10a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="corgi-chatbot-header-btn"
                onClick={() => setIsOpen(false)}
                title="关闭"
              >
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* API设置面板 */}
          {showSettings && (
            <ApiSettings
              config={apiConfig}
              onSave={handleSaveApiConfig}
              onClose={() => setShowSettings(false)}
            />
          )}

          {/* 消息区域 */}
          <div className="corgi-chatbot-messages">
            {messages.length === 0 && (
              <div className="corgi-chatbot-welcome">
                <img src={avatarUrl} alt={COCORI_NAME} className="corgi-chatbot-welcome-avatar" />
                <p className="corgi-chatbot-welcome-text">
                  汪! 我是{COCORI_NAME}~
                </p>
                <p className="corgi-chatbot-welcome-sub">
                  有什么旅行问题都可以问我哦!
                </p>
                {!apiConfig && (
                  <button
                    className="corgi-chatbot-welcome-btn"
                    onClick={() => setShowSettings(true)}
                  >
                    点击这里设置API
                  </button>
                )}
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} avatarUrl={avatarUrl} />
            ))}
            {status === 'loading' && (
              <div className="corgi-chatbot-loading">
                <div className="corgi-chatbot-loading-dot" />
                <div className="corgi-chatbot-loading-dot" />
                <div className="corgi-chatbot-loading-dot" />
              </div>
            )}
            {error && (
              <div className="corgi-chatbot-error">
                <span>{error}</span>
                <button onClick={() => setError(null)}>x</button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="corgi-chatbot-input-area">
            <textarea
              ref={inputRef}
              className="corgi-chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiConfig ? "输入你的问题..." : "请先设置API..."}
              disabled={!apiConfig || status === 'loading'}
              rows={1}
            />
            <button
              className="corgi-chatbot-send-btn"
              onClick={handleSend}
              disabled={!apiConfig || !inputValue.trim() || status === 'loading'}
            >
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M12 2L12 22M12 22L5 15M12 22L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 12)"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .corgi-chatbot-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F5A623 0%, #F7C948 100%);
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 16px rgba(245, 166, 35, 0.4);
          cursor: pointer;
          z-index: 9999;
          padding: 0;
          overflow: visible;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .corgi-chatbot-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(245, 166, 35, 0.5);
        }

        .corgi-chatbot-fab-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .corgi-chatbot-fab-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #FF6B6B;
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .corgi-chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 380px;
          height: 520px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 9998;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .corgi-chatbot-header {
          background: linear-gradient(135deg, #F5A623 0%, #F7C948 100%);
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .corgi-chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .corgi-chatbot-header-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          object-fit: cover;
        }

        .corgi-chatbot-header-name {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #333333;
        }

        .corgi-chatbot-header-status {
          font-size: 12px;
          color: #666666;
        }

        .corgi-chatbot-header-actions {
          display: flex;
          gap: 8px;
        }

        .corgi-chatbot-header-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333333;
          transition: background 0.2s;
        }

        .corgi-chatbot-header-btn:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .corgi-chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #FFF9F0;
        }

        .corgi-chatbot-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 20px;
        }

        .corgi-chatbot-welcome-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #F5A623;
          margin-bottom: 16px;
          object-fit: cover;
        }

        .corgi-chatbot-welcome-text {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 700;
          color: #333333;
        }

        .corgi-chatbot-welcome-sub {
          margin: 0 0 16px;
          font-size: 14px;
          color: #666666;
        }

        .corgi-chatbot-welcome-btn {
          background: #F5A623;
          color: #333333;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .corgi-chatbot-welcome-btn:hover {
          background: #E6951A;
        }

        .corgi-chatbot-loading {
          display: flex;
          gap: 6px;
          padding: 12px 16px;
          background: #FFFFFF;
          border-radius: 16px;
          width: fit-content;
          margin-top: 8px;
        }

        .corgi-chatbot-loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F5A623;
          animation: dotPulse 1.4s infinite ease-in-out;
        }

        .corgi-chatbot-loading-dot:nth-child(1) { animation-delay: 0s; }
        .corgi-chatbot-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .corgi-chatbot-loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .corgi-chatbot-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          background: #FFF0F0;
          border: 1px solid #FFD6D6;
          border-radius: 12px;
          margin-top: 8px;
          font-size: 13px;
          color: #CC3333;
        }

        .corgi-chatbot-error button {
          background: none;
          border: none;
          color: #CC3333;
          cursor: pointer;
          font-size: 14px;
          padding: 0 2px;
        }

        .corgi-chatbot-input-area {
          padding: 12px 16px;
          background: #FFFFFF;
          border-top: 1px solid #F0E6D6;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .corgi-chatbot-input {
          flex: 1;
          border: 2px solid #F0E6D6;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
          max-height: 100px;
        }

        .corgi-chatbot-input:focus {
          border-color: #F5A623;
        }

        .corgi-chatbot-input:disabled {
          background: #F5F5F5;
          cursor: not-allowed;
        }

        .corgi-chatbot-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F5A623;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          transition: background 0.2s, transform 0.2s;
          flex-shrink: 0;
        }

        .corgi-chatbot-send-btn:hover:not(:disabled) {
          background: #E6951A;
          transform: scale(1.05);
        }

        .corgi-chatbot-send-btn:disabled {
          background: #CCCCCC;
          cursor: not-allowed;
        }

        @media (max-width: 440px) {
          .corgi-chatbot-window {
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .corgi-chatbot-fab {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  )
}
