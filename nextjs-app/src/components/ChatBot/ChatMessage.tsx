'use client'

import type { ChatMessage } from '@/types/chat'

interface ChatMessageProps {
  message: ChatMessage
  avatarUrl: string
}

export default function ChatMessageComponent({ message, avatarUrl }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}>
      {!isUser && (
        <div className="chat-message-avatar-wrapper">
          <img src={avatarUrl} alt="柯基小助手" className="chat-message-avatar" />
        </div>
      )}
      <div className="chat-message-content">
        <div className={`chat-message-bubble ${isUser ? 'chat-message-bubble-user' : 'chat-message-bubble-assistant'}`}>
          <div className="chat-message-text">
            {message.content.split('\n').map((line, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0' }}>
                {line || <br />}
              </p>
            ))}
          </div>
        </div>
        <span className={`chat-message-time ${isUser ? 'chat-message-time-user' : ''}`}>
          {timestamp}
        </span>
      </div>
      {isUser && (
        <div className="chat-message-avatar-wrapper">
          <div className="chat-message-user-avatar">
            <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
              <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-message {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          max-width: 100%;
        }

        .chat-message-user {
          flex-direction: row-reverse;
        }

        .chat-message-avatar-wrapper {
          flex-shrink: 0;
        }

        .chat-message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #F5A623;
          object-fit: cover;
        }

        .chat-message-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #333333 0%, #555555 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
        }

        .chat-message-content {
          max-width: 75%;
          display: flex;
          flex-direction: column;
        }

        .chat-message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .chat-message-bubble-assistant {
          background: #FFFFFF;
          border: 1px solid #F0E6D6;
          border-bottom-left-radius: 4px;
        }

        .chat-message-bubble-user {
          background: linear-gradient(135deg, #F5A623 0%, #F7C948 100%);
          color: #333333;
          border-bottom-right-radius: 4px;
        }

        .chat-message-text {
          font-size: 14px;
          line-height: 1.6;
          color: #333333;
        }

        .chat-message-time {
          font-size: 11px;
          color: #999999;
          margin-top: 4px;
          padding-left: 4px;
        }

        .chat-message-time-user {
          text-align: right;
          padding-right: 4px;
        }
      `}</style>
    </div>
  )
}
