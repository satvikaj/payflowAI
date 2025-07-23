import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeList.css';
import Sidebar from '../components/Sidebar';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        axios.get('http://localhost:8080/api/employee')
            .then(response => setEmployees(response.data))
            .catch(error => console.error('Error fetching employees:', error));
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(employees.length / rowsPerPage);
    const paginatedEmployees = employees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="employee-page-layout">
            <Sidebar />
            <div className="employee-list-container">
                <h2>All Employees</h2>
                <div className="rows-per-page-select">
                    <label htmlFor="rowsPerPage">Rows per page: </label>
                    <select id="rowsPerPage" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
                <table className="employee-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Phone</th>
                        <th>Joining Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedEmployees.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.fullName}</td>
                            <td>{emp.email}</td>
                            <td>{emp.role}</td>
                            <td>{emp.department}</td>
                            <td>{emp.phone}</td>
                            <td>{emp.joiningDate}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={currentPage === i + 1 ? 'active' : ''}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next &raquo;</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeList;

