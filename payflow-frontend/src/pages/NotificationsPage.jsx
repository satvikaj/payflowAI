import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ManagerSidebar from '../components/SidebarManager';
import './NotificationsPage.css';

export default function NotificationsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const notifications = location.state?.notifications || [];

    return (
        <div className="notifications-page-container">
            <ManagerSidebar />

            <div className="notifications-content">
                <h2 className="page-title">All Notifications</h2>

                {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications found.</p>
                ) : (
                    <ul className="notifications-list">
                        {notifications.map((n) => (
                            <li key={n.id} className={`notification-card priority-${n.priority}`}>
                                <strong>{n.message}</strong>
                                <div className="notification-meta">
                                    {n.date} | Priority: {n.priority}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <button className="back-btn" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        </div>
    );
}
