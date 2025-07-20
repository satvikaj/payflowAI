import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SidebarAdmin';
import './AdminDashboard.css';
import { FaEdit } from 'react-icons/fa';
const AdminDashboard = () => {
    const navigate = useNavigate();

    const hrList = [
        { name: 'John Smith', email: 'john.smith@example.com', status: 'Active' },
        { name: 'Emma Johnson', email: 'emma.johnson@example.com', status: 'Inactive' },
        { name: 'Michael Williams', email: 'michael.williams@example.com', status: 'Active' },
    ];

    return (
        <div className="admin-dashboard-layout">
            <Sidebar />
            <main className="admin-dashboard-main">
                <div className="admin-dashboard-content-card">
                    <section className="admin-dashboard-section">
                        <div className="admin-card-grid">
                            {/* Total HRs */}
                            <div className="admin-card">
                                <h2 className="admin-section-title">TOTAL HRs</h2>
                                <div className="admin-count">6</div>
                                <div className="stats">
                                    <span>Active: 5</span>
                                    <span>Inactive: 1</span>
                                </div>
                            </div>

                            {/* Total Employees */}
                            <div className="admin-card">
                                <h2 className="admin-section-title">TOTAL EMPLOYEES</h2>
                                <div className="admin-count">150</div>
                                <div className="admin-stats">
                                    <span>Male: 95</span>
                                    <span>Female: 55</span>
                                </div>
                            </div>
                        </div>

                        {/* HR Management Section */}
                        <div className="hr-table-card">
                            <div className="hr-management-header">
                                <h2 className="section-title">HR Management</h2>
                                <button className="create-btn" onClick={() => navigate('/create-user')}>
                                    + Add New HR
                                </button>
                            </div>

                            <table className="hr-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Edit</th>
                                </tr>
                                </thead>
                                <tbody>
                                {hrList.map((hr, index) => (
                                    <tr key={index}>
                                        <td>{hr.name}</td>
                                        <td>{hr.email}</td>
                                        <td>
                        <span className={`status ${hr.status.toLowerCase()}`}>

                          {hr.status}
                        </span>
                                        </td>
                                        <td>
                                            <FaEdit className="edit-icon" />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;



// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './AdminDashboard.css';
//
// const AdminDashboard = () => {
//     const navigate = useNavigate();
//
//     return (
//         <div className="admin-dashboard">
//             <h2>Admin Dashboard</h2>
//             <button onClick={() => navigate('/create-user')}>Create HR/Manager</button>
//             {/*<button onClick={() => navigate('/reset-password')}>Reset Password</button>*/}
//         </div>
//     );
// };
//
// export default AdminDashboard;
