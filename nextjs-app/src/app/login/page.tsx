'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('请填写用户名和密码')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        setLoading(false)
        return
      }

      if (data.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/planner')
      }
    } catch {
      setError('网络错误，请重试')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', zIndex: 100,
      backgroundImage: 'radial-gradient(circle, oklch(80% 0.008 265 / 25%) 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{
          background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
          borderRadius: '18px', padding: '40px 36px 32px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.10)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="7" fill="#EEEEFF" stroke="#0500FF" strokeWidth="1.1"/>
              <path d="M14 6C11.2 6 9 8.2 9 11c0 3.5 5 10 5 10s5-6.5 5-10c0-2.8-2.2-5-5-5z" fill="#0500FF" fillOpacity=".15" stroke="#0500FF" strokeWidth="1.2" strokeLinejoin="round"/>
              <circle cx="14" cy="11" r="2" fill="#0500FF" fillOpacity=".4" stroke="#0500FF" strokeWidth="1"/>
            </svg>
            旅行策划
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted, #71717A)', marginBottom: '32px', lineHeight: 1.5 }}>
            登录你的账户，开始规划下一段旅程
          </p>

          {error && (
            <div style={{
              background: 'oklch(95% 0.04 25)', color: 'oklch(50% 0.18 25)',
              border: '1px solid oklch(88% 0.06 25)', borderRadius: '10px',
              padding: '10px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted, #71717A)', letterSpacing: '0.02em' }}>
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="输入用户名"
                autoComplete="username"
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid var(--border, #E4E4E7)',
                  borderRadius: '10px', fontSize: '14px', outline: 'none',
                  transition: 'all .15s', boxSizing: 'border-box' as const
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#0500FF'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(5,0,255,0.08)' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = ''; (e.target as HTMLInputElement).style.boxShadow = '' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted, #71717A)', letterSpacing: '0.02em' }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="输入密码"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px', border: '1px solid var(--border, #E4E4E7)',
                    borderRadius: '10px', fontSize: '14px', outline: 'none',
                    transition: 'all .15s', boxSizing: 'border-box' as const
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#0500FF'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(5,0,255,0.08)' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = ''; (e.target as HTMLInputElement).style.boxShadow = '' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                    width: '34px', height: '34px', border: 'none', background: 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--muted-light, #A1A1AA)', borderRadius: '8px'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 2.5l15 15M1.5 10s3.5-5.5 8.5-5.5c1.5 0 2.8.4 4 1M18.5 10s-1.2 1.7-3.2 3M8.5 10.5a3 3 0 004 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M1.5 10s3.5-5.5 8.5-5.5S18.5 10 18.5 10s-3.5 5.5-8.5 5.5S1.5 10 1.5 10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                background: 'var(--accent, #0500FF)', color: 'white',
                width: '100%', marginTop: '4px', letterSpacing: '0.01em',
                opacity: loading ? 0.6 : 1, transition: 'all .15s'
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
