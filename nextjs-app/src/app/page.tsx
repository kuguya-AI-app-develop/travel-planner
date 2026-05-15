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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#71717A', fontSize: '14px' }}>加载中...</p>
    </div>
  )
}
