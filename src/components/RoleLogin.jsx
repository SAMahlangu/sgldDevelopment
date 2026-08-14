import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabase'

export default function RoleLogin({ onLoginSuccess, onSwitchToSignup }) {
  const { login, loading } = useAuth()
  const [selectedRole, setSelectedRole] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isDBConnected, setIsDBConnected] = useState(null)
  const [loginLogs, setLoginLogs] = useState([])

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${message}`
    console.log(logEntry)
    setLoginLogs(prev => [...prev, logEntry])
  }

  // Check database connection on mount
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        addLog('🔍 Checking database connection...')
        const { data, error } = await supabase
          .from('users')
          .select('count', { count: 'exact' })
          .limit(1)
        
        if (error) {
          addLog(`❌ Database Error: ${error.message}`)
          setIsDBConnected(false)
        } else {
          addLog('✅ Database Connected')
          setIsDBConnected(true)
        }
      } catch (err) {
        addLog(`❌ Connection Error: ${err.message}`)
        setIsDBConnected(false)
      }
    }
    
    checkDatabaseConnection()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!selectedRole) newErrors.role = 'Please select a role'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginLogs([])
    addLog('🚀 Login attempt started')
    
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      addLog('❌ Form validation failed')
      setErrors(newErrors)
      return
    }

    addLog(`📧 Email: ${formData.email}`)
    addLog(`👤 Role: ${selectedRole}`)
    addLog('⏳ Sending login request to Supabase...')

    const result = await login(formData.email, formData.password, selectedRole)
    
    if (result.success) {
      addLog('✓ Login successful! Redirecting to dashboard...')
      setTimeout(() => onLoginSuccess(), 500)
    } else {
      addLog(`❌ Login failed: ${result.message}`)
      setErrors({ form: result.message })
    }
  }

  const demoCredentials = {
    student: { email: 'student@example.com', password: 'pass123' },
    admin: { email: 'admin@example.com', password: 'admin123' },
    src: { email: 'src@example.com', password: 'src123' },
    sfc: { email: 'sfc@example.com', password: 'sfc123' },
    // Institutional/campus roles removed from login selection
  }

  const fillDemoCredentials = (role) => {
    const creds = demoCredentials[role]
    if (creds) {
      setFormData(creds)
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Login to SGLD</h2>
        <p className="auth-subtitle">Access your dashboard</p>

        {/* Database Status Indicator */}
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '4px',
          backgroundColor: isDBConnected === true ? '#e8f5e9' : isDBConnected === false ? '#ffebee' : '#e3f2fd',
          border: `1px solid ${isDBConnected === true ? '#4CAF50' : isDBConnected === false ? '#F44336' : '#2196F3'}`,
          fontSize: '13px',
          fontWeight: '500',
          color: isDBConnected === true ? '#2e7d32' : isDBConnected === false ? '#c62828' : '#1565c0'
        }}>
          {isDBConnected === true && '✅ Connected'}
          {isDBConnected === false && '❌ Not Connected'}
          {isDBConnected === null && '⏳ Connecting...'}
        </div>

        {errors.form && <div className="error-alert">{errors.form}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Your Role *</label>
            <div className="role-selection">
              {['src', 'sfc', 'admin'].map(role => {
                const roleEmoji = {
                  'admin': '⚙️',
                  'src': '👥',
                  'sfc': '💰',
                  'isrc': '🏛️',
                  'isp': '🏛️',
                  'csrc': '🏫',
                  'csp': '🏫',
                }
                const roleLabel = {
                  'admin': 'Administrator',
                  'src': 'SRC Member',
                  'sfc': 'SFC Member',
                  'isrc': 'ISRC',
                  'isp': 'ISP',
                  'csrc': 'CSRC',
                  'csp': 'CSP',
                }
                return (
                  <label key={role} className="role-radio">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    />
                    <span className="role-label">
                      {roleEmoji[role]} {roleLabel[role]}
                    </span>
                  </label>
                )
              })}
            </div>
            {errors.role && <span className="error-text">{errors.role}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !selectedRole}>
            {loading ? '⏳ Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onSwitchToSignup} className="link-btn">Sign up here</button></p>
        </div>
      </div>
    </div>
  )
}
