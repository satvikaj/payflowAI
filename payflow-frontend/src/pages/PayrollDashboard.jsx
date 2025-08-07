import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin';
import Sidebar from '../components/Sidebar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
    const [calculatedPayslip, setCalculatedPayslip] = useState(null);
    const [autoCalculating, setAutoCalculating] = useState(false);

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

    // Function to automatically calculate payslip when employee, month, and year are selected
    const calculateAutomaticPayslip = async () => {
        if (!selectedEmployee || !payslipData.payrollMonth || !payslipData.payrollYear) {
            setCalculatedPayslip(null);
            return;
        }

        setAutoCalculating(true);
        try {
            const monthIndex = months.indexOf(payslipData.payrollMonth) + 1;
            const response = await axios.get(
                `/api/payslip/calculate/${selectedEmployee}/${payslipData.payrollYear}/${monthIndex}`
            );
            setCalculatedPayslip(response.data);
        } catch (error) {
            console.error('Error calculating payslip:', error);
            showMessage('error', 'Failed to calculate payslip automatically');
            setCalculatedPayslip(null);
        } finally {
            setAutoCalculating(false);
        }
    };

    // Effect to trigger automatic calculation when selections change
    useEffect(() => {
        calculateAutomaticPayslip();
    }, [selectedEmployee, payslipData.payrollMonth, payslipData.payrollYear]);

    // Function to generate and save payslip to database
    const generateAndSavePayslip = async () => {
        if (!calculatedPayslip) return;

        setLoading(true);
        try {
            // Prepare payslip data for backend
            const payslipData = {
                employeeId: calculatedPayslip.employeeId,
                employeeName: calculatedPayslip.employeeName,
                payrollMonth: months[calculatedPayslip.month - 1],
                payrollYear: calculatedPayslip.year,
                workingDays: calculatedPayslip.totalWorkingDays,
                attendedDays: calculatedPayslip.effectiveWorkingDays,
                grossSalary: calculatedPayslip.monthlyNetSalary,
                totalDeductions: calculatedPayslip.monthlyNetSalary - calculatedPayslip.finalNetSalary,
                netPay: calculatedPayslip.finalNetSalary,
                unpaidLeaveDays: calculatedPayslip.unpaidLeaveDays,
                unpaidLeaveDeduction: calculatedPayslip.unpaidLeaveDeduction,
                basicSalary: calculatedPayslip.basicSalary,
                hra: calculatedPayslip.hra,
                medicalAllowance: calculatedPayslip.medicalAllowance,
                conveyanceAllowance: calculatedPayslip.conveyanceAllowance,
                specialAllowance: calculatedPayslip.specialAllowance,
                performanceBonus: calculatedPayslip.performanceBonus,
                providentFund: calculatedPayslip.providentFund,
                professionalTax: calculatedPayslip.professionalTax,
                incomeTax: calculatedPayslip.incomeTax,
                insurancePremium: calculatedPayslip.insurancePremium,
                status: 'GENERATED'
            };

            // Save to database
            await axios.post('/api/ctc-management/payslip/generate', payslipData);
            
            showMessage('success', 'Payslip generated and saved successfully!');
            
            // Reset form and close modal
            resetForm();
            
            // Refresh payslips table
            fetchAllPayslips();
            
        } catch (error) {
            console.error('Error saving payslip:', error);
            showMessage('error', error.response?.data?.message || 'Failed to generate payslip');
        } finally {
            setLoading(false);
        }
    };

    // Function to generate PDF from calculated payslip
    const generateCalculatedPayslipPDF = () => {
        if (!calculatedPayslip) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        
        // Document styling
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, 250);
        
        // Header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('PAYSLIP', pageWidth / 2, 30, { align: 'center' });
        
        // Employee details
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Employee: ${calculatedPayslip.employeeName}`, 20, 50);
        doc.text(`Position: ${calculatedPayslip.employeePosition}`, 20, 60);
        doc.text(`Month/Year: ${months[calculatedPayslip.month - 1]} ${calculatedPayslip.year}`, 20, 70);
        
        // Working days information
        doc.text(`Total Working Days: ${calculatedPayslip.totalWorkingDays}`, 20, 85);
        doc.text(`Unpaid Leave Days: ${calculatedPayslip.unpaidLeaveDays}`, 20, 95);
        doc.text(`Effective Working Days: ${calculatedPayslip.effectiveWorkingDays}`, 20, 105);
        
        // Salary breakdown
        let yPos = 125;
        doc.setFont(undefined, 'bold');
        doc.text('EARNINGS', 20, yPos);
        yPos += 10;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Basic Salary: ₹${calculatedPayslip.basicSalary?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`HRA: ₹${calculatedPayslip.hra?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Medical Allowance: ₹${calculatedPayslip.medicalAllowance?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Conveyance Allowance: ₹${calculatedPayslip.conveyanceAllowance?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Special Allowance: ₹${calculatedPayslip.specialAllowance?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Performance Bonus: ₹${calculatedPayslip.performanceBonus?.toFixed(2) || '0.00'}`, 25, yPos);
        
        yPos += 20;
        doc.setFont(undefined, 'bold');
        doc.text('DEDUCTIONS', 20, yPos);
        yPos += 10;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Provident Fund: ₹${calculatedPayslip.providentFund?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Professional Tax: ₹${calculatedPayslip.professionalTax?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Income Tax: ₹${calculatedPayslip.incomeTax?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Insurance Premium: ₹${calculatedPayslip.insurancePremium?.toFixed(2) || '0.00'}`, 25, yPos);
        yPos += 10;
        doc.text(`Unpaid Leave Deduction: ₹${calculatedPayslip.unpaidLeaveDeduction?.toFixed(2) || '0.00'}`, 25, yPos);
        
        yPos += 20;
        doc.setFont(undefined, 'bold');
        doc.text(`NET SALARY: ₹${calculatedPayslip.finalNetSalary?.toFixed(2) || '0.00'}`, 20, yPos);
        
        // Footer
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 245);
        
        // Save the PDF
        doc.save(`${calculatedPayslip.employeeName}_${months[calculatedPayslip.month - 1]}_${calculatedPayslip.year}_Payslip.pdf`);
    };

    const downloadPayslip = async (payslipId) => {
        try {
            // Get payslip data from backend
            const response = await axios.get(`/api/ctc-management/payslip/download/${payslipId}`);
            const payslipData = response.data;
            
            // Debug: Log the full response to understand the data structure
            console.log('Full payslip response:', response.data);
            console.log('Payslip data keys:', Object.keys(payslipData));
            
            // Check if the data is nested in another object
            const actualPayslipData = payslipData.payslip || payslipData.data || payslipData;
            console.log('Actual payslip data:', actualPayslipData);

            // Generate PDF using the professional template format
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            
            // Outer border for entire document
            doc.setLineWidth(2);
            doc.rect(10, 10, pageWidth - 20, 250);
            
            // Company Header Section with border
            doc.setLineWidth(1);
            doc.rect(10, 10, pageWidth - 20, 50);
            
            // Company logo placeholder
            doc.setFillColor(70, 130, 180);
            doc.rect(15, 20, 20, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('🏢', 23, 35);
            
            // Company name and details
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('PayFlow Solutions', pageWidth / 2, 30, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('123 Business District, Tech City, State - 123456', pageWidth / 2, 40, { align: 'center' });
            
            // Pay Slip title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Pay Slip for ${actualPayslipData.payrollMonth || actualPayslipData.month || 'N/A'} ${actualPayslipData.payrollYear || actualPayslipData.year || 'N/A'}`, pageWidth / 2, 52, { align: 'center' });
            
            // Employee Details Table
            let currentY = 70;
            
            // Debug log to see what data we have
            console.log('Payslip data for PDF:', actualPayslipData);
            
            const employeeData = [
                ['Employee ID', actualPayslipData.employeeId?.toString() || actualPayslipData.id?.toString() || '-', 'UAN', '-'],
                ['Employee Name', actualPayslipData.employeeName || actualPayslipData.name || actualPayslipData.fullName || '-', 'PF No.', '-'],
                ['Designation', actualPayslipData.employeePosition || actualPayslipData.designation || actualPayslipData.position || '-', 'ESI No.', '-'],
                ['Department', actualPayslipData.department || 'IT', 'Bank', '-'],
                ['Date of Joining', actualPayslipData.joiningDate || actualPayslipData.dateOfJoining || actualPayslipData.joinDate || '-', 'Account No.', '-']
            ];
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: employeeData,
                theme: 'grid',
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { cellWidth: 42, fontStyle: 'bold' },
                    1: { cellWidth: 53 },
                    2: { cellWidth: 42, fontStyle: 'bold' },
                    3: { cellWidth: 53 }
                }
            });
            
            // Working Days Section
            currentY = doc.lastAutoTable.finalY + 5;
            
            const workingDaysData = [
                ['Gross Wages', `₹${actualPayslipData.grossSalary?.toLocaleString() || '0'}`, '', ''],
                ['Total Working Days', actualPayslipData.workingDays?.toString() || '22', 'Leaves', actualPayslipData.unpaidLeaveDays?.toString() || '0'],
                ['LOP Days', actualPayslipData.unpaidLeaveDays?.toString() || '0', 'Paid Days', actualPayslipData.attendedDays?.toString() || '22']
            ];
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: workingDaysData,
                theme: 'grid',
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { cellWidth: 47.5, fontStyle: 'bold' },
                    1: { cellWidth: 47.5 },
                    2: { cellWidth: 47.5, fontStyle: 'bold' },
                    3: { cellWidth: 47.5 }
                }
            });
            
            // Earnings and Deductions Section
            currentY = doc.lastAutoTable.finalY + 5;
            
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
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 47.5 },
                    1: { cellWidth: 47.5 },
                    2: { cellWidth: 47.5 },
                    3: { cellWidth: 47.5 }
                }
            });
            
            // Earnings and Deductions data
            currentY = doc.lastAutoTable.finalY;
            
            // Prepare earnings and deductions data with real employee data
            const earningsDeductionsData = [];
            
            // Add earnings with corresponding deductions in parallel
            const earningsItems = [];
            const deductionsItems = [];
            
            // Collect earnings
            if (actualPayslipData.basicSalary && actualPayslipData.basicSalary > 0) {
                earningsItems.push(['Basic', `₹${actualPayslipData.basicSalary.toLocaleString()}`]);
            }
            if (actualPayslipData.hra && actualPayslipData.hra > 0) {
                earningsItems.push(['HRA', `₹${actualPayslipData.hra.toLocaleString()}`]);
            }
            if (actualPayslipData.conveyanceAllowance && actualPayslipData.conveyanceAllowance > 0) {
                earningsItems.push(['Conveyance Allowance', `₹${actualPayslipData.conveyanceAllowance.toLocaleString()}`]);
            }
            if (actualPayslipData.medicalAllowance && actualPayslipData.medicalAllowance > 0) {
                earningsItems.push(['Medical Allowance', `₹${actualPayslipData.medicalAllowance.toLocaleString()}`]);
            }
            if (actualPayslipData.specialAllowance && actualPayslipData.specialAllowance > 0) {
                earningsItems.push(['Other Allowances', `₹${actualPayslipData.specialAllowance.toLocaleString()}`]);
            }
            if (actualPayslipData.performanceBonus && actualPayslipData.performanceBonus > 0) {
                earningsItems.push(['Performance Bonus', `₹${actualPayslipData.performanceBonus.toLocaleString()}`]);
            }
            
            // Collect deductions
            if (actualPayslipData.providentFund && actualPayslipData.providentFund > 0) {
                deductionsItems.push(['EPF', `₹${actualPayslipData.providentFund.toLocaleString()}`]);
            }
            if (actualPayslipData.incomeTax && actualPayslipData.incomeTax > 0) {
                deductionsItems.push(['Income Tax', `₹${actualPayslipData.incomeTax.toLocaleString()}`]);
            }
            if (actualPayslipData.professionalTax && actualPayslipData.professionalTax > 0) {
                deductionsItems.push(['Professional Tax', `₹${actualPayslipData.professionalTax.toLocaleString()}`]);
            }
            if (actualPayslipData.insurancePremium && actualPayslipData.insurancePremium > 0) {
                deductionsItems.push(['Insurance', `₹${actualPayslipData.insurancePremium.toLocaleString()}`]);
            }
            if (actualPayslipData.unpaidLeaveDeduction && actualPayslipData.unpaidLeaveDeduction > 0) {
                deductionsItems.push(['LOP Deduction', `₹${actualPayslipData.unpaidLeaveDeduction.toLocaleString()}`]);
            }
            
            // Add ESI as zero if no ESI data
            if (deductionsItems.length === 0 || !deductionsItems.find(item => item[0] === 'ESI')) {
                deductionsItems.push(['ESI', '₹0']);
            }
            
            // Combine earnings and deductions in parallel rows
            const maxRows = Math.max(earningsItems.length, deductionsItems.length);
            
            for (let i = 0; i < maxRows; i++) {
                const earningsRow = earningsItems[i] || ['', ''];
                const deductionsRow = deductionsItems[i] || ['', ''];
                earningsDeductionsData.push([
                    earningsRow[0], 
                    earningsRow[1], 
                    deductionsRow[0], 
                    deductionsRow[1]
                ]);
            }
            
            // If no data, add placeholder row
            if (earningsDeductionsData.length === 0) {
                earningsDeductionsData.push(['', '₹0', '', '₹0']);
            }
            
            doc.autoTable({
                startY: currentY,
                head: [],
                body: earningsDeductionsData,
                theme: 'grid',
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { cellWidth: 47.5 },
                    1: { cellWidth: 47.5, halign: 'right' },
                    2: { cellWidth: 47.5 },
                    3: { cellWidth: 47.5, halign: 'right' }
                }
            });
            
            // Total Earnings and Total Deductions row
            currentY = doc.lastAutoTable.finalY;
            const totalsData = [
                ['Total Earnings', `₹${actualPayslipData.grossSalary?.toLocaleString() || '0'}`, 'Total Deductions', `₹${actualPayslipData.totalDeductions?.toLocaleString() || '0'}`]
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
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 47.5 },
                    1: { cellWidth: 47.5, halign: 'right' },
                    2: { cellWidth: 47.5 },
                    3: { cellWidth: 47.5, halign: 'right' }
                }
            });
            
            // Net Salary Section
            currentY = doc.lastAutoTable.finalY;
            const netSalaryData = [
                ['Net Salary', `₹${actualPayslipData.netPay?.toLocaleString() || actualPayslipData.finalNetSalary?.toLocaleString() || '0'}`]
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
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 95, halign: 'right' },
                    1: { cellWidth: 95, halign: 'right' }
                }
            });

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 255);
            
            // Save the PDF
            const fileName = `Payslip-${actualPayslipData.employeeName || 'Employee'}-${actualPayslipData.payrollMonth || actualPayslipData.month || 'Unknown'}_${actualPayslipData.payrollYear || actualPayslipData.year || 'Unknown'}.pdf`;
            doc.save(fileName);
            
            showMessage('success', 'Payslip downloaded successfully');
            
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

                        <div className="payslip-form">
                            {/* Selection Section */}
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
                            </div>

                            {/* Automatic Calculation Display */}
                            {autoCalculating && (
                                <div className="calculation-loading">
                                    <p>Calculating payslip...</p>
                                </div>
                            )}

                            {calculatedPayslip && !autoCalculating && (
                                <div className="calculated-payslip">
                                    <h4>Calculated Payslip Details</h4>
                                    
                                    <div className="payslip-summary">
                                        <div className="summary-row">
                                            <span>Employee:</span>
                                            <span>{calculatedPayslip.employeeName}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Position:</span>
                                            <span>{calculatedPayslip.employeePosition}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Period:</span>
                                            <span>{months[calculatedPayslip.month - 1]} {calculatedPayslip.year}</span>
                                        </div>
                                    </div>

                                    <div className="working-days-info">
                                        <h5>Working Days Information</h5>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span>Total Working Days:</span>
                                                <span className="value">{calculatedPayslip.totalWorkingDays}</span>
                                            </div>
                                            <div className="info-item">
                                                <span>Unpaid Leave Days:</span>
                                                <span className="value highlight-red">{calculatedPayslip.unpaidLeaveDays}</span>
                                            </div>
                                            <div className="info-item">
                                                <span>Effective Working Days:</span>
                                                <span className="value">{calculatedPayslip.effectiveWorkingDays}</span>
                                            </div>
                                            <div className="info-item">
                                                <span>Daily Rate:</span>
                                                <span className="value">₹{calculatedPayslip.dailyRate?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="salary-breakdown">
                                        <div className="earnings-section">
                                            <h5>Earnings</h5>
                                            <div className="breakdown-item">
                                                <span>Basic Salary:</span>
                                                <span>₹{calculatedPayslip.basicSalary?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>HRA:</span>
                                                <span>₹{calculatedPayslip.hra?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Medical Allowance:</span>
                                                <span>₹{calculatedPayslip.medicalAllowance?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Conveyance Allowance:</span>
                                                <span>₹{calculatedPayslip.conveyanceAllowance?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Special Allowance:</span>
                                                <span>₹{calculatedPayslip.specialAllowance?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Performance Bonus:</span>
                                                <span>₹{calculatedPayslip.performanceBonus?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-total">
                                                <span><strong>Gross Monthly Salary:</strong></span>
                                                <span><strong>₹{calculatedPayslip.monthlyNetSalary?.toFixed(2)}</strong></span>
                                            </div>
                                        </div>

                                        <div className="deductions-section">
                                            <h5>Deductions</h5>
                                            <div className="breakdown-item">
                                                <span>Provident Fund:</span>
                                                <span>₹{calculatedPayslip.providentFund?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Professional Tax:</span>
                                                <span>₹{calculatedPayslip.professionalTax?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Income Tax:</span>
                                                <span>₹{calculatedPayslip.incomeTax?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item">
                                                <span>Insurance Premium:</span>
                                                <span>₹{calculatedPayslip.insurancePremium?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="breakdown-item highlight-red">
                                                <span>Unpaid Leave Deduction:</span>
                                                <span>₹{calculatedPayslip.unpaidLeaveDeduction?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="final-salary">
                                        <div className="final-amount">
                                            <span><strong>Final Net Salary:</strong></span>
                                            <span className="amount"><strong>₹{calculatedPayslip.finalNetSalary?.toFixed(2)}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                                {calculatedPayslip && (
                                    <button 
                                        type="button" 
                                        className="btn-primary" 
                                        onClick={generateAndSavePayslip}
                                        disabled={loading}
                                    >
                                        {loading ? 'Generating...' : 'Generate'}
                                    </button>
                                )}
                            </div>
                        </div>
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