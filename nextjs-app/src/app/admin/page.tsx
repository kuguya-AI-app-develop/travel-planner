'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface UserAccount {
  id: number
  username: string
  role: string
  status: string
  expireAt: string | null
  note: string | null
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null)
  const [resetTarget, setResetTarget] = useState<UserAccount | null>(null)

  // Form fields
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('user')
  const [formExpire, setFormExpire] = useState('')
  const [formNote, setFormNote] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)

  const showToast = useCallback((msg: string, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const loadUsers = useCallback(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { if (data.users) setUsers(data.users) })
      .catch(() => {})
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const todayStr = () => {
    const d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }

  const getStatus = (u: UserAccount) => {
    if (u.status === 'disabled') return 'disabled'
    if (u.expireAt && u.expireAt < todayStr()) return 'expired'
    return 'active'
  }

  const statusLabel = (s: string) => {
    if (s === 'active') return '已启用'
    if (s === 'disabled') return '已停用'
    return '已过期'
  }

  const filtered = users.filter(u => {
    const s = getStatus(u)
    if (statusFilter && s !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!u.username.toLowerCase().includes(q) && !(u.note || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const stats = {
    total: users.length,
    active: users.filter(u => getStatus(u) === 'active').length,
    disabled: users.filter(u => getStatus(u) === 'disabled').length,
    expired: users.filter(u => getStatus(u) === 'expired').length,
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormUsername('')
    setFormPassword('')
    setFormRole('user')
    setFormExpire('')
    setFormNote('')
    setShowCreateModal(true)
  }

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u)
    setFormUsername(u.username)
    setFormPassword('')
    setFormRole(u.role)
    setFormExpire(u.expireAt || '')
    setFormNote(u.note || '')
    setShowCreateModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formUsername.trim()) { showToast('请填写用户名', 'error'); return }

    if (editingUser) {
      // Edit existing
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          role: formRole,
          expireAt: formExpire || null,
          note: formNote || null
        })
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || '操作失败', 'error'); return }

      // Reset password if provided
      if (formPassword.length > 0) {
        if (formPassword.length < 6) { showToast('密码至少 6 位', 'error'); return }
        await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingUser.id, action: 'reset-password', password: formPassword })
        })
      }

      showToast('账号已更新')
    } else {
      // Create new
      if (!formPassword || formPassword.length < 6) { showToast('密码至少 6 位', 'error'); return }
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formUsername.trim(), password: formPassword, role: formRole, expireAt: formExpire || null, note: formNote || null })
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || '创建失败', 'error'); return }
      showToast('账号已发行')
    }

    setShowCreateModal(false)
    loadUsers()
  }

  const toggleStatus = async (u: UserAccount) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, action: 'toggle-status' })
    })
    if (res.ok) {
      showToast(u.status === 'disabled' ? u.username + ' 已启用' : u.username + ' 已停用')
      loadUsers()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { showToast(data.error || '删除失败', 'error'); setShowConfirmModal(false); return }
    showToast('已删除 ' + deleteTarget.username)
    setShowConfirmModal(false)
    setDeleteTarget(null)
    loadUsers()
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!resetTarget) return
    if (newPassword.length < 6) { showToast('密码至少 6 位', 'error'); return }
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resetTarget.id, action: 'reset-password', password: newPassword })
    })
    if (res.ok) {
      showToast('密码已重置')
      setShowResetModal(false)
      setResetTarget(null)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="7" fill="#EEEEFF" stroke="#0500FF" strokeWidth="1.1"/>
            <path d="M14 6C11.2 6 9 8.2 9 11c0 3.5 5 10 5 10s5-6.5 5-10c0-2.8-2.2-5-5-5z" fill="#0500FF" fillOpacity=".15" stroke="#0500FF" strokeWidth="1.2" strokeLinejoin="round"/>
            <circle cx="14" cy="11" r="2" fill="#0500FF" fillOpacity=".4" stroke="#0500FF" strokeWidth="1"/>
          </svg>
          旅行策划 · 账号管理
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a onClick={() => router.push('/planner')} style={{ fontSize: '12.5px', color: 'var(--muted)', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>旅行计划</a>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>管</div>
            管理员
          </div>
          <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--muted)' }}>退出</button>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px 60px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { label: '总账号', value: stats.total, color: 'var(--accent)' },
            { label: '已启用', value: stats.active, color: 'var(--success)' },
            { label: '已停用', value: stats.disabled, color: 'var(--muted)' },
            { label: '已过期', value: stats.expired, color: 'var(--warn)' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.02em' }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索用户名或备注..."
                style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--surface)', boxSizing: 'border-box' as const }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '8px 28px 8px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--surface)', cursor: 'pointer' }}>
              <option value="">全部状态</option>
              <option value="active">已启用</option>
              <option value="disabled">已停用</option>
              <option value="expired">已过期</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={openCreateModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white' }}>
              + 发行账号
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--border-light)' }}>
                {['#', '用户名', '权限', '状态', '到期时间', '备注', '操作'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.02em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>暂无账号</td></tr>
              ) : filtered.map((u, i) => {
                const s = getStatus(u)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-light)' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.username}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: '11.5px', fontWeight: 500,
                        background: u.role === 'admin' ? 'var(--accent-subtle)' : 'var(--border-light)',
                        color: u.role === 'admin' ? 'var(--accent)' : 'var(--muted)'
                      }}>
                        {u.role === 'admin' ? '管理员' : '普通'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: '11.5px', fontWeight: 500,
                        background: s === 'active' ? 'var(--success-subtle)' : s === 'disabled' ? 'var(--border-light)' : 'var(--danger-subtle)',
                        color: s === 'active' ? 'var(--success)' : s === 'disabled' ? 'var(--muted)' : 'var(--danger)'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {statusLabel(s)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12.5px', fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{u.expireAt || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '12.5px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.note || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEditModal(u)} title="编辑" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        </button>
                        <button onClick={() => toggleStatus(u)} title={s === 'disabled' ? '启用' : '停用'} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s === 'disabled'
                            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8.5L7 11.5 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 10.5L10.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                        </button>
                        <button onClick={() => { setResetTarget(u); setNewPassword(''); setShowResetModal(true) }} title="重置密码" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2"/></svg>
                        </button>
                        <button onClick={() => { setDeleteTarget(u); setShowConfirmModal(true) }} title="删除" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.01em' }}>{editingUser ? '编辑账号' : '发行新账号'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{editingUser ? `修改「${editingUser.username}」的信息` : '填写以下信息为用户创建登录账号'}</div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>用户名 *</label>
                <input type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} readOnly={!!editingUser}
                  placeholder="例如 zhangsan" autoComplete="off"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: editingUser ? 'var(--border-light)' : 'var(--surface)', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>{editingUser ? '新密码（留空不修改）' : '初始密码 *'}</label>
                <input type="text" value={formPassword} onChange={e => setFormPassword(e.target.value)}
                  placeholder="至少 6 位" autoComplete="off"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>权限 *</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--surface)', cursor: 'pointer' }}>
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>到期时间</label>
                <input type="date" value={formExpire} onChange={e => setFormExpire(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>备注</label>
                <textarea value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="可选，例如：销售部张三"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}>取消</button>
                <button type="submit"
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white' }}>
                  {editingUser ? '保存修改' : '确认发行'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowConfirmModal(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 12 }}>
                <circle cx="20" cy="20" r="16" stroke="#DC2626" strokeWidth="1.5"/>
                <path d="M20 12v10M20 26v1" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 14, color: 'var(--fg)', marginBottom: 4 }}>确认删除「{deleteTarget.username}」？</p>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>该账号将被永久删除，此操作不可撤销。</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setShowConfirmModal(false)}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)' }}>取消</button>
              <button onClick={handleDelete}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--danger)', background: 'var(--surface)', color: 'var(--danger)' }}>删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && resetTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowResetModal(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>重置密码</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>为「{resetTarget.username}」设置新密码</div>
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="至少 6 位" autoComplete="off"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowResetModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)' }}>取消</button>
                <button type="submit"
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white' }}>确认重置</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          color: 'white', zIndex: 300,
          background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)'
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
