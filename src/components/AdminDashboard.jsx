import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminService, newsService, eventsService, communicationService, sfcCommunicationService } from '../services/apiService'
import './Dashboards.css'
import AdminCommunications from './AdminCommunications'

export default function AdminDashboard() {
  const { user } = useAuth()
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Overview data
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    pending_approvals: 0,
    active_concerns: 0,
    active_polls: 0
  })
  
  // Users data
  const [pendingUsers, setPendingUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  
  // Policies data
  const [policies, setPolicies] = useState([])
  const [showNewPolicy, setShowNewPolicy] = useState(false)
  const [newPolicy, setNewPolicy] = useState({ title: '', description: '', content: '' })
  
  // News data
  const [news, setNews] = useState([])
  const [showNewNews, setShowNewNews] = useState(false)
  const [newNewsForm, setNewNewsForm] = useState({ title: '', description: '', imageFile: null })
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Events data
  const [events, setEvents] = useState([])
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [newEventForm, setNewEventForm] = useState({ title: '', location: '', date: '', time: '', description: '' })

  // SRC data
  const [srcs, setSrcs] = useState([])
  const [showNewSRC, setShowNewSRC] = useState(false)
  const [newSRCForm, setNewSRCForm] = useState({ name: '', email: '', password: '' })

  // SFC data
  const [sfcs, setSfcs] = useState([])
  const [showNewSFC, setShowNewSFC] = useState(false)
  const [newSFCForm, setNewSFCForm] = useState({ name: '', email: '', password: '' })

  // Communication data
  const [unreadCount, setUnreadCount] = useState(0)

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load statistics
      const stats = await adminService.getDashboardStatistics()
      if (stats && !stats.error) {
        setDashboardStats(stats)
      }
      
      // Load pending users
      const pending = await adminService.getPendingUsers()
      if (Array.isArray(pending)) {
        setPendingUsers(pending)
      }
      
      // Load all users
      const users = await adminService.getAllUsers()
      if (Array.isArray(users)) {
        setAllUsers(users)
      }
      
      // Load policies
      const policiesList = await adminService.getPolicies()
      if (Array.isArray(policiesList)) {
        setPolicies(policiesList)
      }
      
      // Load news - only admin's own posts
      const newsList = await newsService.getNews()
      if (Array.isArray(newsList)) {
        const adminNews = newsList.filter(n => n.created_by === user.id)
        setNews(adminNews)
      }
      
      // Load events - only admin's own posts
      const eventsList = await eventsService.getEvents()
      if (Array.isArray(eventsList)) {
        const adminEvents = eventsList.filter(e => e.created_by === user.id)
        setEvents(adminEvents)
      }

      // Load SRCs assigned to this admin
      const srcList = await adminService.getAdminSRCs(user.id)
      if (Array.isArray(srcList)) {
        setSrcs(srcList)
      }

      // Load SFCs assigned to this admin
      const sfcList = await adminService.getAdminSFCs(user.id)
      if (Array.isArray(sfcList)) {
        setSfcs(sfcList)
      }

      // Load unread message count
      if (communicationService && user.id) {
        const unread = await communicationService.getAdminUnreadCount(user.id)
        setUnreadCount(unread)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // User Management handlers
  const handleApproveUser = async (userId) => {
    try {
      const result = await adminService.approveUser(userId)
      if (result.success) {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId))
        loadDashboardData() // Refresh stats
      }
    } catch (err) {
      setError('Failed to approve user')
      console.error(err)
    }
  }

  const handleRejectUser = async (userId) => {
    try {
      const result = await adminService.rejectUser(userId)
      if (result.success) {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId))
        loadDashboardData() // Refresh stats
      }
    } catch (err) {
      setError('Failed to reject user')
      console.error(err)
    }
  }

  // Policy handlers
  const handleSubmitPolicy = async (e) => {
    e.preventDefault()
    if (!newPolicy.title.trim()) return
    
    try {
      const policy = await adminService.createPolicy(
        newPolicy.title,
        newPolicy.description,
        newPolicy.content
      )
      if (policy && !policy.error) {
        setPolicies([policy, ...policies])
        setNewPolicy({ title: '', description: '', content: '' })
        setShowNewPolicy(false)
      }
    } catch (err) {
      setError('Failed to create policy')
      console.error(err)
    }
  }

  const approvePolicy = async (policyId) => {
    try {
      const result = await adminService.approvePolicy(policyId)
      if (result && !result.error) {
        setPolicies(policies.map(p => 
          p.id === policyId ? { ...p, status: 'approved' } : p
        ))
      }
    } catch (err) {
      setError('Failed to approve policy')
      console.error(err)
    }
  }

  // News handlers
  const handleSubmitNews = async (e) => {
    e.preventDefault()
    if (!newNewsForm.title.trim() || !newNewsForm.description.trim()) return
    
    setUploadingImage(true)
    try {
      const newsItem = await newsService.createNews(
        newNewsForm.title,
        newNewsForm.description,
        newNewsForm.imageFile,
        user.id
      )
      if (newsItem && !newsItem.error) {
        setNews([newsItem, ...news])
        setNewNewsForm({ title: '', description: '', imageFile: null })
        setShowNewNews(false)
      } else {
        setError('Failed to create news')
      }
    } catch (err) {
      setError('Failed to create news: ' + err.message)
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleNewsImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setNewNewsForm({ ...newNewsForm, imageFile: file })
      setError(null)
    }
  }

  const deleteNews = async (newsId) => {
    try {
      const result = await newsService.deleteNews(newsId)
      if (result.success) {
        setNews(news.filter(n => n.id !== newsId))
      }
    } catch (err) {
      setError('Failed to delete news')
      console.error(err)
    }
  }

  // Events handlers
  const handleSubmitEvent = async (e) => {
    e.preventDefault()
    if (!newEventForm.title.trim() || !newEventForm.date.trim()) return
    
    try {
      const event = await eventsService.createEvent(
        newEventForm.title,
        newEventForm.location,
        newEventForm.date,
        newEventForm.time,
        newEventForm.description,
        user.id
      )
      if (event && !event.error) {
        setEvents([event, ...events])
        setNewEventForm({ title: '', location: '', date: '', time: '', description: '' })
        setShowNewEvent(false)
      }
    } catch (err) {
      setError('Failed to create event')
      console.error(err)
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      const result = await eventsService.deleteEvent(eventId)
      if (result.success) {
        setEvents(events.filter(e => e.id !== eventId))
      }
    } catch (err) {
      setError('Failed to delete event')
      console.error(err)
    }
  }

  // SRC handlers
  const handleCreateSRC = async (e) => {
    e.preventDefault()
    if (!newSRCForm.name.trim() || !newSRCForm.email.trim() || !newSRCForm.password.trim()) {
      setError('All fields are required')
      return
    }

    try {
      const src = await adminService.createSRC(
        newSRCForm.name,
        newSRCForm.email,
        newSRCForm.password,
        user.id,
        user.campus
      )
      if (src && !src.error) {
        setSrcs([src, ...srcs])
        setNewSRCForm({ name: '', email: '', password: '' })
        setShowNewSRC(false)
        setError(null)
      } else {
        setError(src.error || 'Failed to create SRC')
      }
    } catch (err) {
      setError('Failed to create SRC: ' + err.message)
      console.error(err)
    }
  }

  const handleDeactivateSRC = async (srcId) => {
    try {
      const result = await adminService.deactivateSRC(srcId)
      if (result && !result.error) {
        setSrcs(srcs.map(s => s.id === srcId ? { ...s, status: 'inactive' } : s))
      }
    } catch (err) {
      setError('Failed to deactivate SRC')
      console.error(err)
    }
  }

  const handleActivateSRC = async (srcId) => {
    try {
      const result = await adminService.activateSRC(srcId)
      if (result && !result.error) {
        setSrcs(srcs.map(s => s.id === srcId ? { ...s, status: 'active' } : s))
      }
    } catch (err) {
      setError('Failed to activate SRC')
      console.error(err)
    }
  }

  const handleDeleteSRC = async (srcId) => {
    if (window.confirm('Are you sure you want to delete this SRC?')) {
      try {
        const result = await adminService.deleteSRC(srcId)
        if (result.success) {
          setSrcs(srcs.filter(s => s.id !== srcId))
        }
      } catch (err) {
        setError('Failed to delete SRC')
        console.error(err)
      }
    }
  }

  // SFC handlers
  const handleCreateSFC = async (e) => {
    e.preventDefault()
    if (!newSFCForm.name.trim() || !newSFCForm.email.trim() || !newSFCForm.password.trim()) {
      setError('All fields are required')
      return
    }
    try {
      const sfc = await adminService.createSFC(
        newSFCForm.name,
        newSFCForm.email,
        newSFCForm.password,
        user.id,
        user.campus
      )
      if (sfc && !sfc.error) {
        setSfcs([sfc, ...sfcs])
        setNewSFCForm({ name: '', email: '', password: '' })
        setShowNewSFC(false)
        setError(null)
      } else {
        setError(sfc.error || 'Failed to create SFC')
      }
    } catch (err) {
      setError('Failed to create SFC: ' + err.message)
      console.error(err)
    }
  }

  const handleDeactivateSFC = async (sfcId) => {
    try {
      const result = await adminService.deactivateSFC(sfcId)
      if (result && !result.error) {
        setSfcs(sfcs.map(s => s.id === sfcId ? { ...s, status: 'inactive' } : s))
      }
    } catch (err) {
      setError('Failed to deactivate SFC')
      console.error(err)
    }
  }

  const handleActivateSFC = async (sfcId) => {
    try {
      const result = await adminService.activateSFC(sfcId)
      if (result && !result.error) {
        setSfcs(sfcs.map(s => s.id === sfcId ? { ...s, status: 'active' } : s))
      }
    } catch (err) {
      setError('Failed to activate SFC')
      console.error(err)
    }
  }

  const handleDeleteSFC = async (sfcId) => {
    if (window.confirm('Are you sure you want to delete this SFC?')) {
      try {
        const result = await adminService.deleteSFC(sfcId)
        if (result.success) {
          setSfcs(sfcs.filter(s => s.id !== sfcId))
        }
      } catch (err) {
        setError('Failed to delete SFC')
        console.error(err)
      }
    }
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1>Administrator Dashboard</h1>
        <p>Manage system, approve policies, and oversee governance • Campus: {user.campus}</p>
      </div>

      {error && (
        <div style={{ 
          background: '#fee', 
          border: '1px solid #c33', 
          color: '#c00', 
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          Approvals ({pendingUsers.length})
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          Policies
        </button>
        <button 
          className={`tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          News & Events
        </button>
        <button 
          className={`tab ${activeTab === 'srcs' ? 'active' : ''}`}
          onClick={() => setActiveTab('srcs')}
        >
          SRC Management ({srcs.length})
        </button>
        <button 
          className={`tab ${activeTab === 'sfcs' ? 'active' : ''}`}
          onClick={() => setActiveTab('sfcs')}
        >
          💰 SFC ({sfcs.length})
        </button>
        <button 
          className={`tab ${activeTab === 'communications' ? 'active' : ''}`}
          onClick={() => setActiveTab('communications')}
        >
          Communications
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>System Statistics</h2>
            </div>
            <div className="card-body stats-grid">
              <div className="stat-item">
                <div className="stat-number">{dashboardStats.total_users}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{dashboardStats.pending_approvals}</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{dashboardStats.active_concerns}</div>
                <div className="stat-label">Active Concerns</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{dashboardStats.active_polls}</div>
                <div className="stat-label">Active Polls</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Reports</h2>
            </div>
            <div className="card-body">
              <div className="reports-list">
                <div className="report-item">
                  <h4>Campus Infrastructure Report</h4>
                  <p className="report-date">Generated: 2026-03-10</p>
                  <button className="btn btn-outline">View Report</button>
                </div>
                <div className="report-item">
                  <h4>User Activity Summary</h4>
                  <p className="report-date">Generated: 2026-03-05</p>
                  <button className="btn btn-outline">View Report</button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>System Health</h2>
            </div>
            <div className="card-body health-status">
              <div className="health-item">
                <span className="health-label">Platform Status</span>
                <span className="health-badge active">✓ Operational</span>
              </div>
              <div className="health-item">
                <span className="health-label">Database</span>
                <span className="health-badge active">✓ Connected</span>
              </div>
              <div className="health-item">
                <span className="health-label">API Services</span>
                <span className="health-badge active">✓ Running</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Pending User Approvals</h2>
            </div>
            <div className="card-body">
              {loading ? (
                <p className="empty-state">Loading...</p>
              ) : pendingUsers.length === 0 ? (
                <p className="empty-state">No pending approvals</p>
              ) : (
                <div className="approvals-list">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="approval-item">
                      <div className="approval-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <span className="role-badge">{user.role?.toUpperCase()}</span>
                      </div>
                      <div className="approval-actions">
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          className="btn btn-primary"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectUser(user.id)}
                          className="btn btn-outline"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Manage Users</h2>
            </div>
            <div className="card-body">
              {loading ? (
                <p className="empty-state">Loading...</p>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className="badge">{user.role}</span></td>
                        <td><span className={`status ${user.status}`}>{user.status}</span></td>
                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button className="btn btn-outline small">Edit</button>
                          <button className="btn btn-outline small">Suspend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Governance Policies</h2>
              {!showNewPolicy && (
                <button onClick={() => setShowNewPolicy(true)} className="btn btn-primary">
                  + New Policy
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewPolicy && (
                <form onSubmit={handleSubmitPolicy} className="policy-form">
                  <div className="form-group">
                    <label>Policy Title</label>
                    <input
                      type="text"
                      value={newPolicy.title}
                      onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                      placeholder="Enter policy title"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newPolicy.description}
                      onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                      placeholder="Policy summary..."
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Policy Content</label>
                    <textarea
                      value={newPolicy.content}
                      onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                      placeholder="Full policy details..."
                      rows="5"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Submit for Approval</button>
                    <button type="button" onClick={() => setShowNewPolicy(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="policies-list">
                {policies.length === 0 ? (
                  <p className="empty-state">No policies yet</p>
                ) : (
                  policies.map(policy => (
                    <div key={policy.id} className="policy-item">
                      <div className="policy-info">
                        <h4>{policy.title}</h4>
                        <p className="policy-description">{policy.description}</p>
                        <p className="policy-date">{new Date(policy.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="policy-status">
                        <span className={`status ${policy.status}`}>{policy.status}</span>
                        {policy.status === 'pending' && (
                          <button onClick={() => approvePolicy(policy.id)} className="btn btn-primary small">
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News & Events Tab */}
      {activeTab === 'news' && (
        <div className="dashboard-grid">
          {/* News Section */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Latest News</h2>
              {!showNewNews && (
                <button onClick={() => setShowNewNews(true)} className="btn btn-primary">
                  + Post News
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewNews && (
                <form onSubmit={handleSubmitNews} className="news-form">
                  <div className="form-group">
                    <label>News Title</label>
                    <input
                      type="text"
                      value={newNewsForm.title}
                      onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                      placeholder="Enter news title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newNewsForm.description}
                      onChange={(e) => setNewNewsForm({ ...newNewsForm, description: e.target.value })}
                      placeholder="News details..."
                      rows="4"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewsImageChange}
                      disabled={uploadingImage}
                    />
                    {newNewsForm.imageFile && (
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        📎 {newNewsForm.imageFile.name} ({(newNewsForm.imageFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                      {uploadingImage ? '⏳ Uploading...' : 'Publish News'}
                    </button>
                    <button type="button" onClick={() => setShowNewNews(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="news-grid">
                {news.length === 0 ? (
                  <p className="empty-state">No news posted yet</p>
                ) : (
                  news.map(item => (
                    <div key={item.id} className="news-card">
                      {item.image_url && (
                        <div className="news-image">
                          <img src={item.image_url} alt={item.title} onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                      <div className="news-content">
                        <h4>{item.title}</h4>
                        <p className="news-excerpt">{item.description}</p>
                        <p className="news-date">{new Date(item.created_at).toLocaleDateString()}</p>
                        <div className="news-actions">
                          <button className="btn btn-outline small">Edit</button>
                          <button onClick={() => deleteNews(item.id)} className="btn btn-outline small">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Upcoming Events</h2>
              {!showNewEvent && (
                <button onClick={() => setShowNewEvent(true)} className="btn btn-primary">
                  + Create Event
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewEvent && (
                <form onSubmit={handleSubmitEvent} className="event-form">
                  <div className="form-group">
                    <label>Event Title</label>
                    <input
                      type="text"
                      value={newEventForm.title}
                      onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={newEventForm.location}
                        onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                        placeholder="e.g., Main Campus Auditorium"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={newEventForm.date}
                        onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={newEventForm.time}
                        onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newEventForm.description}
                      onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                      placeholder="Event details..."
                      rows="3"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Create Event</button>
                    <button type="button" onClick={() => setShowNewEvent(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="events-list">
                {events.length === 0 ? (
                  <p className="empty-state">No events created yet</p>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="event-item">
                      <div className="event-date">
                        <div className="event-day">{new Date(event.event_date).getDate()}</div>
                        <div className="event-month">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</div>
                      </div>
                      <div className="event-info">
                        <h4>{event.title}</h4>
                        <p className="event-location">📍 {event.location}</p>
                        {event.event_time && <p className="event-time">🕐 {event.event_time}</p>}
                        {event.description && <p className="event-desc">{event.description}</p>}
                      </div>
                      <div className="event-actions">
                        <button className="btn btn-outline small">Edit</button>
                        <button onClick={() => deleteEvent(event.id)} className="btn btn-outline small">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SRC Management Tab */}
      {activeTab === 'srcs' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>📋 SRC Members ({srcs.length})</h2>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowNewSRC(!showNewSRC)}
              >
                {showNewSRC ? '✕ Cancel' : '+ Create SRC'}
              </button>
            </div>
            <div className="card-body">
              {showNewSRC && (
                <form onSubmit={handleCreateSRC} className="form-group">
                  <div className="form-field">
                    <label>Name</label>
                    <input
                      type="text"
                      value={newSRCForm.name}
                      onChange={(e) => setNewSRCForm({ ...newSRCForm, name: e.target.value })}
                      placeholder="Enter SRC member name"
                    />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newSRCForm.email}
                      onChange={(e) => setNewSRCForm({ ...newSRCForm, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newSRCForm.password}
                      onChange={(e) => setNewSRCForm({ ...newSRCForm, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="form-field">
                    <label>Campus (Auto-assigned)</label>
                    <input
                      type="text"
                      value={user.campus}
                      disabled
                      style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Create SRC</button>
                </form>
              )}

              <div className="srcs-list">
                {srcs.length === 0 ? (
                  <p className="empty-message">No SRCs created yet. Create one to get started!</p>
                ) : (
                  srcs.map(src => (
                    <div key={src.id} className="src-item" style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>{src.name}</h4>
                        <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9em' }}>
                          📧 {src.email}
                        </p>
                        <p style={{ margin: '0', color: '#999', fontSize: '0.85em' }}>
                          Campus: {src.campus} • Status: <span style={{
                            color: src.status === 'active' ? '#2ccc71' : '#e74c3c',
                            fontWeight: 'bold'
                          }}>
                            {src.status}
                          </span>
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {src.status === 'active' ? (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDeactivateSRC(src.id)}
                            style={{ fontSize: '0.9em', padding: '6px 12px' }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleActivateSRC(src.id)}
                            style={{ fontSize: '0.9em', padding: '6px 12px', color: '#2ccc71' }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDeleteSRC(src.id)}
                          style={{ fontSize: '0.9em', padding: '6px 12px', color: '#e74c3c' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>ℹ️ SRC Management Info</h2>
            </div>
            <div className="card-body">
              <div style={{ fontSize: '0.95em', lineHeight: '1.6' }}>
                <p><strong>Your Campus:</strong> {user.campus}</p>
                <p><strong>Total SRCs:</strong> {srcs.length}</p>
                <p><strong>Active SRCs:</strong> {srcs.filter(s => s.status === 'active').length}</p>
                <p><strong>Inactive SRCs:</strong> {srcs.filter(s => s.status === 'inactive').length}</p>
                <hr />
                <h4>Quick Guide:</h4>
                <ul style={{ marginLeft: '20px' }}>
                  <li>Create SRC members for your campus</li>
                  <li>SRCs can only be assigned to your campus</li>
                  <li>SRCs login with their email and password</li>
                  <li>Only active SRCs can access the system</li>
                  <li>You can deactivate or delete SRCs anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SFC Management Tab */}
      {activeTab === 'sfcs' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>💰 SFC Members ({sfcs.length})</h2>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowNewSFC(!showNewSFC)}
              >
                {showNewSFC ? '✕ Cancel' : '+ Create SFC'}
              </button>
            </div>
            <div className="card-body">
              {showNewSFC && (
                <form onSubmit={handleCreateSFC} className="form-group">
                  <div className="form-field">
                    <label>Name</label>
                    <input
                      type="text"
                      value={newSFCForm.name}
                      onChange={(e) => setNewSFCForm({ ...newSFCForm, name: e.target.value })}
                      placeholder="Enter SFC member name"
                    />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newSFCForm.email}
                      onChange={(e) => setNewSFCForm({ ...newSFCForm, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newSFCForm.password}
                      onChange={(e) => setNewSFCForm({ ...newSFCForm, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="form-field">
                    <label>Campus (Auto-assigned)</label>
                    <input
                      type="text"
                      value={user.campus}
                      disabled
                      style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Create SFC</button>
                </form>
              )}

              <div className="sfcs-list">
                {sfcs.length === 0 ? (
                  <p className="empty-message">No SFCs created yet. Create one to get started!</p>
                ) : (
                  sfcs.map(sfc => (
                    <div key={sfc.id} className="sfc-item" style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>{sfc.name}</h4>
                        <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9em' }}>
                          📧 {sfc.email}
                        </p>
                        <p style={{ margin: '0', color: '#999', fontSize: '0.85em' }}>
                          Campus: {sfc.campus} • Status: <span style={{
                            color: sfc.status === 'active' ? '#2ccc71' : '#e74c3c',
                            fontWeight: 'bold'
                          }}>
                            {sfc.status}
                          </span>
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {sfc.status === 'active' ? (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDeactivateSFC(sfc.id)}
                            style={{ fontSize: '0.9em', padding: '6px 12px' }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleActivateSFC(sfc.id)}
                            style={{ fontSize: '0.9em', padding: '6px 12px', color: '#2ccc71' }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDeleteSFC(sfc.id)}
                          style={{ fontSize: '0.9em', padding: '6px 12px', color: '#e74c3c' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>ℹ️ SFC Management Info</h2>
            </div>
            <div className="card-body">
              <div style={{ fontSize: '0.95em', lineHeight: '1.6' }}>
                <p><strong>Your Campus:</strong> {user.campus}</p>
                <p><strong>Total SFCs:</strong> {sfcs.length}</p>
                <p><strong>Active SFCs:</strong> {sfcs.filter(s => s.status === 'active').length}</p>
                <p><strong>Inactive SFCs:</strong> {sfcs.filter(s => s.status === 'inactive').length}</p>
                <hr />
                <h4>Quick Guide:</h4>
                <ul style={{ marginLeft: '20px' }}>
                  <li>Create SFC members for your campus</li>
                  <li>SFCs manage financial operations and budgets</li>
                  <li>SFCs login with their email and password</li>
                  <li>Only active SFCs can access the system</li>
                  <li>You can deactivate or delete SFCs anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communications Tab */}
      {activeTab === 'communications' && (
        <div className="dashboard-grid">
          <AdminCommunications user={user} />
        </div>
      )}
    </div>
  )
}
