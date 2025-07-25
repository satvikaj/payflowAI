import React, { useEffect, useState } from 'react';
import PopupMessage from '../components/PopupMessage';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SidebarAdmin';
import './AdminDashboard.css';
import { FaEdit, FaBell, FaUserPlus, FaFileExport, FaBullhorn } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [employeeCount, setEmployeeCount] = useState(0);

    // Fetch users on component mount
    const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        // Fetch users
        axios.get('http://localhost:8080/api/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error('Failed to fetch users', err));

        // Fetch employee count from backend
        axios.get('http://localhost:8080/api/employee/count')
            .then(res => setEmployeeCount(res.data))
            .catch(err => console.error('Failed to fetch employee count', err));
    }, []);



    const handleDisableUser = async (username) => {
        const confirm = window.confirm("Are you sure you want to disable this user?");
        if (!confirm) return;

        try {
            const res = await axios.put(`http://localhost:8080/api/admin/disable-user`, {
                username: username,
            });

            setPopup({ show: true, title: 'User Disabled', message: res.data.message || 'User has been disabled.', type: 'success' });

            // Refresh user list
            const updatedUsers = await axios.get('http://localhost:8080/api/admin/users');
            setUsers(updatedUsers.data);
        } catch (err) {
            setPopup({ show: true, title: 'Failed', message: 'Failed to disable user', type: 'error' });
            console.error(err);
        }
    };

    // Pagination for Employee Overview
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const totalPages = Math.ceil(users.length / rowsPerPage);
    const paginatedUsers = users.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // For summary cards
    const hrUsers = users.filter(user => user.role?.toUpperCase() === 'HR');
    const managerUsers = users.filter(user => user.role?.toUpperCase() === 'MANAGER');
    const employeeUsers = users.filter(user => user.role?.toUpperCase() === 'EMPLOYEE');
    const activeHRs = hrUsers.filter(user => user.active).length;
    const inactiveHRs = hrUsers.filter(user => !user.active).length;
    const activeManagers = managerUsers.filter(user => user.active).length;
    const inactiveManagers = managerUsers.filter(user => !user.active).length;

    // Pie chart data for role distribution
    const rolePieData = [
        { name: 'HR', value: hrUsers.length },
        { name: 'Manager', value: managerUsers.length },
        { name: 'Employee', value: employeeUsers.length },
    ];
    const pieColors = ['#8884d8', '#82ca9d', '#ffc658'];

    // Bar chart data for employees joined per month (dummy data for now)
    const barData = [
        { month: 'Jan', employees: 2 },
        { month: 'Feb', employees: 3 },
        { month: 'Mar', employees: 5 },
        { month: 'Apr', employees: 4 },
        { month: 'May', employees: 6 },
        { month: 'Jun', employees: 3 },
    ];

    // Sample recent activity feed (replace with real data if available)
    const recentActivity = [
        'John Doe onboarded as Employee',
        'Manager Jane approved leave for Alice',
        'HR Smith disabled user Bob',
        'Employee Alice updated profile',
    ];

    // Sample notifications (replace with real data if available)
    const notifications = [
        '2 pending approvals',
        'System maintenance scheduled for Sunday',
        'New policy update available',
    ];

    return (
        <div className="admin-dashboard-layout" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', color: '#222' }}>
            {popup.show && (
                <PopupMessage title={popup.title} message={popup.message} type={popup.type} onClose={() => setPopup({ ...popup, show: false })} />
            )}
            <Sidebar />
            <main className="admin-dashboard-main" style={{ padding: '32px 36px 36px 36px', maxWidth: 1400, margin: '0 auto' }}>
                {/* Header with Notifications Bell */}
                <div className="admin-dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1.5px solid #e5e7eb', paddingBottom: 18 }}>
                    <h1>Admin Dashboard</h1>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        {/* Quick Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginRight: 24 }}>
                                    <button className="quick-action-btn add-user-btn" title="Add User" onClick={() => navigate('/create-user')}>
                                        <FaUserPlus style={{ marginRight: 6 }} /> Add User
                                    </button>
                                    <button className="quick-action-btn export-btn" title="Export Data" onClick={() => alert('Exporting data...')}>
                                        <FaFileExport style={{ marginRight: 6 }} /> Export
                                    </button>
                                    <button className="quick-action-btn announce-btn" title="Send Announcement" onClick={() => alert('Announcement sent!')}>
                                        <FaBullhorn style={{ marginRight: 6 }} /> Announce
                                    </button>
                                </div>
                        {/* Notifications Bell - always at far right */}
                        <div className="notification-bell-wrapper" style={{ position: 'relative' }}>
                            <div className="notification-bell" tabIndex={0} style={{ position: 'relative', cursor: 'pointer', marginLeft: 24 }}>
                                <FaBell size={24} />
                                {notifications.length > 0 && (
                                    <span className="notification-badge" style={{
                                        position: 'absolute',
                                        top: -6,
                                        right: -6,
                                        background: '#e74c3c',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        fontSize: 12,
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        zIndex: 2
                                    }}>{notifications.length}</span>
                                )}
                                <div className="notifications-dropdown" style={{
                                    display: 'none',
                                    position: 'absolute',
                                    top: 32,
                                    right: 0,
                                    minWidth: 220,
                                    background: '#fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    borderRadius: 8,
                                    zIndex: 10,
                                    padding: 8
                                }}>
                                    {notifications.length === 0 ? (
                                        <div className="notification-item">No new notifications</div>
                                    ) : (
                                        notifications.map((note, idx) => (
                                            <div className="notification-item" key={idx}>{note}</div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
                .quick-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 10px 22px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.08rem;
                    font-weight: 600;
                    background: #f4f4f4;
                    color: #333;
                    cursor: pointer;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                    transition: background 0.25s, color 0.2s, box-shadow 0.2s, transform 0.18s;
                }
                .quick-action-btn:hover {
                    background: #e0e7ff;
                    color: #1e40af;
                    box-shadow: 0 4px 16px rgba(30,64,175,0.10);
                    transform: translateY(-2px) scale(1.04);
                }
                .add-user-btn {
                    background: linear-gradient(90deg, #e0f7fa 60%, #b2ebf2 100%);
                    color: #00796b;
                }
                .add-user-btn:hover {
                    background: linear-gradient(90deg, #b2ebf2 60%, #e0f7fa 100%);
                    color: #004d40;
                }
                .export-btn {
                    background: linear-gradient(90deg, #fff3e0 60%, #ffe0b2 100%);
                    color: #ef6c00;
                }
                .export-btn:hover {
                    background: linear-gradient(90deg, #ffe0b2 60%, #fff3e0 100%);
                    color: #e65100;
                }
                .announce-btn {
                    background: linear-gradient(90deg, #fce4ec 60%, #f8bbd0 100%);
                    color: #ad1457;
                }
                .announce-btn:hover {
                    background: linear-gradient(90deg, #f8bbd0 60%, #fce4ec 100%);
                    color: #880e4f;
                }
                .admin-card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 28px;
                    margin: 36px 0 32px 0;
                }
                .admin-card {
                    background: #fff;
                    border-radius: 14px;
                    box-shadow: 0 4px 24px rgba(30,64,175,0.07), 0 1.5px 6px rgba(0,0,0,0.04);
                    padding: 28px 24px 22px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    transition: box-shadow 0.2s, transform 0.18s;
                }
                .admin-card:hover {
                    box-shadow: 0 8px 32px rgba(30,64,175,0.13), 0 2px 8px rgba(0,0,0,0.06);
                    transform: translateY(-2px) scale(1.02);
                }
                .highlight-card {
                    border-left: 6px solid #6366f1;
                }
                .info-card {
                    border-left: 6px solid #06b6d4;
                }
                .admin-section-title {
                    font-size: 1.12rem;
                    font-weight: 700;
                    color: #6366f1;
                    margin-bottom: 8px;
                }
                .admin-count {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #22223b;
                    margin-bottom: 8px;
                }
                .stats {
                    font-size: 1rem;
                    color: #64748b;
                    display: flex;
                    gap: 18px;
                }
                .dashboard-charts-row {
                    display: flex;
                    gap: 32px;
                    margin-bottom: 36px;
                    flex-wrap: wrap;
                }
                .dashboard-chart-card {
                    background: #fff;
                    border-radius: 14px;
                    box-shadow: 0 4px 24px rgba(30,64,175,0.07), 0 1.5px 6px rgba(0,0,0,0.04);
                    padding: 24px 18px 18px 18px;
                    flex: 1 1 340px;
                    min-width: 320px;
                    max-width: 480px;
                    margin-bottom: 12px;
                }
                .dashboard-activity-feed {
                    background: #fff;
                    border-radius: 14px;
                    box-shadow: 0 4px 24px rgba(30,64,175,0.07), 0 1.5px 6px rgba(0,0,0,0.04);
                    padding: 24px 18px 18px 18px;
                    margin-top: 18px;
                }
                .activity-list {
                    margin: 0;
                    padding: 0 0 0 18px;
                    font-size: 1.04rem;
                }
                .activity-list li {
                    margin-bottom: 8px;
                }
                .notification-bell-wrapper {
                    position: relative;
                }
                .notification-bell:hover .notifications-dropdown,
                .notification-bell:focus .notifications-dropdown {
                    display: block !important;
                }
                .notifications-dropdown {
                    display: none;
                    position: absolute;
                    top: 32px;
                    right: 0;
                    min-width: 240px;
                    background: #fff;
                    box-shadow: 0 4px 24px rgba(30,64,175,0.13), 0 2px 8px rgba(0,0,0,0.06);
                    border-radius: 12px;
                    z-index: 10;
                    padding: 12px 8px 8px 8px;
                    font-size: 1rem;
                }
                .notification-item {
                    padding: 8px 10px;
                    border-radius: 6px;
                    margin-bottom: 4px;
                    transition: background 0.18s;
                }
                .notification-item:hover {
                    background: #e0e7ff;
                }
                .notification-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #e74c3c;
                    color: #fff;
                    border-radius: 50%;
                    font-size: 12px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    z-index: 2;
                }
                `}</style>

                {/* Summary Cards */}
                <div className="admin-card-grid">
                    <div className="admin-card highlight-card">
                        <h2 className="admin-section-title">TOTAL HRs</h2>
                        <div className="admin-count">{hrUsers.length}</div>
                        <div className="stats">
                            <span>Active: {activeHRs}</span>
                            <span>Inactive: {inactiveHRs}</span>
                        </div>
                    </div>
                    <div className="admin-card highlight-card">
                        <h2 className="admin-section-title">TOTAL MANAGERS</h2>
                        <div className="admin-count">{managerUsers.length}</div>
                        <div className="stats">
                            <span>Active: {activeManagers}</span>
                            <span>Inactive: {inactiveManagers}</span>
                        </div>
                    </div>
                    <div className="admin-card highlight-card">
                        <h2 className="admin-section-title">TOTAL EMPLOYEES</h2>
                        <div className="admin-count">{employeeCount}</div>
                        <div className="stats">
                            <span>Active: {employeeUsers.filter(u => u.active).length}</span>
                            <span>Inactive: {employeeUsers.filter(u => !u.active).length}</span>
                        </div>
                    </div>
                    <div className="admin-card info-card">
                        <h2 className="admin-section-title">Pending Onboardings</h2>
                        <div className="admin-count">3</div>
                        <div className="stats">
                            <span>Last: 2 days ago</span>
                        </div>
                    </div>
                    <div className="admin-card info-card">
                        <h2 className="admin-section-title">Recent Logins</h2>
                        <div className="admin-count">5</div>
                        <div className="stats">
                            <span>Today: 2</span>
                        </div>
                    </div>
                </div>

                {/* Charts & Visualizations */}
                <div className="dashboard-charts-row">
                    <div className="dashboard-chart-card">
                        <h3>Role Distribution</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={rolePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                    {rolePieData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="dashboard-chart-card">
                        <h3>Employees Joined Per Month</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <XAxis dataKey="month" />
                                <YAxis />
                <style>{`
                .notification-bell-wrapper {
                    position: relative;
                }
                .notification-bell:hover .notifications-dropdown,
                .notification-bell:focus .notifications-dropdown {
                    display: block !important;
                }
                .notifications-dropdown {
                    display: none;
                    position: absolute;
                    top: 32px;
                    right: 0;
                    min-width: 220px;
                    background: #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    border-radius: 8px;
                    z-index: 10;
                    padding: 8px;
                }
                .notification-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #e74c3c;
                    color: #fff;
                    border-radius: 50%;
                    font-size: 12px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    z-index: 2;
                }
                `}</style>
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="employees" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="dashboard-activity-feed">
                    <h3>Recent Activity</h3>
                    <ul className="activity-list">
                        {recentActivity.length === 0 ? (
                            <li>No recent activity</li>
                        ) : (
                            recentActivity.map((item, idx) => <li key={idx}>{item}</li>)
                        )}
                    </ul>
                </div>
            </main>
        </div>
  );
};

export default AdminDashboard;