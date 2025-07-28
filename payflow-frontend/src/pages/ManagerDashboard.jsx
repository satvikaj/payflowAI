import React, { useEffect, useState } from 'react';

import SidebarManager from '../components/SidebarManager';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import './ManagerDashboard.css';
import axios from '../utils/axios';

function ManagerDashboard() {
    // Use managerId from localStorage (set after login)
    const managerId = localStorage.getItem('managerId');
    const [team, setTeam] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [reminder, setReminder] = useState("");
    const [reminders, setReminders] = useState([]);
    const navigate = useNavigate();

    // Dummy notifications for demo
    const notifications = [
        { id: 1, message: 'Leave request from John Doe', date: '2025-07-24' },
        { id: 2, message: 'Project deadline approaching: Project X', date: '2025-07-25' },
        { id: 3, message: 'New team member onboarded: Jane Smith', date: '2025-07-23' },
    ];

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [teamRes, leavesRes, projectsRes] = await Promise.all([
                    axios.get(`/manager/${managerId}/team`),
                    axios.get(`/manager/${managerId}/leaves`),
                    axios.get(`/manager/${managerId}/projects`)
                ]);
                setTeam(teamRes.data);
                setLeaves(leavesRes.data);
                setProjects(projectsRes.data);
            } catch (err) {
                console.error("Error fetching manager data", err);
            }
            setLoading(false);
        }
        fetchData();
    }, [managerId]);

    const handleReminderAdd = (e) => {
        e.preventDefault();
        if (reminder.trim()) {
            setReminders([...reminders, { text: reminder, date: new Date().toLocaleString() }]);
            setReminder("");
        }
    };

    // Employees on leave today
    const today = new Date().toISOString().slice(0, 10);
    const employeesOnLeave = leaves.filter(l => l.fromDate <= today && l.toDate >= today);

    return (
        <div className="manager-dashboard-layout">
            <SidebarManager />
            <main className="manager-dashboard-main">
                <div className="manager-dashboard-header">
                    <h1>Manager Dashboard</h1>
                    <div className="manager-dashboard-bell-wrapper">
                        <div
                            className="manager-dashboard-bell"
                            onMouseEnter={() => setShowNotif(true)}
                            onMouseLeave={() => setShowNotif(false)}
                            onClick={() => navigate('/manager-notifications')}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <FaBell size={26} />
                            {notifications.length > 0 && (
                                <span className="manager-dashboard-bell-count">{notifications.length}</span>
                            )}
                            {showNotif && (
                                <div className="manager-dashboard-notif-list">
                                    <ul>
                                        {notifications.map(n => (
                                            <li key={n.id}>{n.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p>Welcome to the manager dashboard. Here you can view your project overview, team, notifications, reminders, and employees on leave.</p>
                <button className="quick-link-btn" style={{marginBottom:16}} onClick={() => navigate(`/manager/${managerId}/leaves`)}>
                    View All Leave Requests
                </button>
                {loading ? <div>Loading...</div> : (
                    <>
                        {/* Project Overview Card */}
                        <div className="manager-dashboard-cards-row">
                            <div className="manager-dashboard-card">
                                <h3>Projects Overview</h3>
                                <div className="manager-dashboard-card-value">{projects.length}</div>
                                <div className="manager-dashboard-card-label">Active Projects</div>
                            </div>
                            <div className="manager-dashboard-card">
                                <h3>Team Members</h3>
                                <div className="manager-dashboard-card-value">{team.length}</div>
                                <div className="manager-dashboard-card-label">Total Team</div>
                            </div>
                            <div className="manager-dashboard-card">
                                <h3>Employees on Leave</h3>
                                <div className="manager-dashboard-card-value">{employeesOnLeave.length}</div>
                                <div className="manager-dashboard-card-label">On Leave Today</div>
                            </div>
                            <div className="manager-dashboard-card">
                                <h3>Reminders</h3>
                                <form onSubmit={handleReminderAdd} className="manager-dashboard-reminder-form">
                                    <input
                                        type="text"
                                        value={reminder}
                                        onChange={e => setReminder(e.target.value)}
                                        placeholder="Set a reminder..."
                                        className="manager-dashboard-reminder-input"
                                    />
                                    <button type="submit" className="manager-dashboard-reminder-btn">Add</button>
                                </form>
                                <ul className="manager-dashboard-reminder-list">
                                    {reminders.map((r, idx) => (
                                        <li key={idx}>{r.text} <span className="manager-dashboard-reminder-date">({r.date})</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Employees on Leave Cards */}
                        {employeesOnLeave.length > 0 && (
                            <div className="manager-dashboard-leave-cards-row">
                                {employeesOnLeave.map(lv => {
                                    const emp = team.find(e => e.id === lv.employeeId);
                                    return (
                                        <div className="manager-dashboard-leave-card" key={lv.id}>
                                            <div className="manager-dashboard-leave-card-title">{emp ? emp.fullName : 'Employee #' + lv.employeeId}</div>
                                            <div className="manager-dashboard-leave-card-type">{lv.type}</div>
                                            <div className="manager-dashboard-leave-card-dates">{lv.fromDate} to {lv.toDate}</div>
                                            <div className="manager-dashboard-leave-card-status">Status: {lv.status}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default ManagerDashboard;