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
                    <NavLink to="/manager-dashboard" activeClassName="active-link">
                        <FaTachometerAlt /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/team-members" activeClassName="active-link">
                        <FaUsers /> Team Members
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/projects" activeClassName="active-link">
                        <FaProjectDiagram /> Projects
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/leave-requests" activeClassName="active-link">
                        <FaEnvelopeOpenText /> Leave Requests
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default SidebarManager;
