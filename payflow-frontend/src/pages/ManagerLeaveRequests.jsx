import React, { useEffect, useState } from 'react';
import SidebarManager from '../components/SidebarManager';
import axios from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';

function ManagerLeaveRequests() {
    const { managerId: routeManagerId } = useParams();
    const navigate = useNavigate();
    // Use managerId from route params if available, else from localStorage
    const managerId = routeManagerId || localStorage.getItem('managerId');
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [denyingId, setDenyingId] = useState(null);
    const [denyReason, setDenyReason] = useState('');

    // If managerId is not set, redirect to login
    useEffect(() => {
        if (!managerId) {
            navigate('/manager-login');
        }
    }, [managerId, navigate]);

    useEffect(() => {
        console.log('ManagerLeaveRequests: managerId used for API call:', managerId);
        setLoading(true);
        axios.get(`/manager/${managerId}/leaves`)
            .then(res => setLeaves(res.data))
            .catch(() => setLeaves([]))
            .finally(() => setLoading(false));
    }, [managerId]);

    const handleAction = async (leaveId, action) => {
        try {
            await axios.post(`/employee/leave/${leaveId}/action`, { action });
            setLeaves(leaves => leaves.map(l => l.id === leaveId ? { ...l, status: action === 'ACCEPT' ? 'ACCEPTED' : 'DENIED' } : l));
            setDenyingId(null);
            setDenyReason('');
            alert(`Leave request ${action === 'ACCEPT' ? 'accepted' : 'denied'}`);
        } catch (err) {
            alert('Error updating leave status');
        }
    };

    const handleDeny = async (e, leaveId) => {
        e.preventDefault();
        try {
            await axios.post(`/employee/leave/${leaveId}/action`, { action: 'DENY', reason: denyReason });
            setLeaves(leaves => leaves.map(l => l.id === leaveId ? { ...l, status: 'DENIED', denialReason: denyReason } : l));
            setDenyingId(null);
            setDenyReason('');
            alert('Leave request denied');
        } catch (err) {
            alert('Error denying leave request');
        }
    };

    return (
        <div className="manager-dashboard-layout">
            <SidebarManager />
            <main className="manager-dashboard-main">
                <h2>Leave Requests</h2>
                {loading ? <div>Loading...</div> : (
                    leaves.length === 0 ? <div>No leave requests found.</div> : (
                        <div className="leave-requests-cards">
                            {leaves.map((leave, idx) => (
                                <div className="leave-request-card" key={leave.id || idx} style={{border:'1px solid #ccc', borderRadius:8, padding:20, marginBottom:20, boxShadow:'0 2px 8px #eee'}}>
                                    <div><strong>Employee:</strong> {leave.employeeName || leave.employeeId}</div>
                                    <div><strong>Type:</strong> {leave.type || '-'}</div>
                                    <div><strong>Employee Reason:</strong> {leave.reason || '-'}</div>
                                    {leave.status === 'DENIED' && (
                                        <div><strong>Manager Denial Reason:</strong> {leave.denialReason || '-'}</div>
                                    )}
                                    <div><strong>Start Date:</strong> {leave.fromDate}</div>
                                    <div><strong>End Date:</strong> {leave.toDate}</div>
                                    <div><strong>Status:</strong> {leave.status}</div>
                                    {leave.status === 'PENDING' && (
                                        <div style={{marginTop:12}}>
                                            <button style={{marginRight:8, background:'#4caf50', color:'#fff', border:'none', padding:'6px 16px', borderRadius:4, cursor:'pointer'}} onClick={() => handleAction(leave.id, 'ACCEPT')}>Accept</button>
                                            <button style={{background:'#f44336', color:'#fff', border:'none', padding:'6px 16px', borderRadius:4, cursor:'pointer'}} onClick={() => setDenyingId(leave.id)}>Deny</button>
                                        </div>
                                    )}
                                    {denyingId === leave.id && (
                                        <form style={{marginTop:12}} onSubmit={e => handleDeny(e, leave.id)}>
                                            <input type="text" placeholder="Enter denial reason" value={denyReason} onChange={e => setDenyReason(e.target.value)} style={{padding:6, width:'60%', marginRight:8}} required />
                                            <button type="submit" style={{background:'#f44336', color:'#fff', border:'none', padding:'6px 16px', borderRadius:4, cursor:'pointer'}}>Submit Deny</button>
                                            <button type="button" style={{marginLeft:8}} onClick={() => {setDenyingId(null); setDenyReason('');}}>Cancel</button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}

export default ManagerLeaveRequests;
