import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Sidebar from "../components/Sidebar";
import Header from "./Header";

import axios from '../utils/axios';

export default function Dashboard() {
    // State for all dynamic sections
    const [employeeCount, setEmployeeCount] = useState(0);
    const [genderStats, setGenderStats] = useState({ male: 0, female: 0 });
    const [announcements, setAnnouncements] = useState([]);
    const [onLeave, setOnLeave] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [onboardings, setOnboardings] = useState([]);
    const [projects, setProjects] = useState([]);
    const [payrollSummary, setPayrollSummary] = useState({ totalPaid: 0, pending: 0, cycle: '' });
    const [payrollTable, setPayrollTable] = useState([]);
    const [recentOnboardings, setRecentOnboardings] = useState([]);
    const [onboardingsLoading, setOnboardingsLoading] = useState(true);
    const [onboardingsError, setOnboardingsError] = useState(null);

    const [payrollSearch, setPayrollSearch] = useState("");

    // Payroll pagination state and logic (must be after payrollTable is declared)
    const [payrollPage, setPayrollPage] = useState(1);
    const [payrollRowsPerPage, setPayrollRowsPerPage] = useState(10);
    // Filter payrollTable by search
    const filteredPayroll = payrollTable.filter(row =>
        row.employee.toLowerCase().includes(payrollSearch.toLowerCase()) ||
        row.department.toLowerCase().includes(payrollSearch.toLowerCase())
    );
    const payrollTotalPages = Math.ceil(filteredPayroll.length / payrollRowsPerPage);
    const paginatedPayroll = filteredPayroll.slice((payrollPage - 1) * payrollRowsPerPage, payrollPage * payrollRowsPerPage);

    const handlePayrollRowsPerPageChange = (e) => {
        setPayrollRowsPerPage(Number(e.target.value));
        setPayrollPage(1);
    };

    const handlePayrollPageChange = (page) => {
        if (page >= 1 && page <= payrollTotalPages) setPayrollPage(page);
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        setPayrollPage(1);
    }, [payrollSearch]);

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
                    setRecentOnboardings(res.data);
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

        // Fetch onboarding summary
        // axios.get('/api/onboarding/summary')
        //     .then(res => setOnboardings(res.data))
        //     .catch(() => setOnboardings([]));

        // axios.get('/api/onboarding/summary')
        //     .then(res => {
        //         setOnboardings(Array.isArray(res.data) ? res.data : []);
        //     })
        //     .catch(() => setOnboardings([]));

        axios.get('/api/projects/summary')
            .then(res => {
                setProjects(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => setProjects([]));


        // Fetch project summary
        // axios.get('/api/projects/summary')
        //     .then(res => setProjects(res.data))
        //     .catch(() => setProjects([]));
        //
        // Fetch payroll summary
        axios.get('/api/payroll/summary')
            .then(res => setPayrollSummary(res.data))
            .catch(() => setPayrollSummary({ totalPaid: 0, pending: 0, cycle: '' }));

        // Fetch payroll table
        axios.get('/api/payroll/table')
            .then(res => setPayrollTable(res.data))
            .catch(() => setPayrollTable([]));
    }, []);

    return (
        <div className="dashboard-layout" >
            <Sidebar />
            <main className="dashboard-main" >
                {/* <style>{`
                .dashboard-section {
                    animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: none; }
                }
                .card {
                    box-shadow: 0 4px 24px rgba(30,64,175,0.10), 0 1.5px 6px rgba(0,0,0,0.04);
                    border-radius: 16px;
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(2.5px);
                    border: 1.5px solid #e0e7ff;
                    transition: box-shadow 0.22s, transform 0.18s, background 0.18s;
                }
                .card:hover {
                    box-shadow: 0 8px 32px rgba(30,64,175,0.16), 0 2px 8px rgba(0,0,0,0.08);
                    transform: translateY(-2px) scale(1.025);
                    background: rgba(255,255,255,0.97);
                }
                .section-title {
                    font-size: 1.13rem;
                    font-weight: 700;
                    color: #6366f1;
                    margin-bottom: 8px;
                    letter-spacing: 0.01em;
                }
                .count {
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
                .onboarding-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    background: rgba(255,255,255,0.98);
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(30,64,175,0.07);
                    overflow: hidden;
                    margin-top: 12px;
                }
                .onboarding-table th, .onboarding-table td {
                    padding: 12px 10px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }
                .onboarding-table th {
                    background: #f3f4f6;
                    font-weight: 700;
                    color: #374151;
                }
                .onboarding-table tr:last-child td {
                    border-bottom: none;
                }
                .status {
                    display: inline-block;
                    padding: 4px 14px;
                    border-radius: 16px;
                    font-size: 0.98rem;
                    font-weight: 600;
                    letter-spacing: 0.01em;
                    background: #e0e7ff;
                    color: #3730a3;
                    border: 1px solid #c7d2fe;
                    transition: background 0.18s, color 0.18s;
                }
                .status.completed {
                    background: #d1fae5;
                    color: #047857;
                    border-color: #6ee7b7;
                }
                .status.pending {
                    background: #fef9c3;
                    color: #b45309;
                    border-color: #fde68a;
                }
                .status.delayed {
                    background: #fee2e2;
                    color: #b91c1c;
                    border-color: #fecaca;
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
                    gap: 6px;
                    margin-top: 12px;
                }
                .pagination-controls button {
                    background: #e0e7ff;
                    color: #3730a3;
                    border: none;
                    border-radius: 6px;
                    padding: 6px 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s;
                }
                .pagination-controls button.active, .pagination-controls button:focus {
                    background: #6366f1;
                    color: #fff;
                }
                .pagination-controls button:disabled {
                    background: #f3f4f6;
                    color: #a1a1aa;
                    cursor: not-allowed;
                }
                .dashboard-main {
                    border-top: 2.5px solid #e0e7ff;
                    margin-top: 0;
                }
                `}</style> */}
                {/* Section 1: Summary Cards */}
                <section className="dashboard-section">
                    <Header/>
                    <div className="card-grid" >
                        {/* Total Employees */}
                        <div className="card" >
                            <h2 className="section-title">TOTAL EMPLOYEES</h2>
                            <div className="count" >{employeeCount}</div>
                            <div className="stats" >
                                <span>Male: {genderStats.male}</span>
                                <span>Female: {genderStats.female}</span>
                            </div>
                            <div
                                className="circle-chart"
                                style={{
                                    width: '150px',
                                    height: '180px',
                                    padding: '50px',
                                    
                                }}
                            ></div>
                            {/* Legend for circle chart */}
                            <div className='legend'>
                                 <span className="legend-item">
                                <span className="legend-color male"></span>
                                <span className="legend-label">Male</span>
                            </span>
                            <span className="legend-item">
                                <span className="legend-color female"></span>
                                <span className="legend-label">Female</span>
                            </span>
                            </div>
                        </div>

                        {/* Column containing Announcements and Employees on Leave */}
                        <div className="card-column" >
                            {/* Announcements Card */}
                            <div className="card">
                                <h2 className="section-title">ANNOUNCEMENTS</h2>
                                <ul className="announcement-list">
                                    {announcements.length === 0 ? <li>No announcements</li> : announcements.map((a, i) => (
                                        <li className="announcement-box" key={i}>{a.message}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Employees on Leave Card */}
                            <div className="card">
                                <h2 className="section-title">EMPLOYEES ON LEAVE TODAY</h2>
                                {(() => {
                                    // Get today's date in YYYY-MM-DD format
                                    const today = new Date().toISOString().split('T')[0];
                                    
                                    // Count employees on leave today
                                    let employeesOnLeaveCount = 0;
                                    const employeesOnLeaveToday = [];
                                    
                                    if (onLeave && Array.isArray(onLeave)) {
                                        onLeave.forEach(leave => {
                                            // Use the correct field names from the API response
                                            let fromDate = leave.from;
                                            let toDate = leave.to;
                                            
                                            // Skip if no dates available or dates are "N/A"
                                            if (!fromDate || !toDate || fromDate === "N/A" || toDate === "N/A") return;
                                            
                                            // Convert dates to YYYY-MM-DD format for comparison
                                            try {
                                                fromDate = new Date(fromDate).toISOString().split('T')[0];
                                                toDate = new Date(toDate).toISOString().split('T')[0];
                                            } catch (e) {
                                                console.error('Date parsing error:', e);
                                                return;
                                            }
                                            
                                            // Check if leave is approved/accepted
                                            const status = (leave.status || '').toLowerCase();
                                            const isApproved = status === 'approved' || status === 'accepted';
                                            
                                            // Check if today falls within leave period
                                            const isToday = fromDate <= today && today <= toDate;
                                            
                                            if (isApproved && isToday) {
                                                const employeeName = leave.name || 'Unknown Employee';
                                                const leaveType = leave.type || 'Leave';
                                                
                                                // Check for duplicates based on name and dates
                                                const isDuplicate = employeesOnLeaveToday.some(emp => 
                                                    emp.name === employeeName && 
                                                    emp.fromDate === fromDate && 
                                                    emp.toDate === toDate
                                                );
                                                
                                                if (!isDuplicate) {
                                                    employeesOnLeaveToday.push({
                                                        name: employeeName,
                                                        type: leaveType,
                                                        fromDate: fromDate,
                                                        toDate: toDate
                                                    });
                                                }
                                            }
                                        });
                                    }
                                    
                                    employeesOnLeaveCount = employeesOnLeaveToday.length;
                                    
                                    return (
                                        <>
                                            <div className="count-box">
                                                {employeesOnLeaveCount}
                                            </div>
                                            <ul className="leave-list">
                                                {employeesOnLeaveCount === 0 ? (
                                                    <li>✅ Full attendance today</li>
                                                ) : (
                                                    employeesOnLeaveToday.map((emp, i) => (
                                                        <li key={`${emp.name}-${i}`} >
                                                            <strong >{emp.name}</strong> - 
                                                            <span >{emp.type}</span>
                                                            <br />
                                                            <span >
                                                                ({emp.fromDate} to {emp.toDate})
                                                            </span>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Calendar */}
                       <div className="card">
  <h2 className="section-title">CALENDAR</h2>
  <ul className="calendar-events">
    {calendarEvents.length === 0 ? (
      <li>No events</li>
    ) : (
      calendarEvents.map((e, i) => (
        <li 
          key={i} 
          className="box-item"
        >
          {e.time} – {e.title}
        </li>
      ))
    )}
  </ul>
</div>


                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="card">
                        <h2 className="section-title">RECENT ONBOARDINGS</h2>
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
                                    <td colSpan="6">Loading...</td>
                                </tr>
                            ) : onboardingsError ? (
                                <tr>
                                    <td colSpan="6">
                                        {onboardingsError}
                                    </td>
                                </tr>
                            ) : recentOnboardings.length === 0 ? (
                                <tr>
                                    <td colSpan="6">No recent onboardings</td>
                                </tr>
                            ) : (
                                recentOnboardings.map((o, i) => (
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
                    </div>
                </section>


                {/* Section 2: Project Summary Table */}
                {/*<section className="dashboard-section">*/}
                {/*    <div className="card" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(30,64,175,0.07), 0 1.5px 6px rgba(0,0,0,0.04)', padding: '28px 24px 22px 24px', transition: 'box-shadow 0.2s, transform 0.18s' }}>*/}
                {/*        <h2 className="section-title">CURRENT ONBOARDINGS SUMMARY</h2>*/}
                {/*        <table className="onboarding-table">*/}
                {/*            <thead>*/}
                {/*            <tr>*/}
                {/*                <th>Code</th>*/}
                {/*                <th>Position</th>*/}
                {/*                <th>Candidates</th>*/}
                {/*                <th>Deadline</th>*/}
                {/*                <th>Status</th>*/}
                {/*            </tr>*/}
                {/*            </thead>*/}
                {/*            <tbody>*/}
                {/*            {onboardings.length === 0 ? (*/}
                {/*                <tr><td colSpan="5">No onboardings</td></tr>*/}
                {/*            ) : onboardings.map((o, i) => (*/}
                {/*                <tr key={i}>*/}
                {/*                    <td>{o.code}</td>*/}
                {/*                    <td>{o.position}</td>*/}
                {/*                    <td><div className="avatars">{Array.isArray(o.candidates) && o.candidates.map((c, j) => (*/}
                {/*                        <img key={j} src={c.avatar || '/placeholder-avatar.png'} alt="" />*/}
                {/*                    ))}*/}
                {/*                        <span>{(Array.isArray(o.candidates) ? o.candidates.length : 0) > 0 ? `${o.candidates.length}+` : '0'}</span>*/}
                {/*                    </div></td>*/}
                {/*                    <td>{o.deadline}</td>*/}
                {/*                    <td><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></td>*/}
                {/*                </tr>*/}
                {/*            ))}*/}
                {/*            </tbody>*/}
                {/*        </table>*/}
                {/*    </div>*/}
                {/*</section>*/}

                {/* Section 4: Project Summary */}
                {/*<section className="dashboard-section">*/}
                {/*    <div className="card" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(30,64,175,0.07), 0 1.5px 6px rgba(0,0,0,0.04)', padding: '28px 24px 22px 24px', transition: 'box-shadow 0.2s, transform 0.18s' }}>*/}
                {/*        <h2 className="section-title">PROJECT SUMMARY</h2>*/}
                {/*        <table className="onboarding-table">*/}
                {/*            <thead>*/}
                {/*            <tr>*/}
                {/*                <th>Project Name</th>*/}
                {/*                <th>Manager</th>*/}
                {/*                <th>Team Members</th>*/}
                {/*                <th>Status</th>*/}
                {/*                <th>Deadline</th>*/}
                {/*            </tr>*/}
                {/*            </thead>*/}
                {/*            <tbody>*/}
                {/*            {projects.length === 0 ? (*/}
                {/*                <tr><td colSpan="5">No projects</td></tr>*/}
                {/*            ) : projects.map((p, i) => (*/}
                {/*                <tr key={i}>*/}
                {/*                    <td>{p.name}</td>*/}
                {/*                    <td>{p.manager}</td>*/}
                {/*                    <td><div className="avatars">{Array.isArray(p.team) && p.team.map((m, j) => (*/}
                {/*                        <img key={j} src={m.avatar || '/placeholder-avatar.png'} alt="" />*/}
                {/*                    ))}*/}
                {/*                        <span>{(Array.isArray(p.team) ? `+${p.team.length}` : '+0')}</span>*/}
                {/*                    </div></td>*/}
                {/*                    <td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td>*/}
                {/*                    <td>{p.deadline}</td>*/}
                {/*                </tr>*/}
                {/*            ))}*/}
                {/*            </tbody>*/}
                {/*        </table>*/}
                {/*    </div>*/}
                {/*</section>*/}

                {/* Section 5: Payroll Summary */}
                <section className="dashboard-section">
                    <div className="card" >
                        <h2 className="section-title">PAYROLL SUMMARY</h2>
                        <div className="payroll-stats">
                            <div className="payroll-item">
                                <h4>Total Salary Paid</h4>
                                <p className="amount">₹{payrollSummary.totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="payroll-item">
                                <h4>Pending Payments</h4>
                                <p className="amount text-yellow">₹{payrollSummary.pending.toLocaleString()}</p>
                            </div>
                            <div className="payroll-item">
                                <h4>Salary Cycle</h4>
                                <p>{payrollSummary.cycle}</p>
                            </div>
                        </div>

                        {/* Search bar and rows-per-page select for Employees table */}
                        <div className="rows-per-page-select" >
                            <label htmlFor="payrollSearch" style={{ marginRight: '8px' }}>Search:</label>
                            <input
                                id="payrollSearch"
                                type="text"
                                placeholder="Employee or department..."
                                value={payrollSearch}
                                onChange={e => setPayrollSearch(e.target.value)}
                                className="payroll-search-input"
                            />

                            {/* <div className="rows-per-page-select" > */}
                                <label htmlFor="payrollRowsPerPage" >Rows per page:</label>
                                <select id="payrollRowsPerPage" value={payrollRowsPerPage} onChange={handlePayrollRowsPerPageChange} >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            {/* </div> */}
                        </div>

                        <table className="onboarding-table mt-4">
                            <thead>
                            <tr>
                                <th>Employee</th>
                                {/*<th>Department</th>*/}
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Payment Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedPayroll.length === 0 ? (
                                <tr><td colSpan="5">No employees found</td></tr>
                            ) : paginatedPayroll.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.employee}</td>
                                    {/*<td>{row.department}</td>*/}
                                    <td>₹{row.netSalary.toLocaleString()}</td>
                                    <td><span className={`status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                                    <td>{row.paymentDate}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {/* Pagination Controls */}
                        {payrollTotalPages > 1 && (
                            <div className="pagination-controls">
                                <button onClick={() => handlePayrollPageChange(payrollPage - 1)} disabled={payrollPage === 1}>&laquo; Prev</button>
                                {Array.from({ length: payrollTotalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={payrollPage === i + 1 ? 'active' : ''}
                                        onClick={() => handlePayrollPageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => handlePayrollPageChange(payrollPage + 1)} disabled={payrollPage === payrollTotalPages}>Next &raquo;</button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
