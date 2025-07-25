import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import './EmployeeDashboard.css';
import './EmployeeLeave.css';
import { FaClipboardList, FaHistory, FaPlusCircle } from 'react-icons/fa';

const EmployeeLeave = () => {
    const email = localStorage.getItem('userEmail');
    const [leaveSummary, setLeaveSummary] = useState({ total: 12, used: 0, remaining: 12 });
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState('');
    const [leaveSuccess, setLeaveSuccess] = useState('');

    useEffect(() => {
        if (email) {
            axios.get(`http://localhost:8080/api/leave/summary?email=${email}`)
                .then(res => {
                    setLeaveSummary(res.data.summary);
                    setLeaveHistory(res.data.history || []);
                })
                .catch(() => {
                    setLeaveSummary({ total: 12, used: 0, remaining: 12 });
                    setLeaveHistory([]);
                });
        }
    }, [email]);

    const handleLeaveFormChange = (e) => {
        setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
    };

    const handleLeaveApply = (e) => {
        e.preventDefault();
        setLeaveLoading(true);
        setLeaveError('');
        setLeaveSuccess('');
        axios.post('http://localhost:8080/api/leave/apply', {
            email,
            ...leaveForm
        })
            .then(res => {
                setLeaveSuccess('Leave request submitted successfully!');
                setLeaveForm({ startDate: '', endDate: '', reason: '' });
                return axios.get(`http://localhost:8080/api/leave/summary?email=${email}`);
            })
            .then(res => {
                setLeaveSummary(res.data.summary);
                setLeaveHistory(res.data.history || []);
            })
            .catch(err => {
                setLeaveError('Failed to submit leave request.');
            })
            .finally(() => setLeaveLoading(false));
    };

    return (
        <div className="employee-leave-layout">
            <EmployeeSidebar />
            <div className="employee-leave-content">
                <h2 className="leave-page-title"><FaClipboardList style={{marginRight:8}}/>Leave Management</h2>
                <div className="leave-top-row">
                    <div className="leave-summary-card dashboard-card leave-card">
                        <h3><FaClipboardList /> Leave Summary</h3>
                        <div className="leave-summary-grid">
                            <div><b>Total</b><div className="leave-summary-value total">{leaveSummary.total}</div></div>
                            <div><b>Used</b><div className="leave-summary-value used">{leaveSummary.used}</div></div>
                            <div><b>Remaining</b><div className="leave-summary-value remaining">{leaveSummary.remaining}</div></div>
                        </div>
                    </div>
                    <div className="leave-form-card dashboard-card leave-card">
                        <h3><FaPlusCircle style={{color:'#6366f1'}}/> Apply for Leave</h3>
                        <form className="leave-apply-form" onSubmit={handleLeaveApply}>
                            <div className="form-row">
                                <label>Start Date
                                    <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveFormChange} required />
                                </label>
                                <label>End Date
                                    <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveFormChange} required />
                                </label>
                            </div>
                            <label>Reason
                                <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveFormChange} required rows={2} placeholder="Reason for leave..." />
                            </label>
                            <button className="quick-link-btn" type="submit" disabled={leaveLoading} style={{marginTop:12}}>
                                {leaveLoading ? 'Submitting...' : 'Submit Leave Request'}
                            </button>
                            {leaveError && <div className="leave-error">{leaveError}</div>}
                            {leaveSuccess && <div className="leave-success">{leaveSuccess}</div>}
                        </form>
                    </div>
                </div>
                <div className="leave-history-card dashboard-card leave-card">
                    <h3><FaHistory style={{color:'#6366f1'}}/> Leave History</h3>
                    {leaveHistory.length === 0 ? (
                        <p className="leave-history-empty">No leave records found.</p>
                    ) : (
                        <table className="leave-history-table">
                            <thead>
                                <tr>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveHistory.map((leave, idx) => (
                                    <tr key={idx}>
                                        <td>{leave.startDate}</td>
                                        <td>{leave.endDate}</td>
                                        <td><b>{leave.status}</b></td>
                                        <td>{leave.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeLeave;
