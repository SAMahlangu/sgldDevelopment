import React, { createContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [users, setUsers] = useState([])

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get user from localStorage if available
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [])

  const signup = useCallback(async (email, password, name, role) => {
    setLoading(true)
    try {
      // Add user to users table with role
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: undefined, // Let it auto-generate
            email,
            name,
            role,
            status: role === 'student' ? 'active' : 'pending_approval',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (dbError) throw dbError

      // Auto-login students
      if (role === 'student') {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: userData.status,
        })
      }

      return { 
        success: true, 
        message: role === 'student' ? 'Account created successfully!' : 'Account created. Awaiting admin approval.' 
      }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password, role) => {
    setLoading(true)
    try {
      // Handle SRC login separately
      if (role === 'src') {
        const { data: srcData, error: srcError } = await supabase
          .from('srcs')
          .select('*')
          .eq('email', email)
          .single()

        if (srcError || !srcData) {
          throw new Error('Invalid email, password, or role')
        }

        if (srcData.status !== 'active') {
          throw new Error('Your SRC account is not active')
        }

        // Verify password (demo: simple string comparison)
        if (!password || password !== srcData.password) {
          throw new Error('Invalid password')
        }

        // Set user as logged in
        const userObj = {
          id: srcData.id,
          email: srcData.email,
          name: srcData.name,
          role: 'src',
          status: srcData.status,
          admin_id: srcData.admin_id,
          campus: srcData.campus,
        }
        setUser(userObj)
        localStorage.setItem('user', JSON.stringify(userObj))

        return { success: true, message: 'Login successful' }
      }

      // Handle SFC login separately
      if (role === 'sfc') {
        const { data: sfcData, error: sfcError } = await supabase
          .from('sfcs')
          .select('*')
          .eq('email', email)
          .single()

        if (sfcError || !sfcData) {
          throw new Error('Invalid email, password, or role')
        }

        if (sfcData.status !== 'active') {
          throw new Error('Your SFC account is not active')
        }

        // Verify password (demo: simple string comparison)
        if (!password || password !== sfcData.password) {
          throw new Error('Invalid password')
        }

        // Set user as logged in
        const userObj = {
          id: sfcData.id,
          email: sfcData.email,
          name: sfcData.name,
          role: 'sfc',
          status: sfcData.status,
          admin_id: sfcData.admin_id,
          campus: sfcData.campus,
        }
        setUser(userObj)
        localStorage.setItem('user', JSON.stringify(userObj))

        return { success: true, message: 'Login successful' }
      }

      // Handle institutional roles (ISRC, ISP, CSRC, CSP) - query from users table
      if (['isrc', 'isp', 'csrc', 'csp'].includes(role)) {
        const { data: institutionalData, error: instError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('role', role)
          .single()

        if (instError || !institutionalData) {
          throw new Error('Invalid email, password, or role')
        }

        if (institutionalData.status !== 'active') {
          throw new Error('Your account is not active')
        }

        if (!password || password !== institutionalData.password) {
          throw new Error('Invalid password')
        }

        const userObj = {
          id: institutionalData.id,
          email: institutionalData.email,
          name: institutionalData.name,
          role: institutionalData.role,
          status: institutionalData.status,
          admin_id: institutionalData.admin_id,
          campus: institutionalData.campus,
        }
        setUser(userObj)
        localStorage.setItem('user', JSON.stringify(userObj))
        return { success: true, message: 'Login successful' }
      }

      // Handle student/admin login
      const { data: userData, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', role)
        .single()

      if (checkError || !userData) {
        throw new Error('Invalid email, password, or role')
      }

      if (userData.status === 'pending_approval') {
        throw new Error('Your account is pending admin approval')
      }

      if (userData.status !== 'active') {
        throw new Error('Your account is not active')
      }

      // Verify password for admins - check against stored password field
      if (role === 'admin') {
        if (!userData.password) {
          throw new Error('Admin account has no password set. Contact system administrator.')
        }
        if (password !== userData.password) {
          throw new Error('Invalid password')
        }
      } else {
        // For students: Accept any password (demo mode)
        if (!password || password.length < 1) {
          throw new Error('Password is required')
        }
      }

      // Set user as logged in
      const userObj = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        campus: userData.campus,
      }
      setUser(userObj)
      localStorage.setItem('user', JSON.stringify(userObj))

      return { success: true, message: 'Login successful' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setUser(null)
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const approveUser = useCallback(async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }, [])

  const rejectUser = useCallback(async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }, [])

  const getPendingUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending_approval')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching pending users:', error)
      return []
    }
  }, [])

  const value = {
    user,
    loading,
    users,
    signup,
    login,
    logout,
    approveUser,
    rejectUser,
    getPendingUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
