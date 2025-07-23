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

    useEffect(() => {
        // Fetch employee count
        axios.get('/employee/count')
            .then(res => setEmployeeCount(res.data))
            .catch(() => setEmployeeCount(0));

        // Fetch gender stats (assuming endpoint exists)
        axios.get('/employee/gender-stats')
            .then(res => setGenderStats(res.data))
            .catch(() => setGenderStats({ male: 0, female: 0 }));

        // Fetch announcements
        axios.get('/announcements')
            .then(res => setAnnouncements(res.data))
            .catch(() => setAnnouncements([]));

        // Fetch employees on leave
        axios.get('/leave/today')
            .then(res => setOnLeave(res.data))
            .catch(() => setOnLeave([]));

        // Fetch calendar events
        axios.get('/calendar/events')
            .then(res => setCalendarEvents(res.data))
            .catch(() => setCalendarEvents([]));

        // Fetch onboarding summary
        axios.get('/onboarding/summary')
            .then(res => setOnboardings(res.data))
            .catch(() => setOnboardings([]));

        // Fetch project summary
        axios.get('/projects/summary')
            .then(res => setProjects(res.data))
            .catch(() => setProjects([]));

        // Fetch payroll summary
        axios.get('/payroll/summary')
            .then(res => setPayrollSummary(res.data))
            .catch(() => setPayrollSummary({ totalPaid: 0, pending: 0, cycle: '' }));

        // Fetch payroll table
        axios.get('/payroll/table')
            .then(res => setPayrollTable(res.data))
            .catch(() => setPayrollTable([]));
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                {/* Section 1: Summary Cards */}
                <section className="dashboard-section">
                    <Header/>
                    <div className="card-grid">
                        {/* Total Employees */}
                        <div className="card">
                            <h2 className="section-title">TOTAL EMPLOYEES</h2>
                            <div className="count">{employeeCount}</div>
                            <div className="stats">
                                <span>Male: {genderStats.male}</span>
                                <span>Female: {genderStats.female}</span>
                            </div>
                            <div className="circle-chart"></div>
                        </div>

                        {/* Column containing Announcements and Employees on Leave */}
                        <div className="card-column">
                            {/* Announcements Card */}
                            <div className="card">
                                <h2 className="section-title">ANNOUNCEMENTS</h2>
                                <ul className="announcement-list">
                                    {announcements.length === 0 ? <li>No announcements</li> : announcements.map((a, i) => (
                                        <li key={i}>{a.message}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Employees on Leave Card */}
                            <div className="card">
                                <h2 className="section-title">EMPLOYEES ON LEAVE</h2>
                                <ul className="leave-list">
                                    {onLeave.length === 0 ? <li>No one on leave</li> : onLeave.map((l, i) => (
                                        <li key={i}><strong>{l.name}</strong> - {l.type} ({l.from} - {l.to})</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="card">
                            <h2 className="section-title">CALENDAR</h2>
                            <ul className="calendar-list">
                                {calendarEvents.length === 0 ? <li>No events</li> : calendarEvents.map((e, i) => (
                                    <li key={i} className={`event ${e.color}`}>{e.time} – {e.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2: Project Summary Table */}
                <section className="dashboard-section">
                    <div className="card">
                        <h2 className="section-title">CURRENT ONBOARDINGS SUMMARY</h2>
                        <table className="onboarding-table">
                            <thead>
                            <tr>
                                <th>Code</th>
                                <th>Position</th>
                                <th>Candidates</th>
                                <th>Deadline</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {onboardings.length === 0 ? (
                                <tr><td colSpan="5">No onboardings</td></tr>
                            ) : onboardings.map((o, i) => (
                                <tr key={i}>
                                    <td>{o.code}</td>
                                    <td>{o.position}</td>
                                    <td><div className="avatars">{o.candidates.map((c, j) => <img key={j} src={c.avatar} alt="" />)}<span>{o.candidates.length}+</span></div></td>
                                    <td>{o.deadline}</td>
                                    <td><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 4: Project Summary */}
                <section className="dashboard-section">
                    <div className="card">
                        <h2 className="section-title">PROJECT SUMMARY</h2>
                        <table className="onboarding-table">
                            <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Manager</th>
                                <th>Team Members</th>
                                <th>Status</th>
                                <th>Deadline</th>
                            </tr>
                            </thead>
                            <tbody>
                            {projects.length === 0 ? (
                                <tr><td colSpan="5">No projects</td></tr>
                            ) : projects.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.name}</td>
                                    <td>{p.manager}</td>
                                    <td><div className="avatars">{p.team.map((m, j) => <img key={j} src={m.avatar} alt="" />)}<span>+{p.team.length}</span></div></td>
                                    <td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td>
                                    <td>{p.deadline}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 5: Payroll Summary */}
                <section className="dashboard-section">
                    <div className="card">
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

                        <table className="onboarding-table mt-4">
                            <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Payment Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payrollTable.length === 0 ? (
                                <tr><td colSpan="5">No payroll data</td></tr>
                            ) : payrollTable.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.employee}</td>
                                    <td>{row.department}</td>
                                    <td>₹{row.netSalary.toLocaleString()}</td>
                                    <td><span className={`status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                                    <td>{row.paymentDate}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}



// import React from 'react';
// import './Dashboard.css';
// import Sidebar from "../components/Sidebar";
//
// export default function Dashboard() {
//     return (
//         <main className="dashboard-container">
//             {/* Section 1: Summary Cards */}
//             <Sidebar/>
//             <section className="dashboard-section">
//                 <div className="card-grid">
//                     {/* Total Employees */}
//                     <div className="card">
//                         <h2 className="section-title">TOTAL EMPLOYEES</h2>
//                         <div className="count">352</div>
//                         <div className="stats">
//                             <span>Male: 240</span>
//                             <span>Female: 112</span>
//                         </div>
//                         <div className="circle-chart"></div>
//                     </div>
//
//                     {/* Column containing Announcements and Employees on Leave */}
//                     <div className="card-column">
//                         {/* Announcements Card */}
//                         <div className="card">
//                             <h2 className="section-title">ANNOUNCEMENTS</h2>
//                             <ul className="announcement-list">
//                                 <li>📢 Annual meet scheduled on 5th Aug</li>
//                                 <li>🛡️ Security audit on 20th July</li>
//                             </ul>
//                         </div>
//
//                         {/* Employees on Leave Card */}
//                         <div className="card">
//                             <h2 className="section-title">EMPLOYEES ON LEAVE</h2>
//                             <ul className="leave-list">
//                                 <li><strong>John Carter</strong> - Sick Leave (12 Jul - 15 Jul)</li>
//                                 <li><strong>Meena Rai</strong> - Casual Leave (13 Jul)</li>
//                             </ul>
//                         </div>
//                     </div>
//
//                     {/* Calendar */}
//                     <div className="card">
//                         <h2 className="section-title">CALENDAR</h2>
//                         <ul className="calendar-list">
//                             <li className="event green">12PM – Business lunch at Pret</li>
//                             <li className="event yellow">1PM – Skype call with Kate</li>
//                             <li className="event red">4PM – HR team meeting</li>
//                         </ul>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Section 2: Project Summary Table */}
//             <section className="dashboard-section">
//                 <div className="card">
//                     <h2 className="section-title">CURRENT ONBOARDINGS SUMMARY</h2>
//                     <table className="onboarding-table">
//                         <thead>
//                         <tr>
//                             <th>Code</th>
//                             <th>Position</th>
//                             <th>Candidates</th>
//                             <th>Deadline</th>
//                             <th>Status</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         <tr>
//                             <td>CAB235</td>
//                             <td>Senior Business Developer</td>
//                             <td><div className="avatars"><img src="https://i.pravatar.cc/30?img=1" alt="" /><span>2+</span></div></td>
//                             <td>29/05/2025</td>
//                             <td><span className="status pending">Pending</span></td>
//                         </tr>
//                         <tr>
//                             <td>FBD114</td>
//                             <td>Senior Python Developer</td>
//                             <td><div className="avatars"><img src="https://i.pravatar.cc/30?img=2" alt="" /><span>3+</span></div></td>
//                             <td>30/05/2025</td>
//                             <td><span className="status pending">Pending</span></td>
//                         </tr>
//                         <tr>
//                             <td>HKD099</td>
//                             <td>Junior Project Manager</td>
//                             <td><div className="avatars"><img src="https://i.pravatar.cc/30?img=3" alt="" /></div></td>
//                             <td>12/06/2025</td>
//                             <td><span className="status pending">Pending</span></td>
//                         </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </section>
//             {/* Section 4: Project Summary */}
//             <section className="dashboard-section">
//                 <div className="card">
//                     <h2 className="section-title">PROJECT SUMMARY</h2>
//                     <table className="onboarding-table">
//                         <thead>
//                         <tr>
//                             <th>Project Name</th>
//                             <th>Manager</th>
//                             <th>Team Members</th>
//                             <th>Status</th>
//                             <th>Deadline</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         <tr>
//                             <td>HRMS Revamp</td>
//                             <td>Ravi Kumar</td>
//                             <td>
//                                 <div className="avatars">
//                                     <img src="https://i.pravatar.cc/30?img=8" alt="" />
//                                     <img src="https://i.pravatar.cc/30?img=9" alt="" />
//                                     <span>+3</span>
//                                 </div>
//                             </td>
//                             <td><span className="status pending">In Progress</span></td>
//                             <td>31/08/2025</td>
//                         </tr>
//                         <tr>
//                             <td>Payroll Automation</td>
//                             <td>Anjali Mehta</td>
//                             <td>
//                                 <div className="avatars">
//                                     <img src="https://i.pravatar.cc/30?img=12" alt="" />
//                                     <img src="https://i.pravatar.cc/30?img=13" alt="" />
//                                 </div>
//                             </td>
//                             <td><span className="status completed">Completed</span></td>
//                             <td>15/07/2025</td>
//                         </tr>
//                         <tr>
//                             <td>Onboarding Portal</td>
//                             <td>Karthik Reddy</td>
//                             <td>
//                                 <div className="avatars">
//                                     <img src="https://i.pravatar.cc/30?img=5" alt="" />
//                                     <span>+1</span>
//                                 </div>
//                             </td>
//                             <td><span className="status delayed">Delayed</span></td>
//                             <td>22/07/2025</td>
//                         </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </section>
//             {/* Section 5: Payroll Summary */}
//             <section className="dashboard-section">
//                 <div className="card">
//                     <h2 className="section-title">PAYROLL SUMMARY</h2>
//                     <div className="payroll-stats">
//                         <div className="payroll-item">
//                             <h4>Total Salary Paid</h4>
//                             <p className="amount">₹12,45,000</p>
//                         </div>
//                         <div className="payroll-item">
//                             <h4>Pending Payments</h4>
//                             <p className="amount text-yellow">₹1,15,000</p>
//                         </div>
//                         <div className="payroll-item">
//                             <h4>Salary Cycle</h4>
//                             <p>1st - 5th Every Month</p>
//                         </div>
//                     </div>
//
//                     <table className="onboarding-table mt-4">
//                         <thead>
//                         <tr>
//                             <th>Employee</th>
//                             <th>Department</th>
//                             <th>Net Salary</th>
//                             <th>Status</th>
//                             <th>Payment Date</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         <tr>
//                             <td>Alessandra Fox</td>
//                             <td>HR</td>
//                             <td>₹42,000</td>
//                             <td><span className="status completed">Paid</span></td>
//                             <td>02/07/2025</td>
//                         </tr>
//                         <tr>
//                             <td>Karthik Reddy</td>
//                             <td>Tech</td>
//                             <td>₹55,000</td>
//                             <td><span className="status pending">Pending</span></td>
//                             <td>-</td>
//                         </tr>
//                         <tr>
//                             <td>Susan Olsen</td>
//                             <td>Finance</td>
//                             <td>₹38,500</td>
//                             <td><span className="status completed">Paid</span></td>
//                             <td>03/07/2025</td>
//                         </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </section>
//
//
//         </main>
//     );
// }
