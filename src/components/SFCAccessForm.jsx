import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabase'
import './AuthForms.css'

export default function SFCAccessForm({ onSignupSuccess, onSwitchToLogin }) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    campus: '',
  })
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.campus.trim()) newErrors.campus = 'Campus is required'
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Create SFC account using the same table structure as SRC
      // Note: This creates a standalone SFC entry
      const { data, error } = await supabase
        .from('sfcs')
        .insert([{
          name: formData.name,
          email: formData.email,
          password: formData.password, // In production, hash this
          campus: formData.campus,
          status: 'active', // SFCs get instant access like Students
          admin_id: '00000000-0000-0000-0000-000000000001', // Placeholder - can be assigned by admin later
        }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setErrors({ email: 'Email already exists' })
        } else {
          throw error
        }
      } else {
        setSuccessMsg('SFC account created successfully! You can now login.')
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          campus: '',
        })
        
        // Auto-login the SFC
        setTimeout(() => {
          const loginResult = login(data.email, data.password, 'sfc')
          if (loginResult && loginResult.success) {
            onSignupSuccess()
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ form: error.message || 'Failed to create account' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Student Finance Coordinator Access</h2>
      <p className="form-subtitle">Create your SFC account to manage financial operations</p>
      
      {successMsg && <div className="success-alert">{successMsg}</div>}
      {errors.form && <div className="error-alert">{errors.form}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={loading}
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
            placeholder="sfc@institution.edu"
            disabled={loading}
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
            placeholder="e.g., Finance, Student Services"
            disabled={loading}
          />
          {errors.department && <span className="error-text">{errors.department}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="campus">Campus *</label>
          <select
            id="campus"
            name="campus"
            value={formData.campus}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select a campus</option>
            <option value="North Campus">North Campus</option>
            <option value="South Campus">South Campus</option>
            <option value="East Campus">East Campus</option>
            <option value="West Campus">West Campus</option>
            <option value="Central">Central</option>
          </select>
          {errors.campus && <span className="error-text">{errors.campus}</span>}
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
            disabled={loading}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
          <small>Minimum 6 characters</small>
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
            disabled={loading}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create SFC Account'}
        </button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="btn btn-link"
          disabled={loading}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  )
}
