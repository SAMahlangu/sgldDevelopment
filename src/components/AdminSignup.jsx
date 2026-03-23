import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AdminSignup({ onSignupSuccess, onSwitchToLogin }) {
  const { signup, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    adminCode: '',
  })
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  // Simple admin verification code (in production, this would be verified on backend)
  const ADMIN_CODE = 'ADMIN2026'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.department) newErrors.department = 'Department is required'
    if (formData.adminCode !== ADMIN_CODE) newErrors.adminCode = 'Invalid admin verification code'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = signup(formData.email, formData.password, formData.name, 'admin')
    if (result.success) {
      setSuccessMsg(result.message)
      setTimeout(() => {
        onSignupSuccess()
      }, 1500)
    } else {
      setErrors({ form: result.message })
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Admin Registration</h2>
        <p className="auth-subtitle">Register as an administrator</p>

        {errors.form && <div className="error-alert">{errors.form}</div>}
        {successMsg && <div className="success-alert">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Admin Name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@tut.ac.za"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Student Affairs"
            />
            {errors.department && <span className="error-text">{errors.department}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="adminCode">Admin Verification Code *</label>
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              placeholder="Enter verification code"
            />
            {errors.adminCode && <span className="error-text">{errors.adminCode}</span>}
            <small>Ask your institution for the admin verification code</small>
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Have an admin account? <button onClick={onSwitchToLogin} className="link-btn">Login here</button></p>
        </div>
      </div>
    </div>
  )
}
