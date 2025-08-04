import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin';
import Sidebar from '../components/Sidebar';
import './PayrollDashboardNew.css';

const PayrollDashboard = () => {
    const location = useLocation();
    const isHRRoute = location.pathname.includes('/manager/');
    
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [payslipData, setPayslipData] = useState({
        employeeId: '',
        payrollMonth: '',
        payrollYear: new Date().getFullYear(),
        workingDays: 22,
        attendedDays: '',
        overtime: 0,
        medicalAllowance: 0,
        travelAllowance: 0,
        professionalTax: 200,
        incomeTax: 0,
        otherDeductions: 0,
        notes: ''
    });
    const [payslips, setPayslips] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkData, setBulkData] = useState({
        payrollMonth: '',
        payrollYear: new Date().getFullYear(),
        workingDays: 22
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchEmployees();
        fetchAllPayslips();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/employee');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            showMessage('error', 'Failed to fetch employees');
        }
    };

    const fetchAllPayslips = async () => {
        try {
            console.log('Fetching payslips from: /api/ctc-management/payslip/all');
            const response = await axios.get('/api/ctc-management/payslip/all');
            console.log('Payslips response:', response.data);
            setPayslips(response.data);
        } catch (error) {
            console.error('Error fetching payslips:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPayslipData({ ...payslipData, [name]: value });
    };

    const handleBulkInputChange = (e) => {
        const { name, value } = e.target;
        setBulkData({ ...bulkData, [name]: value });
    };

    const handleEmployeeSelect = (employeeId) => {
        setSelectedEmployee(employeeId);
        setPayslipData({ ...payslipData, employeeId });
    };

    const generateIndividualPayslip = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/ctc-management/payslip/generate', payslipData);
            showMessage('success', 'Payslip generated successfully');
            resetForm();
            fetchAllPayslips();
        } catch (error) {
            console.error('Error generating payslip:', error);
            showMessage('error', error.response?.data?.message || 'Failed to generate payslip');
        } finally {
            setLoading(false);
        }
    };

    const generateBulkPayslips = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/ctc-management/payslip/generate-bulk', bulkData);
            showMessage('success', `Generated ${response.data.count} payslips successfully`);
            setBulkData({
                payrollMonth: '',
                payrollYear: new Date().getFullYear(),
                workingDays: 22
            });
            setShowBulkModal(false);
            fetchAllPayslips();
        } catch (error) {
            console.error('Error generating bulk payslips:', error);
            showMessage('error', error.response?.data?.message || 'Failed to generate bulk payslips');
        } finally {
            setLoading(false);
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
        } catch (error) {
            console.error('Error downloading payslip:', error);
            showMessage('error', 'Failed to download payslip');
        }
    };

    const viewPayslip = (payslip) => {
        setSelectedPayslip(payslip);
    };

    const resetForm = () => {
        setPayslipData({
            employeeId: '',
            payrollMonth: '',
            payrollYear: new Date().getFullYear(),
            workingDays: 22,
            attendedDays: '',
            overtime: 0,
            medicalAllowance: 0,
            travelAllowance: 0,
            professionalTax: 200,
            incomeTax: 0,
            otherDeductions: 0,
            notes: ''
        });
        setSelectedEmployee('');
        setShowModal(false);
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
            case 'GENERATED': return '#4CAF50';
            case 'SENT': return '#2196F3';
            case 'REVISED': return '#FF9800';
            default: return '#666';
        }
    };

    return (
        <div className={isHRRoute ? "hr-dashboard-layout" : "admin-dashboard-layout"}>
            {isHRRoute ? <Sidebar /> : <SidebarAdmin />}
            <div className="payroll-dashboard">
                <div className="payroll-header">
                    <h1>Payroll Dashboard</h1>
                    <p>Generate and manage employee payslips</p>
                </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="payroll-content">
                {/* Action Buttons */}
                <div className="action-buttons">
                    <button
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        Generate Individual Payslip
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowBulkModal(true)}
                    >
                        Generate Bulk Payslips
                    </button>
                </div>

                {/* Payslips Table */}
                <div className="payslips-section">
                    <h3>Recent Payslips</h3>
                    {payslips.length > 0 ? (
                        <div className="payslips-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Month/Year</th>
                                        <th>Gross Salary</th>
                                        <th>Deductions</th>
                                        <th>Net Pay</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payslips.map(payslip => (
                                        <tr key={payslip.payslipId}>
                                            <td>{payslip.employeeName || `Employee ID: ${payslip.employeeId}`}</td>
                                            <td>{payslip.month} {payslip.year}</td>
                                            <td>{formatCurrency(payslip.grossSalary)}</td>
                                            <td>{formatCurrency(payslip.totalDeductions)}</td>
                                            <td className="net-pay">{formatCurrency(payslip.netPay)}</td>
                                            <td>
                                                <span 
                                                    className="status"
                                                    style={{ backgroundColor: getStatusColor(payslip.status) }}
                                                >
                                                    {payslip.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons-small">
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => viewPayslip(payslip)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="btn-download"
                                                        onClick={() => downloadPayslip(payslip.payslipId)}
                                                    >
                                                        Download
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No payslips generated yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Payslip Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Generate Individual Payslip</h3>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={generateIndividualPayslip} className="payslip-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Employee</label>
                                    <select
                                        value={selectedEmployee}
                                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.fullName} - {emp.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Payroll Month</label>
                                    <select
                                        name="payrollMonth"
                                        value={payslipData.payrollMonth}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Month</option>
                                        {months.map((month, index) => (
                                            <option key={index} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Payroll Year</label>
                                    <input
                                        type="number"
                                        name="payrollYear"
                                        value={payslipData.payrollYear}
                                        onChange={handleInputChange}
                                        min="2020"
                                        max="2030"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Working Days</label>
                                    <input
                                        type="number"
                                        name="workingDays"
                                        value={payslipData.workingDays}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="31"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Attended Days</label>
                                    <input
                                        type="number"
                                        name="attendedDays"
                                        value={payslipData.attendedDays}
                                        onChange={handleInputChange}
                                        min="0"
                                        max={payslipData.workingDays}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Overtime Hours</label>
                                    <input
                                        type="number"
                                        name="overtime"
                                        value={payslipData.overtime}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Additional Allowances</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Medical Allowance</label>
                                        <input
                                            type="number"
                                            name="medicalAllowance"
                                            value={payslipData.medicalAllowance}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Travel Allowance</label>
                                        <input
                                            type="number"
                                            name="travelAllowance"
                                            value={payslipData.travelAllowance}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Deductions</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Professional Tax</label>
                                        <input
                                            type="number"
                                            name="professionalTax"
                                            value={payslipData.professionalTax}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Income Tax</label>
                                        <input
                                            type="number"
                                            name="incomeTax"
                                            value={payslipData.incomeTax}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Other Deductions</label>
                                    <input
                                        type="number"
                                        name="otherDeductions"
                                        value={payslipData.otherDeductions}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={payslipData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Additional notes for payslip..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate Payslip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Generation Modal */}
            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="modal bulk-modal">
                        <div className="modal-header">
                            <h3>Generate Bulk Payslips</h3>
                            <button className="close-btn" onClick={() => setShowBulkModal(false)}>×</button>
                        </div>

                        <form onSubmit={generateBulkPayslips} className="bulk-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Payroll Month</label>
                                    <select
                                        name="payrollMonth"
                                        value={bulkData.payrollMonth}
                                        onChange={handleBulkInputChange}
                                        required
                                    >
                                        <option value="">Select Month</option>
                                        {months.map((month, index) => (
                                            <option key={index} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Payroll Year</label>
                                    <input
                                        type="number"
                                        name="payrollYear"
                                        value={bulkData.payrollYear}
                                        onChange={handleBulkInputChange}
                                        min="2020"
                                        max="2030"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Working Days</label>
                                <input
                                    type="number"
                                    name="workingDays"
                                    value={bulkData.workingDays}
                                    onChange={handleBulkInputChange}
                                    min="1"
                                    max="31"
                                    required
                                />
                            </div>

                            <div className="bulk-info">
                                <p><strong>Note:</strong> This will generate payslips for all active employees with default values. Individual adjustments can be made after generation.</p>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowBulkModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate All Payslips'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payslip View Modal */}
            {selectedPayslip && (
                <div className="modal-overlay">
                    <div className="modal payslip-view-modal">
                        <div className="modal-header">
                            <h3>Payslip Details</h3>
                            <button className="close-btn" onClick={() => setSelectedPayslip(null)}>×</button>
                        </div>

                        <div className="payslip-view">
                            <div className="payslip-header-info">
                                <h4>Employee: {selectedPayslip.employeeName || `EMP-${selectedPayslip.employeeId}`}</h4>
                                <p>Pay Period: {selectedPayslip.payrollMonth} {selectedPayslip.payrollYear}</p>
                            </div>

                            <div className="payslip-details">
                                <div className="section">
                                    <h5>Earnings</h5>
                                    <div className="detail-row">
                                        <span>Basic Salary:</span>
                                        <span>{formatCurrency(selectedPayslip.basicSalary)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>HRA:</span>
                                        <span>{formatCurrency(selectedPayslip.hra)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Allowances:</span>
                                        <span>{formatCurrency(selectedPayslip.allowances)}</span>
                                    </div>
                                    <div className="detail-row total">
                                        <span>Gross Salary:</span>
                                        <span>{formatCurrency(selectedPayslip.grossSalary)}</span>
                                    </div>
                                </div>

                                <div className="section">
                                    <h5>Deductions</h5>
                                    <div className="detail-row">
                                        <span>PF Contribution:</span>
                                        <span>{formatCurrency(selectedPayslip.pfDeduction)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Professional Tax:</span>
                                        <span>{formatCurrency(selectedPayslip.professionalTax)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Income Tax:</span>
                                        <span>{formatCurrency(selectedPayslip.incomeTax)}</span>
                                    </div>
                                    <div className="detail-row total">
                                        <span>Total Deductions:</span>
                                        <span>{formatCurrency(selectedPayslip.totalDeductions)}</span>
                                    </div>
                                </div>

                                <div className="net-pay-section">
                                    <div className="detail-row net-pay-row">
                                        <span>Net Pay:</span>
                                        <span>{formatCurrency(selectedPayslip.netPay)}</span>
                                    </div>
                                </div>

                                <div className="attendance-section">
                                    <h5>Attendance</h5>
                                    <div className="detail-row">
                                        <span>Working Days:</span>
                                        <span>{selectedPayslip.workingDays}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Attended Days:</span>
                                        <span>{selectedPayslip.attendedDays}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="payslip-actions">
                                <button
                                    className="btn-download"
                                    onClick={() => downloadPayslip(selectedPayslip.payslipId)}
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default PayrollDashboard;