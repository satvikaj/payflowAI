import React from 'react';
import './NotificationsPage.css';

function NotificationsPage() {
    // Dummy notifications for demo
    const notifications = [
        { id: 1, message: 'Leave request from John Doe', date: '2025-07-24' },
        { id: 2, message: 'Project deadline approaching: Project X', date: '2025-07-25' },
        { id: 3, message: 'New team member onboarded: Jane Smith', date: '2025-07-23' },
    ];

    return (
        <div className="notifications-page-container">
            <h2>All Notifications</h2>
            <ul className="notifications-list">
                {notifications.map(n => (
                    <li key={n.id} className="notification-item">
                        <span className="notification-message">{n.message}</span>
                        <span className="notification-date">{n.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NotificationsPage;
