import React, { useState, useEffect } from 'react'
import { communicationService, adminService } from '../services/apiService'

export default function AdminCommunications({ user }) {
  const [srcs, setSrcs] = useState([])
  const [selectedSRC, setSelectedSRC] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('select')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadSRCs()
    checkUnread()
  }, [user])

  const loadSRCs = async () => {
    const data = await adminService.getAdminSRCs(user.id)
    if (data && !data.error) {
      setSrcs(data)
    }
  }

  const checkUnread = async () => {
    const count = await communicationService.getAdminUnreadCount(user.id)
    setUnreadCount(count)
  }

  const loadConversation = async (src) => {
    setSelectedSRC(src)
    setActiveTab('messages')
    setLoading(true)
    const data = await communicationService.getConversation(src.id, user.id)
    if (data && !data.error) {
      setMessages(data)
    }
    setLoading(false)
  }

  const loadDocuments = async (src) => {
    const data = await communicationService.getDocumentsForAdmin(user.id)
    if (data && !data.error) {
      setDocuments(data.filter(d => d.src_id === src.id))
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedSRC) return

    setLoading(true)
    const result = await communicationService.sendMessage(
      selectedSRC.id,
      user.id,
      user.id,
      'admin',
      newMessage
    )

    if (!result.error) {
      setNewMessage('')
      await loadConversation(selectedSRC)
    }
    setLoading(false)
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    
    setLoading(true)
    const result = await communicationService.deleteMessage(messageId)
    if (!result.error) {
      await loadConversation(selectedSRC)
    }
    setLoading(false)
  }

  const handleDownloadDocument = async (filePath, fileName) => {
    try {
      const data = await communicationService.downloadDocument(filePath)
      if (data && !data.error) {
        const url = URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
      }
    } catch (error) {
      alert('Download failed: ' + error.message)
    }
  }

  const handleDeleteDocument = async (docId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    setLoading(true)
    const result = await communicationService.deleteDocument(docId, filePath)
    if (!result.error) {
      if (selectedSRC) await loadDocuments(selectedSRC)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Tab Navigation */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('select')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'select' ? '#C41E3A' : '#e5e7eb',
            color: activeTab === 'select' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          👥 SRCs ({srcs.length})
        </button>
        {selectedSRC && (
          <>
            <button
              onClick={async () => {
                setActiveTab('messages')
                await loadConversation(selectedSRC)
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'messages' ? '#C41E3A' : '#e5e7eb',
                color: activeTab === 'messages' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📧 Messages
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={async () => {
                setActiveTab('documents')
                await loadDocuments(selectedSRC)
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'documents' ? '#C41E3A' : '#e5e7eb',
                color: activeTab === 'documents' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📄 Documents
            </button>
          </>
        )}
      </div>

      {/* Select SRC Tab */}
      {activeTab === 'select' && (
        <div>
          <h3>Select SRC to Communicate</h3>
          {srcs.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No SRCs assigned to you yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {srcs.map((src) => (
                <div
                  key={src.id}
                  onClick={() => loadConversation(src)}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    hover: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.5rem' }}>{src.name}</h4>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                    📧 {src.email}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                    📍 {src.campus}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    backgroundColor: src.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: src.status === 'active' ? '#166534' : '#991b1b',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && selectedSRC && (
        <div>
          <h3 style={{ marginTop: 0 }}>Chat with {selectedSRC.name}</h3>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            height: '400px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb'
          }}>
            {messages.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '3rem' }}>
                No messages yet. Start by responding when the SRC sends a message!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '1rem',
                    textAlign: msg.sender_type === 'admin' ? 'right' : 'left',
                    display: 'flex',
                    justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: msg.sender_type === 'admin' ? '#C41E3A' : '#e5e7eb',
                      color: msg.sender_type === 'admin' ? '#fff' : '#000',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      maxWidth: '60%',
                      wordWrap: 'break-word'
                    }}
                  >
                    <strong style={{ fontSize: '0.8rem' }}>
                      {msg.sender_type === 'admin' ? 'You' : selectedSRC.name}
                    </strong>
                    <p style={{ margin: '0.5rem 0 0' }}>{msg.message}</p>
                    <small style={{ opacity: '0.7' }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </small>
                  </div>
                  {msg.sender_type === 'admin' && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        height: 'fit-content'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your response..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#C41E3A',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: loading ? '0.5' : '1'
              }}
            >
              {loading ? 'Sending...' : 'Reply'}
            </button>
          </form>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && selectedSRC && (
        <div>
          <h3 style={{ marginTop: 0 }}>Documents from {selectedSRC.name}</h3>
          {documents.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No documents uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem' }}>📄 {doc.file_name}</h4>
                    <small style={{ color: '#6b7280' }}>
                      {doc.description && <p style={{ margin: '0.25rem 0' }}>{doc.description}</p>}
                      <p style={{ margin: '0.25rem 0' }}>
                        Size: {(doc.file_size / 1024).toFixed(2)} KB • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
