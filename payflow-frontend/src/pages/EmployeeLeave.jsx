import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import './EmployeeDashboard.css';
import './EmployeeLeave.css';
import { FaClipboardList, FaHistory, FaPlusCircle } from 'react-icons/fa';

const EmployeeLeave = () => {
    const email = localStorage.getItem('userEmail');
    const [leaveHistory, setLeaveHistory] = useState([]);
    const totalLeaves = 12;
    // Calculate used leaves: count all ACCEPTED leaves, sum their days (or just count as 1 per leave if not tracking days)
    const usedLeaves = useMemo(() => {
        return leaveHistory.filter(l => l.status === 'ACCEPTED').length;
    }, [leaveHistory]);
    const remainingLeaves = totalLeaves - usedLeaves;
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState('');
    const [leaveSuccess, setLeaveSuccess] = useState('');

    useEffect(() => {
        if (email) {
            axios.get(`http://localhost:8080/api/employee/leave/history?email=${email}`)
                .then(res => {
                    setLeaveHistory(res.data || []);
                })
                .catch(() => {
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
        axios.post('http://localhost:8080/api/employee/leave/apply', {
            email,
            type: 'Annual', // or use a dropdown for type selection
            startDate: leaveForm.startDate,
            endDate: leaveForm.endDate,
            reason: leaveForm.reason
        })
            .then(res => {
                setLeaveSuccess('Leave request submitted successfully!');
                setLeaveError('');
                setLeaveForm({ startDate: '', endDate: '', reason: '' });
                return axios.get(`http://localhost:8080/api/employee/leave/history?email=${email}`);
            })
            .then(res => {
                setLeaveHistory(res.data || []);
            })
            .catch(err => {
                setLeaveError('Failed to submit leave request.');
                setLeaveSuccess('');
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
                            <div><b>Total</b><div className="leave-summary-value total">{totalLeaves}</div></div>
                            <div><b>Used</b><div className="leave-summary-value used">{usedLeaves}</div></div>
                            <div><b>Remaining</b><div className="leave-summary-value remaining">{remainingLeaves}</div></div>
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
                        <table className="leave-history-table" style={{width:'100%', borderCollapse:'collapse', marginTop:16, background:'#fff', borderRadius:8, overflow:'hidden', boxShadow:'0 2px 8px #eee'}}>
                            <thead style={{background:'#f5f6fa'}}>
                                <tr>
                                    <th style={{padding:'10px 16px', borderBottom:'1px solid #e0e0e0'}}>Start Date</th>
                                    <th style={{padding:'10px 16px', borderBottom:'1px solid #e0e0e0'}}>End Date</th>
                                    <th style={{padding:'10px 16px', borderBottom:'1px solid #e0e0e0'}}>Status</th>
                                    <th style={{padding:'10px 16px', borderBottom:'1px solid #e0e0e0'}}>Employee Reason</th>
                                    <th style={{padding:'10px 16px', borderBottom:'1px solid #e0e0e0'}}>Manager Denial Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveHistory.map((leave, idx) => (
                                    <tr key={idx} style={{background: idx % 2 === 0 ? '#fafbfc' : '#fff'}}>
                                        <td style={{padding:'8px 16px', borderBottom:'1px solid #f0f0f0'}}>{leave.fromDate}</td>
                                        <td style={{padding:'8px 16px', borderBottom:'1px solid #f0f0f0'}}>{leave.toDate}</td>
                                        <td style={{padding:'8px 16px', borderBottom:'1px solid #f0f0f0'}}><b>{leave.status}</b></td>
                                        <td style={{padding:'8px 16px', borderBottom:'1px solid #f0f0f0'}}>{leave.reason || '-'}</td>
                                        <td style={{padding:'8px 16px', borderBottom:'1px solid #f0f0f0'}}>{leave.denialReason || '-'}</td>
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
