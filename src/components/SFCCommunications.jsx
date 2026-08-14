import React, { useState, useEffect } from 'react'
import { sfcCommunicationService } from '../services/apiService'

export default function SFCCommunications({ user, onUnreadChange }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [documents, setDocuments] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('messages')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadConversation()
    loadDocuments()
    checkUnread()
  }, [user])

  const loadConversation = async () => {
    setLoading(true)
    const data = await sfcCommunicationService.getConversation(user.id, user.admin_id)
    if (data && !data.error) {
      setMessages(data)
    }
    setLoading(false)
  }

  const loadDocuments = async () => {
    const data = await sfcCommunicationService.getDocumentsForSFC(user.id, user.admin_id)
    if (data && !data.error) {
      setDocuments(data)
    }
  }

  const checkUnread = async () => {
    const count = await sfcCommunicationService.getSFCUnreadCount(user.id)
    setUnreadCount(count)
    if (onUnreadChange) onUnreadChange()
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    const result = await sfcCommunicationService.sendMessage(
      user.id,
      user.admin_id,
      user.id,
      'sfc',
      newMessage
    )

    if (!result.error) {
      setNewMessage('')
      await loadConversation()
    }
    setLoading(false)
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    
    setLoading(true)
    const result = await sfcCommunicationService.deleteMessage(messageId)
    if (!result.error) {
      await loadConversation()
    }
    setLoading(false)
  }

  const handleUploadDocument = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    const result = await sfcCommunicationService.uploadDocument(
      selectedFile,
      user.id,
      user.admin_id,
      user.id,
      'sfc',
      description
    )

    if (!result.error) {
      setSelectedFile(null)
      setDescription('')
      await loadDocuments()
      alert('Document uploaded successfully!')
    } else {
      alert(`Upload failed: ${result.error}`)
    }
    setLoading(false)
  }

  const handleDownloadDocument = async (filePath, fileName) => {
    try {
      const data = await sfcCommunicationService.downloadDocument(filePath)
      if (data && !data.error) {
        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download document')
    }
  }

  const handleDeleteDocument = async (docId, filePath) => {
    if (!window.confirm('Delete this document?')) return

    setLoading(true)
    const result = await sfcCommunicationService.deleteDocument(docId, filePath)
    if (!result.error) {
      await loadDocuments()
    }
    setLoading(false)
  }

  return (
    <div className="dashboard-card full-width">
      <div className="card-header">
        <h2>💬 Communications with Admin</h2>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount} unread</span>}
      </div>

      <div className="comm-tabs">
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents ({documents.length})
        </button>
      </div>

      <div className="card-body comm-body">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="messages-list">
              {!loading && messages.length === 0 && (
                <div className="empty-state">
                  <p>No messages yet. Start a conversation with your admin!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender_type === 'sfc' ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    <p className="message-text">{msg.message}</p>
                    <span className="message-time">{msg.created_at}</span>
                  </div>
                  {msg.sender_type === 'sfc' && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMessage(msg.id)}
                      title="Delete message"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <div className="form-group">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows="3"
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="documents-section">
            <form onSubmit={handleUploadDocument} className="upload-form">
              <div className="form-group">
                <label htmlFor="document">Choose File</label>
                <input
                  type="file"
                  id="document"
                  onChange={(e) => setSelectedFile(e.target.files?.[0])}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this document..."
                  rows="2"
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !selectedFile}>
                {loading ? 'Uploading...' : '📤 Upload Document'}
              </button>
            </form>

            <div className="documents-list">
              {documents.length === 0 ? (
                <div className="empty-state">
                  <p>No documents yet. Upload one to share with your admin.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="document-info">
                      <h4>📄 {doc.file_name}</h4>
                      <p>{doc.description}</p>
                      <span className="doc-meta">
                        {doc.file_size && <span>{(doc.file_size / 1024).toFixed(2)} KB</span>}
                        <span>{doc.created_at}</span>
                        <span>By {doc.uploaded_by_type}</span>
                      </span>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)}
                      >
                        📥 Download
                      </button>
                      <button 
                        className="btn btn-outline delete"
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
