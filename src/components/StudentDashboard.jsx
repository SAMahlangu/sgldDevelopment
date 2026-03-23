import React, { useState } from 'react'
import './Dashboards.css'

export default function StudentDashboard() {
  const [concerns, setConcerns] = useState([
    { id: 1, title: 'Campus Wi-Fi Issues', status: 'resolved', date: '2026-02-20', votes: 124 },
    { id: 2, title: 'Library Hours', status: 'in_progress', date: '2026-02-18', votes: 89 },
  ])
  const [polls, setPolls] = useState([
    { id: 1, title: 'Should campus have 24/7 library access?', options: ['Yes', 'No'], votes: [156, 89], userVoted: true },
    { id: 2, title: 'Best time for orientation week?', options: ['January', 'February', 'March'], votes: [98, 142, 67], userVoted: false },
  ])
  const [showNewConcern, setShowNewConcern] = useState(false)
  const [newConcern, setNewConcern] = useState({ title: '', description: '' })

  const handleSubmitConcern = (e) => {
    e.preventDefault()
    if (newConcern.title.trim()) {
      setConcerns([...concerns, {
        id: concerns.length + 1,
        title: newConcern.title,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        votes: 1
      }])
      setNewConcern({ title: '', description: '' })
      setShowNewConcern(false)
    }
  }

  const handleVotePoll = (pollId) => {
    setPolls(polls.map(p => 
      p.id === pollId ? { ...p, userVoted: true } : p
    ))
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Report concerns, vote in polls, and stay informed</p>
      </div>

      <div className="dashboard-grid">
        {/* Submit Concern Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>📋 Report a Concern</h2>
          </div>
          <div className="card-body">
            {!showNewConcern ? (
              <button onClick={() => setShowNewConcern(true)} className="btn btn-primary">
                Submit New Concern
              </button>
            ) : (
              <form onSubmit={handleSubmitConcern}>
                <div className="form-group">
                  <label>Concern Title</label>
                  <input
                    type="text"
                    value={newConcern.title}
                    onChange={(e) => setNewConcern({ ...newConcern, title: e.target.value })}
                    placeholder="Brief title of your concern"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newConcern.description}
                    onChange={(e) => setNewConcern({ ...newConcern, description: e.target.value })}
                    placeholder="Provide more details..."
                    rows="4"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Submit</button>
                  <button type="button" onClick={() => setShowNewConcern(false)} className="btn">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* My Concerns */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Concerns</h2>
            <span className="badge">{concerns.length}</span>
          </div>
          <div className="card-body">
            <div className="concerns-list">
              {concerns.map(concern => (
                <div key={concern.id} className="concern-item">
                  <div className="concern-info">
                    <h4>{concern.title}</h4>
                    <div className="concern-meta">
                      <span className={`status ${concern.status}`}>{concern.status.replace('_', ' ')}</span>
                      <span className="date">{concern.date}</span>
                    </div>
                  </div>
                  <div className="concern-votes">
                    <strong>{concern.votes}</strong> votes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Polls */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Active Polls</h2>
          </div>
          <div className="card-body">
            <div className="polls-list">
              {polls.map(poll => (
                <div key={poll.id} className="poll-item">
                  <h4>{poll.title}</h4>
                  <div className="poll-options">
                    {poll.options.map((option, idx) => (
                      <div key={idx} className="poll-option">
                        <div className="option-bar">
                          <div className="option-name">{option}</div>
                          <div className="option-votes">{poll.votes[idx]} votes</div>
                        </div>
                        <div className="option-progress">
                          <div className="progress-bar" style={{width: `${(poll.votes[idx] / Math.max(...poll.votes)) * 100}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!poll.userVoted && (
                    <button onClick={() => handleVotePoll(poll.id)} className="btn btn-outline">
                      Vote Now
                    </button>
                  )}
                  {poll.userVoted && <p className="voted-msg">✓ You've already voted</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Upcoming Events</h2>
          </div>
          <div className="card-body">
            <div className="events-list">
              <div className="event-item">
                <div className="event-date">12 Mar</div>
                <div className="event-details">
                  <h4>Student Leadership Forum</h4>
                  <p>Main Campus Auditorium • 14:00</p>
                </div>
              </div>
              <div className="event-item">
                <div className="event-date">15 Mar</div>
                <div className="event-details">
                  <h4>Governance Training Workshop</h4>
                  <p>Student Centre • 10:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Cases */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Tracked Cases</h2>
          </div>
          <div className="card-body">
            <div className="cases-list">
              <div className="case-item">
                <span className="case-status resolved">✓</span>
                <div className="case-info">
                  <h4>Campus Parking Improvement</h4>
                  <p className="case-date">Resolved - 2026-02-10</p>
                </div>
              </div>
              <div className="case-item">
                <span className="case-status progress">⟳</span>
                <div className="case-info">
                  <h4>Student Health Center Hours</h4>
                  <p className="case-date">In Progress - 50% complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
