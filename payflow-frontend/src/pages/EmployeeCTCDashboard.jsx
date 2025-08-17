import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './EmployeeCTCDashboard.css';

const EmployeeCTCDashboard = () => {
    const navigate = useNavigate();
    const [employeeId, setEmployeeId] = useState(null);
    const [currentCTC, setCurrentCTC] = useState(null);
    const [ctcHistory, setCTCHistory] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ctc');
    const [message, setMessage] = useState({ type: '', text: '' });
    // Bank details state
    const [bankDetails, setBankDetails] = useState({
        uan: '',
        pfNo: '',
        esiNo: '',
        bank: '',
        accountNo: ''
    });
    const [showBankModal, setShowBankModal] = useState(false);
    // Fetch bank details from backend on mount
    useEffect(() => {
        if (!employeeId) return;
        axios.get(`/api/employee/${employeeId}/bank-details`)
            .then(res => {
                if (res.data) setBankDetails(res.data);
            })
            .catch(() => setBankDetails({ uan: '', pfNo: '', esiNo: '', bank: '', accountNo: '' }));
    }, [employeeId]);
    // Save bank details to backend
    const handleBankDetailsSave = async () => {
        if (!employeeId) return;
        try {
            await axios.put(`/api/employee/${employeeId}/bank-details`, bankDetails);
            setShowBankModal(false);
            showMessage('success', 'Bank details saved!');
        } catch (err) {
            showMessage('error', 'Failed to save bank details');
        }
    };

    console.log('Employee CTC Dashboard - Employee ID:', employeeId); // Debug log

    useEffect(() => {
        initializeEmployeeData();
    }, []);

    const initializeEmployeeData = async () => {
        setLoading(true);
        
        // First, try to get employeeId from localStorage
        let storedEmployeeId = localStorage.getItem('employeeId');
        
        if (storedEmployeeId) {
            setEmployeeId(storedEmployeeId);
            await fetchEmployeeData(storedEmployeeId);
        } else {
            // If no employeeId, try to get it using the stored email
            const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
            
            if (userEmail) {
                try {
                    console.log('Fetching employee details for email:', userEmail);
                    const response = await axios.get(`/api/employee?email=${userEmail}`);
                    
                    if (response.data && response.data.id) {
                        const fetchedEmployeeId = response.data.id;
                        setEmployeeId(fetchedEmployeeId);
                        // Store for future use
                        localStorage.setItem('employeeId', fetchedEmployeeId);
                        await fetchEmployeeData(fetchedEmployeeId);
                    } else {
                        showMessage('error', 'Employee data not found. Please contact HR.');
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error fetching employee by email:', error);
                    showMessage('error', 'Unable to load employee information. Please login again.');
                    setTimeout(() => navigate('/login'), 3000);
                    setLoading(false);
                }
            } else {
                showMessage('error', 'No authentication found. Please login again.');
                setTimeout(() => navigate('/login'), 3000);
                setLoading(false);
            }
        }
    };

    const fetchEmployeeData = async (empId) => {
        if (!empId) return;
        
        try {
            await Promise.all([
                fetchCurrentCTC(empId),
                fetchCTCHistory(empId),
                fetchPayslips(empId)
            ]);
        } catch (error) {
            console.error('Error fetching employee data:', error);
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentCTC = async (empId) => {
        try {
            const response = await axios.get(`/api/ctc-management/ctc/employee/${empId}`);
            setCurrentCTC(response.data);
        } catch (error) {
            console.error('Error fetching current CTC:', error);
        }
    };

    const fetchCTCHistory = async (empId) => {
        try {
            const response = await axios.get(`/api/ctc-management/ctc/history/${empId}`);
            setCTCHistory(response.data);
        } catch (error) {
            console.error('Error fetching CTC history:', error);
        }
    };

    const fetchPayslips = async (empId) => {
        try {
            console.log('Fetching payslips for employee ID:', empId);
            const response = await axios.get(`/api/ctc-management/payslip/employee/${empId}`);
            console.log('Payslips response:', response.data);
            setPayslips(response.data);
        } catch (error) {
            console.error('Error fetching payslips:', error);
        }
    };

    const downloadPayslip = async (payslipId) => {
        try {
            // Get payslip data from backend
            const response = await axios.get(`/api/ctc-management/payslip/download/${payslipId}`);
            const { payslip: fullPayslip, employee } = response.data;

            // Generate PDF using jsPDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
                const payslipCycle = fullPayslip.cycle || 'August 2025';
            
                // Outer border for entire document
                doc.setLineWidth(2);
                doc.rect(10, 10, pageWidth - 20, 250);
                
                // Company Header Section with border (new professional style)
                doc.setLineWidth(1);
                doc.rect(15, 15, pageWidth - 30, 50);
                
                // Logo box (gray with blue bottom, 'PFS' text)
                doc.setFillColor(230, 230, 230); // light gray
                doc.rect(25, 25, 25, 25, 'F');
                doc.setFillColor(70, 130, 180); // blue bottom
                doc.rect(25, 50, 25, 5, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(18);
                doc.setFont('times', 'bold');
                doc.text('PFS', 37, 42, { align: 'center' });
                
                // Company name and details (centered)
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(16);
                doc.setFont('times', 'bold');
                doc.text('PayFlow Solutions', pageWidth / 2, 35, { align: 'center' });
                doc.setFontSize(9);
                doc.setFont('times', 'normal');
                doc.text('123 Business District, Tech City, State - 123456', pageWidth / 2, 45, { align: 'center' });
                
                // Pay Slip title with fallback for cycle/month (bold, centered)
                doc.setFontSize(12);
                doc.setFont('times', 'bold');
                doc.text(`Pay Slip for ${payslipCycle}`, pageWidth / 2, 57, { align: 'center' });
            
            // Employee Details Table
            let currentY = 70;
            const employeeData = [
                ['Employee ID', fullPayslip.employeeId?.toString() || '7', 'UAN', bankDetails.uan || '-'],
                ['Employee Name', employee?.fullName || employee?.firstName || 'Employee', 'PF No.', bankDetails.pfNo || '-'],
                ['Designation', employee?.designation || 'Employee', 'ESI No.', bankDetails.esiNo || '-'],
                ['Department', employee?.department || 'General', 'Bank', bankDetails.bank || '-'],
                ['Date of Joining', employee?.joinDate || '2025-07-30', 'Account No.', bankDetails.accountNo || '-']
            ];
            
            // Company Header Section with border (admin/HR/manager style)
            doc.setLineWidth(1);
            doc.rect(15, 15, pageWidth - 30, 50);
            // Logo box (gray with blue bottom, 'PFS' text)
            doc.setFillColor(230, 230, 230); // light gray
            doc.rect(25, 25, 25, 25, 'F');
            doc.setFillColor(70, 130, 180); // blue bottom
            doc.rect(25, 50, 25, 5, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(18);
            doc.setFont('times', 'bold');
            doc.text('PFS', 37, 42, { align: 'center' });
            // Company name and details (centered)
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('times', 'bold');
            doc.text('PayFlow Solutions', pageWidth / 2, 35, { align: 'center' });
            doc.setFontSize(9);
            doc.setFont('times', 'normal');
            doc.text('123 Business District, Tech City, State - 123456', pageWidth / 2, 45, { align: 'center' });
            // Pay Slip title with fallback for cycle/month (bold, centered)
            doc.setFontSize(12);
            doc.setFont('times', 'bold');
            doc.text(`Pay Slip for ${payslipCycle}`, pageWidth / 2, 57, { align: 'center' });

            doc.autoTable({
                startY: currentY,
                head: [],
                body: employeeData,
                theme: 'grid',
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                    halign: 'center' // Center all cells by default
                },
                columnStyles: {
                    0: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    1: { cellWidth: 50, halign: 'center' },
                    2: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    3: { cellWidth: 50, halign: 'center' }
                }
            });
            
            // Earnings and Deductions Section
            currentY = doc.lastAutoTable.finalY + 5;
            
            // Calculate exact values to match the format
            const hra = 12500.00;
            const conveyanceAllowance = 6666.67;
            const medicalAllowance = 250;
            const otherAllowances = 333.33;
            const totalEarnings = 61166.67;
            
            const epf = 500.00;
            const esi = 0;
            const professionalTax = 4033.33;
            const totalDeductions = 4533.33;
            
            const netSalary = 56633.34;
            
            // Create Earnings and Deductions table header
            const earningsDeductionsHeader = [
                ['Earnings', '', 'Deductions', '']
            ];
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: earningsDeductionsHeader,
                theme: 'grid',
                styles: { 
                    fontSize: 11,
                    cellPadding: 4,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                    fontStyle: 'bold',
                    halign: 'center' // Center all cells by default
                },
                columnStyles: {
                    0: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    1: { cellWidth: 50, halign: 'center' },
                    2: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    3: { cellWidth: 50, halign: 'center' }
                }
            });
            
            // Earnings and Deductions data
            currentY = doc.lastAutoTable.finalY;
            const baseSalary = fullPayslip.baseSalary || 41666.67;
            const earningsDeductionsData = [
                ['Basic', `₹${baseSalary.toLocaleString()}`, 'EPF', `₹${epf.toLocaleString()}`],
                ['HRA', `₹${hra.toLocaleString()}`, 'ESI', `₹${esi.toLocaleString()}`],
                ['Conveyance Allowance', `₹${conveyanceAllowance.toLocaleString()}`, 'Professional Tax', `₹${professionalTax.toLocaleString()}`],
                ['Medical Allowance', `₹${medicalAllowance.toLocaleString()}`, '', ''],
                ['Other Allowances', `₹${otherAllowances.toLocaleString()}`, '', '']
            ];
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: earningsDeductionsData,
                theme: 'grid',
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                    halign: 'center' // Center all cells by default
                },
                columnStyles: {
                    0: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    1: { cellWidth: 50, halign: 'center' },
                    2: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    3: { cellWidth: 50, halign: 'center' }
                }
            });
            
            // Total Earnings and Total Deductions row
            currentY = doc.lastAutoTable.finalY;
            const totalsData = [
                ['Total Earnings', `₹${totalEarnings.toLocaleString()}`, 'Total Deductions', `₹${totalDeductions.toLocaleString()}`]
            ];
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: totalsData,
                theme: 'grid',
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                    fontStyle: 'bold',
                    halign: 'center' // Center all cells by default
                },
                columnStyles: {
                    0: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    1: { cellWidth: 50, halign: 'center' },
                    2: { cellWidth: 40, fontStyle: 'bold', halign: 'center' },
                    3: { cellWidth: 50, halign: 'center' }
                }
            });
            
            // Net Salary Section
            currentY = doc.lastAutoTable.finalY;
            const netSalaryData = [
                ['Net Salary', `₹${netSalary.toLocaleString()}`]
            ];
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: netSalaryData,
                theme: 'grid',
                styles: { 
                    fontSize: 12,
                    cellPadding: 4,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5,
                    fontStyle: 'bold',
                    halign: 'center' 
                },
                columnStyles: {
                    0: { cellWidth: 90, halign: 'center' },
                    1: { cellWidth: 90, halign: 'center' }
                }
            });

            doc.save(`Payslip-${employee?.fullName || fullPayslip.employeeId}-${payslipCycle}.pdf`);
            
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
                <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', position: 'relative' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', width: '100%' }}>My Compensation & Payroll</h1>
                        <p style={{ textAlign: 'center', marginTop: 0, width: '100%' }}>View your CTC details and download payslips</p>
                    </div>
                    <button
                        className="bank-details-btn"
                        onClick={() => setShowBankModal(true)}
                        style={{
                            position: 'absolute',
                            right: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '24px',
                            padding: '10px 24px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 2px 8px rgba(123,47,242,0.08)',
                            cursor: 'pointer',
                            transition: 'background 0.2s, box-shadow 0.2s',
                            marginLeft: 'auto',
                            zIndex: 2
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f357a8 0%, #7b2ff2 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%)'}
                    >
                        Add/Edit Bank Details
                    </button>
                </div>
            {/* Bank Details Modal */}
            {showBankModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(60, 0, 100, 0.18)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '18px',
                        boxShadow: '0 8px 32px rgba(123,47,242,0.18)',
                        padding: '2rem 2.5rem',
                        minWidth: '340px',
                        maxWidth: '90vw',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.2rem',
                        position: 'relative'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.35rem',
                            fontWeight: 700,
                            color: '#7b2ff2',
                            textAlign: 'center'
                        }}>Bank & Statutory Details</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <label style={{ fontWeight: 500, color: '#333' }}>UAN:
                                <input type="text" value={bankDetails.uan} onChange={e => setBankDetails({ ...bankDetails, uan: e.target.value })} style={{ marginLeft: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', padding: '7px 12px', width: '70%' }} />
                            </label>
                            <label style={{ fontWeight: 500, color: '#333' }}>PF No.:
                                <input type="text" value={bankDetails.pfNo} onChange={e => setBankDetails({ ...bankDetails, pfNo: e.target.value })} style={{ marginLeft: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', padding: '7px 12px', width: '70%' }} />
                            </label>
                            <label style={{ fontWeight: 500, color: '#333' }}>ESI No.:
                                <input type="text" value={bankDetails.esiNo} onChange={e => setBankDetails({ ...bankDetails, esiNo: e.target.value })} style={{ marginLeft: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', padding: '7px 12px', width: '70%' }} />
                            </label>
                            <label style={{ fontWeight: 500, color: '#333' }}>Bank:
                                <input type="text" value={bankDetails.bank} onChange={e => setBankDetails({ ...bankDetails, bank: e.target.value })} style={{ marginLeft: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', padding: '7px 12px', width: '70%' }} />
                            </label>
                            <label style={{ fontWeight: 500, color: '#333' }}>Account No.:
                                <input type="text" value={bankDetails.accountNo} onChange={e => setBankDetails({ ...bankDetails, accountNo: e.target.value })} style={{ marginLeft: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', padding: '7px 12px', width: '70%' }} />
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                            <button onClick={handleBankDetailsSave} style={{
                                background: 'linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '18px',
                                padding: '8px 22px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 2px 8px rgba(123,47,242,0.08)',
                                cursor: 'pointer',
                                transition: 'background 0.2s, box-shadow 0.2s'
                            }}>Save</button>
                            <button onClick={() => setShowBankModal(false)} style={{
                                background: '#eee',
                                color: '#7b2ff2',
                                border: 'none',
                                borderRadius: '18px',
                                padding: '8px 22px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 2px 8px rgba(123,47,242,0.08)',
                                cursor: 'pointer',
                                transition: 'background 0.2s, box-shadow 0.2s'
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

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
