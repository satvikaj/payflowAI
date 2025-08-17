import React, { useEffect, useState } from 'react';
import { FaBullhorn, FaListAlt, FaCalendarAlt, FaClock, FaTimes } from 'react-icons/fa';
import './Dashboard.css';
import Sidebar from "../components/Sidebar";
import Header from "./Header";
import axios from '../utils/axios';

export default function Dashboard() {
    // State for all dynamic sections
    const [employeeCount, setEmployeeCount] = useState(0);
    const [genderStats, setGenderStats] = useState({ male: 0, female: 0 });
    const [announcements, setAnnouncements] = useState([]);
    const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
    const [onLeave, setOnLeave] = useState([]);
    const [showAllOnLeave, setShowAllOnLeave] = useState(false);
    const [username, setUsername] = useState("");
    // Helper to get today's on-leave employees
    const getEmployeesOnLeaveToday = () => {
        const today = new Date().toISOString().split('T')[0];
        const employeesOnLeaveToday = [];
        if (onLeave && Array.isArray(onLeave)) {
            onLeave.forEach(leave => {
                let fromDate = leave.from;
                let toDate = leave.to;
                if (!fromDate || !toDate || fromDate === "N/A" || toDate === "N/A") return;
                try {
                    fromDate = new Date(fromDate).toISOString().split('T')[0];
                    toDate = new Date(toDate).toISOString().split('T')[0];
                } catch (e) { return; }
                const status = (leave.status || '').toLowerCase();
                const isApproved = status === 'approved' || status === 'accepted';
                const isToday = fromDate <= today && today <= toDate;
                if (isApproved && isToday) {
                    const employeeName = leave.name || 'Unknown Employee';
                    const leaveType = leave.type || 'Leave';
                    const isDuplicate = employeesOnLeaveToday.some(emp => emp.name === employeeName && emp.fromDate === fromDate && emp.toDate === toDate);
                    if (!isDuplicate) {
                        employeesOnLeaveToday.push({ name: employeeName, type: leaveType, fromDate, toDate });
                    }
                }
            });
        }
        return employeesOnLeaveToday;
    };
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [onboardings, setOnboardings] = useState([]);
    const [projects, setProjects] = useState([]);
    const [payrollSummary, setPayrollSummary] = useState({ totalPaid: 0, pending: 0, cycle: '' });
    const [payrollTable, setPayrollTable] = useState([]);
    const [recentOnboardings, setRecentOnboardings] = useState([]);
    const [onboardingsLoading, setOnboardingsLoading] = useState(true);
    const [onboardingsError, setOnboardingsError] = useState(null);
    // Recent Onboardings pagination state and logic
    const [onboardingsPage, setOnboardingsPage] = useState(1);
    const [onboardingsRowsPerPage, setOnboardingsRowsPerPage] = useState(5);
    const recentOnboardingsTotalPages = Math.ceil(recentOnboardings.length / onboardingsRowsPerPage);
    const paginatedRecentOnboardings = recentOnboardings.slice((onboardingsPage - 1) * onboardingsRowsPerPage, onboardingsPage * onboardingsRowsPerPage);

    const handleOnboardingsRowsPerPageChange = (e) => {
        setOnboardingsRowsPerPage(Number(e.target.value));
        setOnboardingsPage(1);
    };

    const handleOnboardingsPageChange = (page) => {
        if (page >= 1 && page <= recentOnboardingsTotalPages) setOnboardingsPage(page);
    };

    useEffect(() => {
        setOnboardingsPage(1);
    }, [recentOnboardings]);

    // Payroll pagination state and logic (must be after payrollTable is declared)
    const [payrollPage, setPayrollPage] = useState(1);
    const [payrollRowsPerPage, setPayrollRowsPerPage] = useState(10);
    const payrollTotalPages = Math.ceil(payrollTable.length / payrollRowsPerPage);
    const paginatedPayroll = payrollTable.slice((payrollPage - 1) * payrollRowsPerPage, payrollPage * payrollRowsPerPage);

    const handlePayrollRowsPerPageChange = (e) => {
        setPayrollRowsPerPage(Number(e.target.value));
        setPayrollPage(1);
    };

    const handlePayrollPageChange = (page) => {
        if (page >= 1 && page <= payrollTotalPages) setPayrollPage(page);
    };

    useEffect(() => {
        // Use the same key as profile icon ("role")
        const storedUsername = localStorage.getItem('role');
        setUsername(storedUsername || "User");
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPayrollPage(1);
    }, []);

    useEffect(() => {
        // Fetch employee count
        axios.get('/api/employee/count')
            .then(res => setEmployeeCount(res.data))
            .catch(() => setEmployeeCount(0));

        // Fetch gender stats (assuming endpoint exists)
        axios.get('/api/employee/gender-stats')
            .then(res => setGenderStats(res.data))
            .catch(() => setGenderStats({ male: 0, female: 0 }));

        // Fetch announcements
        axios.get('/api/announcements')
            .then(res => setAnnouncements(res.data))
            .catch(() => setAnnouncements([]));

        // Fetch employees on leave
        axios.get('/api/leave/today')
            .then(res => setOnLeave(res.data))
            .catch(() => setOnLeave([]));

        // Fetch calendar events
        axios.get('/api/calendar/events')
            .then(res => setCalendarEvents(res.data))
            .catch(() => setCalendarEvents([]));



        // Fetch recent onboarded employees summary
        axios.get('/api/onboarding/summary')
            .then(res => {
                if (Array.isArray(res.data)) {
                    // Sort by joiningDate descending (most recent first)
                    const sorted = res.data.slice().sort((a, b) => {
                        const dateA = new Date(a.joiningDate);
                        const dateB = new Date(b.joiningDate);
                        return dateB - dateA;
                    });
                    setRecentOnboardings(sorted);
                } else {
                    console.warn('Unexpected onboarding summary format:', res.data);
                    setRecentOnboardings([]);
                    setOnboardingsError('Unexpected data format');
                }
            })
            .catch(err => {
                console.error('Failed to load onboarding summary:', err);
                setRecentOnboardings([]);
                setOnboardingsError('Failed to load onboardings');
            })
            .finally(() => setOnboardingsLoading(false));

        axios.get('/api/projects/summary')
            .then(res => {
                setProjects(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => setProjects([]));

        axios.get('/api/payroll/summary')
            .then(res => setPayrollSummary(res.data))
            .catch(() => setPayrollSummary({ totalPaid: 0, pending: 0, cycle: '' }));

        // Fetch payroll table
        axios.get('/api/payroll/table')
            .then(res => setPayrollTable(res.data))
            .catch(() => setPayrollTable([]));
    }, []);

    return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', color: '#222', boxSizing: 'border-box' }}>
            <Sidebar />
            <main className="dashboard-main" style={{ padding: '40px 48px 48px 48px', maxWidth: 1400, margin: '0 auto', borderRadius: '24px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(44,62,80,0.10)' }}>
                {/* Styled Welcome Message */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
                    <div style={{
                        background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
                        color: '#fff',
                        borderRadius: 20,
                        boxShadow: '0 8px 32px rgba(30,64,175,0.13)',
                        padding: '28px 56px',
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        letterSpacing: '0.03em',
                        textShadow: '0 2px 12px rgba(30,64,175,0.13)',
                        border: '2.5px solid #e0e7ff',
                        display: 'inline-block',
                        marginTop: 12,
                        transition: 'box-shadow 0.22s, transform 0.18s',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 10 }}>
                                <circle cx="22" cy="22" r="22" fill="#e0e7ff"/>
                                <path d="M22 13C19.2386 13 17 15.2386 17 18C17 20.7614 19.2386 23 22 23C24.7614 23 27 20.7614 27 18C27 15.2386 24.7614 13 22 13ZM22 21C20.3431 21 19 19.6569 19 18C19 16.3431 20.3431 15 22 15C23.6569 15 25 16.3431 25 18C25 19.6569 23.6569 21 22 21Z" fill="#6366f1"/>
                            </svg>
                            Welcome Back, HR!
                        </span>
                    </div>
                </div>
                <style>{`
                .dashboard-section {
                    animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: none; }
                }
                .card {
                    box-shadow: 0 8px 32px rgba(44,62,80,0.13), 0 2px 8px rgba(0,0,0,0.06);
                    border-radius: 20px;
                    background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
                    backdrop-filter: blur(3px);
                    border: 2px solid #e0e7ff;
                    transition: box-shadow 0.22s, transform 0.18s, background 0.18s;
                }
                .card:hover {
                    box-shadow: 0 16px 48px rgba(44,62,80,0.18), 0 4px 16px rgba(0,0,0,0.10);
                    transform: translateY(-4px) scale(1.035);
                    background: linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%);
                }
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #185a9d;
                    margin-bottom: 12px;
                    letter-spacing: 0.02em;
                    text-shadow: 0 1px 4px rgba(44,62,80,0.08);
                }
                .count {
                    font-size: 2.7rem;
                    font-weight: 900;
                    color: #185a9d;
                    margin-bottom: 10px;
                    text-shadow: 0 1px 4px rgba(44,62,80,0.08);
                }
                .stats {
                    font-size: 1.08rem;
                    color: #43cea2;
                    display: flex;
                    gap: 22px;
                    font-weight: 700;
                }
                .onboarding-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
                    border-radius: 16px;
                    box-shadow: 0 4px 16px rgba(44,62,80,0.09);
                    overflow: hidden;
                    margin-top: 18px;
                }
                .onboarding-table th, .onboarding-table td {
                    padding: 16px 12px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }
                .onboarding-table th {
                    background: #e0e7ff;
                    font-weight: 800;
                    color: #185a9d;
                    font-size: 1.08rem;
                }
                .onboarding-table tr:last-child td {
                    border-bottom: none;
                }
                .status {
                    display: inline-block;
                    padding: 6px 18px;
                    border-radius: 18px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    background: #43cea2;
                    color: #fff;
                    border: 1.5px solid #185a9d;
                    transition: background 0.18s, color 0.18s;
                }
                .status.completed {
                    background: #43cea2;
                    color: #fff;
                    border-color: #185a9d;
                }
                .status.pending {
                    background: #ffd600;
                    color: #185a9d;
                    border-color: #ffd600;
                }
                .status.delayed {
                    background: #ff6a6a;
                    color: #fff;
                    border-color: #ff6a6a;
                }
                .avatars {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .avatars img {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 1px 4px rgba(30,64,175,0.10);
                    object-fit: cover;
                }
                .avatars span {
                    font-size: 0.98rem;
                    color: #6366f1;
                    font-weight: 600;
                    margin-left: 2px;
                }
                .payroll-stats {
                    display: flex;
                    gap: 32px;
                    margin-bottom: 18px;
                }
                .payroll-item h4 {
                    font-size: 1.01rem;
                    color: #6366f1;
                    margin-bottom: 2px;
                }
                .payroll-item .amount {
                    font-size: 1.18rem;
                    font-weight: 700;
                }
                .payroll-item .text-yellow {
                    color: #eab308;
                }
                .pagination-controls {
                    display: flex;
                    gap: 10px;
                    margin-top: 18px;
                    justify-content: center;
                }
                .pagination-controls button {
                    background: #43cea2;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 18px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 1rem;
                    box-shadow: 0 2px 8px rgba(44,62,80,0.08);
                    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
                }
                .pagination-controls button.active, .pagination-controls button:focus {
                    background: #185a9d;
                    color: #fff;
                    box-shadow: 0 4px 16px rgba(44,62,80,0.13);
                }
                .pagination-controls button:disabled {
                    background: #e0e7ff;
                    color: #a1a1aa;
                    cursor: not-allowed;
                }
                .dashboard-main {
                    border-top: 2.5px solid #e0e7ff;
                    margin-top: 0;
                    border-radius: 24px;
                }
                `}</style>
                {/* Section 1: Summary Cards */}
                <section className="dashboard-section">
                    <Header/>
                    <div className="dashboard-cards-row" style={{ display: 'flex', gap: '28px', justifyContent: 'center', margin: '36px 0 32px 0' }}>
                        {/* Total Employees Card */}
                        <div className="card dashboard-card" style={{ flex: '1 1 0', minWidth: 260, maxWidth: 340, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(30,64,175,0.10)', transition: 'box-shadow 0.22s, transform 0.18s' }}>
                            <h2 className="section-title" style={{ fontSize: '1.12rem', fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>TOTAL EMPLOYEES</h2>
                            <div className="count" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#22223b', marginBottom: 8 }}>{employeeCount}</div>
                            <div className="stats" style={{ fontSize: '1rem', color: '#64748b', display: 'flex', gap: 18 }}>
                                <span>Male: {genderStats.male}</span>
                                <span>Female: {genderStats.female}</span>
                            </div>
                            <div
                                className="circle-chart"
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    margin: '10px auto 0',
                                    background: (() => {
                                        const total = genderStats.male + genderStats.female;
                                        const malePercent = total > 0 ? (genderStats.male / total) * 100 : 0;
                                        const femalePercent = total > 0 ? (genderStats.female / total) * 100 : 0;
                                        return `conic-gradient(#1976d2 0% ${malePercent}%, #FFD600 ${malePercent}% 100%)`;
                                    })(),
                                    border: '2px solid #eee',
                                }}
                            ></div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1976d2', display: 'inline-block', border: '1px solid #1976d2' }}></span>
                                    <span style={{ fontSize: 12 }}>Male</span>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFD600', display: 'inline-block', border: '1px solid #FFD600' }}></span>
                                    <span style={{ fontSize: 12 }}>Female</span>
                                </span>
                            </div>
                        </div>

                        {/* Employees on Leave Today Card */}
                        <div className="card dashboard-card" style={{ flex: '1 1 0', minWidth: 260, maxWidth: 340, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(30,64,175,0.10)', transition: 'box-shadow 0.22s, transform 0.18s', position: 'relative' }}>
                            <h2 className="section-title" style={{ fontSize: '1.12rem', fontWeight: 700, color: '#6366f1', marginBottom: 2 }}>ON LEAVE TODAY</h2>
                            {(() => {
                                const employeesOnLeaveToday = getEmployeesOnLeaveToday();
                                const employeesOnLeaveCount = employeesOnLeaveToday.length;
                                return (
                                    <>
                                        <div style={{ marginBottom: '10px', fontSize: '2.2rem', fontWeight: '800', color: '#22223b', textAlign: 'center' }}>{employeesOnLeaveCount}</div>
                                        <ul className="leave-list" style={{ padding: 0, margin: 0, listStyle: 'none', width: '100%' }}>
                                            {employeesOnLeaveCount === 0 ? (
                                                <li style={{ color: '#10b981', fontWeight: '500', textAlign: 'center' }}>✅ Full attendance today</li>
                                            ) : (
                                                employeesOnLeaveToday.slice(0,2).map((emp, i) => (
                                                    <li key={`${emp.name}-${i}`} style={{ marginBottom: '6px', padding: '6px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fbbf24', fontSize: '0.98rem', textAlign: 'center' }}>
                                                        <strong style={{ color: '#92400e' }}>{emp.name}</strong> - <span style={{ color: '#b45309', marginLeft: '4px' }}>{emp.type}</span>
                                                        <br />
                                                        <span style={{ fontSize: '0.9rem', color: '#78716c' }}>({emp.fromDate} to {emp.toDate})</span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                        <button
                                            style={{ position: 'absolute', top: 14, right: 14, background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.98rem' }}
                                            onClick={() => setShowAllOnLeave(true)}
                                            title="View All On Leave"
                                        >
                                            <FaListAlt /> View All
                                        </button>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Announcements Card */}
    {/* Modal for All On Leave - render outside card so it overlays dashboard */}
    {showAllOnLeave && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(44,62,80,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(44,62,80,0.18)', minWidth: 400, maxWidth: 480, width: '100%', padding: '2.5rem 2.2rem 2rem 2.2rem', position: 'relative' }}>
                <button
                    onClick={() => setShowAllOnLeave(false)}
                    style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#b45309', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                    title="Close"
                >
                    <FaTimes />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.2rem' }}>
                    <FaListAlt style={{ fontSize: '2.2rem', color: '#b45309' }} />
                    <h2 style={{ margin: 0, fontWeight: 700, color: '#222' }}>All On Leave Today</h2>
                </div>
                <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 10 }}>
                    {getEmployeesOnLeaveToday().length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No employees on leave today.</div>
                    ) : (
                        <ul style={{ padding: 0, margin: 0 }}>
                            {getEmployeesOnLeaveToday().map((emp, idx) => (
                                <li key={idx} style={{ background: '#fef3c7', borderRadius: 8, padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(44,62,80,0.06)', listStyle: 'none', fontSize: '0.98rem' }}>
                                    <div style={{ fontSize: '1.08rem', fontWeight: 500, color: '#b45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FaListAlt /> {emp.name} - {emp.type}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <span>({emp.fromDate} to {emp.toDate})</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )}
                        <div className="card dashboard-card" style={{ flex: '1 1 0', minWidth: 260, maxWidth: 340, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(30,64,175,0.10)', transition: 'box-shadow 0.22s, transform 0.18s', position: 'relative' }}>
                            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.12rem', fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>
                                <FaBullhorn style={{ color: '#6c63ff', fontSize: '1.3em' }} /> ANNOUNCEMENTS
                            </h2>
                            <ul className="announcement-list" style={{ marginBottom: 10, padding: 0, listStyle: 'none', width: '100%' }}>
                                {announcements.length === 0 ? (
                                    <li style={{ color: '#888', fontWeight: 500, padding: '8px 0', textAlign: 'center' }}>No announcements</li>
                                ) : (
                                    announcements.slice(0,2).map((a, i) => (
                                        <li key={i} style={{ marginBottom: '8px', background: '#f3f4f6', borderRadius: '8px', padding: '8px 10px', boxShadow: '0 1px 4px rgba(44,62,80,0.06)', fontSize: '0.98rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#4f46e5', fontSize: '1em' }}>
                                                <FaBullhorn /> {a.message}
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, fontSize: '0.95em', color: '#555', marginTop: 2 }}>
                                                <span><FaCalendarAlt /> {a.date || '-'}</span>
                                                <span><FaClock /> {a.time || '-'}</span>
                                                <span style={{ color: '#888', fontSize: '0.9em' }}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</span>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                            <button
                                style={{ position: 'absolute', top: 14, right: 14, background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.98rem' }}
                                onClick={() => setShowAllAnnouncements(true)}
                                title="View All Announcements"
                            >
                                <FaListAlt /> View All
                            </button>
                        </div>
    {/* Modal for All Announcements - render outside card so it overlays dashboard */}
    {showAllAnnouncements && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(44,62,80,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(44,62,80,0.18)', minWidth: 400, maxWidth: 480, width: '100%', padding: '2.5rem 2.2rem 2rem 2.2rem', position: 'relative' }}>
                <button
                    onClick={() => setShowAllAnnouncements(false)}
                    style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#6366f1', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                    title="Close"
                >
                    <FaTimes />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.2rem' }}>
                    <FaBullhorn style={{ fontSize: '2.2rem', color: '#6c63ff' }} />
                    <h2 style={{ margin: 0, fontWeight: 700, color: '#222' }}>All Announcements</h2>
                </div>
                <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 10 }}>
                    {announcements.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No announcements found.</div>
                    ) : (
                        <ul style={{ padding: 0, margin: 0 }}>
                            {announcements.map((a, idx) => (
                                <li key={idx} style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(44,62,80,0.06)', listStyle: 'none', fontSize: '0.98rem' }}>
                                    <div style={{ fontSize: '1.08rem', fontWeight: 500, color: '#4f46e5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FaBullhorn /> {a.message}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: '0.95rem', color: '#555', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <span><FaCalendarAlt /> {a.date || '-'}</span>
                                            <span><FaClock /> {a.time || '-'}</span>
                                        </div>
                                        <span style={{ fontSize: '0.88em', color: '#888', marginLeft: 'auto' }}>Sent: {a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )}
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="card">
                        <h2 className="section-title">RECENT ONBOARDINGS</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginBottom: 16, marginTop: 8, background: 'rgba(243,244,246,0.7)', borderRadius: 10, padding: '10px 16px' }}>
                            <div className="rows-per-page-select" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label htmlFor="onboardingsRowsPerPage" style={{ fontWeight: 500, color: '#64748b' }}>Rows per page:</label>
                                <select id="onboardingsRowsPerPage" value={onboardingsRowsPerPage} onChange={handleOnboardingsRowsPerPageChange} style={{ borderRadius: 6, padding: '4px 10px', border: '1.5px solid #e0e7ff', background: '#fff', fontSize: 15 }}>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                        <table className="onboarding-table">
                            <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Department</th>
                                <th>Role</th>
                                <th>Joining Date</th>
                                {/*<th>Manager</th>*/}
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {onboardingsLoading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
                                </tr>
                            ) : onboardingsError ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'red' }}>
                                        {onboardingsError}
                                    </td>
                                </tr>
                            ) : recentOnboardings.length === 0 ? (
                                <tr>
                                    <td colSpan="6">No recent onboardings</td>
                                </tr>
                            ) : (
                                paginatedRecentOnboardings.map((o, i) => (
                                    <tr key={`${o.fullName || 'unknown'}-${i}`}>
                                        <td>{o.fullName || '-'}</td>
                                        <td>{o.department || '-'}</td>
                                        <td>{o.role || '-'}</td>
                                        <td>{o.joiningDate || '-'}</td>
                                        {/*<td>{o.managerName || '-'}</td>*/}
                                        <td>
                <span className={`status ${(o.status || '').toLowerCase()}`}>
                  {o.status || 'Unknown'}
                </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                        {/* Pagination Controls */}
                        {recentOnboardingsTotalPages > 1 && (
                            <div className="pagination-controls">
                                <button onClick={() => handleOnboardingsPageChange(onboardingsPage - 1)} disabled={onboardingsPage === 1}>&laquo; Prev</button>
                                {Array.from({ length: recentOnboardingsTotalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={onboardingsPage === i + 1 ? 'active' : ''}
                                        onClick={() => handleOnboardingsPageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => handleOnboardingsPageChange(onboardingsPage + 1)} disabled={onboardingsPage === recentOnboardingsTotalPages}>Next &raquo;</button>
                            </div>
                        )}
                    </div>
                </section>

               
            </main>
        </div>
    );
}
