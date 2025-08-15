import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import EmployeeSidebar from "../components/EmployeeSidebar";

const EmployeeReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    async function fetchReminders() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/reminders/employee/${employeeId}`);
        setReminders(res.data || []);
      } catch (err) {
        setReminders([]);
      }
      setLoading(false);
    }
    fetchReminders();
  }, [employeeId]);

  return (
    <div style={{ display: "flex" }}>
      <EmployeeSidebar />
      <div className="employee-reminders-page" style={{ flex: 1, padding: 32 }}>
        <h2>All Reminders Received</h2>
        {loading ? (
          <p>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p>No reminders received from your manager.</p>
        ) : (
          <ul className="reminders-list" style={{ maxWidth: 600, margin: "0 auto" }}>
            {reminders.map((rem) => (
              <li key={rem.id} className="reminder-item" style={{ marginBottom: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <strong>{rem.text}</strong>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Date: {rem.date} | Time: {rem.time}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeeReminders;
