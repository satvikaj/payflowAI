import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUserTie, FaUsers, FaCogs } from 'react-icons/fa';
import './SidebarAdmin.css';

const SidebarAdmin = () => {
    return (
        <div className="sidebar">
            <h2 className="logo">WELCOME!</h2>
            <ul className="nav-list">
                {/* Functional Dashboard Link */}
                <li>
                    <NavLink to="/admin-dashboard" activeClassName="active-link">
                        <FaTachometerAlt /> Dashboard
                    </NavLink>

                </li>

                {/* Clickable but not navigating now */}
                <li className="nav-placeholder">
                    <FaUserTie /> HR Management
                </li>
                <li className="nav-placeholder">
                    <FaUsers /> Employee Overview
                </li>
                <li className="nav-placeholder">
                    <FaCogs /> Settings
                </li>
            </ul>
        </div>
    );
};

export default SidebarAdmin;