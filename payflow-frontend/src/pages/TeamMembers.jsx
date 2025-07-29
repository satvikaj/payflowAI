import React, { useEffect, useState } from 'react';
import SidebarManager from '../components/SidebarManager';
import axios from 'axios';
import { 
    FaUsers, 
    FaCalendarCheck, 
    FaPhone, 
    FaEnvelope, 
    FaBuilding, 
    FaBriefcase,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaUserTie,
    FaSearch,
    FaFilter,
    FaDownload,
    FaEye
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
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    const membersPerPage = 12;

    useEffect(() => {
        async function fetchTeamData() {
            setLoading(true);
            try {
                console.log('Fetching team data for manager:', managerId);
                const [teamRes, leavesRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/manager/${managerId}/team`),
                    axios.get(`http://localhost:8080/api/manager/${managerId}/leaves`)
                ]);
                
                console.log('Team data:', teamRes.data);
                console.log('Leaves data:', leavesRes.data);
                
                setTeam(teamRes.data);
                setLeaves(leavesRes.data);
            } catch (err) {
                console.error("Error fetching team data", err);
                
                // Fallback: try alternative API endpoints
                try {
                    console.log('Trying fallback APIs...');
                    const teamFallback = await axios.get('http://localhost:8080/api/employee');
                    const leavesFallback = await axios.get('http://localhost:8080/api/employee/leaves/all');
                    
                    // Filter team members for this manager
                    const filteredTeam = teamFallback.data.filter(emp => 
                        emp.managerId === managerId || emp.managerId === parseInt(managerId)
                    );
                    
                    setTeam(filteredTeam.length > 0 ? filteredTeam : teamFallback.data.slice(0, 15));
                    setLeaves(leavesFallback.data || []);
                } catch (fallbackErr) {
                    console.error("Fallback API calls failed:", fallbackErr);
                    setTeam([]);
                    setLeaves([]);
                }
            }
            setLoading(false);
        }
        
        if (managerId) {
            fetchTeamData();
        }
    }, [managerId]);

    // Filter and search functionality
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

    // Pagination
    const totalPages = Math.ceil(filteredTeam.length / membersPerPage);
    const startIndex = (currentPage - 1) * membersPerPage;
    const paginatedTeam = filteredTeam.slice(startIndex, startIndex + membersPerPage);

    // Get unique departments for filter
    const departments = [...new Set(team.map(member => member.department).filter(Boolean))];

    // Today's date for leave checking
    const today = new Date().toISOString().slice(0, 10);

    const handleViewDetails = (member) => {
        setSelectedMember(member);
        setShowDetailsModal(true);
    };

    const exportTeamData = () => {
        const csvContent = [
            ['Name', 'Email', 'Department', 'Position', 'Phone', 'Joining Date', 'Salary'].join(','),
            ...filteredTeam.map(member => [
                member.fullName || '',
                member.email || '',
                member.department || '',
                member.position || '',
                member.phoneNumber || '',
                member.joiningDate || '',
                member.salary || ''
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

    if (loading) {
        return (
            <div className="team-members-layout">
                <SidebarManager />
                <div className="team-members-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading team members...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="team-members-layout">
            <SidebarManager />
            <div className="team-members-main">
                {/* Header */}
                <div className="team-members-header">
                    <div className="header-left">
                        <h1><FaUsers /> Team Members</h1>
                        <p className="header-subtitle">
                            Manage and view details of your <strong>{filteredTeam.length}</strong> team member{filteredTeam.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="header-right">
                        <button className="export-btn" onClick={exportTeamData}>
                            <FaDownload /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="team-filters">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email, department, or position..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="filter-controls">
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                value={filterDepartment}
                                onChange={(e) => {
                                    setFilterDepartment(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="on-leave">On Leave</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Team Statistics */}
                <div className="team-stats-summary">
                    <div className="stat-card">
                        <div className="stat-number">{team.length}</div>
                        <div className="stat-label">Total Members</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{departments.length}</div>
                        <div className="stat-label">Departments</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {team.filter(member => {
                                const memberLeaves = leaves.filter(l => l.employeeId === member.id);
                                return memberLeaves.some(l => l.fromDate <= today && l.toDate >= today && l.status === 'ACCEPTED');
                            }).length}
                        </div>
                        <div className="stat-label">On Leave Today</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{filteredTeam.length}</div>
                        <div className="stat-label">Filtered Results</div>
                    </div>
                </div>

                {/* Team Members Table */}
                {paginatedTeam.length > 0 ? (
                    <>
                        <div className="team-members-table-container">
                            <table className="team-members-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Contact</th>
                                        <th>Status</th>
                                        <th>Leave Info</th>
                                        <th>Total Leaves</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTeam.map(member => {
                                        const memberLeaves = leaves.filter(l => l.employeeId === member.id);
                                        const currentLeave = memberLeaves.find(l => 
                                            l.fromDate <= today && l.toDate >= today && l.status === 'ACCEPTED'
                                        );

                                        return (
                                            <tr key={member.id}>
                                                <td data-label="Employee">
                                                    <div className="member-info-cell">
                                                        <div className="member-avatar-small">
                                                            {(member.fullName || member.firstName || 'E').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="member-details">
                                                            <div className="member-name-table">
                                                                {member.fullName || 
                                                                 (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : '') ||
                                                                 member.name || 'Unknown Employee'}
                                                            </div>
                                                            <div className="member-position-table">
                                                                {member.position || 'Employee'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Department" className="department-cell">
                                                    {member.department || 'N/A'}
                                                </td>
                                                <td data-label="Contact" className="contact-cell">
                                                    <div>{member.email || 'N/A'}</div>
                                                    <div>{member.phoneNumber || 'N/A'}</div>
                                                </td>
                                                <td data-label="Status" className="status-cell">
                                                    {currentLeave ? (
                                                        <span className="status-badge-small on-leave">On Leave</span>
                                                    ) : (
                                                        <span className="status-badge-small active">Active</span>
                                                    )}
                                                </td>
                                                <td data-label="Leave Info" className="leave-info-cell">
                                                    {currentLeave ? (
                                                        <div>
                                                            <div className="current-leave-small">
                                                                {currentLeave.type}
                                                            </div>
                                                            <div className="leave-dates-small">
                                                                {currentLeave.fromDate} to {currentLeave.toDate}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span style={{color: '#64748b'}}>No active leave</span>
                                                    )}
                                                </td>
                                                <td data-label="Total Leaves" className="stats-cell">
                                                    <span className="stat-number-small">{memberLeaves.length}</span>
                                                    <span className="stat-label-small">Total</span>
                                                </td>
                                                <td data-label="Actions" className="actions-cell">
                                                    <button 
                                                        className="view-btn-small"
                                                        onClick={() => handleViewDetails(member)}
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button 
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                
                                <div className="pagination-pages">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button 
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-team-members">
                        <FaUsers size={64} />
                        <h3>No Team Members Found</h3>
                        <p>
                            {searchTerm || filterDepartment || filterStatus ? 
                                'No team members match your current filters. Try adjusting your search criteria.' :
                                `No team members are assigned to manager ${managerName}.`
                            }
                        </p>
                        {(searchTerm || filterDepartment || filterStatus) && (
                            <button 
                                className="clear-filters-btn"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterDepartment('');
                                    setFilterStatus('');
                                    setCurrentPage(1);
                                }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Member Details Modal */}
                {showDetailsModal && selectedMember && (
                    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Team Member Details</h2>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="member-details-grid">
                                    <div className="detail-section">
                                        <h3>Personal Information</h3>
                                        <div className="detail-row">
                                            <span className="label">Full Name:</span>
                                            <span className="value">{selectedMember.fullName || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Email:</span>
                                            <span className="value">{selectedMember.email || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Phone:</span>
                                            <span className="value">{selectedMember.phoneNumber || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Date of Birth:</span>
                                            <span className="value">
                                                {selectedMember.dob ? new Date(selectedMember.dob).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Address:</span>
                                            <span className="value">{selectedMember.address || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h3>Work Information</h3>
                                        <div className="detail-row">
                                            <span className="label">Department:</span>
                                            <span className="value">{selectedMember.department || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Position:</span>
                                            <span className="value">{selectedMember.position || 'Employee'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Joining Date:</span>
                                            <span className="value">
                                                {selectedMember.joiningDate ? new Date(selectedMember.joiningDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Salary:</span>
                                            <span className="value">
                                                {selectedMember.salary ? `₹${selectedMember.salary.toLocaleString()}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Employee ID:</span>
                                            <span className="value">{selectedMember.employeeId || selectedMember.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMembers;
