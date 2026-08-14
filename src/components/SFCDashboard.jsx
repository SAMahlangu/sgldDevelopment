import React, { useState, useEffect } from 'react'
import './Dashboards.css'
import SFCCommunications from './SFCCommunications'
import { sfcCommunicationService } from '../services/apiService'

export default function SFCDashboard({ user }) {
  const [activities, setActivities] = useState([
    { id: 1, name: 'Faculty-Student Collaboration Initiative', status: 'active', progress: 65, startDate: '2026-02-01', description: 'Building stronger partnerships between faculty and students' },
    { id: 2, name: 'Academic Excellence Program', status: 'active', progress: 40, startDate: '2026-03-01', description: 'Supporting student academic achievements and peer mentoring' },
    { id: 3, name: 'Campus Culture Enhancement', status: 'planning', progress: 20, startDate: '2026-04-01', description: 'Planning initiatives to improve campus community environment' },
  ])
  
  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Monthly Council Meeting', date: '2026-03-25', time: '14:00', location: 'Student Center Room 301', status: 'scheduled', attendees: 12 },
    { id: 2, title: 'Academic Committee Meeting', date: '2026-03-28', time: '15:30', location: 'Faculty Building Room 205', status: 'scheduled', attendees: 8 },
    { id: 3, title: 'Student Life Committee', date: '2026-04-01', time: '13:00', location: 'Student Center Room 102', status: 'upcoming', attendees: 10 },
  ])
  
  const [proposals, setProposals] = useState([
    { id: 1, title: 'Proposal: Increase Faculty Office Hours', description: 'Increase faculty accessibility by 25%', votes: { yes: 18, no: 2, abstain: 3 }, status: 'voted', createdBy: 'Dr. Peterson' },
    { id: 2, title: 'Proposal: New Student Mentorship Program', description: 'Launch peer mentoring initiative for first-year students', votes: { yes: 0, no: 0, abstain: 0 }, status: 'voting', createdBy: 'Sarah Chen' },
    { id: 3, title: 'Proposal: Campus Sustainability Initiative', description: 'Implement recycling and green practices', votes: { yes: 15, no: 5, abstain: 3 }, status: 'voted', createdBy: 'Environmental Club' },
  ])
  
  const [members, setMembers] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@sgld.com', role: 'Chair', committee: 'Faculty Relations' },
    { id: 2, name: 'Michael Chen', email: 'michael.chen@sgld.com', role: 'Vice Chair', committee: 'Academic Affairs' },
    { id: 3, name: 'Jessica Williams', email: 'jessica.williams@sgld.com', role: 'Secretary', committee: 'Student Life' },
  ])
  
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [newActivity, setNewActivity] = useState({ name: '', description: '' })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [unreadCount, setUnreadCount] = useState(0)

  // Load unread message count on mount
  useEffect(() => {
    loadUnreadCount()
  }, [user])

  const loadUnreadCount = async () => {
    if (user?.id) {
      const count = await sfcCommunicationService.getSFCUnreadCount(user.id)
      setUnreadCount(count)
    }
  }

  const handleCreateActivity = (e) => {
    e.preventDefault()
    if (newActivity.name.trim() && newActivity.description.trim()) {
      setActivities([...activities, {
        id: activities.length + 1,
        name: newActivity.name,
        description: newActivity.description,
        status: 'planning',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0]
      }])
      setNewActivity({ name: '', description: '' })
      setShowNewActivity(false)
    }
  }

  const handleVoteProposal = (proposalId, voteType) => {
    setProposals(proposals.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votes: {
            ...p.votes,
            [voteType]: p.votes[voteType] + 1
          }
        }
      }
      return p
    }))
  }

  const getTotalVotes = (votes) => {
    return votes.yes + votes.no + votes.abstain
  }

  const getVotePercentage = (voteCount, totalVotes) => {
    return totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0
  }

  return (
    <div className="dashboard sfc-dashboard">
      <div className="dashboard-header">
        <h1>📋 Student Faculty Council Dashboard</h1>
        <p>Collaborate with faculty, vote on proposals, and coordinate council activities</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          Activities
        </button>
        <button 
          className={`tab ${activeTab === 'meetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('meetings')}
        >
          Meetings
        </button>
        <button 
          className={`tab ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          Proposals
        </button>
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
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
              <h2>Quick Overview</h2>
            </div>
            <div className="card-body stats-grid">
              <div className="stat-item">
                <div className="stat-number">{activities.length}</div>
                <div className="stat-label">Active Initiatives</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{meetings.filter(m => m.status === 'scheduled').length}</div>
                <div className="stat-label">Upcoming Meetings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{proposals.filter(p => p.status === 'voting').length}</div>
                <div className="stat-label">Proposals Voting</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{members.length}</div>
                <div className="stat-label">Council Members</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>🎯 Current Initiatives</h2>
            </div>
            <div className="card-body">
              <div className="activities-list">
                {activities.slice(0, 3).map(activity => (
                  <div key={activity.id} className="activity-progress-item">
                    <div className="activity-info">
                      <h4>{activity.name}</h4>
                      <p>{activity.description}</p>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${activity.progress}%` }}></div>
                    </div>
                    <div className="progress-text">
                      <span>{activity.progress}% Complete</span>
                      <span className={`status ${activity.status}`}>{activity.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>📅 Next Meetings</h2>
            </div>
            <div className="card-body">
              <div className="meetings-list">
                {meetings.slice(0, 3).map(meeting => (
                  <div key={meeting.id} className="meeting-item">
                    <div className="meeting-date">
                      <strong>{meeting.date.split('-')[2]}</strong>
                      <small>{meeting.date.split('-')[1]}</small>
                    </div>
                    <div className="meeting-info">
                      <h4>{meeting.title}</h4>
                      <p>⏰ {meeting.time} • 📍 {meeting.location}</p>
                      <p style={{ fontSize: '0.9em', color: '#666' }}>👥 {meeting.attendees} attendees</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>🗳️ Active Proposals</h2>
            </div>
            <div className="card-body">
              <div className="proposals-list">
                {proposals.filter(p => p.status === 'voting').slice(0, 2).map(proposal => {
                  const total = getTotalVotes(proposal.votes)
                  return (
                    <div key={proposal.id} className="proposal-card">
                      <h4>{proposal.title}</h4>
                      <p>{proposal.description}</p>
                      <div className="voting-info">
                        <span style={{ color: '#10b981' }}>By: {proposal.createdBy}</span>
                        <span className="voting-status">Now Voting</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Council Initiatives</h2>
              {!showNewActivity && (
                <button onClick={() => setShowNewActivity(true)} className="btn btn-primary">
                  + New Initiative
                </button>
              )}
            </div>
            <div className="card-body">
              {showNewActivity && (
                <form onSubmit={handleCreateActivity} className="activity-form">
                  <div className="form-group">
                    <label>Initiative Name</label>
                    <input
                      type="text"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      placeholder="e.g., Faculty-Student Mentorship Program"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      placeholder="Describe your initiative..."
                      rows="4"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Create Initiative</button>
                    <button type="button" onClick={() => setShowNewActivity(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="activities-grid">
                {activities.map(activity => (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-card-header">
                      <h3>{activity.name}</h3>
                      <span className={`status ${activity.status}`}>{activity.status}</span>
                    </div>
                    <div className="activity-card-content">
                      <p>{activity.description}</p>
                      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>Started: {activity.startDate}</p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${activity.progress}%` }}></div>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9em' }}>
                        {activity.progress}% Complete
                      </div>
                    </div>
                    <div className="activity-actions">
                      <button className="btn btn-outline">View Details</button>
                      <button className="btn btn-outline">Update Progress</button>
                    </div>
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
              <h2>Council Meetings</h2>
            </div>
            <div className="card-body">
              <div className="meetings-grid">
                {meetings.map(meeting => (
                  <div key={meeting.id} className="meeting-card">
                    <div className="meeting-date-large">
                      <div className="date-day">{meeting.date.split('-')[2]}</div>
                      <div className="date-month">
                        {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div className="meeting-card-content">
                      <h3>{meeting.title}</h3>
                      <p>⏰ {meeting.time}</p>
                      <p>📍 {meeting.location}</p>
                      <p style={{ marginTop: '0.5rem', color: '#666' }}>👥 {meeting.attendees} Attendees</p>
                    </div>
                    <div className="meeting-actions">
                      <button className="btn btn-outline">View Agenda</button>
                      <button className="btn btn-outline">RSVP</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Council Proposals & Voting</h2>
            </div>
            <div className="card-body">
              <div className="proposals-grid">
                {proposals.map(proposal => {
                  const total = getTotalVotes(proposal.votes)
                  return (
                    <div key={proposal.id} className="proposal-card full">
                      <div className="proposal-header">
                        <h3>{proposal.title}</h3>
                        <span className={`proposal-status ${proposal.status}`}>{proposal.status}</span>
                      </div>
                      <div className="proposal-body">
                        <p>{proposal.description}</p>
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>Proposed by: {proposal.createdBy}</p>
                      </div>
                      
                      {proposal.status === 'voting' && (
                        <div className="voting-section">
                          <p style={{ marginBottom: '1rem', fontWeight: '500' }}>Cast Your Vote</p>
                          <div className="voting-buttons">
                            <button className="btn btn-success" onClick={() => handleVoteProposal(proposal.id, 'yes')}>
                              ✓ Yes
                            </button>
                            <button className="btn btn-outline" onClick={() => handleVoteProposal(proposal.id, 'abstain')}>
                              ○ Abstain
                            </button>
                            <button className="btn btn-danger" onClick={() => handleVoteProposal(proposal.id, 'no')}>
                              ✗ No
                            </button>
                          </div>
                        </div>
                      )}

                      {total > 0 && (
                        <div className="vote-results">
                          <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Voting Results</p>
                          <div className="vote-item">
                            <span>Yes: {proposal.votes.yes} ({getVotePercentage(proposal.votes.yes, total)}%)</span>
                            <div className="vote-bar">
                              <div className="vote-fill yes" style={{ width: `${getVotePercentage(proposal.votes.yes, total)}%` }}></div>
                            </div>
                          </div>
                          <div className="vote-item">
                            <span>No: {proposal.votes.no} ({getVotePercentage(proposal.votes.no, total)}%)</span>
                            <div className="vote-bar">
                              <div className="vote-fill no" style={{ width: `${getVotePercentage(proposal.votes.no, total)}%` }}></div>
                            </div>
                          </div>
                          <div className="vote-item">
                            <span>Abstain: {proposal.votes.abstain} ({getVotePercentage(proposal.votes.abstain, total)}%)</span>
                            <div className="vote-bar">
                              <div className="vote-fill abstain" style={{ width: `${getVotePercentage(proposal.votes.abstain, total)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h2>Council Members</h2>
            </div>
            <div className="card-body">
              <div className="members-grid">
                {members.map(member => (
                  <div key={member.id} className="member-card">
                    <div className="member-avatar">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="member-info">
                      <h3>{member.name}</h3>
                      <p className="member-role">{member.role}</p>
                      <p className="member-committee">📋 {member.committee}</p>
                      <p className="member-email">📧 {member.email}</p>
                    </div>
                    <div className="member-actions">
                      <button className="btn btn-outline">Message</button>
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
        <SFCCommunications user={user} onUnreadChange={loadUnreadCount} />
      )}
    </div>
  )
}
