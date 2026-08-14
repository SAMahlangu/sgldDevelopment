import React, { useState, useEffect } from 'react'
import './Dashboards.css'

export default function ISRCDashboard({ user }) {
  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Institutional Council Meeting', date: '2026-03-20', time: '14:00', location: 'Main Hall', status: 'scheduled', attendees: 24, description: 'Quarterly institutional review and coordination' },
    { id: 2, title: 'Inter-Campus Coordination', date: '2026-03-25', time: '11:00', location: 'Virtual', status: 'scheduled', attendees: 18, description: 'Cross-campus initiatives discussion' },
    { id: 3, title: 'Strategic Planning Session', date: '2026-04-01', time: '15:00', location: 'Conference Center', status: 'upcoming', attendees: 20, description: 'Planning for next institutional cycle' },
  ])
  
  const [decisions, setDecisions] = useState([
    { id: 1, title: 'New Institutional Policy Framework Approved', date: '2026-03-10', institutions: ['All Campuses'], status: 'active', impact: 'High' },
    { id: 2, title: 'Joint Initiative for Student Welfare Launched', date: '2026-03-08', institutions: ['Campus 1', 'Campus 2', 'Campus 3'], status: 'active', impact: 'High' },
    { id: 3, title: 'Inter-Campus Collaboration Fund Established', date: '2026-03-01', institutions: ['All Campuses'], status: 'active', impact: 'Medium' },
  ])
  
  const [representatives, setRepresentatives] = useState([
    { id: 1, name: 'John Okonkwo', campus: 'Campus 1', role: 'ISRC Chair', since: '2026-01-15' },
    { id: 2, name: 'Amara Nwosu', campus: 'Campus 2', role: 'ISRC Vice Chair', since: '2026-01-15' },
    { id: 3, name: 'Chioma Adeyemi', campus: 'Campus 3', role: 'ISRC Treasurer', since: '2026-02-01' },
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
    <div className="dashboard isrc-dashboard">
      <div className="dashboard-header">
        <h1>🏛️ Institutional Student Representative Council (ISRC)</h1>
        <p>Coordinate across institutions, manage institutional decisions, and lead inter-campus initiatives</p>
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
          Meetings ({meetings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
          Decisions ({decisions.length})
        </button>
        <button 
          className={`tab ${activeTab === 'representatives' ? 'active' : ''}`}
          onClick={() => setActiveTab('representatives')}
        >
          Representatives ({representatives.length})
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
                <div className="stat-number">{decisions.length}</div>
                <div className="stat-label">Active Decisions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{representatives.length}</div>
                <div className="stat-label">Key Representatives</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">6</div>
                <div className="stat-label">Campuses Coordinated</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📅 Upcoming Institutional Meetings</h2>
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
              <h2>✅ Recent Decisions</h2>
            </div>
            <div className="card-body">
              <div className="updates-list">
                {decisions.slice(0, 3).map(decision => (
                  <div key={decision.id} className="update-item">
                    <h4>{decision.title}</h4>
                    <div className="update-meta">
                      <span className="date">{decision.date}</span>
                      <span className="status" style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>👥 Key Leadership</h2>
            </div>
            <div className="card-body">
              <div className="pending-list">
                {representatives.slice(0, 3).map(rep => (
                  <div key={rep.id} className="pending-item">
                    <div>
                      <p style={{ fontWeight: '600' }}>{rep.name}</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>{rep.role}</p>
                    </div>
                    <span className="pending-count">{rep.campus}</span>
                  </div>
                ))}
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
              <h2>Institutional Meetings</h2>
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
                        placeholder="e.g., Institutional Council Meeting"
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
                        placeholder="e.g., Main Hall / Virtual"
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

      {/* Decisions Tab */}
      {activeTab === 'decisions' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Institutional Decisions</h2>
            </div>
            <div className="card-body">
              <div className="requests-list">
                {decisions.map(decision => (
                  <div key={decision.id} className="request-item">
                    <div className="request-badge" style={{ background: '#10b981' }}>✅ Active</div>
                    <div className="request-content">
                      <h4>{decision.title}</h4>
                      <p>📅 {decision.date} • Impact: <strong>{decision.impact}</strong></p>
                      <p>Institutions: {decision.institutions.join(', ')}</p>
                    </div>
                    <div className="request-actions">
                      <button className="btn btn-outline">View</button>
                      <button className="btn btn-outline">Share</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Representatives Tab */}
      {activeTab === 'representatives' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Institutional Leadership</h2>
            </div>
            <div className="card-body">
              <div className="members-grid">
                {representatives.map(rep => (
                  <div key={rep.id} className="member-card">
                    <div className="member-avatar" style={{ width: '60px', height: '60px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', margin: '0 auto 10px' }}>👤</div>
                    <h3>{rep.name}</h3>
                    <p className="role">{rep.role}</p>
                    <p className="campus">{rep.campus}</p>
                    <p className="since" style={{ fontSize: '12px', color: '#999' }}>Since: {rep.since}</p>
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
