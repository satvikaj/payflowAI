import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import './EmployeeCTCDashboard.css';

const EmployeeCTCDashboard = () => {
    const [employeeId] = useState(localStorage.getItem('employeeId') || 54); // Default to 54 for testing
    const [currentCTC, setCurrentCTC] = useState(null);
    const [ctcHistory, setCTCHistory] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ctc');
    const [message, setMessage] = useState({ type: '', text: '' });

    console.log('Employee CTC Dashboard - Employee ID:', employeeId); // Debug log

    useEffect(() => {
        fetchEmployeeData();
    }, [employeeId]);

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCurrentCTC(),
                fetchCTCHistory(),
                fetchPayslips()
            ]);
        } catch (error) {
            console.error('Error fetching employee data:', error);
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentCTC = async () => {
        try {
            const response = await axios.get(`/api/ctc-management/ctc/employee/${employeeId}`);
            setCurrentCTC(response.data);
        } catch (error) {
            console.error('Error fetching current CTC:', error);
        }
    };

    const fetchCTCHistory = async () => {
        try {
            const response = await axios.get(`/api/ctc-management/ctc/history/${employeeId}`);
            setCTCHistory(response.data);
        } catch (error) {
            console.error('Error fetching CTC history:', error);
        }
    };

    const fetchPayslips = async () => {
        try {
            console.log('Fetching payslips for employee ID:', employeeId);
            const response = await axios.get(`/api/ctc-management/payslip/employee/${employeeId}`);
            console.log('Payslips response:', response.data);
            setPayslips(response.data);
        } catch (error) {
            console.error('Error fetching payslips:', error);
        }
    };

    const downloadPayslip = async (payslipId) => {
        try {
            const response = await axios.get(`/api/ctc-management/payslip/download/${payslipId}`, {
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
            
            showMessage('success', 'Payslip downloaded successfully');
        } catch (error) {
            console.error('Error downloading payslip:', error);
            showMessage('error', 'Failed to download payslip');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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
            case 'ACTIVE': return '#4CAF50';
            case 'INACTIVE': return '#f44336';
            case 'GENERATED': return '#4CAF50';
            case 'SENT': return '#2196F3';
            case 'REVISED': return '#FF9800';
            default: return '#666';
        }
    };

    if (loading) {
        return (
            <div className="employee-ctc-dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employee-dashboard-layout">
            <EmployeeSidebar />
            <div className="employee-ctc-dashboard">
                <div className="dashboard-header">
                    <h1>My Compensation & Payroll</h1>
                    <p>View your CTC details and download payslips</p>
                </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'ctc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ctc')}
                >
                    CTC Information
                </button>
                <button
                    className={`tab-btn ${activeTab === 'payslips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payslips')}
                >
                    Payslips
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'ctc' && (
                    <div className="ctc-section">
                        {/* Current CTC Card */}
                        {currentCTC && (
                            <div className="current-ctc-card">
                                <div className="card-header">
                                    <h3>Current CTC Structure</h3>
                                    <span className="effective-date">
                                        Effective from: {new Date(currentCTC.effectiveFrom).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="ctc-breakdown">
                                    <div className="breakdown-grid">
                                        <div className="breakdown-item">
                                            <label>Basic Salary</label>
                                            <span className="amount">{formatCurrency(currentCTC.basicSalary)}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <label>HRA</label>
                                            <span className="amount">{formatCurrency(currentCTC.hra)}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <label>Allowances</label>
                                            <span className="amount">{formatCurrency(currentCTC.allowances)}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <label>Bonuses</label>
                                            <span className="amount">{formatCurrency(currentCTC.bonuses)}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <label>PF Contribution</label>
                                            <span className="amount">{formatCurrency(currentCTC.pfContribution)}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <label>Gratuity</label>
                                            <span className="amount">{formatCurrency(currentCTC.gratuity)}</span>
                                        </div>
                                    </div>

                                    <div className="total-ctc">
                                        <div className="total-row">
                                            <label>Total Annual CTC</label>
                                            <span className="total-amount">{formatCurrency(currentCTC.totalCtc)}</span>
                                        </div>
                                        <div className="monthly-ctc">
                                            <label>Monthly CTC</label>
                                            <span className="monthly-amount">{formatCurrency(currentCTC.totalCtc / 12)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CTC History */}
                        <div className="ctc-history-section">
                            <h3>CTC History</h3>
                            {ctcHistory.length > 0 ? (
                                <div className="history-timeline">
                                    {ctcHistory.map((ctc, index) => (
                                        <div key={ctc.ctcId} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <span className="timeline-date">
                                                        {new Date(ctc.effectiveFrom).toLocaleDateString()}
                                                    </span>
                                                    <span 
                                                        className="timeline-status"
                                                        style={{ backgroundColor: getStatusColor(ctc.status) }}
                                                    >
                                                        {ctc.status}
                                                    </span>
                                                </div>
                                                <div className="timeline-details">
                                                    <div className="detail-grid">
                                                        <span>Total CTC: {formatCurrency(ctc.totalCtc)}</span>
                                                        <span>Basic: {formatCurrency(ctc.basicSalary)}</span>
                                                        <span>HRA: {formatCurrency(ctc.hra)}</span>
                                                    </div>
                                                    {ctc.revisionReason && (
                                                        <p className="revision-reason">
                                                            <strong>Reason:</strong> {ctc.revisionReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No CTC history available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'payslips' && (
                    <div className="payslips-section">
                        <h3>My Payslips</h3>
                        {payslips.length > 0 ? (
                            <div className="payslips-table">
                                <div className="payslips-header">
                                    <div className="header-item period">Period</div>
                                    <div className="header-item status">Status</div>
                                    <div className="header-item gross">Gross Salary</div>
                                    <div className="header-item deductions">Deductions</div>
                                    <div className="header-item net-pay">Net Pay</div>
                                    <div className="header-item actions">Actions</div>
                                </div>
                                
                                <div className="payslips-list">
                                    {payslips.map(payslip => (
                                        <div key={payslip.payslipId} className="payslip-row">
                                            <div className="row-item period">
                                                <div className="period-info">
                                                    <span className="month">{payslip.month}</span>
                                                    <span className="year">{payslip.year}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="row-item status">
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(payslip.status) }}
                                                >
                                                    {payslip.status}
                                                </span>
                                            </div>
                                            
                                            <div className="row-item gross">
                                                <span className="amount">{formatCurrency(payslip.grossSalary)}</span>
                                            </div>
                                            
                                            <div className="row-item deductions">
                                                <span className="amount deduction-amount">{formatCurrency(payslip.totalDeductions)}</span>
                                            </div>
                                            
                                            <div className="row-item net-pay">
                                                <span className="net-amount">{formatCurrency(payslip.netPay)}</span>
                                            </div>
                                            
                                            <div className="row-item actions">
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
                                <p>No payslips available yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default EmployeeCTCDashboard;
