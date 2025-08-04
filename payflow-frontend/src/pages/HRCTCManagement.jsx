import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import Sidebar from '../components/Sidebar';
import './HRCTCManagement.css';

const HRCTCManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [ctcData, setCTCData] = useState({
        employeeId: '',
        basicSalary: '',
        hra: '',
        allowances: '',
        bonuses: '',
        pfContribution: '',
        gratuity: '',
        totalCtc: '',
        effectiveFrom: '',
        status: 'ACTIVE',
        revisionReason: ''
    });
    const [ctcHistory, setCTCHistory] = useState([]);
    const [activeCTCs, setActiveCTCs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchActiveCTCs();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('/api/ctc-management/employees');
            console.log('Employees data:', response.data); // Debug log
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setMessage({ text: 'Failed to fetch employees', type: 'error' });
        }
    };

    const fetchActiveCTCs = async () => {
        try {
            const response = await axios.get('/api/ctc-management/ctc/all');
            console.log('Active CTCs response:', response.data);
            console.log('First CTC object structure:', response.data[0]);
            setActiveCTCs(response.data);
        } catch (error) {
            console.error('Error fetching active CTCs:', error);
            setMessage({ text: 'Failed to fetch CTC data', type: 'error' });
        }
    };

    const fetchCTCHistory = async (employeeId) => {
        try {
            const response = await axios.get(`/api/ctc-management/ctc/history/${employeeId}`);
            setCTCHistory(response.data);
        } catch (error) {
            console.error('Error fetching CTC history:', error);
            setMessage({ text: 'Failed to fetch CTC history', type: 'error' });
        }
    };

    const handleEmployeeSelect = (employeeId) => {
        setSelectedEmployee(employeeId);
        setCTCData({ ...ctcData, employeeId });
        if (employeeId) {
            fetchCTCHistory(employeeId);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCTCData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Auto-calculate total CTC
            if (['basicSalary', 'hra', 'allowances', 'bonuses', 'pfContribution', 'gratuity'].includes(name)) {
                const basic = parseFloat(updated.basicSalary) || 0;
                const hra = parseFloat(updated.hra) || 0;
                const allowances = parseFloat(updated.allowances) || 0;
                const bonuses = parseFloat(updated.bonuses) || 0;
                const pf = parseFloat(updated.pfContribution) || 0;
                const gratuity = parseFloat(updated.gratuity) || 0;
                updated.totalCtc = (basic + hra + allowances + bonuses + pf + gratuity).toString();
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        console.log('Submitting CTC data:', ctcData);
        
        try {
            const response = await axios.post('/api/ctc-management/ctc/add', ctcData);
            console.log('CTC creation response:', response.data);
            setMessage({ text: 'CTC structure created successfully!', type: 'success' });
            
            // Reset form and close modal
            setCTCData({
                employeeId: '',
                basicSalary: '',
                hra: '',
                allowances: '',
                bonuses: '',
                pfContribution: '',
                gratuity: '',
                totalCtc: '',
                effectiveFrom: '',
                status: 'ACTIVE',
                revisionReason: ''
            });
            setSelectedEmployee('');
            setShowModal(false);
            
            // Refresh data
            fetchActiveCTCs();
        } catch (error) {
            console.error('Error creating CTC:', error);
            console.error('Error response:', error.response?.data);
            setMessage({ text: 'Failed to create CTC structure', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setShowModal(true);
        setMessage({ text: '', type: '' });
    };

    const closeModal = () => {
        setShowModal(false);
        setCTCData({
            employeeId: '',
            basicSalary: '',
            hra: '',
            allowances: '',
            bonuses: '',
            pfContribution: '',
            gratuity: '',
            totalCtc: '',
            effectiveFrom: '',
            status: 'ACTIVE',
            revisionReason: ''
        });
        setSelectedEmployee('');
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
        <div className="hr-dashboard-layout">
            <Sidebar />
            <div className="hr-ctc-management">
                <div className="hr-ctc-header">
                    <h1>HR - CTC Management</h1>
                    <p>Manage employee compensation structures</p>
                    <button className="add-ctc-btn" onClick={openModal}>
                        + Add CTC Structure
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="hr-ctc-content">
                    <div className="ctc-overview-section">
                        <h3>Current CTC Structures</h3>
                        {activeCTCs.length > 0 ? (
                            <div className="ctc-table">
                                <div className="ctc-table-header">
                                    <div className="ctc-header-item">Employee ID</div>
                                    <div className="ctc-header-item">Basic Salary</div>
                                    <div className="ctc-header-item">HRA</div>
                                    <div className="ctc-header-item">Allowances</div>
                                    <div className="ctc-header-item">Bonuses</div>
                                    <div className="ctc-header-item">PF Contribution</div>
                                    <div className="ctc-header-item">Gratuity</div>
                                    <div className="ctc-header-item">Total CTC</div>
                                    <div className="ctc-header-item">Status</div>
                                </div>
                                <div className="ctc-table-body">
                                    {activeCTCs.map(ctc => (
                                        <div key={ctc.ctcId} className="ctc-table-row">
                                            <div className="ctc-table-item">
                                                <span className="employee-name">ID: {ctc.employeeId}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="breakdown-amount">{formatCurrency(ctc.basicSalary)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="breakdown-amount">{formatCurrency(ctc.hra)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="breakdown-amount">{formatCurrency(ctc.allowances)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="breakdown-amount">{formatCurrency(ctc.bonuses)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="breakdown-amount">{formatCurrency(ctc.pfContribution)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="breakdown-amount">{formatCurrency(ctc.gratuity)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span className="ctc-amount">{formatCurrency(ctc.totalCtc)}</span>
                                            </div>
                                            <div className="ctc-table-item">
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(ctc.status) }}
                                                >
                                                    {ctc.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="no-data">
                                <p>No CTC structures found. Click "Add CTC Structure" to create one.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal for adding CTC */}
                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add CTC Structure</h2>
                                <button className="close-btn" onClick={closeModal}>&times;</button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="ctc-form">
                                <div className="employee-selection">
                                    <label>Select Employee</label>
                                    <select
                                        value={selectedEmployee}
                                        onChange={(e) => {
                                            setSelectedEmployee(e.target.value);
                                            setCTCData(prev => ({ ...prev, employeeId: e.target.value }));
                                        }}
                                        className="employee-select"
                                        required
                                    >
                                        <option value="">Choose an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.fullName} (ID: {emp.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Basic Salary (₹)</label>
                                        <input
                                            type="number"
                                            name="basicSalary"
                                            value={ctcData.basicSalary}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>HRA (₹)</label>
                                        <input
                                            type="number"
                                            name="hra"
                                            value={ctcData.hra}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Travel Allowance (₹)</label>
                                        <input
                                            type="number"
                                            name="allowances"
                                            value={ctcData.allowances}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Bonuses (₹)</label>
                                        <input
                                            type="number"
                                            name="bonuses"
                                            value={ctcData.bonuses}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>PF Contribution (₹)</label>
                                        <input
                                            type="number"
                                            name="pfContribution"
                                            value={ctcData.pfContribution}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gratuity (₹)</label>
                                        <input
                                            type="number"
                                            name="gratuity"
                                            value={ctcData.gratuity}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Effective From</label>
                                        <input
                                            type="date"
                                            name="effectiveFrom"
                                            value={ctcData.effectiveFrom}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Total CTC (₹)</label>
                                        <input
                                            type="number"
                                            name="totalCtc"
                                            value={ctcData.totalCtc}
                                            readOnly
                                            className="readonly-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            name="status"
                                            value={ctcData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="REVISED">Revised</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        {/* Empty space for alignment */}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Revision Reason</label>
                                    <textarea
                                        name="revisionReason"
                                        value={ctcData.revisionReason}
                                        onChange={handleInputChange}
                                        placeholder="Reason for CTC revision (optional)"
                                        rows="3"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create CTC Structure'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRCTCManagement;
