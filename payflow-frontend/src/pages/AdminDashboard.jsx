import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SidebarAdmin';
import './AdminDashboard.css';
import { FaEdit } from 'react-icons/fa';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    // Fetch users on component mount
    useEffect(() => {
        axios.get('http://localhost:8080/api/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error('Failed to fetch users', err));
    }, []);



    const handleDisableUser = async (username) => {
        const confirm = window.confirm("Are you sure you want to disable this user?");
        if (!confirm) return;

        try {
            const res = await axios.put(`http://localhost:8080/api/admin/disable-user`, {
                username: username,
            });

            alert(res.data.message);

            // Refresh user list
            const updatedUsers = await axios.get('http://localhost:8080/api/admin/users');
            setUsers(updatedUsers.data);
        } catch (err) {
            alert("Failed to disable user");
            console.error(err);
        }
    };

    const hrUsers = users.filter(user => user.role?.toUpperCase() === 'HR');
    const managerUsers = users.filter(user => user.role?.toUpperCase() === 'MANAGER');
    const employeeUsers = users.filter(user => user.role?.toUpperCase() === 'EMPLOYEE');

    const activeHRs = hrUsers.filter(user => user.active).length;
    const inactiveHRs = hrUsers.filter(user => !user.active).length;

    const activeManagers = managerUsers.filter(user => user.active).length;
    const inactiveManagers = managerUsers.filter(user => !user.active).length;

    const totalEmployees = employeeUsers.length;

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
                                <div className="admin-count">{hrUsers.length}</div>
                                <div className="stats">
                                    <span>Active: {activeHRs}</span>
                                    <span>Inactive: {inactiveHRs}</span>
                                </div>
                            </div>

                            {/* Total Managers */}
                            <div className="admin-card">
                                <h2 className="admin-section-title">TOTAL MANAGERS</h2>
                                <div className="admin-count">{managerUsers.length}</div>
                                <div className="stats">
                                    <span>Active: {activeManagers}</span>
                                    <span>Inactive: {inactiveManagers}</span>
                                </div>
                            </div>

                            {/* Total Employees */}
                            <div className="admin-card">
                                <h2 className="admin-section-title">TOTAL EMPLOYEES</h2>
                                <div className="admin-count">{totalEmployees}</div>
                            </div>

                        </div>

                        {/* HR Management Section */}
                        <div className="hr-table-card">
                            <div className="hr-management-header">
                                <h2 className="section-title">HR / MANAGER  Management</h2>
                                <button className="create-btn" onClick={() => navigate('/create-user')}>
                                    + Add New HR
                                </button>
                            </div>

                            <table className="hr-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th> {/* 👈 Add this */}
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.name}</td>
                                            <td>{user.username}</td>
                                            <td>{user.role}</td> {/* 👈 Show whether HR or MANAGER */}
                                            <td>
                                                <span className={`status ${user.active === false ? 'inactive' : 'active'}`}>
                                                    {user.active === false ? 'Inactive' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.active ? (
                                                    <button className="disable-btn" onClick={() => handleDisableUser(user.username)}>
                                                        Disable
                                                    </button>
                                                ) : (
                                                    <span className="disabled-text">Disabled</span>
                                                )}
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
