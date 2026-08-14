import React, { useState, useEffect } from 'react'
import './Dashboards.css'
import SRCCommunications from './SRCCommunications'
import { communicationService } from '../services/apiService'

export default function SRCDashboard({ user }) {
  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Weekly SRC Meeting', date: '2026-03-20', time: '14:00', location: 'Board Room', status: 'scheduled', attendees: 12 },
    { id: 2, title: 'Campus Planning Committee', date: '2026-03-22', time: '10:30', location: 'Virtual', status: 'scheduled', attendees: 8 },
  ])
  const [updates, setUpdates] = useState([
    { id: 1, title: 'New Parking Permit System Approved', date: '2026-03-10', reactions: 45 },
    { id: 2, title: 'Mental Health Support Program Launched', date: '2026-03-08', reactions: 67 },
  ])
  const [requests, setRequests] = useState([
    { id: 1, type: 'concern', title: 'Library needs extended hours', status: 'new', votes: 124 },
    { id: 2, type: 'request', title: 'Improve campus Wi-Fi coverage', status: 'in_progress', votes: 89 },
  ])
  const [showNewMeeting, setShowNewMeeting] = useState(false)
  const [showNewUpdate, setShowNewUpdate] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', location: '' })
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [unreadCount, setUnreadCount] = useState(0)

  // Load unread message count on mount
  useEffect(() => {
    loadUnreadCount()
  }, [user])

  const loadUnreadCount = async () => {
    if (user?.id) {
      const count = await communicationService.getSRCUnreadCount(user.id)
      setUnreadCount(count)
    }
  }

  const handleCreateMeeting = (e) => {
    e.preventDefault()
    if (newMeeting.title.trim() && newMeeting.date && newMeeting.time) {
      setMeetings([...meetings, {
        id: meetings.length + 1,
        ...newMeeting,
        status: 'scheduled',
        attendees: 0
      }])
      setNewMeeting({ title: '', date: '', time: '', location: '' })
      setShowNewMeeting(false)
    }
  }

  const handlePublishUpdate = (e) => {
    e.preventDefault()
    if (newUpdate.title.trim()) {
      setUpdates([...updates, {
        id: updates.length + 1,
        title: newUpdate.title,
        date: new Date().toISOString().split('T')[0],
        reactions: 0
      }])
      setNewUpdate({ title: '', content: '' })
      setShowNewUpdate(false)
    }
  }

  const handleRespondRequest = (requestId) => {
    setRequests(requests.map(r => 
      r.id === requestId ? { ...r, status: 'in_progress' } : r
    ))
  }

  return (
    <div className="dashboard src-dashboard">
      <div className="dashboard-header">
        <h1>SRC Management Dashboard</h1>
        <p>Organize meetings, respond to student requests, and publish updates</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'meetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('meetings')}
        >
          Meetings
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({requests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
          onClick={() => setActiveTab('updates')}
        >
          Updates
        </button>
        <button 
          className={`tab ${activeTab === 'communications' ? 'active' : ''}`}
          onClick={() => setActiveTab('communications')}
        >
          📱 Communications {unreadCount > 0 && <span style={{ background: '#dc2626', color: 'white', borderRadius: '50%', padding: '0 6px', marginLeft: '4px' }}>{unreadCount}</span>}
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Quick Stats</h2>
            </div>
            <div className="card-body stats-grid">
              <div className="stat-item">
                <div className="stat-number">{meetings.length}</div>
                <div className="stat-label">Scheduled Meetings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{requests.length}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{updates.length}</div>
                <div className="stat-label">Published Updates</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1,245</div>
                <div className="stat-label">Active Members</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📅 Upcoming Meetings</h2>
            </div>
            <div className="card-body">
              <div className="meetings-list">
                {meetings.slice(0, 3).map(meeting => (
                  <div key={meeting.id} className="meeting-item">
                    <div className="meeting-date">{meeting.date}</div>
                    <div className="meeting-details">
                      <h4>{meeting.title}</h4>
                      <p>{meeting.time} • {meeting.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>🔔 Recent Updates</h2>
            </div>
            <div className="card-body">
              <div className="updates-list">
                {updates.slice(0, 3).map(update => (
                  <div key={update.id} className="update-item">
                    <h4>{update.title}</h4>
                    <div className="update-meta">
                      <span className="date">{update.date}</span>
                      <span className="reactions">❤️ {update.reactions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>⚠️ Pending Actions</h2>
            </div>
            <div className="card-body">
              <div className="pending-list">
                <div className="pending-item">
                  <span className="pending-type">New Concern</span>
                  <span className="pending-count">24</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">In Progress</span>
                  <span className="pending-count">18</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">Awaiting Response</span>
                  <span className="pending-count">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Manage Meetings</h2>
              {!showNewMeeting && (
                <button onClick={() => setShowNewMeeting(true)} className="btn btn-primary">
                  + Schedule Meeting
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewMeeting && (
                <form onSubmit={handleCreateMeeting} className="meeting-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Meeting Title</label>
                      <input
                        type="text"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                        placeholder="e.g., Weekly SRC Meeting"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                        placeholder="e.g., Board Room / Virtual"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Schedule Meeting</button>
                    <button type="button" onClick={() => setShowNewMeeting(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="meetings-grid">
                {meetings.map(meeting => (
                  <div key={meeting.id} className="meeting-card">
                    <div className="meeting-header">
                      <h3>{meeting.title}</h3>
                      <span className={`status ${meeting.status}`}>{meeting.status}</span>
                    </div>
                    <div className="meeting-info">
                      <p>📅 {meeting.date}</p>
                      <p>⏰ {meeting.time}</p>
                      <p>📍 {meeting.location}</p>
                      <p>👥 {meeting.attendees} attendees</p>
                    </div>
                    <div className="meeting-actions">
                      <button className="btn btn-outline">Edit</button>
                      <button className="btn btn-outline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Student Requests & Concerns</h2>
            </div>
            <div className="card-body">
              <div className="requests-list">
                {requests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-badge">{request.type}</div>
                    <div className="request-content">
                      <h4>{request.title}</h4>
                      <p className="request-votes">👍 {request.votes} votes</p>
                    </div>
                    <div className="request-status">
                      <span className={`status ${request.status}`}>{request.status}</span>
                    </div>
                    <div className="request-actions">
                      {request.status === 'new' && (
                        <button 
                          onClick={() => handleRespondRequest(request.id)}
                          className="btn btn-primary"
                        >
                          Respond
                        </button>
                      )}
                      {request.status === 'in_progress' && (
                        <button className="btn btn-outline">Update Status</button>
                      )}
                      <button className="btn btn-outline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Publish Updates</h2>
              {!showNewUpdate && (
                <button onClick={() => setShowNewUpdate(true)} className="btn btn-primary">
                  + New Update
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewUpdate && (
                <form onSubmit={handlePublishUpdate} className="update-form">
                  <div className="form-group">
                    <label>Update Title</label>
                    <input
                      type="text"
                      value={newUpdate.title}
                      onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                      placeholder="What's the news?"
                    />
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={newUpdate.content}
                      onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                      placeholder="Share the full details..."
                      rows="6"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Publish Update</button>
                    <button type="button" onClick={() => setShowNewUpdate(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="published-updates">
                <h3>Published Updates</h3>
                {updates.map(update => (
                  <div key={update.id} className="published-update">
                    <div className="update-header">
                      <h4>{update.title}</h4>
                      <span className="update-date">{update.date}</span>
                    </div>
                    <p className="update-reactions">❤️ {update.reactions} reactions</p>
                    <div className="update-actions">
                      <button className="btn btn-outline">Edit</button>
                      <button className="btn btn-outline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communications Tab */}
      {activeTab === 'communications' && (
        <div className="dashboard-grid full-width">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>💬 Admin Communications</h2>
            </div>
            <div className="card-body">
              {user ? <SRCCommunications user={user} /> : <p>Please log in to access communications</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
