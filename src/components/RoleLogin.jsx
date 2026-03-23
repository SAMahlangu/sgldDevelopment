import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function RoleLogin({ onLoginSuccess, onSwitchToSignup }) {
  const { login, loading } = useAuth()
  const [selectedRole, setSelectedRole] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

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

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = login(formData.email, formData.password, selectedRole)
    if (result.success) {
      onLoginSuccess()
    } else {
      setErrors({ form: result.message })
    }
  }

  const demoCredentials = {
    student: { email: 'student@example.com', password: 'pass123' },
    admin: { email: 'admin@example.com', password: 'admin123' },
    src: { email: 'src@example.com', password: 'src123' },
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

        {errors.form && <div className="error-alert">{errors.form}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Your Role *</label>
            <div className="role-selection">
              {['student', 'src', 'admin'].map(role => (
                <label key={role} className="role-radio">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <span className="role-label">
                    {role === 'student' ? '👨‍🎓 Student' : role === 'admin' ? '⚙️ Administrator' : '👥 SRC Member'}
                  </span>
                </label>
              ))}
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

          {selectedRole && (
            <div className="demo-credentials">
              <small>Demo credentials: <button type="button" onClick={() => fillDemoCredentials(selectedRole)} className="link-btn">Fill demo credentials</button></small>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading || !selectedRole}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onSwitchToSignup} className="link-btn">Sign up here</button></p>
        </div>
      </div>
    </div>
  )
}
