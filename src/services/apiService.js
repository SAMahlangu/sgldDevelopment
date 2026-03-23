// API Service for SGLD Backend Integration
// This file provides a template for connecting to Supabase, Firebase, or any REST API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

// Authentication APIs
export const authService = {
  signup: async (email, password, name, role, additionalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          ...additionalData
        })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  login: async (email, password, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  logout: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Student APIs
export const studentService = {
  submitConcern: async (userId, title, description) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${userId}/concerns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getConcerns: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${userId}/concerns`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  votePoll: async (userId, pollId, selectedOption) => {
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, selectedOption })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getPolls: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/polls`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Admin APIs
export const adminService = {
  getPendingUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pending-users`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  approveUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  rejectUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  createPolicy: async (title, description) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  approvePolicy: async (policyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/policies/${policyId}/approve`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getReports: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}

// SRC APIs
export const srcService = {
  createMeeting: async (srcId, title, date, time, location) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srcId, title, date, time, location })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getMeetings: async (srcId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/${srcId}/meetings`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  publishUpdate: async (srcId, title, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srcId, title, content })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getRequests: async (srcId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/${srcId}/requests`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  respondToRequest: async (requestId, response) => {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/src/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      })
      return await apiResponse.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Common APIs
export const commonService = {
  getEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getNews: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  submitContactForm: async (name, email, subject, message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}
