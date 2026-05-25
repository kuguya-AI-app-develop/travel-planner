import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { useRouter, useSegments } from 'expo-router'
import { api, User, LoginResponse, MeResponse } from './api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    checkAuth()
  }, [])

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(tabs)'
    const inAdminPage = segments[0] === 'admin'

    if (!user && inAuthGroup) {
      router.replace('/login')
    } else if (user && !inAuthGroup && !inAdminPage) {
      router.replace('/(tabs)')
    } else if (user && inAdminPage && !isAdmin) {
      router.replace('/(tabs)')
    }
  }, [user, segments, isLoading, isAdmin])

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      if (token) {
        const data = await api.get<MeResponse>('/api/auth/me')
        setUser(data.user)
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(username: string, password: string) {
    const data = await api.post<LoginResponse>('/api/auth/login', {
      username,
      password,
    })
    await SecureStore.setItemAsync('auth_token', data.token)
    setUser(data.user)
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore logout errors
    }
    await SecureStore.deleteItemAsync('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
