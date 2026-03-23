import React, { createContext, useState, useCallback } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // Simulating storage for users (replace with backend API)
  const [users, setUsers] = useState([
    // Example data
    { id: 1, email: 'student@example.com', password: 'pass123', role: 'student', name: 'John Doe', status: 'active' },
    { id: 2, email: 'admin@example.com', password: 'admin123', role: 'admin', name: 'Admin User', status: 'active' },
    { id: 3, email: 'src@example.com', password: 'src123', role: 'src', name: 'SRC Member', status: 'active' },
  ])

  const signup = useCallback((email, password, name, role) => {
    setLoading(true)
    try {
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error('Email already registered')
      }

      const newUser = {
        id: users.length + 1,
        email,
        password, // In production, this should be hashed on backend
        name,
        role,
        status: role === 'student' ? 'active' : 'pending_approval', // Admin/SRC require approval
      }

      setUsers([...users, newUser])
      
      // Auto-login student, but not admin/SRC (they need approval)
      if (role === 'student') {
        setUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
        })
      }

      return { success: true, message: role === 'student' ? 'Account created successfully!' : 'Account created. Awaiting admin approval.' }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [users])

  const login = useCallback((email, password, role) => {
    setLoading(true)
    try {
      const foundUser = users.find(u => u.email === email && u.password === password && u.role === role)
      
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }

      if (foundUser.status === 'pending_approval') {
        throw new Error('Your account is pending admin approval')
      }

      setUser({
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        status: foundUser.status,
      })

      return { success: true, message: 'Login successful' }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const approveUser = useCallback((userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'active' } : u
    ))
  }, [users])

  const rejectUser = useCallback((userId) => {
    setUsers(users.filter(u => u.id !== userId))
  }, [users])

  const getPendingUsers = useCallback(() => {
    return users.filter(u => u.status === 'pending_approval')
  }, [users])

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
