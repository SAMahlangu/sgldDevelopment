import React from 'react'

export default function EventCard({ date, dateNum, month, title, location, time }) {
  return (
    <div className="event-card">
      <div className="event-date-box">
        <div className="event-date-num">{dateNum}</div>
        <div className="event-date-month">{month}</div>
      </div>
      <div className="event-content">
        <h4>{title}</h4>
        {location && (
          <div className="event-detail">
            <span className="event-icon">📍</span>
            <span>{location}</span>
          </div>
        )}
        {time && (
          <div className="event-detail">
            <span className="event-icon">🕐</span>
            <span>{time}</span>
          </div>
        )}
      </div>
    </div>
  )
}
