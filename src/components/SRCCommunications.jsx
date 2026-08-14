import React, { useState, useEffect } from 'react'
import { communicationService } from '../services/apiService'

export default function SRCCommunications({ user }) {
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
    const data = await communicationService.getConversation(user.id, user.admin_id)
    if (data && !data.error) {
      setMessages(data)
    }
    setLoading(false)
  }

  const loadDocuments = async () => {
    const data = await communicationService.getDocumentsForSRC(user.id, user.admin_id)
    if (data && !data.error) {
      setDocuments(data)
    }
  }

  const checkUnread = async () => {
    const count = await communicationService.getSRCUnreadCount(user.id)
    setUnreadCount(count)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    const result = await communicationService.sendMessage(
      user.id,
      user.admin_id,
      user.id,
      'src',
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
    const result = await communicationService.deleteMessage(messageId)
    if (!result.error) {
      await loadConversation()
    }
    setLoading(false)
  }

  const handleUploadDocument = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    const result = await communicationService.uploadDocument(
      selectedFile,
      user.id,
      user.admin_id,
      user.id,
      'src',
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
      await loadDocuments()
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('messages')}
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
          onClick={() => setActiveTab('documents')}
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
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div>
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
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '1rem',
                    textAlign: msg.sender_type === 'src' ? 'right' : 'left',
                    display: 'flex',
                    justifyContent: msg.sender_type === 'src' ? 'flex-end' : 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: msg.sender_type === 'src' ? '#C41E3A' : '#e5e7eb',
                      color: msg.sender_type === 'src' ? '#fff' : '#000',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      maxWidth: '60%',
                      wordWrap: 'break-word'
                    }}
                  >
                    <strong style={{ fontSize: '0.8rem' }}>
                      {msg.sender_type === 'src' ? 'You' : 'Admin'}
                    </strong>
                    <p style={{ margin: '0.5rem 0 0' }}>{msg.message}</p>
                    <small style={{ opacity: '0.7' }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </small>
                  </div>
                  {msg.sender_type === 'src' && (
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
              placeholder="Type your message here..."
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
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ marginTop: 0 }}>Upload Document</h3>
            <form onSubmit={handleUploadDocument}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Select File (Any Type)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the document..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    minHeight: '60px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#C41E3A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  opacity: loading || !selectedFile ? '0.5' : '1'
                }}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>Documents</h3>
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
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
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
        </div>
      )}
    </div>
  )
}
