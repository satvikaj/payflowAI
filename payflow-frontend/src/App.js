
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AddUser from './pages/AddUser';
import ResetPassword from './pages/ResetPassword';
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ManagerLogin from './pages/ManagerLogin';
import HRLogin from './pages/HRLogin';
import Onboarding from "./pages/Onboarding";
// import EmployeeLogin from "./pages/EmployeeLogin";
import ManagerLeaveRequests from './pages/ManagerLeaveRequests';
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import UnifiedLogin from "./pages/UnifiedLogin";
import EmployeeList from "./pages/EmployeeList";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeLeave from "./pages/EmployeeLeave";
import ManagerDashboard from "./pages/ManagerDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import EmployeeOverview from "./pages/EmployeeOverview";
import EmployeeProfile from "./pages/EmployeeProfile";
import ManagerOnboarding from "./pages/ManagerOnboarding";
import TeamMembers from "./pages/TeamMembers";

// import Login from "./components/Login";


function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<UnifiedLogin/>}/>
                <Route path="/hr-dashboard" element={<Dashboard/>} />
                {/*<Route path="/login/admin" element={<AdminLoginPage />} />*/}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/navbar" element={<Navbar/>} />
                <Route path="/sidebar" element={<Sidebar/>}/>
                <Route path="/create-user" element={<AddUser/>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<Onboarding />} />
                {/*<Route path="/login/hr" element={<HRLogin />} />*/}
                {/*<Route path="/login/manager" element={<ManagerLogin />} />*/}
                <Route path="/employee" element={<EmployeeList />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/:managerId/leaves" element={<ManagerLeaveRequests />} />
                <Route path="/manager-notifications" element={<NotificationsPage />} />
                <Route path="/employee-leave" element={<EmployeeLeave />} />
                <Route path="/employee-overview" element={<EmployeeOverview />} />
                <Route path="/employee-profile" element={<EmployeeProfile />} />
                <Route path="/manager-onboarding" element={<ManagerOnboarding />} />
                <Route path="/team-members" element={<TeamMembers />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;