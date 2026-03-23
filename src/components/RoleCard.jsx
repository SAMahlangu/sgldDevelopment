import React, { useState } from 'react'

export default function RoleCard({ title, desc, cta, hoverInfo, image }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="role-card-flip-container"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`role-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front side */}
        <div className="role-card-front">
          {image && <img src={image} alt={title} className="role-card-image" />}
          <div className="role-card-overlay">
            <h3>{title}</h3>
          </div>
        </div>

        {/* Back side */}
        <div className="role-card-back">
          <div className="role-card-back-content">
            <h3>{title}</h3>
            <p>{hoverInfo}</p>
            <button className="btn btn-outline" aria-label={`Login as ${title}`}>{cta}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

