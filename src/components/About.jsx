import React, { useState } from 'react'
import ContactModal from './ContactModal'

export default function About() {
  const [contactModalOpen, setContactModalOpen] = useState(false)
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1>About SGLD</h1>
          <p className="about-subtitle">Student Governance & Leadership Development</p>
        </section>

        {/* Mission Section */}
        <section className="about-section">
          <div className="about-content">
            <div className="about-text-section">
              <div className="about-text">
                <h2>Our Mission</h2>
                <p>
                  The Student Governance & Leadership Development (SGLD) platform is dedicated to empowering TUT (Tshwane University of Technology) students by providing a transparent, inclusive, and engaging space for student governance and leadership opportunities.
                </p>
                <p>
                  We believe in building leaders who are equipped to make informed decisions, advocate for student rights, and contribute meaningfully to our university community.
                </p>
              </div>
            </div>
            <div className="about-image">
              <img src="https://picsum.photos/500/400?random=20" alt="Student leadership and collaboration" className="section-image" />
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="about-section">
          <h2>What We Do</h2>
          <div className="features-grid">
            <div className="feature-card">
              <img src="https://picsum.photos/300/200?random=21" alt="Student representation" className="feature-image" />
              <div className="feature-icon">📋</div>
              <h3>Student Representation</h3>
              <p>Provide students with a voice in university decision-making through elected representatives who advocate for student interests and concerns.</p>
            </div>

            <div className="feature-card">
              <img src="https://picsum.photos/300/200?random=22" alt="Democratic voting" className="feature-image" />
              <div className="feature-icon">🗳️</div>
              <h3>Democratic Processes</h3>
              <p>Conduct transparent elections, polls, and voting initiatives that allow students to participate in governance decisions that affect their campus life.</p>
            </div>

            <div className="feature-card">
              <img src="https://picsum.photos/300/200?random=23" alt="Leadership training" className="feature-image" />
              <div className="feature-icon">🎯</div>
              <h3>Leadership Development</h3>
              <p>Equip students with essential leadership skills through training programs, mentorship, and hands-on experience in governance roles.</p>
            </div>

            <div className="feature-card">
              <img src="https://picsum.photos/300/200?random=24" alt="Communication hub" className="feature-image" />
              <div className="feature-icon">📢</div>
              <h3>Communication Hub</h3>
              <p>Keep students informed about campus events, policy changes, and important announcements through a centralized communication platform.</p>
            </div>

            <div className="feature-card">
              <img src="https://picsum.photos/300/200?random=25" alt="Student feedback" className="feature-image" />
              <div className="feature-icon">💬</div>
              <h3>Feedback & Concerns</h3>
              <p>Provide a safe channel for students to report concerns, suggestions, and feedback directly to student leadership and administration.</p>
            </div>

            <div className="feature-card">
              <img src="https://picsum.photos/300/200?random=26" alt="Community engagement" className="feature-image" />
              <div className="feature-icon">🤝</div>
              <h3>Community Engagement</h3>
              <p>Foster a vibrant student community through organized events, initiatives, and collaborative projects that strengthen campus connections.</p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="about-section values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Transparency</h3>
              <p>All processes, decisions, and communications are open and accessible to the student body. We believe in honest and clear governance.</p>
            </div>

            <div className="value-item">
              <h3>Inclusivity</h3>
              <p>Every student's voice matters. We work to ensure all students, regardless of background or affiliation, can participate and contribute.</p>
            </div>

            <div className="value-item">
              <h3>Accountability</h3>
              <p>Student leaders are responsible to the student body. We maintain high standards of conduct and respond to the needs of those we serve.</p>
            </div>

            <div className="value-item">
              <h3>Excellence</h3>
              <p>We strive for excellence in everything we do—from event organization to advocacy to leadership development programs.</p>
            </div>
          </div>
        </section>

        {/* Getting Involved Section */}
        <section className="about-section involved-section">
          <h2>Get Involved</h2>
          <div className="involved-content">
            <div className="involved-card">
              <h3>📝 Vote & Participate</h3>
              <p>Engage in student elections and governance polls. Your vote shapes the future of our student leadership and campus policies.</p>
            </div>

            <div className="involved-card">
              <h3>🎓 Apply for Leadership</h3>
              <p>Consider running for SRC positions or joining student committees. We're always looking for passionate leaders to join our team.</p>
            </div>

            <div className="involved-card">
              <h3>💡 Share Your Ideas</h3>
              <p>Have a suggestion or concern? Use our feedback system to connect with student leadership. Your input drives positive change.</p>
            </div>

            <div className="involved-card">
              <h3>📚 Attend Events</h3>
              <p>Join us at our events, training programs, and community initiatives. These are great opportunities to learn, network, and grow.</p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="about-cta">
          <h2>Questions or Suggestions?</h2>
          <p>We'd love to hear from you! Whether you have questions about SGLD or suggestions for improvement, don't hesitate to reach out.</p>
          <button className="btn btn-primary" onClick={() => setContactModalOpen(true)}>Contact Us</button>
        </section>

        <ContactModal 
          isOpen={contactModalOpen} 
          onClose={() => setContactModalOpen(false)} 
        />
      </div>
    </div>
  )
}
