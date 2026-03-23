import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthForms.css'

export default function StudentSignup({ onSignupSuccess, onSwitchToLogin }) {
  const { signup, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    faculty: '',
  })
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

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
    if (!formData.studentId) newErrors.studentId = 'Student ID is required'
    if (!formData.faculty) newErrors.faculty = 'Faculty is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = signup(formData.email, formData.password, formData.name, 'student')
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
        <h2>Create Student Account</h2>
        <p className="auth-subtitle">Join SGLD and participate in campus governance</p>

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
              placeholder="John Doe"
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
              placeholder="student@tut.ac.za"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="studentId">Student ID *</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="20241234567"
            />
            {errors.studentId && <span className="error-text">{errors.studentId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="faculty">Faculty *</label>
            <select
              id="faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
            >
              <option value="">Select Faculty</option>
              <option value="engineering">Engineering</option>
              <option value="science">Science</option>
              <option value="business">Business & Management</option>
              <option value="humanities">Humanities</option>
              <option value="health">Health Sciences</option>
            </select>
            {errors.faculty && <span className="error-text">{errors.faculty}</span>}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button onClick={onSwitchToLogin} className="link-btn">Login here</button></p>
        </div>
      </div>
    </div>
  )
}
