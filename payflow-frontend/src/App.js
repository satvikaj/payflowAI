import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AddUser from './pages/AddUser';
import ResetPassword from './pages/ResetPassword';
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ManagerLogin from './pages/ManagerLogin';
import HRLogin from './pages/HRLogin';
import Onboarding from "./pages/Onboarding";
import ManagerOnboarding from "./pages/ManagerOnboarding";
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
import TeamMembers from "./pages/TeamMembers";
import PayrollDashboard from "./pages/PayrollDashboard";
import SchedulePayrollForm from "./pages/SchedulePayrollForm";
import PayslipViewer from "./pages/PayslipViewer";
import EmployeeReminders from './pages/EmployeeReminders';
import AdminCTCStructures from "./pages/AdminCTCStructures";
import AdminCTCManagement from "./pages/AdminCTCManagement";
import EmployeeCTCDashboard from "./pages/EmployeeCTCDashboard";
import ManagerTeamPayroll from "./pages/ManagerTeamPayroll";
import HRCTCManagement from "./pages/HRCTCManagement";
import HRCTCStructures from "./pages/HRCTCStructures";
import PaymentHoldManagement from "./pages/PaymentHoldManagement";
import ManagerPaymentHolds from "./pages/ManagerPaymentHolds";
import AdminPaymentHolds from "./pages/AdminPaymentHolds";
import HRPaymentHolds from "./pages/HRPaymentHolds";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeResignation from "./pages/EmployeeResignation";
import ManagerResignationRequests from "./pages/ManagerResignationRequests";
import HRResignationRequests from "./pages/HRResignationRequests";
import HRLeaveRequests from "./pages/HRLeaveRequests";
import LeaveHistory from "./pages/LeaveHistory";
import UpcomingHolidays from "./components/UpcomingHolidays";



function App() {
    return (
        <BrowserRouter>
            <Navbar/>
                        <Routes>
                                <Route path="/" element={<Home/>} />
                                <Route path="/login" element={<UnifiedLogin/>}/>
                                {/* Admin protected routes */}
                                <Route path="/admin-dashboard" element={
                                    <ProtectedRoute roles={["ADMIN"]}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/payment-holds" element={
                                    <ProtectedRoute roles={["ADMIN"]}>
                                        <AdminPaymentHolds />
                                    </ProtectedRoute>
                                } />
                                <Route path="/ctc-management" element={
                                    <ProtectedRoute roles={["ADMIN"]}>
                                        <AdminCTCStructures />
                                    </ProtectedRoute>
                                } />
                                <Route path="/ctc-management-new" element={
                                    <ProtectedRoute roles={["ADMIN"]}>
                                        <AdminCTCManagement />
                                    </ProtectedRoute>
                                } />
                                <Route path="/create-user" element={
                                    <ProtectedRoute roles={["ADMIN"]}>
                                        <AddUser />
                                    </ProtectedRoute>
                                } />
                                {/* HR protected routes */}
                                <Route path="/hr-dashboard" element={
                                    <ProtectedRoute roles={["HR"]}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/hr/payment-holds" element={
                                    <ProtectedRoute roles={["HR"]}>
                                        <HRPaymentHolds />
                                    </ProtectedRoute>
                                } />
                                <Route path="/hr-ctc-auto-calculator" element={
                                    <ProtectedRoute roles={["HR"]}>
                                        <HRCTCManagement />
                                    </ProtectedRoute>
                                } />
                                <Route path="/hr-ctc-structures" element={
                                    <ProtectedRoute roles={["HR"]}>
                                        <HRCTCStructures />
                                    </ProtectedRoute>
                                } />
                                <Route path="/hr/leave-requests" element={
                                    <ProtectedRoute roles={["HR"]}>
                                        <HRLeaveRequests />
                                    </ProtectedRoute>
                                } />
                                <Route path="/hr/resignation-requests" element={
                                    <ProtectedRoute roles={["HR"]}>
                                        <HRResignationRequests />
                                    </ProtectedRoute>
                                } />
                                {/* Manager protected routes */}
                                <Route path="/manager-dashboard" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <ManagerDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager/payroll-dashboard" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <PayrollDashboard />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="/manager/payslip-viewer" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <PayslipViewer />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager/schedule" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <SchedulePayrollForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager-onboarding" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <ManagerOnboarding />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager/payment-holds" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <ManagerPaymentHolds />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager/:managerId/leaves" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <ManagerLeaveRequests />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager-team-payroll" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <ManagerTeamPayroll />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager-notifications" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <NotificationsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/manager/resignation-requests" element={
                                    <ProtectedRoute roles={["MANAGER"]}>
                                        <ManagerResignationRequests />
                                    </ProtectedRoute>
                                } />
                                {/* Employee protected routes */}
                                <Route path="/employee-dashboard" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <EmployeeDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-reminders" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <EmployeeReminders />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-leave" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <EmployeeLeave />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-resignation" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <EmployeeResignation />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-overview" element={
                                    <ProtectedRoute roles={["ADMIN"]}>
                                        <EmployeeOverview />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-profile" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <EmployeeProfile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-leave-history" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <LeaveHistory />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employee-ctc-dashboard" element={
                                    <ProtectedRoute roles={["EMPLOYEE"]}>
                                        <EmployeeCTCDashboard />
                                    </ProtectedRoute>
                                } />
                                {/* Shared/other routes */}
                                <Route path="/employee" element={<EmployeeList />} />
                                <Route path="/onboarding" element={<Onboarding />} />
                                <Route path="/team-members" element={<TeamMembers />} />
                                                <Route path="/payroll-dashboard" element={
                                                    <ProtectedRoute roles={["ADMIN", "HR"]}>
                                                        <PayrollDashboard />
                                                    </ProtectedRoute>
                                                } />
                                <Route path="/payment-hold-management" element={<PaymentHoldManagement />} />
                                <Route path="/upcoming-holidays" element={<UpcomingHolidays />} />
                                <Route path="/navbar" element={<Navbar/>} />
                                <Route path="/sidebar" element={<Sidebar/>}/>
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/employee-login" element={<EmployeeLogin />} />
                        </Routes>
        </BrowserRouter>
    );
}

export default App;