import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin';
import PopupMessage from '../components/PopupMessage';
import './CTCManagement.css';
import './CTCManagementNew.css';

const CTCManagementNew = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [ctcData, setCTCData] = useState({
        employeeId: '',
        annualCtc: '',
        effectiveFrom: '',
        revisionReason: '',
        createdBy: 'HR Admin'
    });
    const [ctcHistory, setCTCHistory] = useState([]);
    const [showCalculation, setShowCalculation] = useState(false);
    const [calculatedComponents, setCalculatedComponents] = useState(null);
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        fetchEmployeesForDropdown();
    }, []);

    // Handle pre-selected employee from query parameter
    useEffect(() => {
        const employeeId = searchParams.get('employeeId');
        const currentCTC = searchParams.get('currentCTC');
        
        if (employeeId && employees.length > 0) {
            const employee = employees.find(emp => emp.id === parseInt(employeeId));
            if (employee) {
                setSelectedEmployee(employee);
                setCTCData(prev => ({ 
                    ...prev, 
                    employeeId: employeeId,
                    ...(currentCTC && { annualCtc: currentCTC })
                }));
                fetchCTCHistory(employeeId);
            }
        }
    }, [employees, searchParams]);

    const fetchEmployeesForDropdown = async () => {
        try {
            const response = await axios.get('/api/ctc-management/employees/dropdown');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            showPopup('error', 'Failed to fetch employees');
        }
    };

    const fetchCTCHistory = async (employeeId) => {
        try {
            const response = await axios.get(`/api/ctc-management/ctc/history/${employeeId}`);
            setCTCHistory(response.data);
        } catch (error) {
            console.error('Error fetching CTC history:', error);
            setCTCHistory([]);
        }
    };

    const handleEmployeeSelect = (employeeId) => {
        const employee = employees.find(emp => emp.id === parseInt(employeeId));
        setSelectedEmployee(employee);
        setCTCData({ 
            ...ctcData, 
            employeeId: employeeId
        });
        setShowCalculation(false);
        setCalculatedComponents(null);
        if (employeeId) {
            fetchCTCHistory(employeeId);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCTCData({ ...ctcData, [name]: value });
        
        // Reset calculation when annual CTC changes
        if (name === 'annualCtc') {
            setShowCalculation(false);
            setCalculatedComponents(null);
        }
    };

    const calculateComponents = () => {
        const annualCtc = parseFloat(ctcData.annualCtc);
        if (!annualCtc || annualCtc <= 0) {
            showPopup('error', 'Please enter a valid Annual CTC amount');
            return;
        }

        // Calculate components based on industry standards
        const basicSalary = annualCtc * 0.40;
        const hra = basicSalary * 0.50;
        const conveyanceAllowance = 19200; // Fixed
        const medicalAllowance = 15000; // Fixed
        const performanceBonus = annualCtc * 0.10;
        const employerPfContribution = basicSalary * 0.12;
        const gratuity = basicSalary * 0.0481;
        
        const totalCalculated = basicSalary + hra + conveyanceAllowance + medicalAllowance + 
                               performanceBonus + employerPfContribution + gratuity;
        const specialAllowance = annualCtc - totalCalculated;
        
        // Monthly calculations
        const grossMonthlySalary = (basicSalary + hra + conveyanceAllowance + medicalAllowance + specialAllowance + performanceBonus) / 12;
        const employeePf = (basicSalary * 0.12) / 12;
        const professionalTax = 200;
        const monthlyGross = annualCtc / 12;
        let tds = 0;
        if (monthlyGross > 50000) {
            tds = monthlyGross * 0.10;
        } else if (monthlyGross > 25000) {
            tds = monthlyGross * 0.05;
        }
        const insurancePremium = monthlyGross * 0.01;
        const totalMonthlyDeductions = employeePf + professionalTax + tds + insurancePremium;
        const netMonthlySalary = grossMonthlySalary - totalMonthlyDeductions;

        const components = {
            // Annual components
            basicSalary: basicSalary.toFixed(2),
            hra: hra.toFixed(2),
            conveyanceAllowance: conveyanceAllowance.toFixed(2),
            medicalAllowance: medicalAllowance.toFixed(2),
            specialAllowance: specialAllowance.toFixed(2),
            performanceBonus: performanceBonus.toFixed(2),
            employerPfContribution: employerPfContribution.toFixed(2),
            gratuity: gratuity.toFixed(2),
            
            // Monthly components
            grossMonthlySalary: grossMonthlySalary.toFixed(2),
            employeePf: employeePf.toFixed(2),
            professionalTax: professionalTax.toFixed(2),
            tds: tds.toFixed(2),
            insurancePremium: insurancePremium.toFixed(2),
            totalMonthlyDeductions: totalMonthlyDeductions.toFixed(2),
            netMonthlySalary: netMonthlySalary.toFixed(2)
        };

        setCalculatedComponents(components);
        setShowCalculation(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!ctcData.employeeId || !ctcData.annualCtc || !ctcData.effectiveFrom) {
            showPopup('error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/ctc-management/ctc/add-auto', ctcData);
            showPopup('success', 'CTC structure created successfully with auto-calculated components');
            resetForm();
            if (selectedEmployee) {
                fetchCTCHistory(selectedEmployee.id);
            }
        } catch (error) {
            console.error('Error creating CTC:', error);
            showPopup('error', error.response?.data?.message || 'Failed to create CTC structure');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCTCData({
            employeeId: '',
            annualCtc: '',
            effectiveFrom: '',
            revisionReason: '',
            createdBy: 'HR Admin'
        });
        setSelectedEmployee(null);
        setShowCalculation(false);
        setCalculatedComponents(null);
        setCTCHistory([]);
    };

    const showPopup = (type, message) => {
        setPopup({ show: true, type, message });
    };

    const closePopup = () => {
        setPopup({ show: false, type: '', message: '' });
    };

    const formatCurrency = (amount) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(numericAmount);
    };

    return (
        <div className="admin-dashboard-layout">
            <SidebarAdmin />
            <div className="ctc-management">
                <div className="ctc-header">
                    <div className="header-content">
                        <div className="header-text">
                            <h1>CTC Management (Auto-Calculate)</h1>
                            <p>Create employee CTC structure with automatic component calculation</p>
                        </div>
                        <button 
                            className="btn-secondary back-btn"
                            onClick={() => navigate('/ctc-management')}
                        >
                            ← Back to CTC Management
                        </button>
                    </div>
                </div>

                {popup.show && (
                    <PopupMessage
                        type={popup.type}
                        message={popup.message}
                        onClose={closePopup}
                    />
                )}

                <div className="ctc-content">
                    {/* Employee Selection and CTC Input */}
                    <div className="ctc-form-section">
                        <h3>Create New CTC Structure</h3>
                        <form onSubmit={handleSubmit} className="ctc-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="employeeId">Select Employee *</label>
                                    <select
                                        id="employeeId"
                                        name="employeeId"
                                        value={ctcData.employeeId}
                                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                                        required
                                        className="form-control"
                                    >
                                        <option value="">Choose an employee...</option>
                                        {employees.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {selectedEmployee && (
                                    <div className="form-group">
                                        <label>Position</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.position}
                                            readOnly
                                            className="form-control readonly"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="annualCtc">Annual CTC (₹) *</label>
                                    <input
                                        type="number"
                                        id="annualCtc"
                                        name="annualCtc"
                                        value={ctcData.annualCtc}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="1000"
                                        className="form-control"
                                        placeholder="Enter annual CTC amount"
                                    />
                                    {searchParams.get('currentCTC') && ctcData.annualCtc && (
                                        <small className="form-text text-muted">
                                            Current CTC: ₹{parseInt(ctcData.annualCtc).toLocaleString('en-IN')} (You can edit this to create a new CTC structure)
                                        </small>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="effectiveFrom">Effective From *</label>
                                    <input
                                        type="date"
                                        id="effectiveFrom"
                                        name="effectiveFrom"
                                        value={ctcData.effectiveFrom}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="revisionReason">Revision Reason</label>
                                <textarea
                                    id="revisionReason"
                                    name="revisionReason"
                                    value={ctcData.revisionReason}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Optional: Reason for CTC revision"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={calculateComponents}
                                    className="btn btn-secondary"
                                    disabled={!ctcData.annualCtc}
                                >
                                    Preview Calculation
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || !ctcData.employeeId || !ctcData.annualCtc || !ctcData.effectiveFrom}
                                >
                                    {loading ? 'Creating...' : 'Create CTC Structure'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="btn btn-outline"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Calculation Preview */}
                    {showCalculation && calculatedComponents && (
                        <div className="calculation-preview">
                            <h3>CTC Breakdown</h3>
                            <div className="calculation-grid">
                                <div className="calculation-section">
                                    <h4>Annual Earnings</h4>
                                    <div className="calculation-item">
                                        <span>Basic Salary (40%)</span>
                                        <span>{formatCurrency(calculatedComponents.basicSalary)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>HRA (50% of Basic)</span>
                                        <span>{formatCurrency(calculatedComponents.hra)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Conveyance Allowance</span>
                                        <span>{formatCurrency(calculatedComponents.conveyanceAllowance)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Medical Allowance</span>
                                        <span>{formatCurrency(calculatedComponents.medicalAllowance)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Special Allowance</span>
                                        <span>{formatCurrency(calculatedComponents.specialAllowance)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Performance Bonus (10%)</span>
                                        <span>{formatCurrency(calculatedComponents.performanceBonus)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Employer PF (12%)</span>
                                        <span>{formatCurrency(calculatedComponents.employerPfContribution)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Gratuity (4.81%)</span>
                                        <span>{formatCurrency(calculatedComponents.gratuity)}</span>
                                    </div>
                                    <div className="calculation-total">
                                        <span>Total Annual CTC</span>
                                        <span>{formatCurrency(ctcData.annualCtc)}</span>
                                    </div>
                                </div>

                                <div className="calculation-section">
                                    <h4>Monthly Breakdown</h4>
                                    <div className="calculation-item">
                                        <span>Gross Monthly Salary</span>
                                        <span>{formatCurrency(calculatedComponents.grossMonthlySalary)}</span>
                                    </div>
                                    <div className="calculation-subheader">Deductions:</div>
                                    <div className="calculation-item">
                                        <span>Employee PF (12%)</span>
                                        <span>{formatCurrency(calculatedComponents.employeePf)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Professional Tax</span>
                                        <span>{formatCurrency(calculatedComponents.professionalTax)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>TDS (Estimated)</span>
                                        <span>{formatCurrency(calculatedComponents.tds)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Insurance Premium</span>
                                        <span>{formatCurrency(calculatedComponents.insurancePremium)}</span>
                                    </div>
                                    <div className="calculation-item">
                                        <span>Total Deductions</span>
                                        <span>{formatCurrency(calculatedComponents.totalMonthlyDeductions)}</span>
                                    </div>
                                    <div className="calculation-total">
                                        <span>Net Monthly Salary</span>
                                        <span>{formatCurrency(calculatedComponents.netMonthlySalary)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTC History */}
                    {selectedEmployee && ctcHistory.length > 0 && (
                        <div className="ctc-history-section">
                            <h3>CTC History for {selectedEmployee.name}</h3>
                            <div className="history-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Effective From</th>
                                            <th>Annual CTC</th>
                                            <th>Net Monthly</th>
                                            <th>Status</th>
                                            <th>Created By</th>
                                            <th>Revision Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ctcHistory.map(ctc => (
                                            <tr key={ctc.ctcId}>
                                                <td>{new Date(ctc.effectiveFrom).toLocaleDateString()}</td>
                                                <td>{formatCurrency(ctc.annualCtc)}</td>
                                                <td>{formatCurrency(ctc.netMonthlySalary)}</td>
                                                <td>
                                                    <span className={`status ${ctc.status.toLowerCase()}`}>
                                                        {ctc.status}
                                                    </span>
                                                </td>
                                                <td>{ctc.createdBy}</td>
                                                <td>{ctc.revisionReason || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CTCManagementNew;
