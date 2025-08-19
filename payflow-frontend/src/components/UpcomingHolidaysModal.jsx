import React from 'react';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import './UpcomingHolidays.css';

const UpcomingHolidaysModal = ({ isOpen, onClose, holidays = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="announcement-modal-overlay">
      <div className="announcement-modal card-style" style={{ position: 'relative', minWidth: 400 }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#6366f1', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
          title="Close"
        >
          <FaTimes />
        </button>
        <div className="modal-header">
          <FaCalendarAlt className="modal-icon" />
          <h2>All Upcoming Holidays</h2>
        </div>
        <div className="announcement-list">
          {holidays.length === 0 ? (
            <div className="no-announcements">No upcoming holidays found.</div>
          ) : (
            <ul>
              {holidays.map((h, idx) => (
                <li key={idx} className="announcement-item">
                  <div className="announcement-message"><FaCalendarAlt /> {h.summary}</div>
                  <div className="announcement-meta">
                    <span>{new Date(h.start.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingHolidaysModal;
