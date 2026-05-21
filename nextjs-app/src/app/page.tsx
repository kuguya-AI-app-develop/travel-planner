'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) {
        r.json().then(data => {
          if (data.user?.role === 'admin') {
            router.replace('/admin')
          } else {
            router.replace('/planner')
          }
        })
      } else {
        router.replace('/login')
      }
    }).catch(() => {
      router.replace('/login')
    })
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: 'var(--muted)', fontSize: '15px', fontWeight: 500 }}>加载中...</p>
    </div>
  )
}
