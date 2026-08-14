import React, { useState } from 'react'
import './Dashboards.css'

export default function CSPDashboard({ user }) {
  const [sessions, setSessions] = useState([
    { id: 1, title: 'Campus Parliament Session', date: '2026-03-20', time: '15:00', location: 'Assembly Hall', status: 'scheduled', attendees: 20, description: 'Regular campus parliament meeting' },
    { id: 2, title: 'Budget Discussion Session', date: '2026-03-25', time: '14:00', location: 'Committee Room', status: 'scheduled', attendees: 15, description: 'Budget allocation discussion' },
    { id: 3, title: 'Special Session on Student Welfare', date: '2026-04-02', time: '16:00', location: 'Virtual', status: 'upcoming', attendees: 25, description: 'Student welfare initiatives' },
  ])
  const [resolutions, setResolutions] = useState([
    { id: 1, title: 'Campus WiFi Improvement Resolution', status: 'passed', votes: 22, description: 'Upgrade campus WiFi infrastructure' },
    { id: 2, title: 'Student Facilities Enhancement', status: 'under_vote', votes: 18, description: 'Improve campus facilities' },
    { id: 3, title: 'Sustainability Initiative', status: 'passed', votes: 26, description: 'Go green on campus' },
  ])
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSession, setNewSession] = useState({ title: '', date: '', time: '', location: '', description: '' })
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleCreateSession = (e) => {
    e.preventDefault()
    if (newSession.title.trim() && newSession.date && newSession.time) {
      setSessions([...sessions, {
        id: sessions.length + 1,
        ...newSession,
        status: 'scheduled',
        attendees: 0
      }])
      setNewSession({ title: '', date: '', time: '', location: '', description: '' })
      setShowNewSession(false)
    }
  }

  return (
    <div className="dashboard csp-dashboard">
      <div className="dashboard-header">
        <h1>🏫 Campus Student Parliament (CSP)</h1>
        <p>Campus parliament sessions, resolutions, and campus governance</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}>
          Sessions ({sessions.length})
        </button>
        <button 
          className={`tab ${activeTab === 'resolutions' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolutions')}>
          Resolutions ({resolutions.length})
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
                <div className="stat-number">{sessions.length}</div>
                <div className="stat-label">Campus Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{resolutions.length}</div>
                <div className="stat-label">Total Resolutions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{resolutions.filter(r => r.status === 'passed').length}</div>
                <div className="stat-label">Passed Resolutions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{sessions.reduce((sum, s) => sum + s.attendees, 0)}</div>
                <div className="stat-label">Total Attendance</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📅 Upcoming Campus Parliament Sessions</h2>
            </div>
            <div className="card-body">
              <div className="meetings-list">
                {sessions.slice(0, 3).map(session => (
                  <div key={session.id} className="meeting-item">
                    <div className="meeting-date">{session.date}</div>
                    <div className="meeting-details">
                      <h4>{session.title}</h4>
                      <p>{session.time} • {session.location}</p>
                      <p className="meeting-desc">{session.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📋 Recent Resolutions</h2>
            </div>
            <div className="card-body">
              <div className="updates-list">
                {resolutions.slice(0, 3).map(resolution => (
                  <div key={resolution.id} className="update-item">
                    <h4>{resolution.title}</h4>
                    <div className="update-meta">
                      <span className="status" style={{ background: resolution.status === 'passed' ? '#10b981' : '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{resolution.status}</span>
                      <span className="reactions">🗳️ {resolution.votes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📊 Resolution Status</h2>
            </div>
            <div className="card-body">
              <div className="pending-list">
                <div className="pending-item">
                  <span className="pending-type">Passed</span>
                  <span className="pending-count">{resolutions.filter(r => r.status === 'passed').length}</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">Under Vote</span>
                  <span className="pending-count">{resolutions.filter(r => r.status === 'under_vote').length}</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">Total Resolutions</span>
                  <span className="pending-count">{resolutions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Campus Parliament Sessions</h2>
              {!showNewSession && (
                <button onClick={() => setShowNewSession(true)} className="btn btn-primary">
                  + Schedule Session
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewSession && (
                <form onSubmit={handleCreateSession} className="meeting-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Session Title</label>
                      <input
                        type="text"
                        value={newSession.title}
                        onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                        placeholder="e.g., Campus Parliament Session"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={newSession.date}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={newSession.time}
                        onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={newSession.location}
                        onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                        placeholder="e.g., Assembly Hall / Virtual"
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={newSession.description}
                      onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                      placeholder="Session agenda and details"
                      rows="3"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Schedule Session</button>
                    <button type="button" onClick={() => setShowNewSession(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="meetings-grid">
                {sessions.map(session => (
                  <div key={session.id} className="meeting-card">
                    <div className="meeting-header">
                      <h3>{session.title}</h3>
                      <span className={`status ${session.status}`}>{session.status}</span>
                    </div>
                    <div className="meeting-info">
                      <p>📅 {session.date}</p>
                      <p>⏰ {session.time}</p>
                      <p>📍 {session.location}</p>
                      <p>👥 {session.attendees} attendees</p>
                      <p className="meeting-desc">{session.description}</p>
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

      {/* Resolutions Tab */}
      {activeTab === 'resolutions' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Campus Resolutions</h2>
            </div>
            <div className="card-body">
              <div className="requests-list">
                {resolutions.map(resolution => (
                  <div key={resolution.id} className="request-item">
                    <div className="request-badge" style={{ background: resolution.status === 'passed' ? '#10b981' : '#3b82f6' }}>📋 {resolution.status}</div>
                    <div className="request-content">
                      <h4>{resolution.title}</h4>
                      <p>{resolution.description}</p>
                      <p className="request-votes">🗳️ {resolution.votes} votes</p>
                    </div>
                    <div className="request-actions">
                      <button className="btn btn-outline">View</button>
                      <button className="btn btn-outline">Vote</button>
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
