import React from 'react'

export default function NewsCard({ title, description, date, image }) {
  return (
    <div className="news-card">
      {image && <img src={image} alt={title} className="news-image" />}
      <div className="news-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="news-date">{date}</span>
      </div>
    </div>
  )
}
