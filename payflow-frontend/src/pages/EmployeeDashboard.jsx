import React, { useEffect, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import EmployeeSidebar from '../components/EmployeeSidebar';
import './EmployeeDashboard.css';
import PayslipViewer from './PayslipViewer';
import axios from 'axios';
import { FaUserCircle, FaBuilding, FaBriefcase, FaCalendarAlt, FaEnvelope, FaPhone, FaMoneyBill, FaClipboardList, FaBell } from 'react-icons/fa';

const EmployeeDashboard = () => {
    const [employee, setEmployee] = useState(null);
    const email = localStorage.getItem('userEmail');
    const employeeId = localStorage.getItem("employeeId");
    console.log("Employee ID:", employeeId);
    // Leave state
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [leaveStats, setLeaveStats] = useState({
        totalPaidLeaves: 12,
        usedPaidLeaves: 0,
        remainingPaidLeaves: 12,
        usedUnpaidLeaves: 0,
        unpaidLeavesThisMonth: 0,
        currentMonth: new Date().getMonth() + 1,
        currentYear: new Date().getFullYear()
    });

    // Payment hold state
    const [paymentHoldStatus, setPaymentHoldStatus] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const totalLeaves = 12;

    const usedLeaves = useMemo(() => {
        return leaveHistory.filter(l => l.status === 'ACCEPTED').reduce((total, leave) => {
            if (leave.leaveDays) {
                return total + leave.leaveDays;
            } else if (leave.fromDate && leave.toDate) {
                const days = Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
                return total + days;
            }
            return total;
        }, 0);
    }, [leaveHistory]);

    const [latestPayslipId, setLatestPayslipId] = useState(null);

// Fetch latest payslip ID for the logged-in employee
useEffect(() => {
  const fetchPayslipId = async () => {
    // const employeeId = localStorage.getItem("employeeId");
    try {
      const res = await fetch(
        `http://localhost:8080/api/ctc-management/payslip/employee/${employeeId}`
      );
      if (!res.ok) throw new Error("Failed to fetch payslip list");
      const payslips = await res.json();

      if (payslips.length > 0) {
        // assuming backend returns sorted list
        setLatestPayslipId(payslips[0].payslipId);
      }
    } catch (err) {
      console.error("Error fetching payslip ID:", err);
    }
  };

  fetchPayslipId();
}, [employeeId]);

const [employeePayslip, setEmployeePayslip] = useState(null);

useEffect(() => {
  const fetchEmployeePayslip = async () => {
    try {
      const empId = localStorage.getItem("employeeId");
      if (!empId) return;

      const res = await fetch(`http://localhost:8080/api/ctc-management/payslip/employee/${empId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setEmployeePayslip(data[0]); // Take the first payslip
      }
    } catch (error) {
      console.error("Error fetching employee payslip:", error);
    }
  };

  fetchEmployeePayslip();
}, []);





const handleFetchPayslip = async (payslipId) => {
    try {
      // Fetch payslip JSON from backend
      const res = await fetch(
        `http://localhost:8080/api/ctc-management/payslip/download/${payslipId}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch payslip. Status: ${res.status}`);
      }

      const data = await res.json();
      const { payslip: fullPayslip, employee } = data;

      // Initialize PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Outer border
      doc.setLineWidth(1.5);
      doc.rect(15, 15, pageWidth - 30, 250);

      // Header with logo
      doc.setLineWidth(1);
      doc.rect(15, 15, pageWidth - 30, 50);
      doc.setFillColor(70, 130, 180);
      doc.rect(25, 25, 25, 30, "F");
      doc.setTextColor(0,0,0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
    //   doc.text("🏢", 35, 42);
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setFillColor(230, 230, 230); // light gray background
    doc.rect(25, 25, 25, 25, "F");
    doc.setTextColor(0, 0, 0);
    doc.text("PFS", 37, 42, { align: "center" });



      // Company details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text("PayFlow Solutions", pageWidth / 2, 35, { align: "center" });
      doc.setFontSize(9);
      doc.text(
        "123 Business District, Tech City, State - 123456",
        pageWidth / 2,
        45,
        { align: "center" }
      );
      doc.setFontSize(12);
      
      doc.text(
        `Pay Slip for ${fullPayslip.cycle || "August 2025"}`,
        pageWidth / 2,
        57,
        { align: "center" }
      );

      // Employee details table
      const employeeDetails = [
        ["Employee ID", fullPayslip.employeeId?.toString() || "-", "UAN", "-"],
        ["Employee Name", employee?.fullName || "-", "PF No.", "-"],
        ["Designation", employee?.designation || "-", "ESI No.", "-"],
        ["Department", employee?.department || "-", "Bank", "-"],
        ["Date of Joining", employee?.joinDate || "-", "Account No.", "-"],
      ];

      doc.autoTable({
        startY: 75,
        body: employeeDetails,
        theme: "grid",
        styles: {
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
          lineWidth: 0.5,          // Border thickness
  lineColor: [0, 0, 0]   
        //   fillColor: [240, 240, 240],
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: "bold" },
          1: { cellWidth: 45 },
          2: { cellWidth: 40, fontStyle: "bold" },
          3: { cellWidth: 45 },
        },
        margin: { left: 20, right: 20 },
      });

      // Working days section
      let startY = doc.lastAutoTable.finalY + 2;
      const workingDaysData = [
        ["Gross Wages", "₹61,166.67", "", ""],
        ["Total Working Days", "22", "Leaves", fullPayslip.numberOfLeaves || "0"],
        ["LOP Days", "0", "Paid Days", "22"],
      ];
      doc.autoTable({
        startY,
        body: workingDaysData,
        theme: "grid",
        styles: {
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
          lineWidth: 0.5,          // Border thickness
  lineColor: [0, 0, 0]
        //   fillColor: [240, 240, 240],
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: "bold" },
          1: { cellWidth: 45 },
          2: { cellWidth: 40, fontStyle: "bold" },
          3: { cellWidth: 45 },
        },
        margin: { left: 20, right: 20 },
      });

      // Earnings / Deductions header
      startY = doc.lastAutoTable.finalY + 2;
      doc.autoTable({
        startY,
        body: [["Earnings", "", "Deductions", ""]],
        theme: "grid",
        styles: {
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
          fillColor: [240, 240, 240],
          lineWidth: 0.5,          // Border thickness
  lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 45 },
          2: { cellWidth: 40 },
          3: { cellWidth: 45 },
        },
        margin: { left: 20, right: 20 },
      });

      // Earnings / Deductions details
      startY = doc.lastAutoTable.finalY;
      const earningsDeductionsData = [
        ["Basic", "₹41,666.67", "EPF", "₹500.00"],
        ["HRA", "₹12,500.00", "ESI", "₹0"],
        ["Conveyance Allowance", "₹6,666.67", "Professional Tax", "₹4,033.33"],
        ["Medical Allowance", "₹250", "", ""],
        ["Other Allowances", "₹333.33", "", ""],
      ];
      doc.autoTable({
        startY,
        body: earningsDeductionsData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.5,          // Border thickness
  lineColor: [0, 0, 0]    },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 45, halign: "center" },
          2: { cellWidth: 40 },
          3: { cellWidth: 45, halign: "center" },
        },
        margin: { left: 20, right: 20 },
      });

      // Totals row
      startY = doc.lastAutoTable.finalY;
      doc.autoTable({
        startY,
        body: [["Total Earnings", "₹61,166.67", "Total Deductions", "₹4,533.33"]],
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold", fillColor: [245, 245, 245], lineWidth: 0.5,          // Border thickness
  lineColor: [0, 0, 0]   },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 45, halign: "center" },
          2: { cellWidth: 40 },
          3: { cellWidth: 45, halign: "center" },
        },
        margin: { left: 20, right: 20 },
      });

      // Net Salary row
      startY = doc.lastAutoTable.finalY;
      doc.autoTable({
        startY,
        body: [["Net Salary", "₹56,633.34"]],
        theme: "grid",
        styles: {
          fontSize: 11,
          fontStyle: "bold",
          halign: "center",
          fillColor: [235, 235, 235],
          lineWidth: 0.5,          // Border thickness
  lineColor: [0, 0, 0]   
        },
        columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 85 } },
        margin: { left: 20, right: 20 },
      });

      // Save the PDF
      doc.save(
        `Payslip-${employee?.fullName || "Employee"}-${
          fullPayslip.cycle || "August-2025"
        }.pdf`
      );
    } catch (error) {
      console.error("Error generating payslip PDF:", error);
      alert("Failed to generate payslip PDF. Please try again.");
    }
  };


//  const [payslipData, setPayslipData] = useState(null);

//   const handleFetchPayslip = async (payslipId) => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/ctc-management/payslip/download/${payslipId}`
//       );

//       if (!res.ok) {
//         throw new Error(`Failed to fetch payslip. Status: ${res.status}`);
//       }

//       const data = await res.json();
//       setPayslipData(data); // This triggers PayslipViewer to run its PDF download logic
//     } catch (err) {
//       console.error("Error fetching payslip:", err);
//     }
//   };
   
    // Example: handleFetchPayslip.js
// const handleFetchPayslip = async () => {
//   try {
//     const response = await fetch("http://localhost:8080/api/employee/payslip/download", {
//       method: "GET",
//     //   headers: {
//     //     "Content-Type": "application/pdf",
//     //   },
//     });

//     if (!response.ok) throw new Error("Failed to fetch payslip");

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(new Blob([blob]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", `Payslip_${new Date().toLocaleString("default", { month: "long" })}.pdf`);
//     document.body.appendChild(link);
//     link.click();
//     link.parentNode.removeChild(link);
//   } catch (error) {
//     console.error(error);
//     alert("Error downloading payslip");
//   }
// };


    const remainingLeaves = Math.max(0, totalLeaves - leaveStats.usedPaidLeaves);

    useEffect(() => {
        if (email) {
            // Fetch employee details
            axios.get(`http://localhost:8080/api/employee?email=${email}`)
                .then(res => {
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        setEmployee(res.data[0]);
                        // Check payment hold status after getting employee details
                        checkPaymentHoldStatus(res.data[0].id);
                    } else if (res.data) {
                        setEmployee(res.data);
                        // Check payment hold status after getting employee details
                        checkPaymentHoldStatus(res.data.id);
                    }
                })
                .catch(err => console.error('Failed to fetch employee details', err));

            // Fetch leave history
            axios.get(`http://localhost:8080/api/employee/leave/history?email=${email}`)
                .then(res => {
                    setLeaveHistory(res.data || []);
                })
                .catch(() => {
                    setLeaveHistory([]);
                });

            // Fetch leave statistics
            axios.get(`http://localhost:8080/api/employee/leave/stats?email=${email}`)
                .then(res => {
                    setLeaveStats(res.data);
                })
                .catch(err => {
                    console.error('Failed to fetch leave stats', err);
                });
        }
    }, [email]);

    // Check payment hold status
    const checkPaymentHoldStatus = async (employeeId) => {
        try {
            const response = await axios.get(`/api/payment-hold/status/${employeeId}`);
            setPaymentHoldStatus(response.data);
            
            // Add payment hold notification if exists
            if (response.data.isOnHold) {
                const holdNotification = {
                    id: 'payment-hold',
                    type: 'warning',
                    title: 'Payment Hold Notice',
                    message: `Your payment is currently on hold. Reason: ${response.data.holdReason || 'Administrative review'}`,
                    date: response.data.holdDate,
                    priority: 'high'
                };
                setNotifications(prev => [holdNotification, ...prev]);
            }
        } catch (error) {
            console.error('Error checking payment hold status:', error);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="employee-dashboard-layout">
            <EmployeeSidebar />
            <div className="employee-dashboard-content">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <FaUserCircle size={72} color="#6366f1" />
                    </div>
                    <div className="profile-header-info">
                        <h2>{employee ? `Welcome ${employee.fullName}!` : 'Welcome!'}</h2>
                        {employee && (
                            <div className="profile-header-meta">
                                <span><FaBuilding /> {employee.department}</span>
                                <span><FaBriefcase /> {employee.role}</span>
                                <span><FaCalendarAlt /> Joined: {employee.joiningDate}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-cards">
                    <div className="dashboard-card notifications-card">
                        <h3><FaBell /> Notifications</h3>
                        <ul className="notifications-list">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <li key={notification.id} className={`notification-item ${notification.type}`}>
                                        <div className="notification-content">
                                            <strong>{notification.title}</strong>
                                            <p>{notification.message}</p>
                                            {notification.date && (
                                                <small>Hold placed on: {formatDate(notification.date)}</small>
                                            )}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li>No new notifications.</li>
                            )}
                        </ul>
                    </div>

                    <div className="dashboard-card leave-card">
                        <h3><FaClipboardList /> Leave Summary</h3>
                        <div style={{ marginBottom: '12px' }}>
                            <p style={{ margin: '4px 0' }}><b>Paid Leaves:</b></p>
                            <p style={{ margin: '2px 0', fontSize: '14px' }}>
                                <span style={{ color: '#6366f1' }}>Total: {leaveStats.totalPaidLeaves}</span> | 
                                <span style={{ color: 'tomato', marginLeft: '8px' }}>Used: {leaveStats.usedPaidLeaves}</span> | 
                                <span style={{ color: '#22c55e', marginLeft: '8px' }}>Remaining: {leaveStats.remainingPaidLeaves}</span>
                            </p>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <p style={{ margin: '4px 0' }}><b>Unpaid Leaves:</b></p>
                            <p style={{ margin: '2px 0', fontSize: '14px' }}>
                                <span style={{ color: 'orange' }}>Year Total: {leaveStats.usedUnpaidLeaves}</span> | 
                                <span style={{ color: 'red', marginLeft: '8px' }}>This Month: {leaveStats.unpaidLeavesThisMonth}</span>
                            </p>
                        </div>
                        <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                            Note: After using all paid leaves, additional requests will be unpaid.
                        </p>
                    </div>

                    <div className="dashboard-card payroll-card">
                        <h3><FaMoneyBill /> Payroll</h3>
                        {paymentHoldStatus && paymentHoldStatus.isOnHold ? (
                            <div className="payment-hold-alert">
                                <div className="hold-status">
                                    <span className="hold-badge">⏸️ Payment On Hold</span>
                                    <p><b>Reason:</b> {paymentHoldStatus.holdReason || 'Administrative review'}</p>
                                    <p><b>Hold Date:</b> {formatDate(paymentHoldStatus.holdDate)}</p>
                                    <small>Please contact HR for more information.</small>
                                </div>
                            </div>
                        ) : (
                            <>
                                <b>Basaly Salary:</b>{" "}
                                <span style={{ color: '#6366f1' }}>
                                    {employeePayslip?.netPay ? `₹${employeePayslip.basicSalary}` : "Not Available"}
                                </span><br/>
                                <br/>
                                <b>Net Salary:</b>{" "}
                                <span style={{ color: '#6366f1' }}>
                                    {employeePayslip?.netPay ? `₹${employeePayslip.netPay}` : "Not Available"}
                                </span><br/>
                                <button onClick={() => handleFetchPayslip(latestPayslipId)}>Download Payslip</button>

                            </>
                        )}
                    </div>
                </div>

                <div className="quick-links">
                    <button className="quick-link-btn">Update Profile</button>
                    <button className="quick-link-btn">Change Password</button>
                    <button className="quick-link-btn">Contact HR</button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
