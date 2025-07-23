import React from 'react';
import './Sidebar.css';
import { FaTachometerAlt, FaUser, FaMoneyBill, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function EmployeeSidebar() {
    const navigate = useNavigate();
    return (
        <aside className="sidebar">
            <h1 className="sidebar-title">
                <span className="logo">Employee</span> Portal
            </h1>
            <div className="sidebar-menu">
                <button className="sidebar-btn active" onClick={() => navigate('/employee-dashboard')}>
                    <FaTachometerAlt /> Dashboard
                </button>
                <button className="sidebar-btn" onClick={() => navigate('/employee-profile')}>
                    <FaUser /> Profile
                </button>
                <button className="sidebar-btn" onClick={() => navigate('/employee-payroll')}>
                    <FaMoneyBill /> Payroll
                </button>
                <button className="sidebar-btn" onClick={() => navigate('/employee-leave')}>
                    <FaCalendarAlt /> Leave
                </button>
                <button className="sidebar-btn" onClick={() => navigate('/employee-notifications')}>
                    <FaEnvelope /> Notifications
                </button>
            </div>
        </aside>
    );
}
