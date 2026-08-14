import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export default function DatabaseStatus() {
  const [status, setStatus] = useState('checking')
  const [details, setDetails] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkDatabaseHealth()
    // Recheck every 30 seconds
    const interval = setInterval(checkDatabaseHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkDatabaseHealth = async () => {
    try {
      const { data, error } = await supabase
        .rpc('database_health_check')
      
      if (error) {
        console.error('Health check error:', error)
        setStatus('error')
        setDetails({ message: 'Database check failed', error: error.message })
        return
      }

      if (data && data.status === 'healthy') {
        setStatus('healthy')
      } else {
        setStatus('warning')
      }
      setDetails(data)
    } catch (err) {
      console.error('Health check exception:', err)
      setStatus('error')
      setDetails({ message: 'Unable to check database', error: err.message })
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return '#4CAF50'
      case 'warning':
        return '#FF9800'
      case 'error':
        return '#F44336'
      default:
        return '#2196F3'
    }
  }

  const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '4px',
    backgroundColor: `${getStatusColor()}20`,
    border: `1px solid ${getStatusColor()}`,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: getStatusColor(),
    transition: 'all 0.3s ease'
  }

  const detailsStyle = {
    position: 'absolute',
    right: 0,
    top: '40px',
    backgroundColor: '#fff',
    border: `1px solid ${getStatusColor()}`,
    borderRadius: '4px',
    padding: '12px',
    minWidth: '250px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    fontSize: '12px',
    fontFamily: 'monospace'
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div 
        style={statusStyle}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        title="Click to refresh database status"
        onClick={checkDatabaseHealth}
      >
        <span>{getStatusIcon()}</span>
        <span>
          {status === 'healthy' && 'DB Connected'}
          {status === 'warning' && 'DB Warning'}
          {status === 'error' && 'DB Error'}
          {status === 'checking' && 'Checking...'}
        </span>
      </div>

      {showDetails && details && (
        <div style={detailsStyle}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Database Status
          </div>
          <div style={{ color: '#666' }}>
            <div>Status: <strong>{details.status}</strong></div>
            <div>Tables: <strong>{details.tables_created || 0}/7</strong></div>
            <div>Users: <strong>{details.users_count || 0}</strong></div>
            <div>News: <strong>{details.news_count || 0}</strong></div>
            <div>Events: <strong>{details.events_count || 0}</strong></div>
            <div style={{ marginTop: '8px', color: '#999', fontSize: '11px' }}>
              {details.message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
