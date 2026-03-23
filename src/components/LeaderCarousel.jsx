import React, { useState, useEffect } from 'react'

export default function LeaderCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const leaders = [
    {
      name: 'Sarah Johnson',
      role: 'SRC President',
      image: 'https://picsum.photos/400/500?random=30',
      quote: 'Student voices matter. Together, we can create real change on campus.'
    },
    {
      name: 'Marcus Williams',
      role: 'Vice President',
      image: 'https://picsum.photos/400/500?random=31',
      quote: 'Leadership is about listening first and acting with purpose.'
    },
    {
      name: 'Emily Chen',
      role: 'Student Rep',
      image: 'https://picsum.photos/400/500?random=32',
      quote: 'Your concerns are our mission. Let us know what matters to you.'
    },
    {
      name: 'James Okafor',
      role: 'Community Lead',
      image: 'https://picsum.photos/400/500?random=33',
      quote: 'Community is built on trust, transparency, and shared goals.'
    },
    {
      name: 'Lisa Martinez',
      role: 'Operations Lead',
      image: 'https://picsum.photos/400/500?random=34',
      quote: 'Efficient systems, effective support—that\'s how we serve you best.'
    }
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % leaders.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [autoPlay, leaders.length])

  const next = () => {
    setCurrentIndex((currentIndex + 1) % leaders.length)
    setAutoPlay(false) // Stop auto-play when user manually navigates
  }

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + leaders.length) % leaders.length)
    setAutoPlay(false) // Stop auto-play when user manually navigates
  }

  const current = leaders[currentIndex]

  return (
    <section className="leader-carousel">
      <div className="carousel-header">
        <h2>Meet Our SGLD Leaders</h2>
      </div>
      
      <div className="carousel-content">
        <button className="carousel-btn prev" onClick={prev} aria-label="Previous leader">‹</button>
        
        <div className="carousel-main">
          <div className="carousel-image">
            <img src={current.image} alt={current.name} />
          </div>

          <div className="carousel-text">
            <h3>{current.name}</h3>
            <p className="role">{current.role}</p>
            <blockquote>"{current.quote}"</blockquote>
          </div>
        </div>

        <button className="carousel-btn next" onClick={next} aria-label="Next leader">›</button>
      </div>

      <div className="carousel-indicators">
        {leaders.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentIndex(idx)
              setAutoPlay(false)
            }}
            aria-label={`Go to leader ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

