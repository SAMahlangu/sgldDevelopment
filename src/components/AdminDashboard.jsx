import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Dashboards.css'

export default function AdminDashboard() {
  const { getPendingUsers, approveUser, rejectUser } = useAuth()
  const [pendingUsers] = useState(getPendingUsers())
  const [allUsers] = useState([
    { id: 1, name: 'John Doe', email: 'student@example.com', role: 'student', status: 'active', joinDate: '2026-01-15' },
    { id: 2, name: 'Jane Smith', email: 'src@example.com', role: 'src', status: 'active', joinDate: '2026-01-20' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', joinDate: '2026-01-10' },
  ])
  const [policies, setPolicies] = useState([
    { id: 1, title: 'Student Code of Conduct', status: 'approved', date: '2026-02-01' },
    { id: 2, title: 'Campus Safety Guidelines', status: 'pending', date: '2026-02-15' },
  ])
  const [showNewPolicy, setShowNewPolicy] = useState(false)
  const [newPolicy, setNewPolicy] = useState({ title: '', description: '' })
  const [activeTab, setActiveTab] = useState('overview')

  const handleApproveUser = (userId) => {
    approveUser(userId)
    // Update local state to reflect the change
  }

  const handleRejectUser = (userId) => {
    rejectUser(userId)
    // Update local state to reflect the change
  }

  const handleSubmitPolicy = (e) => {
    e.preventDefault()
    if (newPolicy.title.trim()) {
      setPolicies([...policies, {
        id: policies.length + 1,
        title: newPolicy.title,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      }])
      setNewPolicy({ title: '', description: '' })
      setShowNewPolicy(false)
    }
  }

  const approvePolicy = (policyId) => {
    setPolicies(policies.map(p => 
      p.id === policyId ? { ...p, status: 'approved' } : p
    ))
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1>Administrator Dashboard</h1>
        <p>Manage system, approve policies, and oversee governance</p>
      </div>

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
                <div className="stat-number">342</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">18</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">127</div>
                <div className="stat-label">Active Concerns</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">8</div>
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
              {pendingUsers.length === 0 ? (
                <p className="empty-state">No pending approvals</p>
              ) : (
                <div className="approvals-list">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="approval-item">
                      <div className="approval-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <span className="role-badge">{user.role.toUpperCase()}</span>
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
                      <td>{user.joinDate}</td>
                      <td>
                        <button className="btn btn-outline small">Edit</button>
                        <button className="btn btn-outline small">Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      placeholder="Policy details..."
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
                {policies.map(policy => (
                  <div key={policy.id} className="policy-item">
                    <div className="policy-info">
                      <h4>{policy.title}</h4>
                      <p className="policy-date">{policy.date}</p>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
