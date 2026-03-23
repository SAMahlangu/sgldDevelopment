import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import About from './components/About'
import LeaderCarousel from './components/LeaderCarousel'
import RoleCard from './components/RoleCard'
import NewsCard from './components/NewsCard'
import EventCard from './components/EventCard'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import SRCDashboard from './components/SRCDashboard'

function AppContent() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')

  // Show dashboard based on user role
  if (user) {
    return (
      <div className="app">
        <Header onNavigate={setCurrentPage} currentPage={currentPage} />
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'src' && <SRCDashboard />}
      </div>
    )
  }

  // Show homepage if not logged in
  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />

      {currentPage === 'about' ? (
        <About />
      ) : (
        <main id="main">
        <section className="hero container" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <h2 id="hero-heading">Student Governance Hub</h2>
            <p className="lede">Streamline representative activities, raise student concerns, and manage campus governance in one accessible place.</p>
            <div className="cta-group">
              <a href="#how" className="btn btn-primary">Learn how it works</a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
          </div>
        </section>

        <section className="roles container" aria-labelledby="roles-heading">
          <h2 id="roles-heading">Who this is for</h2>
          <p className="muted">Whether you're a student, representative, or administrator — this system helps everyone participate in campus governance.</p>

          <div className="roles-grid">
            <RoleCard 
              title="Students" 
              desc="Report concerns, vote in polls, and follow case updates." 
              cta="Login as Student"
              hoverInfo="Report concerns, vote in polls, and follow case updates. Submit your ideas and stay informed about campus governance decisions that affect your student experience."
              image="https://picsum.photos/400/300?random=1"
            />
            <RoleCard 
              title="SRC Members" 
              desc="Organise meetings, respond to requests, and publish updates." 
              cta="Login as SRC"
              hoverInfo="Organise meetings, respond to requests, and publish updates. Lead student initiatives and coordinate with your peers to drive positive change on campus."
              image="https://picsum.photos/400/300?random=2"
            />
            <RoleCard 
              title="Representatives" 
              desc="Review constituency reports and coordinate solutions." 
              cta="Login as Representative"
              hoverInfo="Review constituency reports and coordinate solutions. Bridge the gap between students and administration to ensure concerns are heard and addressed effectively."
              image="https://picsum.photos/400/300?random=3"
            />
            <RoleCard 
              title="Administrators" 
              desc="Access reports, approve policies, and manage roles." 
              cta="Login as Admin"
              hoverInfo="Access reports, approve policies, and manage roles. Oversee governance processes and ensure transparency in all campus decision-making."
              image="https://picsum.photos/400/300?random=4"
            />
          </div>
        </section>

        <section id="how" className="how container" aria-labelledby="how-heading">
          <h2 id="how-heading">How it works</h2>
          <ol>
            <li>Sign in to your account.</li>
            <li>Submit or manage a concern, meeting, or poll.</li>
            <li>Track progress and see outcomes.</li>
          </ol>
        </section>

        <section className="news-events container" aria-labelledby="news-heading">
          <div className="news-events-wrapper">
            <div className="news-section">
              <div className="section-header">
                <h2 id="news-heading">Latest News</h2>
                <a href="#all-news" className="view-all">All News</a>
              </div>
              <div className="news-grid">
                <NewsCard 
                  title="New Student Leadership Council Elected for 2026"
                  description="TUT community votes in fresh student governance representatives committed to addressing campus concerns and improving student life through transparent decision-making processes."
                  date="8 February 2026"
                  image="https://picsum.photos/400/250?random=10"
                />
                <NewsCard 
                  title="Student Governance Forum Launches Mental Health Initiative"
                  description="SGLD introduces comprehensive mental health support program in collaboration with student services, featuring peer support groups and awareness campaigns across all faculties."
                  date="6 February 2026"
                  image="https://picsum.photos/400/250?random=11"
                />
                <NewsCard 
                  title="Campus Sustainability Project Gains Student Support"
                  description="Student governance representatives champion green initiatives, with plans to reduce campus carbon footprint and implement recycling programs through collaborative leadership."
                  date="4 February 2026"
                  image="https://picsum.photos/400/250?random=12"
                />
              </div>
            </div>

            <div className="events-section">
              <div className="section-header">
                <h2>Latest Events</h2>
                <a href="#all-events" className="view-all">All Events</a>
              </div>
              <div className="events-list">
                <EventCard 
                  dateNum="12"
                  month="Feb"
                  title="Student Leadership Development Workshop"
                  location="Main Campus Auditorium"
                  time="14:00"
                />
                <EventCard 
                  dateNum="13"
                  month="Feb"
                  title="SGLD General Assembly Meeting"
                  location="Student Centre, Room 201"
                  time="11:30"
                />
                <EventCard 
                  dateNum="15"
                  month="Feb"
                  title="Governance & Advocacy Training Session"
                  location="Hybrid Event"
                  time="10:00"
                />
              </div>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div className="footer-content">
            <div className="footer-sections">
              <div className="footer-section">
                <h3>Contact</h3>
                <p>+27 (0)86 110 2421</p>
                <p>general@tut.ac.za</p>
                
                <h4>Ethics Hotline</h4>
                <p><strong>Toll-Free Number:</strong><br/>0800 006 924</p>
              <p><strong>Email:</strong><br/>reportit@ethicshelpdesk.com</p>
              
              <p><a href="#additional">Additional Info</a></p>
            </div>

            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="quicklinks">
                <li><a href="#student-portal">Student Portal</a></li>
                <li><a href="#academic-calendar">Academic Core Calendar</a></li>
                
              </ul>
            </div>

            <div className="footer-section">
              <h3>About SGLD</h3>
              <ul className="quicklinks">
                <li><a href="#annual-reports">Annual Reports</a></li>
                
                <li><a href="#vacancies">Vacancies</a></li>
                
              </ul>
              
              <h4>Campus Radio Stations</h4>
              <ul className="quicklinks">
                <li><a href="#tutfm">TUTFM 96.2</a></li>
                <li><a href="#tshwane-fm">Tshwane FM</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#facebook" aria-label="Facebook" title="Facebook">f</a>
                <a href="#instagram" aria-label="Instagram" title="Instagram">📷</a>
                <a href="#twitter" aria-label="Twitter" title="Twitter">𝕏</a>
                <a href="#youtube" aria-label="YouTube" title="YouTube">▶</a>
                <a href="#tiktok" aria-label="TikTok" title="TikTok">♪</a>
              </div>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#privacy">Privacy Policy & POPIA</a>
              <span>|</span>
              <a href="#disclaimer">Disclaimer & Terms and Conditions</a>
            </div>
          </div>
        </div>
      </footer>
        </main>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
