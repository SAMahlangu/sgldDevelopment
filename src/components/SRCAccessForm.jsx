import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function SRCAccessForm({ onSignupSuccess, onSwitchToLogin }) {
  const { signup, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
    faculty: '',
    motivation: '',
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
    if (!formData.position) newErrors.position = 'SRC position is required'
    if (!formData.faculty) newErrors.faculty = 'Faculty is required'
    if (!formData.motivation.trim()) newErrors.motivation = 'Motivation is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = signup(formData.email, formData.password, formData.name, 'src')
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
        <h2>SRC Member Access Request</h2>
        <p className="auth-subtitle">Request access to the SRC management portal</p>

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
              placeholder="src@tut.ac.za"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="position">SRC Position *</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            >
              <option value="">Select Position</option>
              <option value="president">President</option>
              <option value="vice-president">Vice President</option>
              <option value="general-secretary">General Secretary</option>
              <option value="treasurer">Treasurer</option>
              <option value="member">Member</option>
            </select>
            {errors.position && <span className="error-text">{errors.position}</span>}
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
            <label htmlFor="motivation">Why do you want to join SRC? *</label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              placeholder="Tell us about your motivation and contributions..."
              rows="4"
            />
            {errors.motivation && <span className="error-text">{errors.motivation}</span>}
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
            {loading ? 'Submitting...' : 'Request Access'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have SRC access? <button onClick={onSwitchToLogin} className="link-btn">Login here</button></p>
        </div>
      </div>
    </div>
  )
}
