import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ContactModal from './ContactModal'
import StudentSignup from './StudentSignup'
import SRCAccessForm from './SRCAccessForm'
import SFCAccessForm from './SFCAccessForm'
import RoleLogin from './RoleLogin'

export default function Header({ onNavigate, currentPage }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [docDropdownOpen, setDocDropdownOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewDocName, setPreviewDocName] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // login, student-signup, src-signup
  const [contactModalOpen, setContactModalOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)
  const toggleDocDropdown = () => setDocDropdownOpen(!docDropdownOpen)
  const toggleAuthModal = () => setAuthModalOpen(!authModalOpen)
  const toggleContactModal = () => setContactModalOpen(!contactModalOpen)

  const documents = [
    { id: 1, name: 'SRC Constitution', path: '/pdfs/SRC Constitution 2025 2.pdf' },
    { id: 2, name: 'Document 2', path: '/pdfs/sample.pdf' },
    { id: 3, name: 'Document 3', path: '/pdfs/sample.pdf' }
  ]

  const handleDocumentDownload = (e, docPath, docName) => {
    e.preventDefault()
    const link = document.createElement('a')
    link.href = docPath
    link.download = `${docName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDocumentPreview = (e, docPath, docName) => {
    e.preventDefault()
    // Build an absolute URL and encode it to avoid issues with spaces
    const absoluteUrl = `${window.location.origin}${docPath}`
    setPreviewLoading(true)
    setPreviewDoc(encodeURI(absoluteUrl))
    setPreviewDocName(docName || '')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand-button" onClick={() => onNavigate('home')} aria-label="Go to homepage">
          <img src="/logo.png" alt="SGLD Logo" className="logo" />
          <div className="brand-text">
            <h1>Student Governance & Leadership Development</h1>
            <p className="muted">Building Leaders. Empowering Choices. Shaping the Future </p>
          </div>
        </button>
        <button 
          className="menu-toggle" 
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav 
          aria-label="Main navigation"
          className={`nav-menu ${menuOpen ? 'open' : ''}`}
        >
          <button 
            className="menu-close" 
            aria-label="Close menu"
            onClick={toggleMenu}
          >
            ✕
          </button>
          <ul className="nav">
            {!user && (
              <>
                <li><a href="#home" onClick={() => { onNavigate('home'); closeMenu(); }}>Home</a></li>
                <li><a href="#about" onClick={() => { onNavigate('about'); closeMenu(); }}>About</a></li>
                <li className="nav-dropdown">
                  <button 
                    className="nav-link-btn"
                    onClick={toggleDocDropdown}
                    aria-expanded={docDropdownOpen}
                  >
                    Documents
                  </button>
                  {docDropdownOpen && (
                    <>
                      <div className="dropdown-overlay" onClick={() => setDocDropdownOpen(false)}></div>
                      <div className="dropdown-menu">
                        <button className="dropdown-close" onClick={() => setDocDropdownOpen(false)}>✕</button>
                        {documents.map((doc) => (
                          <div key={doc.id} className="dropdown-item">
                            <span className="doc-name">{doc.name}</span>
                            <div className="doc-actions">
                              <button 
                                className="doc-btn preview"
                                onClick={(e) => handleDocumentPreview(e, doc.path, doc.name)}
                                title="Preview PDF"
                              >
                                👁 Preview
                              </button>
                              <button 
                                className="doc-btn download"
                                onClick={(e) => handleDocumentDownload(e, doc.path, doc.name)}
                                title="Download PDF"
                              >
                                ⬇ Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </li>
                <li><button className="nav-link-btn" onClick={() => { toggleContactModal(); closeMenu(); }}>Contact Us</button></li>
              </>
            )}
            {user ? (
              <li className="user-auth-section">
                <span className="user-greeting">{user.name} ({user.role})</span>
                <button className="btn btn-primary" onClick={() => { logout(); closeMenu(); }}>Logout</button>
              </li>
            ) : (
              <li>
                <button className="btn btn-primary" onClick={() => { toggleAuthModal(); closeMenu(); }}>Login</button>
              </li>
            )}
          </ul>
        </nav>

        {/* Auth Modal */}
        {authModalOpen && (
          <div className="modal-overlay" onClick={toggleAuthModal}>
            <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={toggleAuthModal}>✕</button>
              
              {authMode === 'login' && (
                <>
                  <RoleLogin 
                    onLoginSuccess={() => { toggleAuthModal(); closeMenu(); }}
                    onSwitchToSignup={() => { setAuthMode('signup-role'); }}
                  />
                </>
              )}
              
              {authMode === 'signup-role' && (
                <div className="signup-role-selection">
                  <h2>Create Account</h2>
                  <p className="auth-subtitle">Select the account type you want to create</p>
                  <div className="signup-options">
                    <button 
                      className="signup-option-btn"
                      onClick={() => setAuthMode('student-signup')}
                    >
                      <div className="signup-icon">👨‍🎓</div>
                      <h3>Student Account</h3>
                      <p>Report concerns, vote in polls, follow updates</p>
                    </button>
                    
                    <button 
                      className="signup-option-btn"
                      onClick={() => setAuthMode('src-signup')}
                    >
                      <div className="signup-icon">👥</div>
                      <h3>SRC Member</h3>
                      <p>Request access to SRC management portal</p>
                    </button>
                    
                    <button 
                      className="signup-option-btn"
                      onClick={() => setAuthMode('sfc-signup')}
                    >
                      <div className="signup-icon">💰</div>
                      <h3>SFC (Finance Coordinator)</h3>
                      <p>Manage campus financial operations</p>
                    </button>

                  </div>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setAuthMode('login')}
                    style={{ marginTop: '1.5rem', width: '100%' }}
                  >
                    Back to Login
                  </button>
                </div>
              )}
              
              {authMode === 'student-signup' && (
                <StudentSignup 
                  onSignupSuccess={() => { toggleAuthModal(); closeMenu(); }}
                  onSwitchToLogin={() => { setAuthMode('login'); }}
                />
              )}
              

              {authMode === 'src-signup' && (
                <SRCAccessForm 
                  onSignupSuccess={() => { toggleAuthModal(); closeMenu(); }}
                  onSwitchToLogin={() => { setAuthMode('login'); }}
                />
              )}
              
              {authMode === 'sfc-signup' && (
                <SFCAccessForm 
                  onSignupSuccess={() => { toggleAuthModal(); closeMenu(); }}
                  onSwitchToLogin={() => { setAuthMode('login'); }}
                />
              )}
            </div>
          </div>
        )}

        <ContactModal 
          isOpen={contactModalOpen} 
          onClose={() => setContactModalOpen(false)} 
        />

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="modal-overlay" onClick={() => { setPreviewDoc(null); setPreviewDocName(''); setPreviewLoading(false) }}>
            <div className="modal-content pdf-modal" style={{maxWidth: '1000px', width: '92%'}} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => { setPreviewDoc(null); setPreviewDocName(''); setPreviewLoading(false) }}>✕</button>
              <div className="pdf-modal-header">
                <div className="pdf-modal-title">{previewDocName}</div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <a href={decodeURI(previewDoc)} target="_blank" rel="noopener noreferrer" className="doc-btn download" title="Open in new tab">Open</a>
                  <a href={decodeURI(previewDoc)} download={`${previewDocName}.pdf`} className="doc-btn" style={{background:'#0f172a', color:'#fff', borderColor:'#0f172a'}} title="Download PDF">Download</a>
                </div>
              </div>
              <div className="pdf-modal-body">
                {previewLoading && (
                  <div className="pdf-spinner">
                    <div className="spinner" />
                    <div className="spinner-label">Loading document…</div>
                  </div>
                )}
                <div className="pdf-viewer" style={{height: '72vh'}}>
                  <iframe
                    title="Document Preview"
                    src={decodeURI(previewDoc)}
                    style={{width: '100%', height: '100%', border: 'none'}}
                    onLoad={() => setPreviewLoading(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
