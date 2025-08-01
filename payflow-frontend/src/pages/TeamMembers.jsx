import React, { useEffect, useState } from 'react';
import SidebarManager from '../components/SidebarManager';
import axios from '../utils/axios';
import { 
    FaUsers, 
    FaSearch,
    FaFilter,
    FaDownload,
    FaEye,
    FaPhone,
    FaEnvelope,
    FaBuilding,
    FaBriefcase,
    FaCalendarCheck,
    FaUserTie,
    FaTimes,
    FaChartBar,
    FaUserClock
} from 'react-icons/fa';
import './TeamMembers.css';

const TeamMembers = () => {
    const managerId = localStorage.getItem('managerId');
    const managerName = localStorage.getItem('managerName') || 'Manager';
    
    const [team, setTeam] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Scroll to top when component mounts
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 0);
    }, []);

    useEffect(() => {
        async function fetchTeamData() {
            setLoading(true);
            try {
                console.log('Fetching team data for manager:', managerId);
                const [teamRes, leavesRes] = await Promise.all([
                    axios.get(`/api/manager/${managerId}/team`),
                    axios.get(`/api/manager/${managerId}/leaves`)
                ]);
                
                console.log('Team data:', teamRes.data);
                console.log('Leaves data:', leavesRes.data);
                
                setTeam(teamRes.data);
                setLeaves(leavesRes.data);
            } catch (err) {
                console.error("Error fetching team data", err);
                
                // Fallback with sample data for design purposes
                try {
                    const teamFallback = await axios.get('/api/employee');
                    const leavesFallback = await axios.get('/api/employee/leaves/all');
                    
                    const filteredTeam = teamFallback.data.filter(emp => 
                        emp.managerId === managerId || emp.managerId === parseInt(managerId)
                    );
                    
                    setTeam(filteredTeam.length > 0 ? filteredTeam : teamFallback.data.slice(0, 12));
                    setLeaves(leavesFallback.data || []);
                } catch (fallbackErr) {
                    console.error("Fallback API calls failed:", fallbackErr);
                    // Set sample data for design demonstration
                    setTeam([
                        {
                            id: 1,
                            fullName: "John Smith",
                            email: "john.smith@company.com",
                            department: "Engineering",
                            position: "Senior Developer",
                            phoneNumber: "+1-555-0123"
                        },
                        {
                            id: 2,
                            fullName: "Sarah Johnson",
                            email: "sarah.johnson@company.com",
                            department: "Design",
                            position: "UI/UX Designer",
                            phoneNumber: "+1-555-0124"
                        },
                        {
                            id: 3,
                            fullName: "Mike Davis",
                            email: "mike.davis@company.com",
                            department: "Engineering",
                            position: "Frontend Developer",
                            phoneNumber: "+1-555-0125"
                        }
                    ]);
                    setLeaves([]);
                }
            }
            setLoading(false);
        }
        
        if (managerId) {
            fetchTeamData();
        }
    }, [managerId]);

    // Filter team members
    const filteredTeam = team.filter(member => {
        const matchesSearch = 
            member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.position?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = filterDepartment === '' || member.department === filterDepartment;
        
        const memberLeaves = leaves.filter(l => l.employeeId === member.id);
        const hasActiveLeave = memberLeaves.some(l => {
            const today = new Date().toISOString().slice(0, 10);
            return l.fromDate <= today && l.toDate >= today && l.status === 'ACCEPTED';
        });
        
        const matchesStatus = filterStatus === '' || 
            (filterStatus === 'active' && !hasActiveLeave) ||
            (filterStatus === 'on-leave' && hasActiveLeave);
        
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Get statistics
    const departments = [...new Set(team.map(member => member.department).filter(Boolean))];
    const today = new Date().toISOString().slice(0, 10);
    const onLeaveToday = team.filter(member => {
        const memberLeaves = leaves.filter(l => l.employeeId === member.id);
        return memberLeaves.some(l => l.fromDate <= today && l.toDate >= today && l.status === 'ACCEPTED');
    }).length;

    const handleViewMember = (member) => {
        setSelectedMember(member);
        setShowModal(true);
    };

    const exportTeamData = () => {
        const csvContent = [
            ['Name', 'Email', 'Department', 'Position', 'Phone'].join(','),
            ...filteredTeam.map(member => [
                member.fullName || '',
                member.email || '',
                member.department || '',
                member.position || '',
                member.phone || ''
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `team-members-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterDepartment('');
        setFilterStatus('');
    };

    if (loading) {
        return (
            <div className="team-members-container">
                <div className="team-members-layout">
                    <SidebarManager />
                    <div className="team-content">
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading your team...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="team-members-container">
            <div className="team-members-layout">
                <SidebarManager />
                <div className="team-content">
                    {/* Header Section */}
                    <div className="team-header">
                        <div className="team-header-top">
                            <h1 className="team-title">
                                <div className="team-title-icon">
                                    <FaUsers />
                                </div>
                                My Team
                            </h1>
                            <div className="team-actions">
                                <button className="action-btn" onClick={exportTeamData}>
                                    <FaDownload />
                                    Export
                                </button>
                                <button className="action-btn">
                                    <FaChartBar />
                                    Analytics
                                </button>
                            </div>
                        </div>
                        
                        <div className="team-stats-header">
                            <div className="stat-item">
                                <span className="stat-number">{team.length}</span>
                                <span className="stat-label">Total Members</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{departments.length}</span>
                                <span className="stat-label">Departments</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{onLeaveToday}</span>
                                <span className="stat-label">On Leave Today</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{filteredTeam.length}</span>
                                <span className="stat-label">Showing Results</span>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="team-controls">
                        <div className="controls-row">
                            <div className="search-container">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search team members..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            
                            <div className="filter-group">
                                <select
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                                
                                {(searchTerm || filterDepartment || filterStatus) && (
                                    <button className="action-btn" onClick={clearFilters}>
                                        <FaTimes />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Team Members Table */}
                    {filteredTeam.length > 0 ? (
                        <div className="team-table-container">
                            <table className="team-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Contact</th>
                                        <th>Status</th>
                                        <th>Total Leaves</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeam.map(member => {
                                        const memberLeaves = leaves.filter(l => l.employeeId === member.id);
                                        const currentLeave = memberLeaves.find(l => 
                                            l.fromDate <= today && l.toDate >= today && l.status === 'ACCEPTED'
                                        );
                                        const isOnLeave = !!currentLeave;

                                        return (
                                            <tr key={member.id}>
                                                <td data-label="Employee">
                                                    <div className="member-info-cell">
                                                        <div className="member-avatar">
                                                            {(member.fullName || member.firstName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="member-info">
                                                            <div className="member-name">
                                                                {member.fullName || 
                                                                 (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : '') ||
                                                                 member.name || 'Unknown'}
                                                            </div>
                                                            <div className="member-role">{member.position || 'Employee'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Department" className="department-cell">
                                                    {member.department || 'N/A'}
                                                </td>
                                                <td data-label="Contact" className="contact-cell">
                                                    <div>{member.email || 'N/A'}</div>
                                                    <div>{member.phone || 'N/A'}</div>
                                                </td>
                                                <td data-label="Status">
                                                    <span className={`status-badge status-${isOnLeave ? 'leave' : 'active'}`}>
                                                        {isOnLeave ? 'On Leave' : 'Active'}
                                                    </span>
                                                </td>
                                                <td data-label="Leaves" className="text-center">
                                                    <strong>{memberLeaves.length}</strong> leaves
                                                </td>
                                                <td data-label="Actions" className="actions-cell">
                                                    <button 
                                                        className="view-btn"
                                                        onClick={() => handleViewMember(member)}
                                                    >
                                                        <FaEye />
                                                        View
                                                    </button>
                                                    <button className="leaves-btn">
                                                        <FaCalendarCheck />
                                                        Leaves
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FaUsers className="empty-icon" />
                            <h3 className="empty-title">No Team Members Found</h3>
                            <p className="empty-description">
                                {searchTerm || filterDepartment || filterStatus ? 
                                    'No team members match your current search and filter criteria.' :
                                    `No team members are currently assigned to ${managerName}.`
                                }
                            </p>
                            {(searchTerm || filterDepartment || filterStatus) && (
                                <button className="empty-action" onClick={clearFilters}>
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Member Details Modal */}
                    {showModal && selectedMember && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2 className="modal-title">
                                        {selectedMember.fullName || 'Team Member Details'}
                                    </h2>
                                    <button 
                                        className="modal-close"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                
                                <div className="modal-body">
                                    <div className="member-details-modal">
                                        <div className="detail-group">
                                            <h4>Contact Information</h4>
                                            <div className="detail-item">
                                                <FaEnvelope className="detail-icon" />
                                                <span>Email: {selectedMember.email || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaPhone className="detail-icon" />
                                                <span>Phone: {selectedMember.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="detail-group">
                                            <h4>Work Information</h4>
                                            <div className="detail-item">
                                                <FaBuilding className="detail-icon" />
                                                <span>Department: {selectedMember.department || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaBriefcase className="detail-icon" />
                                                <span>Role: {selectedMember.role || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaUserTie className="detail-icon" />
                                                <span>Employee ID: {selectedMember.employeeId || selectedMember.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamMembers;
