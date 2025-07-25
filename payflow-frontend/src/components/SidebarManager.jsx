import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaProjectDiagram, FaEnvelopeOpenText } from 'react-icons/fa';
import './SidebarManager.css';

const SidebarManager = () => {
    return (
        <div className="sidebar">
            <h2 className="logo">MANAGER</h2>
            <ul className="nav-list">
                <li>
                    <NavLink to="/manager-dashboard" className={({ isActive }) => isActive ? 'active-link' : ''} end>
                        <FaTachometerAlt /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/team-members" className={({ isActive }) => isActive ? 'active-link' : ''} end>
                        <FaUsers /> Team Members
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/projects" className={({ isActive }) => isActive ? 'active-link' : ''} end>
                        <FaProjectDiagram /> Projects
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/leave-requests" className={({ isActive }) => isActive ? 'active-link' : ''} end>
                        <FaEnvelopeOpenText /> Leave Requests
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default SidebarManager;