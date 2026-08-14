import React, { useState } from 'react'
import './Dashboards.css'

export default function CSRCDashboard({ user }) {
  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Campus Council Meeting', date: '2026-03-20', time: '14:00', location: 'Board Room', status: 'scheduled', attendees: 15, description: 'Monthly campus council review' },
    { id: 2, title: 'Student Concerns Discussion', date: '2026-03-22', time: '10:30', location: 'Virtual', status: 'scheduled', attendees: 12, description: 'Addressing student feedback' },
    { id: 3, title: 'Campus Planning Session', date: '2026-03-29', time: '15:00', location: 'Student Center', status: 'upcoming', attendees: 18, description: 'Planning campus initiatives' },
  ])
  const [initiatives, setInitiatives] = useState([
    { id: 1, title: 'Campus Infrastructure Improvement', status: 'active', progress: 65, description: 'Improving campus facilities' },
    { id: 2, title: 'Student Engagement Program', status: 'active', progress: 80, description: 'Increasing student involvement' },
    { id: 3, title: 'Campus Safety Initiative', status: 'planning', progress: 30, description: 'Enhancing campus security' },
  ])
  const [concerns, setConcerns] = useState([
    { id: 1, title: 'Improve Parking Facilities', status: 'in_progress', votes: 45, category: 'Infrastructure' },
    { id: 2, title: 'Extend Library Hours', status: 'in_progress', votes: 67, category: 'Academic' },
    { id: 3, title: 'Better Campus WiFi', status: 'new', votes: 38, category: 'Technology' },
  ])
  const [showNewMeeting, setShowNewMeeting] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', location: '', description: '' })
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleCreateMeeting = (e) => {
    e.preventDefault()
    if (newMeeting.title.trim() && newMeeting.date && newMeeting.time) {
      setMeetings([...meetings, {
        id: meetings.length + 1,
        ...newMeeting,
        status: 'scheduled',
        attendees: 0
      }])
      setNewMeeting({ title: '', date: '', time: '', location: '', description: '' })
      setShowNewMeeting(false)
    }
  }

  return (
    <div className="dashboard csrc-dashboard">
      <div className="dashboard-header">
        <h1>🏫 Campus Student Representative Council (CSRC)</h1>
        <p>Organize campus meetings, manage initiatives, and address student concerns</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'meetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('meetings')}>
          Meetings ({meetings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'initiatives' ? 'active' : ''}`}
          onClick={() => setActiveTab('initiatives')}>
          Initiatives ({initiatives.length})
        </button>
        <button 
          className={`tab ${activeTab === 'concerns' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerns')}>
          Concerns ({concerns.length})
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
                <div className="stat-label">Campus Meetings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{initiatives.length}</div>
                <div className="stat-label">Active Initiatives</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{concerns.length}</div>
                <div className="stat-label">Student Concerns</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{Math.round(initiatives.reduce((sum, i) => sum + i.progress, 0) / initiatives.length)}%</div>
                <div className="stat-label">Avg. Progress</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📅 Upcoming Campus Meetings</h2>
            </div>
            <div className="card-body">
              <div className="meetings-list">
                {meetings.slice(0, 3).map(meeting => (
                  <div key={meeting.id} className="meeting-item">
                    <div className="meeting-date">{meeting.date}</div>
                    <div className="meeting-details">
                      <h4>{meeting.title}</h4>
                      <p>{meeting.time} • {meeting.location}</p>
                      <p className="meeting-desc">{meeting.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>🚀 Active Initiatives</h2>
            </div>
            <div className="card-body">
              <div className="updates-list">
                {initiatives.slice(0, 3).map(initiative => (
                  <div key={initiative.id} className="update-item">
                    <h4>{initiative.title}</h4>
                    <div className="update-meta">
                      <span className="date">{initiative.description}</span>
                      <span className="reactions" style={{ color: '#3b82f6' }}>📊 {initiative.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>⚠️ Pending Concerns</h2>
            </div>
            <div className="card-body">
              <div className="pending-list">
                <div className="pending-item">
                  <span className="pending-type">New Concerns</span>
                  <span className="pending-count">{concerns.filter(c => c.status === 'new').length}</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">In Progress</span>
                  <span className="pending-count">{concerns.filter(c => c.status === 'in_progress').length}</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">Total Concerns</span>
                  <span className="pending-count">{concerns.length}</span>
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
              <h2>Campus Council Meetings</h2>
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
                        placeholder="e.g., Campus Council Meeting"
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
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                      placeholder="Meeting agenda and details"
                      rows="3"
                    />
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
                      <p className="meeting-desc">{meeting.description}</p>
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

      {/* Initiatives Tab */}
      {activeTab === 'initiatives' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Campus Initiatives</h2>
            </div>
            <div className="card-body">
              <div className="requests-list">
                {initiatives.map(initiative => (
                  <div key={initiative.id} className="request-item">
                    <div className="request-badge" style={{ background: '#3b82f6' }}>🚀 {initiative.status}</div>
                    <div className="request-content">
                      <h4>{initiative.title}</h4>
                      <p>{initiative.description}</p>
                      <div className="progress-bar" style={{ marginTop: '8px', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${initiative.progress}%`, height: '100%', background: '#10b981' }}></div>
                      </div>
                      <p style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>Progress: {initiative.progress}%</p>
                    </div>
                    <div className="request-actions">
                      <button className="btn btn-outline">Update</button>
                      <button className="btn btn-outline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concerns Tab */}
      {activeTab === 'concerns' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Student Concerns</h2>
            </div>
            <div className="card-body">
              <div className="requests-list">
                {concerns.map(concern => (
                  <div key={concern.id} className="request-item">
                    <div className="request-badge" style={{ background: concern.status === 'in_progress' ? '#10b981' : '#f59e0b' }}>{concern.status}</div>
                    <div className="request-content">
                      <h4>{concern.title}</h4>
                      <p>Category: {concern.category} • 👍 {concern.votes} votes</p>
                    </div>
                    <div className="request-actions">
                      <button className="btn btn-outline">Respond</button>
                      <button className="btn btn-outline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
