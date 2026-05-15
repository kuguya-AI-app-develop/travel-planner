import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '旅行策划 — Travel Planner',
  description: '规划你的下一段旅程',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
