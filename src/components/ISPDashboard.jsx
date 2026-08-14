import React, { useState } from 'react'
import './Dashboards.css'

export default function ISPDashboard({ user }) {
  const [sessions, setSessions] = useState([
    { id: 1, title: 'Institutional Parliament Session', date: '2026-03-20', time: '15:00', location: 'Assembly Hall', status: 'scheduled', attendees: 32 },
    { id: 2, title: 'Policy Review Session', date: '2026-03-27', time: '14:00', location: 'Committee Room', status: 'scheduled', attendees: 20 },
    { id: 3, title: 'Budget Discussion Session', date: '2026-04-03', time: '16:00', location: 'Virtual', status: 'upcoming', attendees: 28 },
  ])
  const [bills, setBills] = useState([
    { id: 1, title: 'Campus Safety Enhancement Bill', status: 'under_review', votes: 28, description: 'Comprehensive safety improvements' },
    { id: 2, title: 'Student Welfare Fund Allocation', status: 'passed', votes: 35, description: 'Increased funding for student programs' },
    { id: 3, title: 'Academic Excellence Initiative', status: 'voting', votes: 22, description: 'Supporting student academic achievement' },
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
    <div className="dashboard isp-dashboard">
      <div className="dashboard-header">
        <h1>🏛️ Institutional Student Parliament (ISP)</h1>
        <p>Parliamentary sessions, bill reviews, and institutional legislative governance</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions ({sessions.length})
        </button>
        <button 
          className={`tab ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          Bills ({bills.length})
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
                <div className="stat-label">Parliamentary Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{bills.length}</div>
                <div className="stat-label">Total Bills</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{bills.filter(b => b.status === 'passed').length}</div>
                <div className="stat-label">Bills Passed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{sessions.reduce((sum, s) => sum + s.attendees, 0)}</div>
                <div className="stat-label">Total Attendance</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📅 Upcoming Parliamentary Sessions</h2>
            </div>
            <div className="card-body">
              <div className="meetings-list">
                {sessions.slice(0, 3).map(session => (
                  <div key={session.id} className="meeting-item">
                    <div className="meeting-date">{session.date}</div>
                    <div className="meeting-details">
                      <h4>{session.title}</h4>
                      <p>{session.time} • {session.location}</p>
                      <p className="meeting-desc">Parliamentary discussion and voting</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📋 Recent Bills</h2>
            </div>
            <div className="card-body">
              <div className="updates-list">
                {bills.slice(0, 3).map(bill => (
                  <div key={bill.id} className="update-item">
                    <h4>{bill.title}</h4>
                    <div className="update-meta">
                      <span className="status" style={{ background: bill.status === 'passed' ? '#10b981' : '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{bill.status}</span>
                      <span className="reactions">🗳️ {bill.votes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>⚖️ Legislation Status</h2>
            </div>
            <div className="card-body">
              <div className="pending-list">
                <div className="pending-item">
                  <span className="pending-type">Bills Passed</span>
                  <span className="pending-count">{bills.filter(b => b.status === 'passed').length}</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">Under Review</span>
                  <span className="pending-count">{bills.filter(b => b.status === 'under_review').length}</span>
                </div>
                <div className="pending-item">
                  <span className="pending-type">Voting Now</span>
                  <span className="pending-count">{bills.filter(b => b.status === 'voting').length}</span>
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
              <h2>Parliamentary Sessions</h2>
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
                        placeholder="e.g., Parliamentary Session"
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

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Parliamentary Bills & Legislation</h2>
            </div>
            <div className="card-body">
              <div className="requests-list">
                {bills.map(bill => (
                  <div key={bill.id} className="request-item">
                    <div className="request-badge" style={{ background: bill.status === 'passed' ? '#10b981' : bill.status === 'voting' ? '#3b82f6' : '#f59e0b' }}>📋 {bill.status}</div>
                    <div className="request-content">
                      <h4>{bill.title}</h4>
                      <p>{bill.description}</p>
                      <p className="request-votes">🗳️ {bill.votes} votes</p>
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
