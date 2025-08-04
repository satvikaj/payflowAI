import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import SidebarManager from '../components/SidebarManager';
import './ManagerTeamPayroll.css';

const ManagerTeamPayroll = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamPayslips, setTeamPayslips] = useState([]);
    const [teamCTCData, setTeamCTCData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('team-ctc');

    // Test connectivity function
    const testBackendConnection = async () => {
        try {
            console.log('Testing backend connection...');
            const response = await axios.get('/api/ctc-management/employees');
            console.log('Backend connection test successful:', response.status);
            return true;
        } catch (error) {
            console.error('Backend connection test failed:', error);
            setMessage({ text: 'Cannot connect to backend server. Please ensure the server is running.', type: 'error' });
            return false;
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            const managerId = localStorage.getItem('managerId');
            console.log('Manager ID from localStorage:', managerId);
            
            if (!managerId) {
                console.error('No manager ID found in localStorage');
                setMessage({ text: 'Manager authentication required. Please login again.', type: 'error' });
                return;
            }

            // Test backend connection first
            const backendConnected = await testBackendConnection();
            if (!backendConnected) return;

            // Fetch data if backend is connected
            fetchTeamMembers();
            fetchTeamPayslips();
            fetchTeamCTC();
        };

        initializeData();
    }, []);

    const fetchTeamMembers = async () => {
        const managerId = localStorage.getItem('managerId');
        console.log('Fetching team members for manager:', managerId);
        
        try {
            setLoading(true);
            const response = await axios.get(`/api/ctc-management/manager/${managerId}/team-members`);
            console.log('Team members response:', response.data);
            setTeamMembers(response.data);
            
            // Clear any previous error messages on successful fetch
            if (message.type === 'error' && message.text.includes('members')) {
                setMessage({ text: '', type: '' });
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setMessage({ text: 'Failed to fetch team members', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamPayslips = async () => {
        const managerId = localStorage.getItem('managerId');
        console.log('Fetching team payslips for manager:', managerId);
        
        try {
            setLoading(true);
            const response = await axios.get(`/api/ctc-management/manager/${managerId}/team-payslips`);
            console.log('Team payslips response:', response.data);
            setTeamPayslips(response.data);
            
            // Clear any previous error messages on successful fetch
            if (message.type === 'error' && message.text.includes('payslips')) {
                setMessage({ text: '', type: '' });
            }
        } catch (error) {
            console.error('Error fetching team payslips:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setMessage({ text: 'Failed to fetch team payslips', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamCTC = async () => {
        const managerId = localStorage.getItem('managerId');
        console.log('Fetching team CTC for manager:', managerId);
        
        try {
            setLoading(true);
            const response = await axios.get(`/api/ctc-management/manager/${managerId}/team-ctc`);
            console.log('Team CTC response:', response.data);
            setTeamCTCData(response.data);
            
            // Clear any previous error messages on successful fetch
            if (message.type === 'error' && message.text.includes('CTC')) {
                setMessage({ text: '', type: '' });
            }
        } catch (error) {
            console.error('Error fetching team CTC data:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setMessage({ text: 'Failed to fetch team CTC data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const downloadPayslip = async (payslipId) => {
        try {
            const response = await axios.get(`/api/ctc-management/payslip/${payslipId}/download`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payslip_${payslipId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading payslip:', error);
            setMessage({ text: 'Failed to download payslip', type: 'error' });
        }
    };

    const formatCurrency = (amount) => {
        // Handle null, undefined, empty string, or NaN values
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || amount === null || amount === undefined || amount === '') {
            return '₹0.00';
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(numericAmount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return '#4CAF50';
            case 'PENDING': return '#FF9800';
            case 'DRAFT': return '#2196F3';
            case 'ACTIVE': return '#4CAF50';
            case 'REVISED': return '#FF9800';
            default: return '#666';
        }
    };

    return (
        <div className="manager-dashboard-layout">
            <SidebarManager />
            <div className="manager-team-payroll">
                <div className="manager-payroll-header">
                    <div>
                        <h1>Team CTC & Payroll Overview</h1>
                        <p>View your team's compensation and payroll information</p>
                    </div>
                    <button 
                        className="refresh-btn"
                        onClick={() => {
                            fetchTeamMembers();
                            fetchTeamPayslips();
                            fetchTeamCTC();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh Data'}
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'team-ctc' ? 'active' : ''}`}
                        onClick={() => setActiveTab('team-ctc')}
                    >
                        Team CTC Overview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'team-payslips' ? 'active' : ''}`}
                        onClick={() => setActiveTab('team-payslips')}
                    >
                        Team Payslips
                    </button>
                </div>

                <div className="manager-payroll-content">
                    {loading && (
                        <div className="loading-indicator">
                            <p>Loading team data...</p>
                        </div>
                    )}
                    
                    {activeTab === 'team-ctc' && (
                        <div className="team-ctc-section">
                            <h3>Team CTC Overview</h3>
                            {teamCTCData.length > 0 ? (
                                <div className="ctc-table">
                                    <div className="ctc-table-header">
                                        <div className="ctc-header-item">Employee Name</div>
                                        <div className="ctc-header-item">Employee ID</div>
                                        <div className="ctc-header-item">Basic Salary</div>
                                        <div className="ctc-header-item">HRA</div>
                                        <div className="ctc-header-item">Travel Allow.</div>
                                        <div className="ctc-header-item">Medical Allow.</div>
                                        <div className="ctc-header-item">Other Allow.</div>
                                        <div className="ctc-header-item">Total CTC</div>
                                        <div className="ctc-header-item">Status</div>
                                    </div>
                                    <div className="ctc-table-body">
                                        {teamCTCData.map(member => (
                                            <div key={member.employeeId} className="ctc-table-row">
                                                <div className="ctc-table-item">
                                                    <span className="employee-name">{member.employeeName || `Employee ${member.employeeId}`}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="employee-id">ID: {member.employeeId}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="breakdown-amount">{formatCurrency(member.basicSalary)}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="breakdown-amount">{formatCurrency(member.hra)}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="breakdown-amount">{formatCurrency(member.travelAllowance)}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="breakdown-amount">{formatCurrency(member.medicalAllowance)}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="breakdown-amount">{formatCurrency(member.otherAllowances)}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span className="ctc-amount">{formatCurrency(member.totalCtc)}</span>
                                                </div>
                                                <div className="ctc-table-item">
                                                    <span 
                                                        className="status-badge"
                                                        style={{ backgroundColor: getStatusColor(member.status) }}
                                                    >
                                                        {member.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No team CTC data available</p>
                                    <p style={{fontSize: '0.9rem', color: '#888', marginTop: '0.5rem'}}>
                                        This could mean no CTC structures have been created yet, or your team members haven't been assigned CTC details.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'team-payslips' && (
                        <div className="team-payslips-section">
                            <h3>Team Payslips</h3>
                            {teamPayslips.length > 0 ? (
                                <div className="payslips-table">
                                    <div className="payslips-header">
                                        <div className="header-item">Employee</div>
                                        <div className="header-item">Period</div>
                                        <div className="header-item">Status</div>
                                        <div className="header-item">Gross Salary</div>
                                        <div className="header-item">Deductions</div>
                                        <div className="header-item">Net Pay</div>
                                        <div className="header-item">Actions</div>
                                    </div>
                                    
                                    <div className="payslips-list">
                                        {teamPayslips.map(payslip => (
                                            <div key={payslip.payslipId} className="payslip-row">
                                                <div className="row-item">
                                                    <span className="employee-name">
                                                        {payslip.employeeName || `ID: ${payslip.employeeId}`}
                                                    </span>
                                                </div>
                                                
                                                <div className="row-item">
                                                    <div className="period-info">
                                                        <span className="month">{payslip.month}</span>
                                                        <span className="year">{payslip.year}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="row-item">
                                                    <span 
                                                        className="status-badge"
                                                        style={{ backgroundColor: getStatusColor(payslip.status) }}
                                                    >
                                                        {payslip.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="row-item">
                                                    <span className="amount">{formatCurrency(payslip.grossSalary)}</span>
                                                </div>
                                                
                                                <div className="row-item">
                                                    <span className="amount deduction-amount">{formatCurrency(payslip.totalDeductions)}</span>
                                                </div>
                                                
                                                <div className="row-item">
                                                    <span className="net-amount">{formatCurrency(payslip.netPay)}</span>
                                                </div>
                                                
                                                <div className="row-item">
                                                    <button
                                                        className="download-btn-compact"
                                                        onClick={() => downloadPayslip(payslip.payslipId)}
                                                        title="Download PDF"
                                                    >
                                                        📄 Download
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No team payslips available</p>
                                    <p style={{fontSize: '0.9rem', color: '#888', marginTop: '0.5rem'}}>
                                        This could mean no payslips have been generated yet, or your team members don't have payroll data.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerTeamPayroll;
