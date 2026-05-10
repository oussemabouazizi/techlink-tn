import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/api'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const token = localStorage.getItem('token')
    if (token && !window.location.pathname.includes('/login')) {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/'
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)